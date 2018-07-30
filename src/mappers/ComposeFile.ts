import {DefinitionMapper} from './DefinitionMapper'
import {Dictionnary} from '../types/Dictionnary'
import {Service as InputService} from '../types/ComposeFile/Service'
import {Network as InputNetwork} from '../types/ComposeFile/Network'
import {Service} from '../types/DockerEngine/Service'
import {Network} from '../types/DockerEngine/Network'

export class ComposeFileMapper
  implements
    DefinitionMapper<Dictionnary<InputService>, Dictionnary<InputNetwork>> {
  mapServices(
    services: Dictionnary<InputService>,
    networks: Dictionnary<InputNetwork>
  ): Service[] {
    return []
  }

  mapNetworks(networks: Dictionnary<InputNetwork>): Network[] {
    return []
  }
}

export default new ComposeFileMapper()
