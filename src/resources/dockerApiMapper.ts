import * as config from 'config';
import DockerApiMapper from '../lib/DockerApiMapper';

export default new DockerApiMapper(
  config.get<string>('docker.api.version')
);
