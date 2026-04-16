const tokenKey = "collabpad_token";
const sessionChangeEvent = "collabpad-session-change";

export class SessionStorage {
  static getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem(tokenKey);
  }

  static hasToken() {
    return Boolean(SessionStorage.getToken());
  }

  static setToken(token: string) {
    window.localStorage.setItem(tokenKey, token);
    SessionStorage.notifyChange();
  }

  static clearToken() {
    window.localStorage.removeItem(tokenKey);
    SessionStorage.notifyChange();
  }

  static subscribe(listener: () => void) {
    if (typeof window === "undefined") {
      return () => {};
    }

    window.addEventListener(sessionChangeEvent, listener);
    window.addEventListener("storage", listener);

    return () => {
      window.removeEventListener(sessionChangeEvent, listener);
      window.removeEventListener("storage", listener);
    };
  }

  private static notifyChange() {
    window.dispatchEvent(new Event(sessionChangeEvent));
  }
}
