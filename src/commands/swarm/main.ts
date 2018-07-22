import {getInfos, deploy} from '../../controllers/swarm/main'

export default function(this: any) {
  const mainCommand = this.rootCommand

  mainCommand
    .command('info')
    .description('Info on the Swarm')
    .action((metadata: any, _options: any) => {
      this.handle(metadata, getInfos())
    })

  mainCommand
    .command('deploy <name> [services-tags...]')
    .description(
      [
        'Deploy services in definition <name> from the definition.yml',
        'service-tags are used to update image\'s tags in the definition',
        'e.g.: !swarm deploy mydefinition service1:tag1 service2:tag2',
      ].join('\n')
    )
    .option('-p, --prune', 'Prune services that are no longer referenced')
    .option('-k, --keep', 'Keep services that are no longer referenced')
    .option('-f, --force', 'Force deploy all services, even unchanged ones')
    .action(
      (metadata: any, name: string, servicesTags: any[], options: any) => {
        // Need to cast to have boolean instead of string|null
        const prune = !!options.prune
        const keep = !!options.keep
        const force = !!options.force
        this.handle(metadata, deploy(name, servicesTags, prune, keep, force))
      }
    )
}
