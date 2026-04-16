export const documentsQueryKey = ["documents"] as const;

export function documentQueryKey(documentId: string) {
  return ["document", documentId] as const;
}

export function documentCollaboratorsQueryKey(documentId: string) {
  return ["document", documentId, "collaborators"] as const;
}
