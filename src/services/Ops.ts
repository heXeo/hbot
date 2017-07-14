import * as yaml from 'js-yaml';
import * as pathLib from 'path';
import GithubApi from '../lib/GithubApi';
import { Github } from '../interfaces/github';

interface IOpsOptions {
  repository: string;
  repositoryPath: string;
}

export default class Ops {
  private api: GithubApi;
  private options: IOpsOptions;

  constructor (githubApi: GithubApi, options: IOpsOptions) {
    this.api = githubApi;
    this.options = options;
  }

  async getServiceDefinition (serviceName: string): Promise<any> {
    const githubPath = pathLib.join(
      '/repos', this.options.repository, 'contents',
      this.options.repositoryPath, `${serviceName}.yml`
    );

    try {
      const serviceFile: Github.Content.IContent = await this.api.get(githubPath);
      const ymlDefinition = Buffer.from(serviceFile.content, 'base64').toString();
      const jsonDefinition = yaml.safeLoad(ymlDefinition);
      return jsonDefinition;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async listServiceDefinitions (): Promise<string[]> {
    const githubPath = pathLib.join(
      '/repos', this.options.repository, 'contents',
      this.options.repositoryPath
    );

    const serviceFiles: Github.Content.IContent[] = await this.api.get(githubPath);
    return serviceFiles
    .filter((serviceFile) => {
      return (serviceFile.type === 'file')
        && (serviceFile.name.endsWith('.yml'));
    })
    .map((serviceFile) => serviceFile.name);
  }
}
