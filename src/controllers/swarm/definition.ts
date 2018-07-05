import opsSvc from '../../resources/ops';

export async function listDefinitions () {
  return opsSvc.listDefinitions();
}

export async function getDefinition (name: string) {
  return opsSvc.getDefinition(name);
}
