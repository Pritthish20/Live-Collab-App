import type { PresenceUser } from "@/types";

type AwarenessState = {
  clientId: number;
  [key: string | number]: unknown;
};

type AwarenessUserState = {
  id?: string;
  name?: string;
  color?: string;
};

export class AwarenessUtils {
  static getPresenceUsers(
    states: AwarenessState[],
    currentUserId: string | null
  ) {
    const usersByIdentity = new Map<string, PresenceUser>();

    for (const state of states) {
      const awarenessUser = state.user as AwarenessUserState | undefined;

      if (!awarenessUser?.name || !awarenessUser.color) {
        continue;
      }

      const userId = awarenessUser.id ?? null;
      const key = userId ?? `client:${state.clientId}`;
      const existing = usersByIdentity.get(key);

      if (existing) {
        usersByIdentity.set(key, {
          ...existing,
          clientId: Math.min(existing.clientId, state.clientId)
        });
        continue;
      }

      usersByIdentity.set(key, {
        clientId: state.clientId,
        userId,
        name: awarenessUser.name,
        color: awarenessUser.color,
        isCurrentUser: Boolean(currentUserId && userId === currentUserId)
      });
    }

    return Array.from(usersByIdentity.values()).sort((a, b) => {
      if (a.isCurrentUser && !b.isCurrentUser) {
        return -1;
      }

      if (!a.isCurrentUser && b.isCurrentUser) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    });
  }
}
