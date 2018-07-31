import yaml from 'js-yaml'
import pathLib from 'path'
import GithubApi from '../libs/GithubApi'
import {Github} from '../interfaces/github'

interface IOpsOptions {
  repository: string
  repositoryPath: string
}

function injectImageTag(serviceDefinition: any, tag: string) {
  const currentImageParts = serviceDefinition.image.split(':')

  serviceDefinition.image = `${currentImageParts[0]}:${tag}`
}

export default class Ops {
  private api: GithubApi
  private options: IOpsOptions

  constructor(githubApi: GithubApi, options: IOpsOptions) {
    this.api = githubApi
    this.options = options
  }

  async getDefinition(name: string): Promise<any> {
    const githubPath = pathLib.join(
      '/repos',
      this.options.repository,
      'contents',
      this.options.repositoryPath,
      `${name}.yml`
    )

    try {
      const definitionFile: Github.Content.IContent = await this.api.get(
        githubPath
      )

      if (definitionFile.type !== 'file' || !definitionFile.content) {
        throw new Error(`${githubPath} is not a file.`)
      }

      const ymlDefinition = Buffer.from(
        definitionFile.content,
        'base64'
      ).toString()

      return yaml.safeLoad(ymlDefinition)
    } catch (error) {
      if (error.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  async listDefinitions(): Promise<string[]> {
    const githubPath = pathLib.join(
      '/repos',
      this.options.repository,
      'contents',
      this.options.repositoryPath
    )

    const definitionFiles: Github.Content.IContent[] = await this.api.get(
      githubPath
    )
    return definitionFiles
      .filter((definitionFile) => {
        return (
          definitionFile.type === 'file' && definitionFile.name.endsWith('.yml')
        )
      })
      .map((definitionFile) => definitionFile.name)
  }

  async updateDefinition(name: string, servicesTags: any[]): Promise<any> {
    const githubPath = pathLib.join(
      '/repos',
      this.options.repository,
      'contents',
      this.options.repositoryPath,
      `${name}.yml`
    )
    const definitionFile: Github.Content.IContent = await this.api.get(
      githubPath
    )

    if (definitionFile.type !== 'file' || !definitionFile.content) {
      throw new Error(`${githubPath} is not a file.`)
    }

    const ymlDefinition = Buffer.from(
      definitionFile.content,
      'base64'
    ).toString()
    const definition = yaml.safeLoad(ymlDefinition)

    servicesTags.forEach((serviceTag: any) => {
      const serviceTagParts = serviceTag.split(':')
      const serviceToUpdate = definition.services[serviceTagParts[0]]
      const newTag = serviceTagParts[1]

      if (serviceTagParts.legnth > 2) {
        throw new Error(`Too many ":" separator for ${serviceTag}`)
      }
      if (!newTag) {
        throw new Error(`${serviceTag} is missing the tag part`)
      }
      if (!serviceToUpdate) {
        throw new Error(
          `${serviceTagParts[0]} doesn't exist in the ${name} definition`
        )
      }

      injectImageTag(serviceToUpdate, newTag)
    })

    const newYmlDefinition = yaml.safeDump(definition)
    await this.api.put(githubPath, {
      body: {
        message: `hbot image tag update(s): ${servicesTags.join(', ')}`,
        content: Buffer.from(newYmlDefinition).toString('base64'),
        sha: definitionFile.sha,
      },
    })

    return definition
  }
}
