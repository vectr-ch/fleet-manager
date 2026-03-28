interface NodeEditSource {
  name: string;
  serial?: string;
  base_id?: string;
}

export interface NodeEditDefaults {
  name: string;
  serial: string;
  baseId: string;
}

export function validateNodeEditName(name: string): string | null {
  return name.trim() ? null : "Drone name is required.";
}

export function validateNodeEditBaseId({
  baseId,
  hadBase,
}: {
  baseId: string;
  hadBase: boolean;
}): string | null {
  return !baseId.trim() && hadBase ? "Base assignment cannot be cleared from this form." : null;
}

export function getNodeEditDefaults(node: NodeEditSource): NodeEditDefaults {
  return {
    name: node.name,
    serial: node.serial ?? "",
    baseId: node.base_id ?? "",
  };
}
