import _ from 'lodash'
import swarmSvc from '../../resources/swarm'

export async function listNodes(): Promise<any> {
  const nodes = await swarmSvc.listNodes()

  return nodes.map((node: any) => _.pick(node, ['ID', 'Spec', 'Status']))
}
