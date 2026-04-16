export const documentsQueryKey = ["documents"] as const;

export function documentQueryKey(documentId: string) {
  return ["document", documentId] as const;
}
