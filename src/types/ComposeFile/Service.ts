import {Dictionnary} from '../Dictionnary'

/* eslint-disable camelcase */
export interface Service {
  build?: string | Build
  cap_add?: string[]
  cap_drop?: string[]
  command?: string | string[]
  cgroup_parent?: string
  container_name?: string
  deploy?: Deploy
  devices?: string[]
  depends_on?: string[]
  dns?: string | string[]
  dns_search?: string | string[]
  tmpfs?: string | string[]
  entrypoint?: string | string[]
  env_file?: string | string[]
  environment?: Dictionnary<string> | string[]
  expose?: string[]
  external_links?: string[]
  extra_hosts?: string[]
  group_add?: string[]
  healthcheck?: HealthCheck
  image?: string
  isolation?: string
  labels?: Dictionnary<string> | string[]
  links?: string[]
  logging?: Logging
  network_mode?: string
  networks?: string[] | Dictionnary<Network>
  pid?: string
  ports?: string[]
  secrets?: string[] | Dictionnary<Secret>
  security_options?: string[]
  stop_grace_period?: string
  stop_signal?: string
  sysctls?: Dictionnary<string | number> | string[]
  ulimits?: Dictionnary<number | ULimit>
  userns_mode?: string
  volumes?: string[]
  volume_driver?: string
  domainname?: string
  hostname?: string
  ipc?: string
  mac_address?: string
  privileged?: boolean
  restart?: string
  read_only?: boolean
  shm_size?: string
  stdin_open?: boolean
  tty?: boolean
  user?: string
  working_dir?: string
}

export interface Build {
  context: string
  dockerfile?: string
  args?: Dictionnary<string> | string[]
}

export interface Deploy {
  mode?: string
  replicas?: number
  placement: Placement
  update_config: UpdateConfig
  resources?: Resources
  restart_policy: RestartPolicy
  labels?: Dictionnary<string> | string[]
}

export interface Placement {
  constraints?: string[]
}

export interface UpdateConfig {
  parallelism?: number
  delay?: string
  failure_action?: string
  monitor?: string
  max_failure_ratio?: number
  order?: string
}

export interface Resources {
  limits?: Limits
  reservations?: Reservations
}

export interface Limits {
  cpus?: string
  memory?: string
}

export interface Reservations {
  cpus?: string
  memory?: string
}

export interface RestartPolicy {
  condition?: string
  delay?: string
  max_attempts?: number
  window?: string
}

export interface HealthCheck {
  test?: string | string[]
  disable?: boolean
  interval?: string
  timeout?: string
  retries?: string
}

export interface Logging {
  driver?: string
  options?: Dictionnary<string>
}

export interface Network {
  aliases?: string[]
  ipv4_address?: string
  ipv6_address?: string
  link_local_ips?: string[]
}

export interface Secret {
  source?: string
  target?: string
  uid?: number | string
  gid?: number | string
  mode?: number | string
}

export interface ULimit {
  soft: number
  hard: number
}
/* eslint-enable camelcase */
