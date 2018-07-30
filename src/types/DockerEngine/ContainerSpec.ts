import {Dictionnary} from '../Dictionnary'

export interface ContainerSpec {
  Image?: string
  Labels?: Dictionnary<string>
  Command?: string[]
  Args?: string[]
  Hostname?: string
  Env?: string[]
  Dir?: string
  User?: string
  Groups?: string[]
  TTY?: boolean
  OpenStdin?: boolean
  ReadOnly?: boolean
  Mounts?: Mount[]
  StopGracePeriod: number
  HealthCheck?: HealthConfig
  Hosts?: string[]
  DNSConfig?: DNSConfig
  Secrets?: Secret[]
}

export interface Mount {
  Target?: string
  Source?: string
  Type?: string
  ReadOnly?: boolean
  BindOptions?: BindOptions
}

export interface BindOptions {
  Propagation?: string
}

export interface VolumeOptions {
  NoCopy?: boolean
  Labels?: Dictionnary<string>
  DriverConfig?: DriverConfig
}

export interface DriverConfig {
  Name?: string
  Options: Dictionnary<string>
}

export interface TmpfsOptions {
  SizeButes?: number
  Mode?: number
}

export interface HealthConfig {
  Test?: string[]
  Interval?: number
  Timeout?: number
  Retries?: number
}

export interface DNSConfig {
  Nameservers?: string[]
  Search?: string[]
  Options?: string[]
}

export interface Secret {
  SecretName?: string
  SecretID?: string
  File?: File
}

export interface File {
  Name?: string
  UID?: string
  GID?: string
  Mode?: number
}
