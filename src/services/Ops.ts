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

  async getDefinition (definitionName: string): Promise<any> {
    const githubPath = pathLib.join(
      '/repos', this.options.repository, 'contents',
      this.options.repositoryPath, `${definitionName}.yml`
    );

    try {
      const definitionFile: Github.Content.IContent = await this.api.get(githubPath);
      const ymlDefinition = Buffer.from(definitionFile.content, 'base64').toString();
      const jsonDefinition = yaml.safeLoad(ymlDefinition);
      return jsonDefinition;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async listDefinitions (): Promise<string[]> {
    const githubPath = pathLib.join(
      '/repos', this.options.repository, 'contents',
      this.options.repositoryPath
    );

    const definitionFiles: Github.Content.IContent[] = await this.api.get(githubPath);
    return definitionFiles
    .filter((definitionFile) => {
      return (definitionFile.type === 'file')
        && (definitionFile.name.endsWith('.yml'));
    })
    .map((definitionFile) => definitionFile.name);
  }
}
