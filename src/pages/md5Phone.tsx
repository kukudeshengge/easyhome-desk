import { Row, Upload, Col, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { md5FnFile, md5Status, removeStatus } from '../utils/electronAPI';
import { Progress } from 'antd';

/**
 * 手机号批量加密
 * @returns Md5Phone
 */
let timer: any = null; // 定时器
let percent = 0; // 进度的数量
const Md5Phone = () => {
    const [md5FileData, setMd5FileData] = useState<any>([]);
    const [md5Loading, setMd5Loading] = useState(false); // 加密的loading
    const [progress, setProgress] = useState(0); // 进度条
    const [hide, setHide] = useState(true);

    useEffect(() => {
        md5Status(callBack);
        return () => {
            removeStatus();
        };
    }, []);

    // 上传之前
    const handBdfore = () => {
        percent = 0;
        setProgress(0);
    };

    // 删除文件
    const handleRemove = () => {
        if (md5Loading) {
            message.info('文件正在加密中，请勿删除当前文件～');
        } else {
            setHide(true);
            setMd5FileData([]);
            setProgress(0);
            percent = 0;
        }
    };

    // 文件上传之前
    const handleUploadFile = (loadFile: any) => {
        setMd5Loading(true);
        setHide(false);
        if (md5Loading) return message.info('文件正在上传中，请勿重复操作～');
        const size = loadFile.file.size / (1024 * 1024);
        // 计算需要的大概时间
        const time = parseInt((loadFile.file.size / 1000).toString());
        // 文件名字
        const { name } = loadFile.file;
        if (size > 210) {
            setMd5Loading(false);
            setHide(true);
            return message.error('上传文件最大为10M，请重新上传');
        }
        if (!name.includes('.txt')) {
            setMd5Loading(false);
            return message.error('仅支持上传扩展名为：.txt 文件');
        }
        console.log('-===loadFile=', loadFile);
        const fileData = {
            name: loadFile.file.name,
            path: loadFile.file?.path || '',
            uid: loadFile.file?.uid,
        };
        setMd5FileData([fileData]);
        md5Deal([fileData], time);
    };

    // md5进行加密
    const md5Deal = (fileData: any, time: number) => {
        if (!fileData.length) return message.info('请先上传需要加密的手机号文件～');
        if (md5Loading) return message.info('文件正在加密中 请勿重复操作～');
        // 开始数据加密
        // 开启进度条的展示
        timer = setInterval(() => {
            if (percent > 90) return;
            percent += 0.02;
            if (percent >= 90) percent = 90;
            setProgress(parseInt(percent.toString()));
            console.log('percent==', percent);
        }, (1 / time) * time);
        md5FnFile(fileData[0]);
    };

    // 回调
    const callBack = (e: any, value: string) => {
        setTimeout(() => {
            percent = 100;
            setProgress(100);
            setHide(true);
            clearInterval(timer);
            timer = null;
            setMd5Loading(false);
            message.success('文件加密完成，已下载到桌面');
            window.electronAPI.openFloder(value);
        }, 100);
    };

    return (
        <div id="md-contain">
            <h1>手机号批量转MD5</h1>
            <div className="">
                <div className="upload-box">
                    <Upload
                        beforeUpload={handBdfore}
                        disabled={md5Loading}
                        onRemove={handleRemove}
                        customRequest={handleUploadFile}
                        fileList={md5FileData}
                        showUploadList={false}
                        maxCount={1}
                    >
                        <Button style={{ width: '160px' }} loading={md5Loading} type="primary" size={md5Loading ? 'small' : 'large'}>
                            手机号一键加密
                        </Button>
                    </Upload>
                </div>

                <div className={hide ? 'load-container' : 'load-container active'}>
                    <div className="load-box">
                        <div className="book-loader">
                            <div>
                                <ul>
                                    <li>
                                        <svg fill="currentColor" viewBox="0 0 90 120">
                                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                        </svg>
                                    </li>
                                    <li>
                                        <svg fill="currentColor" viewBox="0 0 90 120">
                                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                        </svg>
                                    </li>
                                    <li>
                                        <svg fill="currentColor" viewBox="0 0 90 120">
                                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                        </svg>
                                    </li>
                                    <li>
                                        <svg fill="currentColor" viewBox="0 0 90 120">
                                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                        </svg>
                                    </li>
                                    <li>
                                        <svg fill="currentColor" viewBox="0 0 90 120">
                                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                        </svg>
                                    </li>
                                    <li>
                                        <svg fill="currentColor" viewBox="0 0 90 120">
                                            <path d="M90,0 L90,120 L11,120 C4.92486775,120 0,115.075132 0,109 L0,11 C0,4.92486775 4.92486775,0 11,0 L90,0 Z M71.5,81 L18.5,81 C17.1192881,81 16,82.1192881 16,83.5 C16,84.8254834 17.0315359,85.9100387 18.3356243,85.9946823 L18.5,86 L71.5,86 C72.8807119,86 74,84.8807119 74,83.5 C74,82.1745166 72.9684641,81.0899613 71.6643757,81.0053177 L71.5,81 Z M71.5,57 L18.5,57 C17.1192881,57 16,58.1192881 16,59.5 C16,60.8254834 17.0315359,61.9100387 18.3356243,61.9946823 L18.5,62 L71.5,62 C72.8807119,62 74,60.8807119 74,59.5 C74,58.1192881 72.8807119,57 71.5,57 Z M71.5,33 L18.5,33 C17.1192881,33 16,34.1192881 16,35.5 C16,36.8254834 17.0315359,37.9100387 18.3356243,37.9946823 L18.5,38 L71.5,38 C72.8807119,38 74,36.8807119 74,35.5 C74,34.1192881 72.8807119,33 71.5,33 Z"></path>
                                        </svg>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <Progress percent={progress} className="load-progress" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Md5Phone;
