import * as stream from 'stream';
import * as _ from 'lodash';
import DockerApi from '../lib/DockerApi';
import { DockerEngine } from '../interfaces/docker/engine';

const JStream = require('jstream');

const stackNamespaceLabel = 'com.docker.stack.namespace';
const stackImageLabel = 'com.docker.stack.image';
const definitionLabel = 'be.hexeo.definition.name';

function injectSecretKey (serviceApiContent: any, secretKey: string) {
  const env = serviceApiContent.TaskTemplate.ContainerSpec.Env;

  serviceApiContent.TaskTemplate.ContainerSpec.Env = (env || [])
    .concat(`SECRET_KEY=${secretKey}`);

  return serviceApiContent;
}

function injectStackLabels (serviceApiContent: any, stackName: string) {
  const imageParts = serviceApiContent.TaskTemplate.ContainerSpec.Image.split(':');
  const imageLabel = (!imageParts[1] || imageParts[1].toLowerCase() === 'latest') ?
    imageParts[0] : `${imageParts[0]}:${imageParts[1]}`;

  serviceApiContent.Labels = Object.assign(serviceApiContent.Labels || {}, {
    [stackNamespaceLabel]: stackName,
    [stackImageLabel]: imageLabel
  });

  serviceApiContent.TaskTemplate.ContainerSpec.Labels = Object.assign(
    serviceApiContent.TaskTemplate.ContainerSpec.Labels || {}, {
      [stackNamespaceLabel]: stackName
    }
  );
}

function clearStackLabels (serviceApiContent: any, stackName: string) {
  if (serviceApiContent.Labels) {
    delete serviceApiContent.Labels[stackNamespaceLabel];
    delete serviceApiContent.Labels[stackImageLabel];
  }

  if (serviceApiContent.TaskTemplate.Labels) {
    delete serviceApiContent.TaskTemplate.Labels[stackNamespaceLabel];
  }
}

function injectDefinitionLabel (serviceApiContent: any, definitonName: string) {
  serviceApiContent.Labels = Object.assign(serviceApiContent.Labels || {}, {
      [definitionLabel]: definitonName,
  });
}

interface ISwarmOptions {
  secretKey: string;
}

export default class Swarm {
  private api: DockerApi;
  private options: ISwarmOptions;

  constructor (dockerApi: DockerApi, options: ISwarmOptions) {
    this.api = dockerApi;
    this.options = options;
  }

  async info () {
    return this.api.get('/info');
  }

  async deploy (definitionName: string, apiSpecs: any[]) {
    const isStack = apiSpecs.length > 1;

    return Promise.all(apiSpecs.map(async (apiSpec: any) => {
      const serviceName = isStack ? `${definitionName}_${apiSpec.Name}` : definitionName;
      const currentService = await this.findServiceByName(serviceName);

      apiSpec.Name = serviceName;

      injectDefinitionLabel(apiSpec, definitionName);
      if (this.options.secretKey) {
        injectSecretKey(apiSpec, this.options.secretKey);
      }
      if (isStack) {
        injectStackLabels(apiSpec, definitionName);
      } else {
        // Makes sure labels don't stay when services are removed from definition
        // and only 1 service stays
        clearStackLabels(apiSpec, definitionName);
      }

      if (!currentService) {
        return this.api.post('/services/create', {
          body: apiSpec
        });
      }

      const previousSpec: DockerEngine.Service = currentService.Spec;
      const id = currentService.ID;
      const version = currentService.Version.Index;
      // Makes sure service always redeploys
      apiSpec.TaskTemplate.ForceUpdate = (previousSpec.TaskTemplate.ForceUpdate || 0) + 1;

      return this.api.post(`/services/${id}/update`, {
        query: { version: version },
        body: apiSpec
      });
    }));
  }

  async listNodes () {
    return this.api.get('/nodes');
  }

  async getNode (id: string) {
    return this.api.get(`/nodes/${id}`);
  }

  async listStacks () {
    const stacksServices = await this.searchServicesByLabel(stackNamespaceLabel);

    return _.uniqBy(stacksServices, `Spec.Labels['${stackNamespaceLabel}']`)
    .map((service: any) => service.Spec.Labels[stackNamespaceLabel])
  }

  async checkUnreferencedServices (definitionName: string, apiSpecs: any[]) {
    const currentServices = await this.searchServicesByDefinition(definitionName);

    return currentServices
    .filter((currentService:any) => (apiSpecs.findIndex((apiSpec:any) => {
        return currentService.Spec.Name === `${definitionName}_${apiSpec.Name}` ||
        currentService.Spec.Name === `${definitionName}`
      }) === -1)
    );
  }

  async listServices () {
    return this.api.get('/services');
  }

  async searchServicesByName (name: string) {
    return this.api.get('/services', {
      query: {
        filters: JSON.stringify({
          name: [ name ]
        })
      }
    });
  }

  async searchServicesByLabel (label: string) {
    return this.api.get('/services', {
      query: {
        filters: JSON.stringify({
          label: [ label ]
        })
      }
    });
  }

  async searchServicesByDefinition (name: string) {
    return this.searchServicesByLabel(`${definitionLabel}=${name}`);
  }

  async searchServicesByStack (name: string) {
    return this.searchServicesByLabel(`${stackNamespaceLabel}=${name}`);
  }

  async findServiceByName (name: string) {
    const services = await this.searchServicesByName(name);
    return services.find((service: any) => service.Spec.Name === name) || null;
  }

  async getServiceByName (name: string) {
    const service = await this.findServiceByName(name);
    if (!service) {
      throw new Error(`Service ${name} not found.`);
    }
    return service;
  }

  async scaleService (name: string, replicas: number) {
    const serviceInfo = await this.getServiceByName(name);

    const mode = Object.keys(serviceInfo.Spec.Mode)[0];

    if (mode !== 'Replicated') {
      throw new Error(`Can't scale service not in replicated mode.`);
    }

    const id = serviceInfo.ID;
    const version = serviceInfo.Version.Index;
    const newSpec = Object.assign({}, serviceInfo.Spec, {
      Mode: {
        Replicated: {
          Replicas: replicas
        }
      }
    });

    return this.api.post(`/services/${id}/update`, {
      query: { version: version },
      body: newSpec
    });
  }

  async deleteService (nameOrId: string) {
    return this.api.delete(`/services/${nameOrId}`);
  }

  async getEventsStream () {
    let lastGet = Math.floor(Date.now() / 1000);
    const p = new stream.PassThrough();

    const pollEvents = () => {
      if (!p.readable) {
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      this.api.get('/events', {
        query: {
          filters: JSON.stringify({
            type: [ 'container' ],
            event: [ 'start', 'stop', 'restart', 'health_status' ]
          }),
          since: lastGet,
          until: now
        },
        json: false
      })
      .then((res: any) => {
        lastGet = now;
        if (res) {
          p.write(res);
        }
        setTimeout(pollEvents, 10000);
      })
      .catch((error) => {
        console.error(error);
        setTimeout(pollEvents, 60000);
      });
    }

    setTimeout(pollEvents, 10000);

    return p.pipe(new JStream());
  }

  async getServiceTasks (name: string): Promise<any[]> {
    return this.api.get('/tasks', {
      query: {
        filters: JSON.stringify({
          service: [ name ]
        })
      }
    });
  }

  async getServiceLogs (name: string) {
    const tasks = await this.getServiceTasks(name);

    return tasks.reduce(async (promise, task) => {
      const logs = await promise;

      try {
        const taskLogs = await this.api.get(`/containers/${task.Status.ContainerStatus.ContainerID}/logs`, {
          query: {
            stdout: true,
            stderr: true,
            timestamps: true
          }
        });

        return Object.assign(logs, {
          [task.Status.ContainerStatus.ContainerID]: {
            state: task.Status.State,
            content: taskLogs
          }
        });
      } catch (error) {
        return logs;
      }
    }, Promise.resolve({}));
  }
}
