import * as config from 'config';
import DockerApi from '../lib/DockerApi';

export default new DockerApi({
  version: config.get<string>('docker.api.version'),
  uri: config.get<string>('docker.api.uri'),
  proxy: {
    auth: {
      token: config.get<string>('docker.proxy.auth.token')
    }
  },
  registry: {
    auth: {
      email: config.get<string>('docker.registry.auth.email'),
      username: config.get<string>('docker.registry.auth.username'),
      password: config.get<string>('docker.registry.auth.password')
    }
  }
});
