import * as jp from 'jsonpath';
import * as _ from 'lodash';
import * as path from 'path';
import * as Ajv from 'ajv';

import { DockerCompose } from '../interfaces/docker/compose';
import { DockerEngine } from '../interfaces/docker/engine';
import * as Service from '../mappings/Service';

interface IDockerApiMapperOptions {
  mappingsDir?: string;
}

export default class DockerApiMapper {
  private apiVersion: string;
  private mappingsDir: string;
  private validator: Ajv.Ajv;

  constructor (apiVersion: string, options: IDockerApiMapperOptions = {}) {
    this.apiVersion = apiVersion;
    this.mappingsDir = options.mappingsDir || '../mappings';
    this.validator = new Ajv();
  }

  loadSchema (version: string) {
    const fileName = `config_schema_v${version}.json`;
    return require(`../schemas/${fileName}`);
  }

  mapServices(composeValues: DockerCompose.Compose) {
    const composeVersion = composeValues.version;

    if (!composeVersion) {
      throw new Error('Definition file have no version.');
    }

    const composeSchema = this.loadSchema(composeVersion);

    if (!composeSchema) {
      throw new Error('Definition file version not managed.');
    }

    const valid = this.validator.validate(composeValues, composeSchema);
    if (!valid) {
      console.error(this.validator.errors);
      throw new Error('Definition file not valid.');
    }

    return Service.fromComposeCollection(composeValues.services, composeValues.networks);
  }
};
