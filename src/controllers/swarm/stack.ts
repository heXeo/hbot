import _ from 'lodash'
import swarmSvc from '../../resources/swarm'

export async function listStacks(): Promise<any> {
  return swarmSvc.listStacks()
}

export async function getStackServices(name: string): Promise<any> {
  const services = await swarmSvc.searchServicesByStack(name)

  return services.map((service: any) =>
    _.pick(service, [
      'ID',
      'Spec.Name',
      'Spec.Mode.Replicated.Replicas',
      'Spec.TaskTemplate.ContainerSpec.Image',
    ])
  )
}

export async function deleteStack(name: string): Promise<string> {
  const services = await getStackServices(name)

  await Promise.all(
    services.map((service: any) => swarmSvc.deleteService(service.Spec.Name))
  )

  return `Stack ${name} deleted.`
}
