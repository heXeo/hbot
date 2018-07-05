import {
  listDefinitions,
  getDefinition
} from '../../controllers/swarm/definition';

export default function () {
  const mainCommand = this.rootCommand
  .command('definition')
  .showHelpOnEmpty();

  mainCommand
  .command('list')
  .description('List service definitions')
  .action((metadata: any, options: any) => {
    this.handle(metadata, listDefinitions());
  });

  mainCommand
  .command('show <name>')
  .description('Show service definitions')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, getDefinition(name));
  });

  mainCommand
  .command('*', { noHelp: true })
  .option('*', 'Catchall')
  .action((metadata: any, options: any) => {
    this.handle(metadata, Promise.resolve('Definitions sub-command not found...'));
  });
}
