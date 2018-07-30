import {Service} from '../types/DockerEngine/Service'
import {Network} from '../types/DockerEngine/Network'

export interface DefinitionMapper<S, N> {
  mapServices(services?: S, networks?: N): Service[]
  mapNetworks(networks?: N): Network[]
}
