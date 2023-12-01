/**
 * 封装localStorage
 * 增加对JSON对象的转换
 * @author: Ziv
 * @return {[type]} [description]
 */

export const localDb = {
    /**
     * 按key存贮数据value到localStorage
     * @param {String} key   存贮数据的唯一标识
     * @param {String, Object} value 所要存贮的数据
     */
    set(key: string, value: any) {
        if (!value) delete window.localStorage[key];
        else {
            const val = typeof value === 'object' ? JSON.stringify(value) : value;
            window.localStorage[key] = val;
        }
    },

    /**
     * 通过key从localStorage获取数据
     * @param  {String} key  获取数据的可以标识
     * @return {String, Object}  返回空，字符串或者对象
     */
    get(key: string) {
        const str = window.localStorage[key] || '';
        return this.isJSONStr(str) ? JSON.parse(str) : str;
    },

    /**
     * 判断是否是JSON string
     * @param  {String}  str 所要验证的字符串
     * @return {Boolean}   是否是JSON字符串
     */
    isJSONStr(str: string) {
        return (str.charAt(0) === '{' && str.charAt(str.length - 1) === '}') || (str.charAt(0) === '[' && str.charAt(str.length - 1) === ']');
    },

    // 设置用户信息
    setUserInfo(userInfoKey: string, data: any, persistent = false) {
        if (persistent) {
            this.set(userInfoKey, data);
        } else {
            sessionStorage.setItem(userInfoKey, JSON.stringify(data));
        }
    },
    // 获得用户信息
    getUserInfo(userInfoKey: string, persistent = false) {
        if (persistent) {
            return this.get(userInfoKey);
        } else {
            const str = window.sessionStorage[userInfoKey] || '';
            return this.isJSONStr(str) ? JSON.parse(str) : str;
        }
    },

    // jwtToken
    setjwtToken(jwtTokenKey: string, data: any, persistent = false) {
        if (persistent) {
            this.set(jwtTokenKey, data);
        } else {
            localStorage.setItem(jwtTokenKey, JSON.stringify(data));
        }
    },
    // jwtToken
    getjwtToken(jwtTokenKey: string, persistent = false) {
        if (persistent) {
            return this.get(jwtTokenKey);
        } else {
            const str = localStorage[jwtTokenKey] || '';
            return this.isJSONStr(str) ? JSON.parse(str) : str === '' ? str : JSON.parse(str);
        }
    },
    /**
     * 清空localStorage
     * @return 无返回NULL
     */
    clear(key?: string) {
        if (key) {
            window.localStorage.removeItem(key);
        } else {
            window.localStorage.clear();
        }
    },
    setSessionStorage(key: string, value: any) {
        if (!key) {
            return;
        }
        window.sessionStorage.setItem(key, JSON.stringify({ v: value }));
    },
    getSessionStorage(key: string) {
        if (!key) {
            return null;
        }
        const data = window.sessionStorage.getItem(key);
        try {
            const value = JSON.parse(data || '');
            return value.v;
        } catch (error) {
            return null;
        }
    },
    /**
     * sessionStorage
     * @return 无返回NULL
     */
    clearSession(key: string) {
        if (key) {
            window.sessionStorage.removeItem('key');
        } else {
            window.sessionStorage.clear();
        }
    },
};

export const LOCALDBKEYS = {
    PHONE: 'PHONE',
    PASSWORD: 'PASSWORD',
};
