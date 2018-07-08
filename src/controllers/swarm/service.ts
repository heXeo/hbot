import * as _ from 'lodash';
import swarmSvc from '../../resources/swarm';
import opsSvc from '../../resources/ops';
import dockerApiMapper from '../../resources/dockerApiMapper';
import * as JSZip from 'jszip';

export async function listServices (): Promise<any> {
  const services = await swarmSvc.listServices();

  return services.map((service: any) => (_.pick(service, [
    'ID',
    'Spec.Name',
    'Spec.Mode.Replicated.Replicas'
  ])));
}

export function getService (name: string): Promise<any> {
  return swarmSvc.getServiceByName(name);
}

export async function searchService (name: string): Promise<any> {
  const services = await swarmSvc.searchServicesByName(name);

  return services.map((service: any) => (_.pick(service, [
    'ID',
    'Spec.Name',
    'Spec.Mode.Replicated.Replicas',
    'Spec.TaskTemplate.ContainerSpec.Image'
  ])));
}

export async function deployService (name: string, tag: string): Promise<string> {
  const definition = await opsSvc.getDefinition(name);

  if (!definition) {
    throw new Error(`No service definition for ${name}.`);
  }

  const serviceApiContents = dockerApiMapper.mapService(definition);

  if (serviceApiContents.length > 1) {
    throw new Error(`It looks like ${name} is a stack definition, use stack command instead.`);
  }

  const serviceApiContent = serviceApiContents[0];

  await swarmSvc.createOrUpdateService(name, serviceApiContent, {
    imageTag: tag
  });

  return `Service ${name} deployed.`;
}

export async function scaleService (name: string, replicas: number): Promise<string> {
  await swarmSvc.scaleService(name, replicas);

  return `Service ${name} scaled to ${replicas}.`;
}

export async function deleteService (name: string): Promise<string> {
  await swarmSvc.deleteService(name);

  return `Service ${name} deleted.`
}

export async function getServiceTasks (name: string): Promise<any> {
  const tasks = await swarmSvc.getServiceTasks(name);

  return tasks;
}

export async function getServiceLogs (name: string): Promise<Buffer> {
  const entries = await swarmSvc.getServiceLogs(name);

  const zip = new JSZip();

  Object.keys(entries).forEach((containerID) => {
    const shortId = containerID.substr(0, 12);
    const entry = entries[containerID];
    zip.file(`${shortId}-${entry.state}.txt`, entry.content);
  });

  return zip.generateAsync({ type: 'nodebuffer' });
}
