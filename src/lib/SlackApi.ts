import request from 'request-promise-native'
import pathLib from 'path'

interface ISlackApiOptions {
  token: string
}

export default class SlackApi {
  token: string

  constructor(options: ISlackApiOptions) {
    this.token = options.token
  }

  async req(method: string, path: string, options: any = {}): Promise<any> {
    const apiPath = pathLib.join('/', path)
    const requestOptions: any = {
      baseUrl: 'https://slack.com/api',
      uri: apiPath,
      method: method,
      json: options.json !== undefined ? options.json : true,
      formData: options.formData,
      qs: options.query || {},
    }

    if (requestOptions.qs) {
      requestOptions.qs.token = this.token
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
