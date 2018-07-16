import * as _ from 'lodash';
import swarmSvc from '../../resources/swarm';
import opsSvc from '../../resources/ops';
import dockerApiMapper from '../../resources/dockerApiMapper';

export async function getInfos (): Promise<any> {
  const info = await swarmSvc.info();

  return _.pick(info, [
    'Images',
    'Containers',
    'ContainersRunning',
    'ContainersPaused',
    'ContainersStopped',
    'Swarm.Nodes',
    'Swarm.Managers'
  ]);
}

export async function deploy (definitionName: string, servicesTags: any[], prune: boolean = false, force: boolean = false): Promise<string> {
  const definition = await opsSvc.getDefinition(definitionName);
  const serviceApiContents = dockerApiMapper.mapServices(definition);
  const unreferencedServices = await swarmSvc.checkUnreferencedServices(definitionName, serviceApiContents);

  if (unreferencedServices.length > 0) {
    if (prune) {
      await Promise.all(
        unreferencedServices.map((unreferencedService: any) => swarmSvc.deleteService(unreferencedService.Spec.Name))
      );
    } else if (!force) {
      throw new Error(`Unreferenced services exists for definition ${definitionName}, use force or prune option`);
    }
  }

  let newServiceApiContents = serviceApiContents;
  if (servicesTags.length > 0) {
    // perf: UpdateDefinition does a getDefinition too, might be improved
    const newDefinition = await opsSvc.updateDefinition(definitionName, servicesTags);

    newServiceApiContents = dockerApiMapper.mapServices(newDefinition);
  }

  await swarmSvc.deploy(definitionName, newServiceApiContents);

  return `Definition ${definitionName} deployed.`;
}

