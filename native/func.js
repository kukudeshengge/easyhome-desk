const { default: axios } = require('axios');
const Store = require('electron-store');

const store = new Store();

module.exports = [
    {
        name: 'set_cache',
        fn: (e, key, str) => {
            if (str === undefined) return;
            store.set(key, str);
        },
    },
    {
        name: 'get_cache',
        fn: (e, key) => store.get(key),
    },
    {
        name: 'del_cache',
        fn: (e, key) => store.delete(key),
    },
    {
        name: 'axios_get',
        fn: async (e, url, opt) => {
            const res = await axios.get(url, opt);
            return { data: res.data, headers: res.headers };
        },
    },
    {
        name: 'axios_post',
        fn: async (e, url, data, opt) => {
            const res = await axios.post(url, data, opt);
            return { data: res.data, headers: res.headers };
        },
    },
];
