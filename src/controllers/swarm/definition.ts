import opsSvc from '../../resources/ops'

export async function listDefinitions() {
  return opsSvc.listDefinitions()
}

export async function getDefinition(name: string) {
  return opsSvc.getDefinition(name)
}

export async function updateDefinition(name: string, servicesTags: any[]) {
  await opsSvc.updateDefinition(name, servicesTags)

  return `Definition ${name} updated.`
}
