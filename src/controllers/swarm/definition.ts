import opsSvc from '../../resources/ops';

export function listServiceDefinitions () {
  return opsSvc.listServiceDefinitions();
}

export function getServiceDefinition (name: string) {
  return opsSvc.getServiceDefinition(name);
}
