import {
  listStacks,
  deleteStack,
  getStackServices,
} from '../../controllers/swarm/stack'

// FIXME: replace `this: any`
export default function(this: any) {
  const mainCommand = this.rootCommand.command('stack').showHelpOnEmpty()

  mainCommand
    .command('list')
    .description('List all stacks')
    .action((metadata: any, _options: any) => {
      this.handle(metadata, listStacks())
    })

  mainCommand
    .command('services <name>')
    .description('Get stack <name> services')
    .action((metadata: any, name: string, _options: any) => {
      this.handle(metadata, getStackServices(name))
    })

  mainCommand
    .command('delete <name>')
    .description('Delete stack <name>')
    .action((metadata: any, name: string, _options: any) => {
      this.handle(metadata, deleteStack(name))
    })

  mainCommand
    .command('*', {noHelp: true})
    .option('*', 'Catchall')
    .action((metadata: any, _options: any) => {
      this.handle(metadata, Promise.resolve('Stacks sub-command not found...'))
    })
}
