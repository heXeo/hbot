import * as _ from 'lodash';
import swarmSvc from '../../resources/swarm';

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
