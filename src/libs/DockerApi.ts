import request from 'request-promise-native'
import pathLib from 'path'
import urlLib from 'url'

interface IDockerApiOptions {
  version: string
  uri: string
  agent?: {
    token?: string
    proxy: {
      username?: string
      password?: string
    }
  }
  registry: {
    email: string
    username: string
    password: string
  }
}

interface IDockerApiRequestOptions {
  json?: boolean
  query?: any
  body?: any
}

export default class DockerApi {
  public readonly version: string
  private uri: string
  private agentToken: string | null = null
  private proxyAuth: any
  private registryAuth: string | null = null

  constructor(options: IDockerApiOptions) {
    this.version = options.version || ''
    this.uri = options.uri

    if (options.agent) {
      if (options.agent.token) {
        this.agentToken = options.agent.token
      }

      if (options.agent.proxy) {
        if (options.agent.proxy.username && options.agent.proxy.password) {
          this.proxyAuth = {
            username: options.agent.proxy.username,
            password: options.agent.proxy.password,
          }
        }
      }
    }

    if (options.registry) {
      if (
        options.registry.email &&
        options.registry.username &&
        options.registry.password
      ) {
        this.registryAuth = Buffer.from(
          JSON.stringify({
            email: options.registry.email,
            username: options.registry.username,
            password: options.registry.password,
          })
        ).toString('base64')
      }
    }
  }

  async req(
    method: string,
    path: string,
    options: IDockerApiRequestOptions = {}
  ): Promise<any> {
    const apiPath = this.version
      ? pathLib.join('/', `v${this.version}`, path)
      : path
    const requestOptions: any = {
      method: method,
      auth: this.proxyAuth,
      json: options.json !== undefined ? options.json : true,
      headers: {},
      uri: urlLib.resolve(this.uri, apiPath),
    }

    if (this.agentToken) {
      requestOptions.headers['X-Auth-Token'] = this.agentToken
    }

    if (this.registryAuth) {
      requestOptions.headers['X-Registry-Auth'] = this.registryAuth
    }

    if (options.query) {
      requestOptions.qs = options.query
    }

    if (options.body) {
      requestOptions.body = options.body
    }

    return request(requestOptions)
  }

  async get(path: string, options?: any) {
    return this.req('get', path, options)
  }

  async post(path: string, options?: any) {
    return this.req('post', path, options)
  }

  async put(path: string, options?: any) {
    return this.req('put', path, options)
  }

  async delete(path: string, options?: any) {
    return this.req('delete', path, options)
  }
}
