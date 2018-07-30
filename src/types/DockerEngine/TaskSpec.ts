import {Dictionnary} from '../Dictionnary'
import {ContainerSpec} from './ContainerSpec'

export interface TaskSpec {
  ContainerSpec?: ContainerSpec
  Resources?: Resources
  RestartPolicy?: RestartPolicy
  Placement?: Placement
  ForceUpdate?: number
  Networks?: Network[]
  LogDriver?: LogDriver
}

export interface Resources {
  Limits?: Limits
  Reservation?: Reservation
}

export interface Limits {
  NanoCPUs?: number
  MemoryBytes?: number
}

export interface Reservation {
  NanoCPUs?: number
  MemoryBytes?: number
}

export interface LogDriver {
  Name: string
  Options?: Dictionnary<string>
}

export interface Network {
  Target: string
  Aliases?: string[]
}

export interface Placement {
  Constraints?: string[]
  Preferences?: PlacementPreference[]
}

export interface PlacementPreference {
  Spread?: SpreadOver
}

export interface SpreadOver {
  SpreadDescriptor: string
}

export interface RestartPolicy {
  Condition?: string
  Delay?: number
  MaxAttempts?: number
  Window?: number
}
