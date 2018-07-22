import {listNodes} from '../../controllers/swarm/node'

// FIXME: replace `this: any`
export default function(this: any) {
  this.rootCommand
    .command('node')
    .description('List nodes in the Swarm')
    .action((metadata: any, _options: any) => {
      this.handle(metadata, listNodes())
    })
}
