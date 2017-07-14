import { listNodes } from '../../controllers/swarm/node';

export default function () {
  this.rootCommand
  .command('node')
  .description('List nodes in the Swarm')
  .action((metadata: any, options: any) => {
    this.handle(metadata, listNodes());
  });
}
