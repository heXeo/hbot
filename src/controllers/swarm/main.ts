import * as _ from 'lodash'
import swarmSvc from '../../resources/swarm'
import opsSvc from '../../resources/ops'
import dockerApi from '../../resources/dockerApi'
import dockerApiMapper from '../../resources/dockerApiMapper'
import {composeVersionChecker} from '../../helpers/composeVersionChecker'

export async function getInfos(): Promise<any> {
  const info = await swarmSvc.info()

  return _.pick(info, [
    'Images',
    'Containers',
    'ContainersRunning',
    'ContainersPaused',
    'ContainersStopped',
    'Swarm.Nodes',
    'Swarm.Managers',
  ])
}

export async function deploy(
  definitionName: string,
  servicesTags: any[],
  prune: boolean = false,
  keep: boolean = false,
  force: boolean = false
): Promise<string> {
  const definition = await opsSvc.getDefinition(definitionName)
  const nodes = await swarmSvc.listNodes()

  const validVersion = await composeVersionChecker(
    definition.version,
    nodes,
    dockerApi.version
  )
  if (!validVersion) {
    throw new Error(
      `Docker compose version ${
        definition.version
      } is too high for at least one running Docker engine`
    )
  }

  const serviceApiContents = dockerApiMapper.mapServices(definition)
  const unreferencedServices = await swarmSvc.checkUnreferencedServices(
    definitionName,
    serviceApiContents
  )

  if (unreferencedServices.length > 0) {
    if (prune) {
      await Promise.all(
        unreferencedServices.map((unreferencedService: any) =>
          swarmSvc.deleteService(unreferencedService.Spec.Name)
        )
      )
    } else if (!keep) {
      throw new Error(
        `Unreferenced services exists for definition ${definitionName}, use keep or prune option`
      )
    }
  }

  let newServiceApiContents = serviceApiContents
  if (servicesTags.length > 0) {
    // perf: UpdateDefinition does a getDefinition too, might be improved
    const newDefinition = await opsSvc.updateDefinition(
      definitionName,
      servicesTags
    )

    newServiceApiContents = dockerApiMapper.mapServices(newDefinition)
  }

  await swarmSvc.deploy(definitionName, newServiceApiContents, force)

  return `Definition ${definitionName} deployed.`
}
