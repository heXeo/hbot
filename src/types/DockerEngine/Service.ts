import {Dictionnary} from '../Dictionnary'
import {TaskSpec} from './TaskSpec'

export type Mode = Global | Replicated

export interface Service {
  Name: string
  Labels?: Dictionnary<string>
  TaskTemplate: TaskSpec
  Mode?: Mode
  UpdateConfig?: UpdateConfig
  Networks?: Network[]
  EndpointSpec?: EndpointSpec
}

export interface Global {
  Global: {}
}

export interface Replicated {
  Replicated: {
    Replicas: number
  }
}

export interface UpdateConfig {
  Parallelism?: number
  Delay?: number
  FailureAction?: string
  Monitor?: number
  MaxFailureRatio?: number
  Order?: string
}

export interface Network {
  Target: string
}

export interface EndpointSpec {
  Mode?: string
  Ports?: PortConfig[]
}

export interface PortConfig {
  Name?: string
  Protocol: string
  TargetPort: number
  PublishedPort: number
}
