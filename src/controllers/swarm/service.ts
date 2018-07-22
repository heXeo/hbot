import _ from 'lodash'
import swarmSvc from '../../resources/swarm'
import JSZip from 'jszip'

export async function listServices(): Promise<any> {
  const services = await swarmSvc.listServices()

  return services.map((service: any) =>
    _.pick(service, ['ID', 'Spec.Name', 'Spec.Mode.Replicated.Replicas'])
  )
}

export function getService(name: string): Promise<any> {
  return swarmSvc.getServiceByName(name)
}

export async function searchService(name: string): Promise<any> {
  const services = await swarmSvc.searchServicesByName(name)

  return services.map((service: any) =>
    _.pick(service, [
      'ID',
      'Spec.Name',
      'Spec.Mode.Replicated.Replicas',
      'Spec.TaskTemplate.ContainerSpec.Image',
    ])
  )
}

export async function scaleService(
  name: string,
  replicas: number
): Promise<string> {
  await swarmSvc.scaleService(name, replicas)

  return `Service ${name} scaled to ${replicas}.`
}

export async function deleteService(name: string): Promise<string> {
  await swarmSvc.deleteService(name)

  return `Service ${name} deleted.`
}

export async function getServiceTasks(name: string): Promise<any> {
  const tasks = await swarmSvc.getServiceTasks(name)

  return tasks
}

export async function getServiceLogs(name: string): Promise<Buffer> {
  const entries = await swarmSvc.getServiceLogs(name)

  const zip = new JSZip()

  Object.keys(entries).forEach((containerID) => {
    const shortId = containerID.substr(0, 12)
    const entry = entries[containerID]
    zip.file(`${shortId}-${entry.state}.txt`, entry.content)
  })

  return zip.generateAsync({type: 'nodebuffer'})
}
