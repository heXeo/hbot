import Ajv from 'ajv'

import {DockerCompose} from '../interfaces/docker/compose'
import {normalizeComposeVersion} from '../helpers/composeVersionChecker'
import * as Service from '../mappings/Service'

export default class DockerApiMapper {
  private validator: Ajv.Ajv

  constructor() {
    this.validator = new Ajv()
  }

  loadSchema(version: string) {
    const fileName = `config_schema_v${version}.json`
    return require(`../schemas/${fileName}`)
  }

  mapServices(composeValues: DockerCompose.Compose) {
    const composeVersion = normalizeComposeVersion(composeValues.version)

    if (!composeVersion) {
      throw new Error('Definition file have no version.')
    }

    const composeSchema = this.loadSchema(composeVersion)

    if (!composeSchema) {
      throw new Error('Definition file version not managed.')
    }

    const valid = this.validator.validate(composeValues, composeSchema)
    if (!valid) {
      console.error(this.validator.errors)
      throw new Error('Definition file not valid.')
    }

    return Service.fromComposeCollection(
      composeValues.services,
      composeValues.networks
    )
  }
}
