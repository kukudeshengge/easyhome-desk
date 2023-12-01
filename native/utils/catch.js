// 创建一个空对象作为缓存
const cache = {};

const keyEnum = {
    MAINWINDOW: 'mainWindow'
}

// 保存数据到缓存中
function saveToCache(key, value) {
    cache[key] = value;
}

// 从缓存中获取数据
function getFromCache(key) {
    return cache[key];
}

// 从缓存中删除数据
function deleteFromCache(key) {
    delete cache[key];
}

// 清空缓存
function clearCache() {
    for (let key in cache) {
        delete cache[key];
    }
}

// 输出缓存中的数据
function logCache() {
    console.log(cache);
}

// 导出方法
module.exports = {
    saveToCache,
    getFromCache,
    deleteFromCache,
    clearCache,
    logCache,
    keyEnum,
};