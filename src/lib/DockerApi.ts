import * as request from 'request-promise-native';
import * as pathLib from 'path';
import * as urlLib from 'url';

interface IDockerApiOptions {
  version: string;
  uri: string;
  proxy?: {
    auth?: {
      token?: string;
      username?: string;
      password?: string;
    }
  }
  registry: {
    auth: {
      email: string;
      username: string;
      password: string;
    }
  }
}

interface IDockerApiRequestOptions {
  json?: boolean;
  query?: any;
  body?: any;
}

export default class DockerApi {
  private version: string;
  private uri: string;
  private proxyToken: string;
  private proxyAuth: any;
  private registryAuth: string;

  constructor (options: IDockerApiOptions) {
    this.version = options.version || '';
    this.uri = options.uri;

    if (options.proxy) {
      if (options.proxy.auth) {
        if (options.proxy.auth.token) {
          this.proxyToken = options.proxy.auth.token;
        }

        if (options.proxy.auth.username && options.proxy.auth.password) {
          this.proxyAuth = {
            username: options.proxy.auth.username,
            password: options.proxy.auth.password
          };
        }
      }
    }

    if (options.registry) {
      if (options.registry.auth) {
        if (options.registry.auth.email &&
            options.registry.auth.username &&
            options.registry.auth.password) {
          this.registryAuth = Buffer.from(JSON.stringify({
            email: options.registry.auth.email,
            username: options.registry.auth.username,
            password: options.registry.auth.password
          })).toString('base64');
        }
      }
    }
  }

  async req (method: string, path: string, options: IDockerApiRequestOptions = {}): Promise<any> {
    const apiPath = pathLib.join('/', `v${this.version}`, path);
    const requestOptions: any = {
      method: method,
      auth: this.proxyAuth,
      json: options.json !== undefined ? options.json : true,
      headers: {},
      uri: urlLib.resolve(this.uri, apiPath)
    };

    if (this.proxyToken) {
      requestOptions.headers['X-Auth-Token'] = this.proxyToken;
    }

    if (this.registryAuth) {
      requestOptions.headers['X-Registry-Auth'] = this.registryAuth;
    }

    if (options.query) {
      requestOptions.qs = options.query;
    }

    if (options.body) {
      requestOptions.body = options.body;
    }

    return request(requestOptions);
  }

  async get (path: string, options?: any) {
    return this.req('get', path, options);
  }

  async post (path: string, options?: any) {
    return this.req('post', path, options);
  }

  async put (path: string, options?: any) {
    return this.req('put', path, options);
  }

  async delete (path: string, options?: any) {
    return this.req('delete', path, options);
  }
}
