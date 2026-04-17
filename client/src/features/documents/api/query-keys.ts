export const documentsQueryKey = ["documents"] as const;

export function documentQueryKey(documentId: string) {
  return ["document", documentId] as const;
}

export function documentCollaboratorsQueryKey(documentId: string) {
  return ["document", documentId, "collaborators"] as const;
}

export function documentActivityQueryKey(documentId: string) {
  return ["document", documentId, "activity"] as const;
}

export function documentSnapshotsQueryKey(documentId: string) {
  return ["document", documentId, "snapshots"] as const;
}

export function documentCommentsQueryKey(documentId: string) {
  return ["document", documentId, "comments"] as const;
}
