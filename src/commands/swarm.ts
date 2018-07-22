import flat from 'flat'
import yaml from 'js-yaml'

import registerInfoCommand from './swarm/main'
import registerNodesCommand from './swarm/node'
import registerStacksCommand from './swarm/stack'
import registerServicesCommand from './swarm/service'
import registerDefinitionsCommand from './swarm/definition'

function flatInput(input: any) {
  let dislayInput = input
  if (Array.isArray(input)) {
    dislayInput = input.map((line) => flatInput(line))
  } else if (typeof input === 'object') {
    dislayInput = flat(input)
  }
  return dislayInput
}

function slackify(input: any) {
  if (!input) {
    return null
  }
  const output = flatInput(input)
  return `\`\`\`${yaml.safeDump(output)}\`\`\``
}

module.exports = (Commander: any) => {
  async function handle(metadata: any, promise: Promise<any>): Promise<void> {
    try {
      const result = await promise
      Commander.send({channel: metadata.channel}, slackify(result))
    } catch (error) {
      Commander.send({channel: metadata.channel}, slackify(error.message))
    }
  }

  const cmd = Commander.command('swarm').showHelpOnEmpty()

  const context = {
    handle,
    rootCommand: cmd,
  }

  registerInfoCommand.call(context)
  registerNodesCommand.call(context)
  registerStacksCommand.call(context)
  registerServicesCommand.call(context)
  registerDefinitionsCommand.call(context)

  cmd.command('*', {noHelp: true}).action((metadata: any) => {
    handle(metadata, Promise.resolve('Command not found...'))
  })
}
