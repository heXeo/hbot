import {Dictionnary} from '../Dictionnary'

export interface Network {
  Name: string
  CheckDuplicate?: boolean
  Driver?: string
  Internal?: boolean
  Attachable?: boolean
  IPAM?: IPAM
  EnableIPv6?: boolean
  Options?: Dictionnary<string>
  Labels?: Dictionnary<string>
}

export interface IPAM {
  Driver?: string
  Config?: IPAMConfig[]
}

export interface IPAMConfig {
  Subnet?: string
  IPRange?: string
  Gateway?: string
  AuxAddress?: string
}
