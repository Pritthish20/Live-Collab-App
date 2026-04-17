import type { ConnectionStatus } from "@/types";

export type RealtimeStatusMeta = {
  label: string;
  message: string;
  shortLabel: string;
  tone: "connected" | "connecting" | "disconnected";
  activity: "idle" | "syncing" | "reconnecting" | "offline";
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
      shortLabel: this.getShortLabel(status, isSynced, unsyncedChanges),
      tone: status,
      activity: this.getActivity(status, isSynced, unsyncedChanges),
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

  private static getShortLabel(
    status: ConnectionStatus,
    isSynced: boolean,
    unsyncedChanges: number
  ) {
    if (status === "disconnected") {
      return "Offline";
    }

    if (status === "connecting") {
      return "Reconnecting";
    }

    if (unsyncedChanges > 0) {
      return "Syncing changes";
    }

    if (!isSynced) {
      return "Syncing";
    }

    return "All changes synced";
  }

  private static getActivity(
    status: ConnectionStatus,
    isSynced: boolean,
    unsyncedChanges: number
  ): RealtimeStatusMeta["activity"] {
    if (status === "disconnected") {
      return "offline";
    }

    if (status === "connecting") {
      return "reconnecting";
    }

    if (!isSynced || unsyncedChanges > 0) {
      return "syncing";
    }

    return "idle";
  }

  private static getMessage(
    status: ConnectionStatus,
    isSynced: boolean,
    unsyncedChanges: number
  ) {
    if (status === "connected" && isSynced) {
      return "Every edit is saved.";
    }

    if (status === "connected" && unsyncedChanges > 0) {
      return `${unsyncedChanges} change${unsyncedChanges === 1 ? "" : "s"} on the way.`;
    }

    if (status === "connected") {
      return "Checking the latest document state.";
    }

    if (status === "connecting") {
      return "Reconnecting. Keep this tab open.";
    }

    return "Offline. Pending edits will sync when the connection returns.";
  }
}
