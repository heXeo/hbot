export namespace DockerCompose {
  // Commons
  export interface Dictionnary {
    [key: string]: string | number;
  }

  export interface StringDictionnary {
    [key: string]: string;
  }

  export interface Compose {
    version?: string;
    services?: Service.Collection;
    networks?: Network.Collection;
  }

  // Networks
  export interface Network {
    driver?: string;
    driver_opts?: StringDictionnary;
    internal?: boolean;
    external?: boolean | Network.External;
    ipam?: Network.IPAM;
    enableIPv6?: boolean;
    labels?: StringDictionnary | Array<string>;
  }

  export namespace Network {
    export interface Collection {
      [key: string]: Network;
    }

    export interface External {
      name: string;
    }

    export interface IPAM {
      driver?: string;
      config?: Array<IPAM.Config>;
    }

    export namespace IPAM {
      export interface Config {
        subnet?: string;
      }
    }
  }

  // Services
  export interface Service {
    build?: string | Service.Build;
    cap_add?: Array<string>;
    cap_drop?: Array<string>;
    command?: string | Array<string>;
    cgroup_parent?: string;
    container_name?: string;
    deploy?: Service.Deploy;
    devices?: Array<string>;
    depends_on?: Array<string>;
    dns?: string | Array<string>;
    dns_search?: string | Array<string>;
    tmpfs?: string | Array<string>;
    entrypoint?: string | Array<string>;
    env_file?: string | Array<string>;
    environment?: StringDictionnary | Array<string>;
    expose?: Array<string>;
    external_links?: Array<string>;
    extra_hosts?: Array<string>;
    group_add?: Array<string>;
    healthcheck?: Service.HealthCheck;
    image?: string;
    isolation?: string;
    labels?: StringDictionnary | Array<string>;
    links?: Array<string>;
    logging?: Service.Logging;
    network_mode?: string;
    networks?: Array<string> | Service.Network.Collection;
    pid?: string;
    ports?: Array<string>;
    secrets?: Array<string> | Service.Secret.Collection;
    security_options?: Array<string>;
    stop_grace_period?: string;
    stop_signal?: string;
    sysctls?: Dictionnary | Array<string>;
    ulimits?: Service.ULimits;
    userns_mode?: string;
    volumes?: Array<string>;
    volume_driver?: string;
    domainname?: string;
    hostname?: string;
    ipc?: string;
    mac_address?: string;
    privileged?: boolean;
    restart?: string;
    read_only?: boolean;
    shm_size?: string;
    stdin_open?: boolean;
    tty?: boolean;
    user?: string;
    working_dir?: string;
  }

  export namespace Service {
    export interface Collection {
      [key: string]: Service;
    }

    export interface Build {
      context?: string;
      dockerfile?: string;
      args?: StringDictionnary | Array<string>;
    }

    export interface Deploy {
      mode?: string;
      replicas?: number;
      placement: Deploy.Placement;
      update_config: Deploy.UpdateConfig;
      resources?: Deploy.Resources;
      restart_policy: Deploy.RestartPolicy;
      labels?: StringDictionnary | Array<string>;
    }

    export namespace Deploy {
      export interface Placement {
        constraints?: Array<string>;
      }

      export interface UpdateConfig {
        parallelism?: number;
        delay?: string;
        failure_action?: string;
        monitor?: string;
        max_failure_ratio?: number;
        order?: string;
      }

      export interface Resources {
        limits?: Resources.Limits;
        reservations?: Resources.Reservations;
      }

      export namespace Resources {
        export interface Limits {
          cpus?: string;
          memory?: string;
        }

        export interface Reservations {
          cpus?: string;
          memory?: string;
        }
      }

      export interface RestartPolicy {
        condition?: string;
        delay?: string;
        max_attempts?: number;
        window?: string;
      }
    }

    export interface HealthCheck {
      test?: string | Array<string>;
      disable?: boolean;
      interval?: string;
      timeout?: string;
      retries?: string;
    }

    export interface Logging {
      driver?: string;
      options?: StringDictionnary;
    }

    export interface Network {
      aliases?: Array<string>;
      ipv4_address?: string;
      ipv6_address?: string;
      link_local_ips?: Array<string>;
    }

    export namespace Network {
      export interface Collection {
        [key: string]: Network;
      }
    }

    export interface Secret {
      source?: string;
      target?: string;
      uid?: number | string;
      gid?: number | string;
      mode?: number | string;
    }

    export namespace Secret {
      export interface Collection {
        [key: string]: Secret;
      }
    }

    export interface ULimits {
      nproc?: number | string;
      nofile?: Dictionnary;
    }
  }

  // Volumes
  export interface Volume {
    driver?: string;
    driver_opts?: Dictionnary;
    external?: boolean | Volume.External;
    labels?: StringDictionnary | Array<string>;
  }

  export namespace Volume {
    export interface Collection {
      [key: string]: Volume;
    }

    export interface External {
      name?: string;
    }
  }

  // Secrets
  export interface Secret {
    file?: string;
    external?: boolean;
  }

  export namespace Secret {
    export interface Collection {
      [key: string]: Secret;
    }
  }
}
