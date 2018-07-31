import request from 'request-promise-native'

interface IGithubApiAuthOptions {
  username: string
  password: string
}

export default class GithubApi {
  baseUrl: string
  auth: IGithubApiAuthOptions

  constructor(auth: IGithubApiAuthOptions) {
    this.baseUrl = 'https://api.github.com'
    this.auth = auth
  }

  async req(method: string, path: string, options: any = {}): Promise<any> {
    const reqOptions: any = {
      baseUrl: this.baseUrl,
      uri: path,
      auth: this.auth,
      method: method,
      json: true,
      headers: {
        'User-Agent': 'hbot',
      },
    }

    if (options.query) {
      reqOptions.qs = options.query
    }

    if (options.body) {
      reqOptions.body = options.body
    }

    return request(reqOptions)
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
