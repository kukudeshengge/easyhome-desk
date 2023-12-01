declare global {
    interface Window {
        electronAPI: any;
    }
}
//https://www.electronjs.org/zh/docs/latest/tutorial/ipc#%E6%A8%A1%E5%BC%8F-1%E6%B8%B2%E6%9F%93%E5%99%A8%E8%BF%9B%E7%A8%8B%E5%88%B0%E4%B8%BB%E8%BF%9B%E7%A8%8B%E5%8D%95%E5%90%91
//渲染器进程到主进程
const send = (key: string, data: string) => {
    window.electronAPI.send(key, data);
};

// 监听
const on = (key: string, cb: any) => {
    window.electronAPI.on(key, cb);
};

// 移除
const off = (key: string) => {
    window.electronAPI.off(key);
};

//保存图片到本地
export const saveImage = async (data: any = {}) => {
    send('save-image', JSON.stringify(data));
};

// 打开文件
export const openFile = async (data: any = {}) => {
    send('open-file', JSON.stringify(data));
};

// 保存文件
export const saveLotDownFile = async (data: any = {}) => {
    send('save-file', JSON.stringify(data));
};

// 加密数据
export const md5FnFile = async (data: any = {}) => {
    send('md5-file', JSON.stringify(data));
};

// 监听数据处理状态
export const md5Status = async (cb: any) => {
    on('md5-status', cb);
};

// 移除监听状态
export const removeStatus = async () => {
    off('md5-status');
};

export const shellCall = async (data: { fnName: string; params: any }) => {
    send('shell-call', JSON.stringify(data));
};

export const onLoginInfo = async (cb: any) => {
    on('login-info', cb);
    // window.electronAPI.onlogininfo(cb);
};
export const removeLoginInfo = async () => {
    off('login-info');
};
