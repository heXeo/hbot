import compareVersions from 'compare-versions'
// Here the engine version is the lowest needed to support all docker compose features
import composeVersionMap from './composeVersionMap.json'
// Here the engine version is the greatest for which the api support all features
import apiVersionMap from './apiVersionMap.json'

interface Dictionnary<T> {
  [key: string]: T
}

type VersionMap = Dictionnary<string>

export function normalizeComposeVersion(composeVersion: string): string {
  return composeVersion.replace(/^(\d+)$/, '$1.0')
}

export function normalizeEngineVersion(baseEngineVersion: string): string {
  return baseEngineVersion.replace(/-(ce|ee)$/, '')
}

function getMinimalEngineVersion(nodes: Array<any>): string {
  return nodes.reduce((lowestEngineVersion: string, node: any) => {
    const nodeEngineVersion: string = normalizeEngineVersion(
      node.Description.Engine.EngineVersion
    )
    if (
      !lowestEngineVersion ||
      compareVersions(nodeEngineVersion, lowestEngineVersion) < 0
    ) {
      return nodeEngineVersion
    }

    return lowestEngineVersion
  }, '')
}

export function composeVersionChecker(
  composeVersion: string,
  nodes: Array<any>,
  apiVersion?: string
) {
  const nComposeVersion: string = normalizeComposeVersion(composeVersion)
  const minimalEngineVersion: string = (composeVersionMap as VersionMap)[
    nComposeVersion
  ]
  if (!minimalEngineVersion) {
    throw new Error(`Unknown Docker Compose ${composeVersion}`)
  }
  const actualEngineVersion = getMinimalEngineVersion(nodes)

  if (!apiVersion) {
    return compareVersions(actualEngineVersion, minimalEngineVersion) >= 0
  }

  const highestEngineVersion = (apiVersionMap as VersionMap)[apiVersion]
  // Might be too high since api version might support mutliple engine versions
  if (compareVersions(actualEngineVersion, highestEngineVersion) < 0) {
    return compareVersions(actualEngineVersion, minimalEngineVersion) >= 0
  }

  return compareVersions(highestEngineVersion, minimalEngineVersion) >= 0
}
