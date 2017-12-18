export namespace DockerEngine {
  // Commons
  export interface Dictionnary {
    [key: string]: any;
  }

  export interface StringDictionnary {
    [key: string]: string;
  }

  // Networks
  export interface Network {
    Name: string;
    CheckDuplicate?: boolean;
    Driver?: string;
    Internal?: boolean;
    Attachable?: boolean;
    IPAM?: Network.IPAM;
    EnableIPv6?: boolean;
    Options?: StringDictionnary;
    Labels?: StringDictionnary;
  }

  export namespace Network {
    export interface IPAM {
      Driver?: string;
      Config?: Array<IPAM.Config>;
    }

    export namespace IPAM {
      export interface Config {
        Subnet?: string;
        IPRange?: string;
        Gateway?: string;
        AuxAddress?: string;
      }
    }
  }

  // Services
  export interface Service {
    Name: string;
    Labels?: StringDictionnary;
    TaskTemplate: Service.TaskSpec;
    Mode?: Service.Mode;
    UpdateConfig?: Service.UpdateConfig;
    Networks?: Array<Service.Network>;
    EndpointSpec?: Service.EndpointSpec;
  }

  export namespace Service {
    export interface TaskSpec {
      ContainerSpec?: TaskSpec.ContainerSpec;
      Resources?: TaskSpec.Resources;
      RestartPolicy?: TaskSpec.RestartPolicy;
      Placement?: TaskSpec.Placement;
      ForceUpdate?: number;
      Networks?: Array<TaskSpec.Network>;
      LogDriver?: TaskSpec.LogDriver;
    }

    export namespace TaskSpec {
      export interface ContainerSpec {
        Image?: string;
        Labels?: StringDictionnary;
        Command?: Array<string>;
        Args?: Array<string>;
        Hostname?: string;
        Env?: Array<string>;
        Dir?: string;
        User?: string;
        Groups?: Array<string>;
        TTY?: boolean;
        OpenStdin?: boolean;
        ReadOnly?: boolean;
        Mounts?: Array<ContainerSpec.Mount>;
        StopGracePeriod: number;
        HealthCheck?: ContainerSpec.HealthConfig;
        Hosts?: Array<string>;
        DNSConfig?: ContainerSpec.DNSConfig;
        Secrets?: Array<ContainerSpec.Secret>;
      }

      export namespace ContainerSpec {
        export interface Mount {
          Target?: string;
          Source?: string;
          Type?: string;
          ReadOnly?: boolean;
          BindOptions?: Mount.BindOptions;
        }

        export namespace Mount {
          export interface BindOptions {
            Propagation?: string;
          }

          export interface VolumeOptions {
            NoCopy?: boolean;
            Labels?: StringDictionnary;
            DriverConfig?: VolumeOptions.DriverConfig;
          }

          export namespace VolumeOptions {
            export interface DriverConfig {
              Name?: string;
              Options: StringDictionnary;
            }
          }

          export interface TmpfsOptions {
            SizeButes?: number;
            Mode?: number;
          }
        }

        export interface HealthConfig {
          Test?: Array<string>;
          Interval?: number;
          Timeout?: number;
          Retries?: number;
        }

        export interface DNSConfig {
          Nameservers?: Array<string>;
          Search?: Array<string>;
          Options?: Array<string>;
        }

        export interface Secret {
          SecretName?: string;
          SecretID?: string;
          File?: Secret.File;
        }

        export namespace Secret {
          export interface File {
            Name?: string;
            UID?: string;
            GID?: string;
            Mode?: number;
          }
        }
      }

      export interface Resources {
        Limits?: Resources.Limits;
        Reservation?: Resources.Reservation;
      }

      export namespace Resources {
        export interface Limits {
          NanoCPUs?: number;
          MemoryBytes?: number;
        }

        export interface Reservation {
          NanoCPUs?: number;
          MemoryBytes?: number;
        }
      }

      export interface LogDriver {
        Name: string;
        Options?: StringDictionnary;
      }

      export interface Network {
        Target: string;
        Aliases?: Array<string>;
      }

      export interface Placement {
        Constraints?: Array<string>;
        Preferences?: Array<Placement.PlacementPreference>;
      }

      export namespace Placement {
        export interface PlacementPreference {
          Spread?: PlacementPreference.SpreadOver;
        }

        export namespace PlacementPreference {
          export interface SpreadOver {
            SpreadDescriptor: string;
          }
        }
      }

      export interface RestartPolicy {
        Condition?: string;
        Delay?: number;
        MaxAttempts?: number;
        Window?: number;
      }
    }

    export interface Mode {
      Global?: Mode.Global;
      Replicated?: Mode.Replicated;
    }

    export namespace Mode {
      export interface Global {}

      export interface Replicated {
        Replicas: number;
      }
    }

    export interface UpdateConfig {
      Parallelism?: number;
      Delay?: number;
      FailureAction?: string;
      Monitor?: number;
      MaxFailureRatio?: number;
      Order?: string;
    }

    export interface Network {
      Target: string;
    }

    export interface EndpointSpec {
      Mode?: string;
      Ports?: Array<EndpointSpec.PortConfig>;
    }

    export namespace EndpointSpec {
      export interface PortConfig {
        Name?: string;
        Protocol: string;
        TargetPort: number;
        PublishedPort: number;
      }
    }
  }
}
