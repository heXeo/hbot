import {
  listDefinitions,
  getDefinition,
  updateDefinition
} from '../../controllers/swarm/definition';

export default function () {
  const mainCommand = this.rootCommand
  .command('definition')
  .showHelpOnEmpty();

  mainCommand
  .command('list')
  .description('List definitions')
  .action((metadata: any, options: any) => {
    this.handle(metadata, listDefinitions());
  });

  mainCommand
  .command('show <name>')
  .description('Show definitions')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, getDefinition(name));
  });

  mainCommand
  .command('update <name> <sesrvicesTags...>')
  .description([
    "Update definition service's tags on repository",
    'e.g.: !swarm definition mystack service1:tag1 service2:tag2'
  ].join('\n'))
  .action((metadata: any, name: string, servicesTags:any[], options: any) => {
    this.handle(metadata, updateDefinition(name, servicesTags));
  });

  mainCommand
  .command('*', { noHelp: true })
  .option('*', 'Catchall')
  .action((metadata: any, options: any) => {
    this.handle(metadata, Promise.resolve('Definitions sub-command not found...'));
  });
}
