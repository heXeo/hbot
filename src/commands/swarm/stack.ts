import {
  listStacks,
  deployStack,
  deleteStack,
  getStackServices
} from '../../controllers/swarm/stack';

export default function () {
  const mainCommand = this.rootCommand
  .command('stack')
  .showHelpOnEmpty();

  mainCommand
  .command('list')
  .description('List all stacks')
  .action((metadata: any, options: any) => {
    this.handle(metadata, listStacks());
  });

  mainCommand
  .command('services <name>')
  .description('Get stack <name> services')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, getStackServices(name));
  });

  mainCommand
  .command('deploy <name>')
  .description('Deploy a new stack <name> from the stack.yml.')
  .option('-p, --prune', 'Prune services that are no longer referenced')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, deployStack(name, options.prune));
  });

   mainCommand
  .command('delete <name>')
  .description('Delete stack <name>')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, deleteStack(name));
  });

  mainCommand
  .command('*', { noHelp: true })
  .option('*', 'Catchall')
  .action((metadata: any, options: any) => {
    this.handle(metadata, Promise.resolve('Stacks sub-command not found...'));
  });
}
