const { saveImage, openFile, saveLotDownFile, md5Phone } = require('./utils/fileUtils');
const { shell } = require('electron');

//事件合集，默认传入app，win对象
module.exports = [
    {
        name: 'save-image',
        fn: (event, data) => {
            saveImage(data);
        },
    },
    {
        name: 'open-file',
        fn: (event, data) => {
            openFile(data);
        },
    },
    {
        name: 'save-file',
        fn: (event, data) => {
            saveLotDownFile(data);
        },
    },
    {
        name: 'md5-file',
        fn: (event, data) => {
            md5Phone(data);
        },
    },
    {
        name: 'shell-call',
        fn: (event, data) => {
            shell[data.fnName](data.params);
        },
    },
];
