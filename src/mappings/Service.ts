import _ from 'lodash'
import path from 'path'
import parsePortShortFormat from '../helpers/parsePortShortFormat'
import {DockerCompose} from '../interfaces/docker/compose'
import {DockerEngine} from '../interfaces/docker/engine'
import {RAMInBytes as getRAMInBytes} from './go-units/size'
const durationParse = require('parse-duration')

const nanoMult = Math.pow(10, 9)
const timeMult = Math.pow(10, 6)

function resolveDockerComposeNetworkName(
  name: string,
  networks: DockerCompose.Network.Collection
): string {
  const network = networks[name]
  if (
    !networks ||
    !network ||
    network.external === undefined ||
    typeof network.external === 'boolean'
  ) {
    return name
  }

  return network.external.name
}

function getServiceMode(
  definition: DockerCompose.Service
): DockerEngine.Service.Mode | undefined {
  if (!definition || !definition.deploy || !definition.deploy.mode) {
    return undefined
  }

  if (definition.deploy.mode === 'global') {
    return {
      Global: {},
    }
  } else if (
    definition.deploy.mode === 'replicated' &&
    definition.deploy.replicas !== undefined
  ) {
    return {
      Replicated: {
        Replicas: definition.deploy.replicas,
      },
    }
  }

  throw new Error('Unknown deploy mode')
}

function getServiceUpdateConfig(
  definition: DockerCompose.Service
): DockerEngine.Service.UpdateConfig | undefined {
  if (!definition || !definition.deploy || !definition.deploy.update_config) {
    return undefined
  }

  return {
    Parallelism: definition.deploy.update_config.parallelism,
    Delay:
      durationParse(definition.deploy.update_config.delay || '10s') * timeMult,
    FailureAction: definition.deploy.update_config.failure_action,
    Monitor:
      durationParse(definition.deploy.update_config.monitor || '0s') * timeMult,
    MaxFailureRatio: definition.deploy.update_config.max_failure_ratio,
    Order: definition.deploy.update_config.order || 'stop-first',
  }
}

function getServiceLabels(
  definition: DockerCompose.Service
): DockerEngine.StringDictionnary | undefined {
  if (!definition || !definition.deploy || !definition.deploy.labels) {
    return undefined
  }

  if (Array.isArray(definition.deploy.labels)) {
    return _.transform(
      definition.deploy.labels,
      (labels, label) => {
        const [key, value] = label.split('=')
        return Object.assign(labels, {
          [key]: value.toString(),
        })
      },
      {} as DockerEngine.StringDictionnary
    )
  }

  return _.transform(
    definition.deploy.labels,
    (labels, value, key) => {
      return Object.assign(labels, {
        [key]: value.toString(),
      })
    },
    {} as DockerEngine.StringDictionnary
  )
}

function getServiceNetworks(
  definition: DockerCompose.Service,
  networks: DockerCompose.Network.Collection
): Array<DockerEngine.Service.Network> | undefined {
  if (!definition || !definition.networks) {
    return undefined
  }

  if (Array.isArray(definition.networks)) {
    return _.map(definition.networks, (name) => {
      return {
        Target: resolveDockerComposeNetworkName(name, networks),
      }
    })
  }

  return _.map(definition.networks, (_network, name) => {
    return {
      Target: resolveDockerComposeNetworkName(name, networks),
    }
  })
}

function getContainerLabels(
  definition: DockerCompose.Service
): DockerEngine.StringDictionnary | undefined {
  if (!definition || !definition.labels) {
    return undefined
  }

  if (Array.isArray(definition.labels)) {
    return _.transform(
      definition.labels,
      (labels, label) => {
        const [key, value] = label.split('=')
        return Object.assign(labels, {
          [key]: value.toString(),
        })
      },
      {} as DockerEngine.StringDictionnary
    )
  }

  return _.transform(
    definition.labels,
    (labels, value, key) => {
      return Object.assign(labels, {
        [key]: value.toString(),
      })
    },
    {} as DockerEngine.StringDictionnary
  )
}

function getContainerEnv(
  definition: DockerCompose.Service
): Array<string> | undefined {
  if (!definition || !definition.environment) {
    return undefined
  }

  if (Array.isArray(definition.environment)) {
    return definition.environment
  }

  return _.map(definition.environment, (value, key) => {
    return `${key}=${value}`
  })
}

function toArray<T>(value: T | T[] | undefined): T[] | undefined {
  if (!value) {
    return undefined
  }
  return ([] as T[]).concat(value)
}

function getContainerDNSConfig(
  definition: DockerCompose.Service
): DockerEngine.Service.TaskSpec.ContainerSpec.DNSConfig | undefined {
  if (!definition || (!definition.dns && !definition.dns_search)) {
    return undefined
  }

  return {
    Nameservers: toArray(definition.dns),
    Search: toArray(definition.dns_search),
  }
}

function getContainerHosts(
  definition: DockerCompose.Service
): Array<string> | undefined {
  if (!definition || !definition.extra_hosts) {
    return undefined
  }

  return _.map(definition.extra_hosts, (entry) => {
    const [hostname, address] = entry.split(':')
    return `${address} ${hostname}`
  })
}

function getContainerMounts(
  definition: DockerCompose.Service
): Array<DockerEngine.Service.TaskSpec.ContainerSpec.Mount> | undefined {
  if (!definition || !definition.volumes) {
    return undefined
  }

  // TODO: handle all volume types
  return _
    .map(definition.volumes, (entry) => {
      const [from, to, flag] = entry.split(':')

      if (!path.isAbsolute(from)) {
        return undefined
      }

      const mount: DockerEngine.Service.TaskSpec.ContainerSpec.Mount = {
        Target: to,
        Source: from,
        Type: 'bind',
        ReadOnly: flag === 'ro',
      }

      return mount
    })
    .filter(
      (volume): volume is DockerEngine.Service.TaskSpec.ContainerSpec.Mount => {
        return volume !== undefined && typeof volume === 'object'
      }
    )
}

function getTaskPlacement(
  definition: DockerCompose.Service
): DockerEngine.Service.TaskSpec.Placement | undefined {
  if (
    !definition ||
    !definition.deploy ||
    !definition.deploy.placement ||
    !definition.deploy.placement.constraints
  ) {
    return undefined
  }

  return {
    Constraints: definition.deploy.placement.constraints,
  }
}

function getTaskRestartPolicy(
  definition: DockerCompose.Service
): DockerEngine.Service.TaskSpec.RestartPolicy | undefined {
  if (!definition || !definition.deploy || !definition.deploy.restart_policy) {
    // TODO: handle `restart` key
    // https://github.com/docker/docker/blob/1dd941077653bc93ee4141c4d2bac90534678e3f/runconfig/opts/parse.go#L63
    // https://github.com/docker/docker/blob/c430aea83c822a506640b10d5e5290b7c86ee46a/cli/compose/convert/service.go#L289
    return undefined
  }

  return {
    Condition: definition.deploy.restart_policy.condition,
    Delay:
      durationParse(definition.deploy.restart_policy.delay || '0s') * timeMult,
    MaxAttempts: definition.deploy.restart_policy.max_attempts,
    Window:
      durationParse(definition.deploy.restart_policy.window || '0s') * timeMult,
  }
}

function getTaskNetwork(
  definition: DockerCompose.Service,
  networks: DockerCompose.Network.Collection
): Array<DockerEngine.Service.TaskSpec.Network> | undefined {
  if (!definition || !definition.networks) {
    return undefined
  }

  if (Array.isArray(definition.networks)) {
    return _.map(definition.networks, (name) => {
      return {
        Target: resolveDockerComposeNetworkName(name, networks),
      }
    })
  }

  return _.map(definition.networks, (network, name) => {
    return {
      Target: resolveDockerComposeNetworkName(name, networks),
      Aliases: network.aliases,
    }
  })
}

function getTaskResources(
  definition: DockerCompose.Service
): DockerEngine.Service.TaskSpec.Resources | undefined {
  if (!definition || !definition.deploy || !definition.deploy.resources) {
    return undefined
  }

  let resources

  if (
    definition.deploy.resources.limits &&
    definition.deploy.resources.limits.cpus
  ) {
    resources = _.merge({}, resources, {
      Limits: {
        NanoCPUs: Math.round(
          parseFloat(definition.deploy.resources.limits.cpus) * nanoMult
        ),
      },
    })
  }

  if (
    definition.deploy.resources.limits &&
    definition.deploy.resources.limits.memory
  ) {
    resources = _.merge({}, resources, {
      Limits: {
        MemoryBytes: getRAMInBytes(definition.deploy.resources.limits.memory),
      },
    })
  }

  if (
    definition.deploy.resources.reservations &&
    definition.deploy.resources.reservations.cpus
  ) {
    resources = _.merge({}, resources, {
      Reservation: {
        NanoCPUs: Math.round(
          parseFloat(definition.deploy.resources.reservations.cpus) * nanoMult
        ),
      },
    })
  }

  if (
    definition.deploy.resources.reservations &&
    definition.deploy.resources.reservations.memory
  ) {
    resources = _.merge({}, resources, {
      Reservation: {
        MemoryBytes: getRAMInBytes(
          definition.deploy.resources.reservations.memory
        ),
      },
    })
  }

  return resources
}

function getContainerCommand(
  definition: DockerCompose.Service
): Array<string> | undefined {
  if (!definition || !definition.entrypoint) {
    return undefined
  }

  if (Array.isArray(definition.entrypoint)) {
    return definition.entrypoint.map((part) => {
      return part.toString()
    })
  }

  return definition.entrypoint.split(' ')
}

function getContainerArgs(
  definition: DockerCompose.Service
): Array<string> | undefined {
  if (!definition || !definition.command) {
    return undefined
  }

  if (Array.isArray(definition.command)) {
    return definition.command.map((part) => {
      return part.toString()
    })
  }

  return definition.command.split(' ')
}

function getContainerHealthCheck(
  definition: DockerCompose.Service
): DockerEngine.Service.TaskSpec.ContainerSpec.HealthConfig | undefined {
  if (!definition || !definition.healthcheck) {
    return undefined
  }

  let config

  if (definition.healthcheck.test) {
    if (Array.isArray(definition.healthcheck.test)) {
      config = _.merge({}, config, {
        Test: definition.healthcheck.test,
      })
    }
  }

  if (definition.healthcheck.interval) {
    config = _.merge({}, config, {
      Interval: durationParse(definition.healthcheck.interval) * timeMult,
    })
  }

  if (definition.healthcheck.timeout) {
    config = _.merge({}, config, {
      Timeout: durationParse(definition.healthcheck.timeout) * timeMult,
    })
  }

  if (definition.healthcheck.retries) {
    config = _.merge({}, config, {
      Retries: parseInt(definition.healthcheck.retries, 10),
    })
  }

  return config
}

function getPortRange(start: number, end?: number): Array<Number> {
  if (!start) {
    return []
  }

  const rangeStart = start
  const rangeEnd = (end || start) + 1

  return _.range(rangeStart, rangeEnd)
}

function getServicePorts(
  definition: DockerCompose.Service
): Array<DockerEngine.Service.EndpointSpec.PortConfig> | undefined {
  if (!definition || !definition.ports) {
    return undefined
  }

  return definition.ports.reduce((result: any[], port: any) => {
    if (typeof port === 'string') {
      // published_ip seems to be used...
      const parsedPort = parsePortShortFormat(port)
      if (!parsedPort) {
        throw new Error(`Incorrect port format for ${port}`)
      }
      const targetRange = getPortRange(
        parsedPort.containerPort,
        parsedPort.containerPortEnd
      )
      const publishedRange = getPortRange(
        parsedPort.hostPort,
        parsedPort.hostPortEnd
      )

      if (
        publishedRange.length > 0 &&
        targetRange.length !== publishedRange.length
      ) {
        throw new Error(`Port mapping ranges don't have the same length`)
      }

      targetRange.forEach((target: Number, i) => {
        result.push({
          Protocol: parsedPort.protocol || 'tcp',
          TargetPort: target,
          PublishedPort: publishedRange[i],
        })
      })
    } else {
      result.push({
        Protocol: port.protocol || 'tcp',
        TargetPort: port.target,
        PublishedPort: port.published,
      })
    }

    return result
  }, [])
}

export function fromCompose(
  name: string,
  definition: DockerCompose.Service,
  networks?: DockerCompose.Network.Collection
): DockerEngine.Service {
  return {
    Name: name,
    Labels: getServiceLabels(definition),
    TaskTemplate: {
      ContainerSpec: {
        Image: definition.image,
        Labels: getContainerLabels(definition),
        Command: getContainerCommand(definition),
        Args: getContainerArgs(definition),
        Hostname: definition.hostname,
        Env: getContainerEnv(definition),
        Dir: definition.working_dir,
        User: definition.user,
        Groups: definition.group_add,
        TTY: definition.tty,
        OpenStdin: definition.stdin_open,
        ReadOnly: definition.read_only,
        Mounts: getContainerMounts(definition),
        StopGracePeriod:
          durationParse(definition.stop_grace_period || '10s') * timeMult,
        HealthCheck: getContainerHealthCheck(definition),
        Hosts: getContainerHosts(definition),
        DNSConfig: getContainerDNSConfig(definition),
      },
      Resources: getTaskResources(definition),
      RestartPolicy: getTaskRestartPolicy(definition),
      Placement: getTaskPlacement(definition),
      Networks: (networks && getTaskNetwork(definition, networks)) || undefined,
    },
    Mode: getServiceMode(definition),
    UpdateConfig: getServiceUpdateConfig(definition),
    Networks:
      (networks && getServiceNetworks(definition, networks)) || undefined,
    EndpointSpec: {
      Mode: 'vip',
      Ports: getServicePorts(definition),
    },
  }
}

export function fromComposeCollection(
  services?: DockerCompose.Service.Collection,
  networks?: DockerCompose.Network.Collection
): Array<DockerEngine.Service> {
  return _.map(services, (definition, name) => {
    return fromCompose(name, definition, networks)
  })
}
