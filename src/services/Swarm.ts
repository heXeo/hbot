import * as stream from 'stream';
import * as _ from 'lodash';
import DockerApi from '../lib/DockerApi';
import { DockerEngine } from '../interfaces/docker/engine';

const JStream = require('jstream');

const stackNamespaceLabel = 'com.docker.stack.namespace';
const stackImageLabel = 'com.docker.stack.image';

function injectSecretKey (secretKey: string, serviceApiContent: any) {
  const env = serviceApiContent.TaskTemplate.ContainerSpec.Env;

  serviceApiContent.TaskTemplate.ContainerSpec.Env = (env || [])
    .concat(`SECRET_KEY=${secretKey}`);

  return serviceApiContent;
}

function injectImageTag (serviceApiContent: any, tag: string) {
  const imageParts = serviceApiContent.TaskTemplate.ContainerSpec.Image.split(':');
  const finalImage = `${imageParts[0]}:${tag}`;
  serviceApiContent.TaskTemplate.ContainerSpec.Image = finalImage;
}

function injectStackLabels (serviceApiContent: any, stackName: string) {
  const imageParts = serviceApiContent.TaskTemplate.ContainerSpec.Image.split(':');
  const imageLabel = (!imageParts[1] || imageParts[1].toLowerCase() === 'latest') ?
    imageParts[0] : `${imageParts[0]}:${imageParts[1]}`;

  serviceApiContent.Labels = {
      [stackNamespaceLabel]: stackName,
      [stackImageLabel]: imageLabel
  };

  serviceApiContent.TaskTemplate.Labels = {
    [stackNamespaceLabel]: stackName
  };
}

interface ISwarmOptions {
  secretKey: string;
}

interface ISwarmCreateUpdateServiceOptions {
  imageTag?: string;
  suffix?: string;
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

  async createOrUpdateStack (name: string, apiSpecs: any[], prune: boolean = false) {
    apiSpecs.forEach((apiSpec: any) => {
      injectStackLabels(apiSpec, name);
    });

    if (prune) {
      const currentServices = await this.searchServicesByStack(name);
      const servicesToPrune = currentServices
      .filter((currentService:any) => apiSpecs.findIndex(
        (apiSpec:any) => currentService.Spec.Name === `${name}_${apiSpec.Name}`
      ) === -1);

      await Promise.all(servicesToPrune.map(
        (serviceToPrune:any) => this.deleteService(serviceToPrune.Spec.Name)
      ));
    }

    return Promise.all(apiSpecs.map(
      (apiSpec: any) => this.createOrUpdateService(
        `${name}_${apiSpec.Name}`, apiSpec
      )
    ));
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

  async searchServicesByStack (name: string) {
    const services = await this.searchServicesByLabel(stackNamespaceLabel);

    return services
    .filter((service:any) => service.Spec.Labels[stackNamespaceLabel] === name)
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

  async createOrUpdateService (name: string, apiSpec: any, options: ISwarmCreateUpdateServiceOptions = {}) {
    const serviceInfo = await this.findServiceByName(name);

    apiSpec.Name = name;

    if (options.imageTag) {
      injectImageTag(apiSpec, options.imageTag);
    }
    injectSecretKey(this.options.secretKey, apiSpec);

    if (!serviceInfo) {
      return this.api.post('/services/create', {
        body: apiSpec
      });
    }

    const previousSpec: DockerEngine.Service = serviceInfo.Spec;
    const id = serviceInfo.ID;
    const version = serviceInfo.Version.Index;
    // Makes sure service always redeploys
    apiSpec.TaskTemplate.ForceUpdate = (previousSpec.TaskTemplate.ForceUpdate || 0) + 1;

    return this.api.post(`/services/${id}/update`, {
      query: { version: version },
      body: apiSpec
    });
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
