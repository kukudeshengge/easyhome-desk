export async function getCache(key: string) {
    if (!key) return;
    return window.electronAPI.cache.get(key);
}

export async function setCache(key: string, value: string) {
    if (!key) return;
    return window.electronAPI.cache.set(key, value);
}

export async function deleteCache(key: string) {
    if (!key) return;
    return window.electronAPI.cache.del(key);
}
