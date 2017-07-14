import { getInfos } from '../../controllers/swarm/info';

export default function () {
  this.rootCommand
  .command('info')
  .description('Info on the Swarm')
  .action((metadata: any, options: any) => {
    this.handle(metadata, getInfos())
  });
}
