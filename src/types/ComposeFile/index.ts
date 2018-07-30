import {Dictionnary} from '../Dictionnary'
import {Service} from './Service'
import {Network} from './Network'

export interface ComposeFile {
  version: string
  services?: Dictionnary<Service>
  networks?: Dictionnary<Network>
}
