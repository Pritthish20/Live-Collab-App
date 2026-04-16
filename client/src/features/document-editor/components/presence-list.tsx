import type { ConnectionStatus, PresenceUser } from "@/types";

type PresenceListProps = {
  users: PresenceUser[];
  connectionStatus: ConnectionStatus;
};

export function PresenceList({ users, connectionStatus }: PresenceListProps) {
  if (connectionStatus !== "connected") {
    return (
      <div className="presence-list" aria-label="Active collaborators">
        <span className="muted">
          Presence will refresh after the connection returns.
        </span>
      </div>
    );
  }

  return (
    <div className="presence-list" aria-label="Active collaborators">
      {users.length > 0 ? (
        users.map((user) => (
          <span className="presence-user" key={`${user.userId ?? user.clientId}`}>
            <span
              className="presence-dot"
              style={{ backgroundColor: user.color }}
            />
            {user.name}
            {user.isCurrentUser ? <span className="muted">(you)</span> : null}
          </span>
        ))
      ) : (
        <span className="muted">No active collaborators yet.</span>
      )}
    </div>
  );
}
