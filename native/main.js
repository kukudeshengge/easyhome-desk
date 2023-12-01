const {
    app, // 控制应用生命周期的模块
    BrowserWindow, // 创建原生浏览器窗口的模块
    Tray,
    screen,
    ipcMain,
    globalShortcut,
} = require('electron');
const path = require('path');
const events = require('./events');
const funcs = require('./func');

const rootFolder = path.join(__dirname, '..');
const isDev = process.env.NODE_ENV === 'development';
const { saveToCache, keyEnum } = require('../native/utils/catch');

// 保持一个对于 window 对象的全局引用，不然，当 JavaScript 被 GC，
// window, tray 会被自动地关闭
let mainWindow = null;
let tray = null;

const windowWidth = isDev ? 1200 : 1000;
const windowHeight = 800;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        title: '洞窝小工具',
        width: windowWidth,
        height: windowHeight,
        show: false,
        center: true,
        backgroundColor: '#403F4D',
        icon: path.join(rootFolder, 'src', 'assets', 'icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: false,
            preload: path.join(__dirname, 'preload.js'),
            devTools: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            // contextIsolation: false,
        },
    });
    saveToCache(keyEnum.MAINWINDOW, mainWindow);

    const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(rootFolder, '/out/index.html')}`;
    mainWindow.loadURL(startURL);

    globalShortcut.register('CommandOrControl+Shift+i', function () {
        mainWindow.webContents.openDevTools();
    });

    mainWindow.once('ready-to-show', () => mainWindow.show());
    tray = new Tray(path.join(rootFolder, 'src', 'assets', 'tray.png'));
    tray.setToolTip('Click to access OneCopy');

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
};

const isSingleInstance = app.requestSingleInstanceLock();

if (!isSingleInstance) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.whenReady().then(() => {
        createWindow();

        // Set App ID for notifications
        app.setAppUserModelId('com.hiroshifuu.onecopy-electron');
        // 设置自定义协议
        app.setAsDefaultProtocolClient('dwdeskapp');
        // dwdeskapp://login?userinfo=123

        // 打开开发工具
        if (isDev) mainWindow.openDevTools();

        // 当 window 被关闭，这个事件会被发出
        mainWindow.on('closed', function () {
            // 取消引用 window 对象，如果你的应用支持多窗口的话，
            // 通常会把多个 window 对象存放在一个数组里面，
            // 但这次不是。
            mainWindow = null;
        });

        //事件监听
        events.forEach((item) => {
            ipcMain.on(item.name, (event, data) => {
                let json = {};
                if (data) {
                    try {
                        json = JSON.parse(data);
                    } catch (error) {}
                }
                item.fn(event, json);
            });
        });
        funcs.forEach((item) => {
            ipcMain.handle(item.name, async (e, ...args) => {
                const res = await item.fn(e, ...args);
                return res;
            });
        });
    });
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null || BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    app.on('open-url', (event, url) => {
        event.preventDefault(); // 阻止默认行为
        const urlO = new URL(url);
        /**
         * {
            href: 'dwdeskapp://login?userinfo=%7B%22userId%22:%22650960852958056448%22,%22userName%22:%22%E8%81%82%E4%B9%90%E5%87%AF%22,%22phone%22:%2217600209465%22,%22status%22:null,%22jwtToken%22:%22Bearer%20eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTA5NjA4NTI5NTgwNTY0NDgiLCJpYXQiOjE2OTIxNzI1ODQsImV4cCI6MTY5MjIxNTc4NH0.xZirpokUYIqL6YI1Fx5R6LE37_HoR-wRjgq82diiFYOdD72l3jaCpqZz5Czixw9VTFcDkd-Tu_kVqhxLS-BIzw%22,%22roleIds%22:null%7D',
            origin: 'null',
            protocol: 'dwdeskapp:',
            username: '',
            password: '',
            host: 'login',
            hostname: 'login',
            port: '',
            pathname: '',
            search: '?userinfo=%7B%22userId%22:%22650960852958056448%22,%22userName%22:%22%E8%81%82%E4%B9%90%E5%87%AF%22,%22phone%22:%2217600209465%22,%22status%22:null,%22jwtToken%22:%22Bearer%20eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTA5NjA4NTI5NTgwNTY0NDgiLCJpYXQiOjE2OTIxNzI1ODQsImV4cCI6MTY5MjIxNTc4NH0.xZirpokUYIqL6YI1Fx5R6LE37_HoR-wRjgq82diiFYOdD72l3jaCpqZz5Czixw9VTFcDkd-Tu_kVqhxLS-BIzw%22,%22roleIds%22:null%7D',
            searchParams: URLSearchParams {
                'userinfo' => '{"userId":"650960852958056448","userName":"聂乐凯","phone":"17600209465","status":null,"jwtToken":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2NTA5NjA4NTI5NTgwNTY0NDgiLCJpYXQiOjE2OTIxNzI1ODQsImV4cCI6MTY5MjIxNTc4NH0.xZirpokUYIqL6YI1Fx5R6LE37_HoR-wRjgq82diiFYOdD72l3jaCpqZz5Czixw9VTFcDkd-Tu_kVqhxLS-BIzw","roleIds":null}' },
            hash: ''
            }
         */
        // 解析 URL 中的参数
        const params = urlO.searchParams;
        const userinfo = params.get('userinfo');
        if (url.includes('dwdeskapp://login') && userinfo) {
            mainWindow.webContents.send('login-info', userinfo);
            app.show();
            app.focus({ steal: true });
        }
    });
}

// 当所有窗口被关闭了，退出。
app.on('window-all-closed', function () {
    // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
    // 应用会保持活动状态
    if (process.platform !== 'darwin') app.quit();
});
