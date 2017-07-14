import {
  listServices,
  getService,
  searchService,
  deployService,
  scaleService,
  deleteService,
  getServiceLogs
} from '../../controllers/swarm/service';

import slackApi from '../../resources/slackApi';

export default function () {
  const mainCommand = this.rootCommand
  .command('service')
  .showHelpOnEmpty();

  mainCommand
  .command('list')
  .description('List all services')
  .action((metadata: any, options: any) => {
    this.handle(metadata, listServices());
  });

  mainCommand
  .command('show <name>')
  .description('Show details of <name> service')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, getService(name));
  });

  mainCommand
  .command('search <name>')
  .description('Search service based on <name>')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, searchService(name));
  });

  mainCommand
  .command('deploy <name>')
  .option('-t, --tag <tag>', 'Set the service tag')
  .description('Deploy a new service <name> from the service.yml')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, deployService(name, options.tag));
  });

  mainCommand
  .command('scale <name> <replicas>')
  .description('Scale service <name> to <replicas>')
  .action((metadata: any, name: string, replicas: string, options: any) => {
    this.handle(metadata, scaleService(name, parseInt(replicas, 10)));
  });

   mainCommand
  .command('delete <name>')
  .description('Delete service <name>')
  .action((metadata: any, name: string, options: any) => {
    this.handle(metadata, deleteService(name));
  });

  mainCommand
  .command('logs <name>')
  .description('Get service <name> logs')
  .action((metadata: any, name: string, options: any) => {
    const promise = getServiceLogs(name)
    .then((zip) => {
      return slackApi.post('/files.upload', {
        formData: {
          file: {
            value: zip,
            options: {
              filename: `${name}-logs.zip`
            }
          },
          filename: `${name}-logs.zip`,
          channels: metadata.channel
        }
      });
    })
    // We don't want slack bot to handle any return value
    .then(() => {
      return null;
    });

    this.handle(metadata, promise);
  });

  mainCommand
  .command('*', { noHelp: true })
  .option('*', 'Catchall')
  .action((metadata: any, options: any) => {
    this.handle(metadata, Promise.resolve('Services sub-command not found...'));
  });
}
