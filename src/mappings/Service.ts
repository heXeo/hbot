import * as _ from 'lodash';
import * as path from 'path';
import * as bytes from 'bytes';
import { DockerCompose } from '../interfaces/docker/compose';
import { DockerEngine } from '../interfaces/docker/engine';
import { RAMInBytes } from './go-units/size';
const durationParse = require('parse-duration');

const nanoMult = Math.pow(10, 9);
const timeMult = Math.pow(10, 6);

export function fromCompose (name: string, definition: DockerCompose.Service, networks: DockerCompose.Network.Collection): DockerEngine.Service {
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
        StopGracePeriod: durationParse(definition.stop_grace_period || '10s') * timeMult,
        HealthCheck: getContainerHealthCheck(definition),
        Hosts: getContainerHosts(definition),
        DNSConfig: getContainerDNSConfig(definition)
      },
      Resources: getTaskResources(definition),
      RestartPolicy: getTaskRestartPolicy(definition),
      Placement: getTaskPlacement(definition),
      Networks: getTaskNetwork(definition, networks)
    },
    Mode: getServiceMode(definition),
    UpdateConfig: getServiceUpdateConfig(definition),
    Networks: getServiceNetworks(definition, networks),
    EndpointSpec: {
      Mode: 'vip'
    }
  };
}

export function fromComposeCollection (services: DockerCompose.Service.Collection, networks: DockerCompose.Network.Collection): Array<DockerEngine.Service> {
  return _.map(services, (definition, name) => {
    return this.fromCompose(name, definition, networks);
  });
}

function resolveDockerComposeNetworkName (name: string, networks: DockerCompose.Network.Collection): string {
  if (!_.has(networks, name)) {
    return name;
  }

  const network = _.get<DockerCompose.Network>(networks, name);
  if (!_.isBoolean(network.external)) {
    return network.external.name;
  }

  return name;
}

function getServiceMode (definition: DockerCompose.Service): DockerEngine.Service.Mode {
  if (!_.has(definition, 'deploy.mode')) {
    return undefined;
  }

  if (definition.deploy.mode === 'global') {
    return {
      Global: {}
    };
  } else if (definition.deploy.mode === 'replicated') {
    return {
      Replicated: {
        Replicas: definition.deploy.replicas
      }
    };
  } else {
    throw new Error('Unknown deploy mode');
  }
}

function getServiceUpdateConfig (definition: DockerCompose.Service): DockerEngine.Service.UpdateConfig {
  if (!_.has(definition, 'deploy.update_config')) {
    return undefined;
  }

  return {
    Parallelism: definition.deploy.update_config.parallelism,
    Delay: durationParse(definition.deploy.update_config.delay || '10s') * timeMult,
    FailureAction: definition.deploy.update_config.failure_action,
    Monitor: durationParse(definition.deploy.update_config.monitor || '0s') * timeMult,
    MaxFailureRatio: definition.deploy.update_config.max_failure_ratio,
    Order: definition.deploy.update_config.order || 'stop-first'
  };
}

function getServiceLabels (definition: DockerCompose.Service): DockerEngine.StringDictionnary {
  if (!_.has(definition, 'deploy.labels')) {
    return undefined;
  }

  if (Array.isArray(definition.deploy.labels)) {
    return _.transform(definition.deploy.labels, (labels, label) => {
      const [ key, value ] = label.split('=');
      return Object.assign(labels, {
        [key]: value.toString()
      });
    }, <DockerEngine.StringDictionnary>{});
  } else {
    return _.transform(definition.deploy.labels, (labels, value, key) => {
      return Object.assign(labels, {
        [key]: value.toString()
      });
    }, <DockerEngine.StringDictionnary>{});
  }
}

function getServiceNetworks (definition: DockerCompose.Service, networks: DockerCompose.Network.Collection): Array<DockerEngine.Service.Network> {
  if (!_.has(definition, 'networks')) {
    return undefined;
  }

  if (Array.isArray(definition.networks)) {
    return _.map(definition.networks, (name) => {
      return {
        Target: resolveDockerComposeNetworkName(name, networks)
      };
    });
  } else {
    return _.map(definition.networks, (network, name) => {
      return {
        Target: resolveDockerComposeNetworkName(name, networks)
      };
    });
  }
}

function getContainerLabels (definition: DockerCompose.Service): DockerEngine.StringDictionnary {
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

function getContainerEnv (definition: DockerCompose.Service): Array<string> {
  if (!_.has(definition, 'environment')) {
    return undefined;
  }

  if (Array.isArray(definition.environment)) {
    return definition.environment;
  } else {
    return _.map(definition.environment, (value, key) => {
      return `${key}=${value}`;
    });
  }
}

function getContainerDNSConfig (definition: DockerCompose.Service): DockerEngine.Service.TaskSpec.ContainerSpec.DNSConfig {
  if (!_.has(definition, 'dns') && !_.has(definition, 'dns_search')) {
    return undefined;
  }

  return {
    Nameservers: definition.dns && [].concat(definition.dns),
    Search: definition.dns_search && [].concat(definition.dns_search)
  };
}

function getContainerHosts (definition: DockerCompose.Service): Array<string> {
  if (!_.has(definition, 'extra_hosts')) {
    return undefined;
  }

  return _.map(definition.extra_hosts, (entry) => {
    const [ hostname, address ] = entry.split(':');
    return `${address} ${hostname}`;
  });
}

function getContainerMounts (definition: DockerCompose.Service): Array<DockerEngine.Service.TaskSpec.ContainerSpec.Mount> {
  if (!_.has(definition, 'volumes')) {
    return undefined;
  }

  // TODO: handle all volume types
  return _.map(definition.volumes, (entry) => {
    const [ from, to, flag ] = entry.split(':');

    if (!path.isAbsolute(from)) {
      return undefined;
    }

    return {
      Target: to,
      Source: from,
      Type: 'bind',
      ReadOnly: (flag === 'ro')
    };
  }).filter(_.isObjectLike);
}

function getTaskPlacement (definition: DockerCompose.Service): DockerEngine.Service.TaskSpec.Placement {
  if (!_.has(definition, 'deploy.placement.constraints')) {
    return undefined;
  }

  return {
    Constraints: definition.deploy.placement.constraints
  };
}

function getTaskRestartPolicy (definition: DockerCompose.Service): DockerEngine.Service.TaskSpec.RestartPolicy {
  if (!_.has(definition, 'deploy.restart_policy')) {
    // TODO: handle `restart` key
    // https://github.com/docker/docker/blob/1dd941077653bc93ee4141c4d2bac90534678e3f/runconfig/opts/parse.go#L63
    // https://github.com/docker/docker/blob/c430aea83c822a506640b10d5e5290b7c86ee46a/cli/compose/convert/service.go#L289
    return undefined;
  }

  return {
    Condition: definition.deploy.restart_policy.condition,
    Delay: durationParse(definition.deploy.restart_policy.delay || '0s') * timeMult,
    MaxAttempts: definition.deploy.restart_policy.max_attempts,
    Window: durationParse(definition.deploy.restart_policy.window || '0s') * timeMult
  };
}

function getTaskNetwork (definition: DockerCompose.Service, networks: DockerCompose.Network.Collection): Array<DockerEngine.Service.TaskSpec.Network> {
  if (!_.has(definition, 'networks')) {
    return undefined;
  }

  if (Array.isArray(definition.networks)) {
    return _.map(definition.networks, (name) => {
      return {
        Target: resolveDockerComposeNetworkName(name, networks)
      };
    });
  } else {
    return _.map(definition.networks, (network, name) => {
      return {
        Target: resolveDockerComposeNetworkName(name, networks),
        Aliases: network.aliases
      };
    });
  }
}

function getTaskResources (definition: DockerCompose.Service): DockerEngine.Service.TaskSpec.Resources {
  if (!_.has(definition, 'deploy.resources')) {
    return undefined;
  }

  let resources;

  if (_.has(definition, 'deploy.resources.limits.cpus')) {
    resources = _.merge({}, resources, {
      Limits: {
        NanoCPUs: Math.round(parseFloat(definition.deploy.resources.limits.cpus) * nanoMult)
      }
    });
  }

  if (_.has(definition, 'deploy.resources.limits.memory')) {
    resources = _.merge({}, resources, {
      Limits: {
        MemoryBytes: RAMInBytes(definition.deploy.resources.limits.memory)
      }
    });
  }

  if (_.has(definition, 'deploy.resources.reservations.cpus')) {
    resources = _.merge({}, resources, {
      Reservation: {
        NanoCPUs: Math.round(parseFloat(definition.deploy.resources.reservations.cpus) * nanoMult)
      }
    });
  }

  if (_.has(definition, 'deploy.resources.reservations.memory')) {
    resources = _.merge({}, resources, {
      Reservation: {
        MemoryBytes: RAMInBytes(definition.deploy.resources.reservations.memory)
      }
    });
  }

  return resources;
}

function getContainerCommand (definition: DockerCompose.Service): Array<string> {
  if (!_.has(definition, 'entrypoint')) {
    return undefined;
  }

  if (Array.isArray(definition.entrypoint)) {
    return definition.entrypoint.map((part) => {
      return part.toString();
    });
  } else {
    return definition.entrypoint.split(' ');
  }
}

function getContainerArgs (definition: DockerCompose.Service): Array<string> {
  if (!_.has(definition, 'command')) {
    return undefined;
  }

  if (Array.isArray(definition.command)) {
    return definition.command.map((part) => {
      return part.toString();
    });
  } else {
    return definition.command.split(' ');
  }
}

function getContainerHealthCheck (definition: DockerCompose.Service): DockerEngine.Service.TaskSpec.ContainerSpec.HealthConfig {
  if (!_.has(definition, 'healthcheck')) {
    return undefined;
  }

  let config;

  if (_.has(definition, 'healthcheck.test')) {
    if (Array.isArray(definition.healthcheck.test)) {
      config = _.merge({}, config, {
        Test: definition.healthcheck.test
      });
    }
  }

  if (_.has(definition, 'healthcheck.interval')) {
    config = _.merge({}, config, {
      Interval: durationParse(definition.healthcheck.interval) * timeMult
    });
  }

  if (_.has(definition, 'healthcheck.timeout')) {
    config = _.merge({}, config, {
      Timeout: durationParse(definition.healthcheck.timeout) * timeMult
    });
  }

  if (_.has(definition, 'healthcheck.retries')) {
    config = _.merge({}, config, {
      Retries: parseInt(definition.healthcheck.retries, 10)
    });
  }

  return config;
}
