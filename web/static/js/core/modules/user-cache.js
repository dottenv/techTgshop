/**
 * User Cache module - client-side data caching and storage
 */
class UserCache {
    constructor(modules) {
        this.modules = modules;
        this.cache = new Map();
        this.config = {
            enableLocalStorage: true,
            defaultTTL: 3600000, // 1 hour
            prefix: 'techtgshop_'
        };
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupCleanup();
    }

    isLocalStorageAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    loadFromStorage() {
        if (!this.config.enableLocalStorage || !this.isLocalStorageAvailable()) return;

        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.prefix)) {
                    const data = localStorage.getItem(key);
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.expires && parsed.expires > Date.now()) {
                            this.cache.set(key.replace(this.config.prefix, ''), parsed.value);
                        } else {
                            localStorage.removeItem(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                }
            }
        } catch (error) {
            console.error('[Cache] Load error:', error);
        }
    }

    setupCleanup() {
        setInterval(() => this.cleanup(), 60000);
    }

    cleanup() {
        const now = Date.now();
        if (this.isLocalStorageAvailable()) {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.prefix)) {
                    try {
                        const parsed = JSON.parse(localStorage.getItem(key));
                        if (parsed.expires && parsed.expires < now) {
                            localStorage.removeItem(key);
                            this.cache.delete(key.replace(this.config.prefix, ''));
                        }
                    } catch (e) {}
                }
            }
        }
    }

    set(key, value, ttl = this.config.defaultTTL) {
        const expires = Date.now() + ttl;
        this.cache.set(key, value);

        if (this.config.enableLocalStorage && this.isLocalStorageAvailable()) {
            try {
                localStorage.setItem(
                    this.config.prefix + key, 
                    JSON.stringify({ value, expires })
                );
            } catch (e) {
                console.warn('[Cache] Storage full or error');
            }
        }
    }

    get(key) {
        // Сначала проверяем память
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        // Потом localStorage
        if (this.isLocalStorageAvailable()) {
            const data = localStorage.getItem(this.config.prefix + key);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.expires > Date.now()) {
                        this.cache.set(key, parsed.value);
                        return parsed.value;
                    }
                    localStorage.removeItem(this.config.prefix + key);
                } catch (e) {}
            }
        }
        return null;
    }

    has(key) {
        return this.get(key) !== null;
    }

    remove(key) {
        this.cache.delete(key);
        if (this.isLocalStorageAvailable()) {
            localStorage.removeItem(this.config.prefix + key);
        }
    }

    clear() {
        this.cache.clear();
        if (this.isLocalStorageAvailable()) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.config.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
    }
}

window.UserCache = UserCache;