import type { ConnectionStatus } from "@/types";

export type RealtimeStatusMeta = {
  label: string;
  message: string;
  tone: "connected" | "connecting" | "disconnected";
  syncLabel: string;
};

export class RealtimeStatus {
  static getMeta(
    status: ConnectionStatus,
    isSynced: boolean,
    unsyncedChanges: number
  ): RealtimeStatusMeta {
    return {
      label: this.getConnectionLabel(status),
      message: this.getMessage(status, isSynced, unsyncedChanges),
      tone: status,
      syncLabel: this.getSyncLabel(isSynced, unsyncedChanges)
    };
  }

  static isDisconnected(status: ConnectionStatus) {
    return status === "disconnected";
  }

  private static getConnectionLabel(status: ConnectionStatus) {
    const labels: Record<ConnectionStatus, string> = {
      connected: "Connected",
      connecting: "Connecting",
      disconnected: "Disconnected"
    };

    return labels[status];
  }

  private static getSyncLabel(isSynced: boolean, unsyncedChanges: number) {
    if (isSynced) {
      return "Synced";
    }

    if (unsyncedChanges > 0) {
      return `${unsyncedChanges} pending`;
    }

    return "Syncing";
  }

  private static getMessage(
    status: ConnectionStatus,
    isSynced: boolean,
    unsyncedChanges: number
  ) {
    if (status === "connected" && isSynced) {
      return "Live changes are synced.";
    }

    if (status === "connected" && unsyncedChanges > 0) {
      return "Sending pending changes.";
    }

    if (status === "connected") {
      return "Checking the latest document state.";
    }

    if (status === "connecting") {
      return "Reconnecting to the collaboration server.";
    }

    return "Keep this tab open. Pending edits will sync when the connection returns.";
  }
}
