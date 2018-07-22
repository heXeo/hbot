import config from 'config'
import DockerApi from '../lib/DockerApi'

export default new DockerApi({
  version: config.get<string>('docker.api.version'),
  uri: config.get<string>('agent.uri'),
  agent: {
    token: config.get<string>('agent.token'),
    proxy: {
      username: config.get<string>('agent.proxy.username'),
      password: config.get<string>('agent.proxy.password'),
    },
  },
  registry: {
    email: config.get<string>('docker.registry.email'),
    username: config.get<string>('docker.registry.username'),
    password: config.get<string>('docker.registry.password'),
  },
})
