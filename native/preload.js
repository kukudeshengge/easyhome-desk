window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    };

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency]);
    }
});
const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    send: (key, data) => {
        ipcRenderer.send(key, data);
    },
    on: (key, cb) => {
        ipcRenderer.on(key, cb);
    },
    off: (key) => {
        ipcRenderer.removeAllListeners(key);
    },
    openFloder: (key) => {
        shell.openPath(key);
    },
    cache: {
        set: async (key, str) => {
            const data = await ipcRenderer.invoke('set_cache', key, str);
            return data;
        },
        get: async (key) => {
            const data = await ipcRenderer.invoke('get_cache', key);
            return data;
        },
        del: async (key) => {
            const data = await ipcRenderer.invoke('del_cache', key);
            return data;
        },
    },
    axios_get: async (url, opt) => {
        const data = await ipcRenderer.invoke('axios_get', url, opt);
        return data;
    },
    axios_post: async (url, data, opt) => {
        const res = await ipcRenderer.invoke('axios_post', url, data, opt);
        return res;
    },
});
