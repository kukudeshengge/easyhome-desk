const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const request = require('request');
const { shell, app } = require('electron');
const nodeExcel = require('node-xlsx');
const { getFromCache, keyEnum } = require('./catch');
const axios = require('axios');

/**
 * @description: 图片另存为
 * @param {*currentSrc}  二维码图片路径 -img-src
 * @param { defaultPath} 文件默认保存名
 * @return { status} 是否保存成功
 */
const saveImage = async (data) => {
    const { folderName, fileType, imgArr, secondLevelName } = data;
    const defaultPath = app.getPath('desktop');
    //设置保存路径
    // 一级文件夹
    const targetFolder = path.join(defaultPath, `/${folderName}`);
    const parthUrl = await creatImageFile(targetFolder, secondLevelName, defaultPath, folderName);
    for (let i = 0; i < imgArr.length; i++) {
        const { fileName, fileUrl } = imgArr[i];
        //创建可写流
        let stream = fs.createWriteStream(path.join(parthUrl, `${fileName}.${fileType}`));
        // 保存
        try {
            const response = await axios.get(fileUrl, { responseType: 'stream', rejectUnauthorized: false });
            response.data.pipe(stream);

            await new Promise((resolve, reject) => {
                stream.on('close', (err) => {
                    stream.close();
                    if (err || secondLevelName) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            await shell.openPath(targetFolder); // 打开文件
        } catch (error) {
            console.error(error);
        }
    }
};

const creatImageFile = async (targetFolder, secondLevelName, defaultPath, folderName) => {
    let parthUrl = targetFolder;
    // 二级文件夹
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }
    if (secondLevelName) {
        const secTargetFolder = path.join(defaultPath, `/${folderName}`, `/${secondLevelName}`);
        if (!fs.existsSync(secTargetFolder)) {
            fs.mkdirSync(secTargetFolder);
        }
        parthUrl = secTargetFolder;
    }
    return parthUrl;
};

// 打开文件
const openFile = (data) => {
    const defaultPath = app.getPath('desktop');
    const targetFolder = path.join(defaultPath, `/${data.folderName}`);
    shell.openPath(targetFolder); //打开文件
};

// 保存异步
const creatFile = async (...args) => {
    for (let index = 0; index < args.length; index++) {
        if (!fs.existsSync(args[index])) {
            fs.mkdirSync(args[index]);
        }
    }
};

// 批量下载保存文件
const saveLotDownFile = async (data) => {
    const defaultPath = app.getPath('desktop');
    const { folderName, secondLevelName } = data;
    // 一级文件夹名字
    const targetFolder = path.join(defaultPath, `/${folderName}`);
    // 二级级文件夹名字
    const secTargetFolder = path.join(defaultPath, `/${folderName}`, `/${secondLevelName}`);
    await creatFile(targetFolder, secTargetFolder);
    let dataNew = [['渠道名称', '异业渠道ID', '链接地址', '短链']]; // 数组第一个为表头
    data.listData.forEach((item, index) => {
        dataNew.push([item.name, item.channelId, item.url, item.httpUrl]);
        if (index === data.listData.length - 1) {
            const list = [{ name: '批量链接表', data: dataNew }]; //  name 为表头的名称
            const buffer = nodeExcel.build(list);
            fs.writeFile(path.join(secTargetFolder, `/${secondLevelName}批量链接表.xlsx`), buffer, function (error) {
                if (error) {
                    return console.log('写入失败');
                }
                console.log('数据写入成功！');
            });
        }
    });
};

/**
 * md5手机号加密
 * @param {*} app
 * @param {*} data
 */
const md5Phone = (data) => {
    // 文件夹名字： 电话号MD5加密
    const defaultPath = app.getPath('desktop');
    const floderName = path.join(defaultPath, `./电话号MD5加密`);
    creatFile(floderName);
    const win = getFromCache(keyEnum.MAINWINDOW);
    const filePath = data.path || '';
    const name = data.name ? data.name.split('.')[0] : '加密手机号文件';
    const time = Date.now() - 1680102291446;
    const fileName = path.join(floderName, `./${name}${time}.txt`);
    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const output = fs.createWriteStream(fileName);
    const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });
    // let num = 0;
    rl.on('line', (line) => {
        // console.log('-总数-', num+= 1);
        if (line) {
            const hash = crypto.createHash('md5').update(line).digest('hex');
            output.write(hash + '\r\n');
            // fs.appendFile(fileName, `${hash}\r\n`, (err) => {
            //     if (err) throw err;
            //     console.log('插入数据成功');
            // });
        }
    });
    rl.on('close', () => {
        output.end();
        console.log('数据已被写入文件');
        // 发送数据
        win.webContents.send('md5-status', floderName);
    });
};

module.exports = { saveImage, openFile, saveLotDownFile, md5Phone };
