import {Dictionnary} from '../Dictionnary'

/* eslint-disable camelcase */
export interface Network {
  driver?: string
  driver_opts?: Dictionnary<string>
  internal?: boolean
  external?: boolean | External
  ipam?: IPAM
  enableIPv6?: boolean
  labels?: Dictionnary<string> | string[]
}

export interface External {
  name: string
}

export interface IPAM {
  driver?: string
  config?: IPAMConfig[]
}

export interface IPAMConfig {
  subnet?: string
}
