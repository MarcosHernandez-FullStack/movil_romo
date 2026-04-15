export class StorageUtil {
  static set<T>(key: string, value: T, session = false) {
    const store = session ? sessionStorage : localStorage;
    store.setItem(key, JSON.stringify(value));
  }

  static get<T>(key: string, session = false): T | null {
    const store = session ? sessionStorage : localStorage;
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  static remove(key: string, session = false) {
    const store = session ? sessionStorage : localStorage;
    store.removeItem(key);
  }

  static clearAll(session = false) {
    const store = session ? sessionStorage : localStorage;
    store.clear();
  }
}
