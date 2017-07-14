import * as config from 'config';
import githubApi from './githubApi';
import OpsService from '../services/Ops';

export default new OpsService(githubApi, {
  repository: config.get<string>('ops.repository'),
  repositoryPath: config.get<string>('ops.path')
});
