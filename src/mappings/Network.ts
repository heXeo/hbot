import * as _ from 'lodash';
import { DockerEngine } from '../interfaces/docker/engine';
import { DockerCompose } from '../interfaces/docker/compose';

export function fromCompose (name: string, definition: DockerCompose.Network): DockerEngine.Network {
  if (!_.isUndefined(definition.external)) {
    return null;
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
    IPAM: getIPAM(definition)
  };
}

export function fromComposeCollection (networks: DockerCompose.Network.Collection): Array<DockerEngine.Network> {
  return _.map(networks, (network, name) => {
    return this.fromCompose(name, network);
  }).filter(_.isObjectLike);
}

function getOptions (definition: DockerCompose.Network): DockerEngine.StringDictionnary {
  if (!_.has(definition, 'driver_opts')) {
    return undefined;
  }

  return _.transform(definition.driver_opts, (options, value, key) => {
    return Object.assign(options, {
      [key]: value.toString()
    });
  }, <DockerEngine.StringDictionnary>{});
}

function getLabels (definition: DockerCompose.Network): DockerEngine.StringDictionnary {
  if (!_.has(definition, 'labels')) {
    return undefined;
  }

  if (Array.isArray(definition.labels)) {
    return _.transform(definition.labels, (labels, label) => {
      const [ key, value ] = label.split('=');
      return Object.assign(labels, {
        [key]: value.toString()
      });
    }, <DockerEngine.StringDictionnary>{});
  } else {
    return _.transform(definition.labels, (labels, value, key) => {
      return Object.assign(labels, {
        [key]: value.toString()
      });
    }, <DockerEngine.StringDictionnary>{});
  }
}

function getIPAM (definition: DockerCompose.Network): DockerEngine.Network.IPAM {
  if (!_.has(definition, 'ipam')) {
    return undefined;
  }

  return {
    Driver: definition.ipam.driver,
    Config: _.map(definition.ipam.config, (composeConfig) => {
      const engineConfig: DockerEngine.Network.IPAM.Config = {
        Subnet: composeConfig.subnet
      };
      return engineConfig;
    })
  };
}
