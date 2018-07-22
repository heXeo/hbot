import _ from 'lodash'
import {DockerEngine} from '../interfaces/docker/engine'
import {DockerCompose} from '../interfaces/docker/compose'

function getOptions(
  definition: DockerCompose.Network
): DockerEngine.StringDictionnary | undefined {
  if (!definition || !definition.driver_opts) {
    return undefined
  }

  return _.transform(
    definition.driver_opts,
    (options, value, key) => {
      return Object.assign(options, {
        [key]: value.toString(),
      })
    },
    {} as DockerEngine.StringDictionnary
  )
}

function getLabels(
  definition: DockerCompose.Network
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

function getIPAM(
  definition: DockerCompose.Network
): DockerEngine.Network.IPAM | undefined {
  if (!definition || !definition.ipam) {
    return undefined
  }

  return {
    Driver: definition.ipam.driver,
    Config: _.map(definition.ipam.config, (composeConfig) => {
      const engineConfig: DockerEngine.Network.IPAM.Config = {
        Subnet: composeConfig.subnet,
      }
      return engineConfig
    }),
  }
}

export function fromCompose(
  name: string,
  definition: DockerCompose.Network
): DockerEngine.Network | undefined {
  if (definition.external === undefined) {
    return undefined
  }

  return {
    Name: name,
    CheckDuplicate: true,
    Driver: definition.driver,
    Internal: definition.internal,
    Attachable: true,
    EnableIPv6: definition.enableIPv6,
    Options: getOptions(definition),
    Labels: getLabels(definition),
    IPAM: getIPAM(definition),
  }
}

export function fromComposeCollection(
  networks: DockerCompose.Network.Collection
): Array<DockerEngine.Network> {
  return _
    .map(networks, (network, name) => {
      return fromCompose(name, network)
    })
    .filter(
      (network): network is DockerEngine.Network => {
        return network !== undefined && typeof network === 'object'
      }
    )
}
