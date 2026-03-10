export function createRawEventId(sourceKind: "reddit" | "x", sourceEventId: string) {
  return `raw_${sourceKind}_${sourceEventId}`;
}

export function createSignalId(sourceKind: "reddit" | "x", sourceEventId: string) {
  return `sig_${sourceKind}_${sourceEventId}`;
}
