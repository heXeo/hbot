import {
  listServices,
  getService,
  searchService,
  scaleService,
  deleteService,
  getServiceTasks,
  getServiceLogs,
} from '../../controllers/swarm/service'

import slackApi from '../../resources/slackApi'

// FIXME: replace `this: any`
export default function(this: any) {
  const mainCommand = this.rootCommand.command('service').showHelpOnEmpty()

  mainCommand
    .command('list')
    .description('List all services')
    .action((metadata: any, _options: any) => {
      this.handle(metadata, listServices())
    })

  mainCommand
    .command('show <name>')
    .description('Show details of <name> service')
    .action((metadata: any, name: string, _options: any) => {
      this.handle(metadata, getService(name))
    })

  mainCommand
    .command('search <name>')
    .description('Search service based on <name>')
    .action((metadata: any, name: string, _options: any) => {
      this.handle(metadata, searchService(name))
    })

  mainCommand
    .command('scale <name> <replicas>')
    .description('Scale service <name> to <replicas>')
    .action((metadata: any, name: string, replicas: string, _options: any) => {
      this.handle(metadata, scaleService(name, parseInt(replicas, 10)))
    })

  mainCommand
    .command('delete <name>')
    .description('Delete service <name>')
    .action((metadata: any, name: string, _options: any) => {
      this.handle(metadata, deleteService(name))
    })

  mainCommand
    .command('tasks <name>')
    .description('Get service <name> tasks')
    .action((metadata: any, name: string, _options: any) => {
      this.handle(metadata, getServiceTasks(name))
    })

  mainCommand
    .command('logs <name>')
    .description('Get service <name> logs')
    .action((metadata: any, name: string, _options: any) => {
      const promise = getServiceLogs(name)
        .then((zip) => {
          return slackApi.post('/files.upload', {
            formData: {
              file: {
                value: zip,
                options: {
                  filename: `${name}-logs.zip`,
                },
              },
              filename: `${name}-logs.zip`,
              channels: metadata.channel,
            },
          })
        })
        // We don't want slack bot to handle any return value
        .then(() => {
          return null
        })

      this.handle(metadata, promise)
    })

  mainCommand
    .command('*', {noHelp: true})
    .option('*', 'Catchall')
    .action((metadata: any, _options: any) => {
      this.handle(
        metadata,
        Promise.resolve('Services sub-command not found...')
      )
    })
}
