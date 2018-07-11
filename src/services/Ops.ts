import * as yaml from 'js-yaml';
import * as pathLib from 'path';
import GithubApi from '../lib/GithubApi';
import { Github } from '../interfaces/github';

interface IOpsOptions {
  repository: string;
  repositoryPath: string;
}

function injectImageTag (serviceDefinition: any, tag: string) {
  const currentImageParts = serviceDefinition.image.split(':');

  serviceDefinition.image = `${currentImageParts[0]}:${tag}`;
}

export default class Ops {
  private api: GithubApi;
  private options: IOpsOptions;

  constructor (githubApi: GithubApi, options: IOpsOptions) {
    this.api = githubApi;
    this.options = options;
  }

  async getDefinition (name: string): Promise<any> {
    const githubPath = pathLib.join(
      '/repos', this.options.repository, 'contents',
      this.options.repositoryPath, `${name}.yml`
    );

    try {
      const definitionFile: Github.Content.IContent = await this.api.get(githubPath);
      const ymlDefinition = Buffer.from(definitionFile.content, 'base64').toString();
      const definition = yaml.safeLoad(ymlDefinition);
      return definition;
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

  async updateDefinition (name: string, servicesTags: any[]): Promise<string> {
    const githubPath = pathLib.join(
      '/repos', this.options.repository, 'contents',
      this.options.repositoryPath, `${name}.yml`
    );
    const definitionFile: Github.Content.IContent = await this.api.get(githubPath);
    const ymlDefinition = Buffer.from(definitionFile.content, 'base64').toString();
    const definition = yaml.safeLoad(ymlDefinition);

    servicesTags.forEach((serviceTag: any) => {
      const serviceTagParts = serviceTag.split(':');
      const serviceToUpdate = definition.services[serviceTagParts[0]];
      const newTag = serviceTagParts[1];

      if (serviceToUpdate && newTag) {
        injectImageTag(serviceToUpdate, newTag);
      }
    });

    const newYmlDefinition = yaml.safeDump(definition);
    return this.api.put(githubPath, {
      body: {
        message: 'image tags update',
        content: Buffer.from(newYmlDefinition).toString('base64'),
        sha: definitionFile.sha
      }
    });
  }
}
