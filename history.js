/* Хранилище: история решений и настройки в Local Storage */
const Store = (() => {
  const HISTORY_KEY = 'coinflip.history.v1';
  const SETTINGS_KEY = 'coinflip.settings.v1';
  const MAX_ITEMS = 200;

  const defaults = { mode: 'smart', yesWeight: 50 };

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* приватный режим / переполнение */ }
  }

  return {
    settings() {
      return Object.assign({}, defaults, read(SETTINGS_KEY, {}));
    },
    saveSettings(s) {
      write(SETTINGS_KEY, s);
    },
    history() {
      const h = read(HISTORY_KEY, []);
      return Array.isArray(h) ? h : [];
    },
    add(item) {
      const h = this.history();
      h.unshift(item);
      write(HISTORY_KEY, h.slice(0, MAX_ITEMS));
    },
    clear() {
      write(HISTORY_KEY, []);
    }
  };
})();
