const CONFIG = {
    CLAUDE_API_URL: 'https://api.anthropic.com/v1/messages',
    CLAUDE_MODEL: 'claude-sonnet-4-20250514',
    MAX_TOKENS: 2048,
    LOCAL_STORAGE_KEYS: {
        API_KEY: 'firstgig_api_key',
        TRACKER: 'firstgig_tracker',
        USER_PREFS: 'firstgig_prefs'
    }
};

const ApiKeyManager = {
    get() {
        return localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.API_KEY) || '';
    },
    set(key) {
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.API_KEY, key);
    },
    remove() {
        localStorage.removeItem(CONFIG.LOCAL_STORAGE_KEYS.API_KEY);
    },
    isSet() {
        return !!this.get();
    },
    validate(key) {
        return key && key.startsWith('sk-ant-') && key.length > 20;
    }
};