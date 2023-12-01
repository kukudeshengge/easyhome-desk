import { Button, Input, message, Table, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import React from 'react';
import { RcFile } from 'antd/es/upload';
import styles from '../styles/uploadImage.module.scss';
import md5 from 'js-md5';
import { PostUploadImage } from '../api/upload';
import copy from 'copy-to-clipboard';

const { Dragger } = Upload;

interface IImageItem {
    file: any;
    name: string;
    type: string;
    path: string;
    url?: string;
    md5?: string;
    state: number;
    width?: number;
    height?: number;
}
interface IState {
    isupload: boolean;
    prefix: string;
    imglist: IImageItem[];
}
export default class UploadImage extends React.Component {
    state: IState = {
        isupload: false,
        prefix: '',
        imglist: [],
    };
    columns = [
        {
            title: '图片',
            dataIndex: 'path',
            width: 130,
            render: (path: string) => <img className={styles.list_img} src={path} alt="" />,
        },
        {
            title: '文件名',
            dataIndex: 'name',
            width: 100,
        },
        {
            title: '类型',
            dataIndex: 'type',
            width: 100,
        },
        {
            title: 'URL',
            dataIndex: 'url',
            width: 200,
        },
        {
            title: '状态',
            dataIndex: 'state',
            render: (state: number, data: any) => {
                if (state === 0) return '准备上传';
                if (state === 1) return '计算MD5';
                if (state === 2) return '检查是否重复';
                if (state === 3) return '排队中';
                if (state === 4) return '上传中';
                if (state === 5)
                    return (
                        <Button type="primary" onClick={() => this.copyStr(data.url)}>
                            复制
                        </Button>
                    );
                if (state === 99) return '失败' + state;
                return '处理中' + state;
            },
        },
    ];
    render() {
        const { isupload, imglist, prefix } = this.state;
        const { beforeUpload, columns } = this;
        return (
            <div>
                <Dragger name="file" multiple={true} beforeUpload={beforeUpload} disabled={isupload} showUploadList={false}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击选择或者拖拽文件到上传区域</p>
                    <p className="ant-upload-hint">支持单文件上传和多文件同时上传</p>
                </Dragger>
                {/* <div className={styles.formlist}>
                    <Input addonBefore="路径前缀" value={prefix} onChange={(e) => this.setState({ prefix: e.target.value })} />
                </div> */}
                {imglist.length > 0 && (
                    <div className={styles.imglist}>
                        <Table rowKey={(record) => record.name} dataSource={imglist} columns={columns} bordered pagination={false} />
                    </div>
                )}
            </div>
        );
    }
    timer: any = null;
    componentDidMount(): void {
        const { imglist } = this.state;
        this.timer = setInterval(() => {
            imglist.forEach((item, index) => {
                // 开始上传
                if (item.state === 0) {
                    this.startUpload(index);
                }
                //加入上次队列
                if (item.state === 3) {
                    this.appendQueue(index);
                }
            });
        }, 500);
    }
    componentWillUnmount(): void {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }
    copyStr = (str: string) => {
        copy(str);
        message.success('已复制');
    };
    beforeUpload = (file: RcFile) => {
        console.log('收到', file);
        this.state.imglist.push({ file, name: file.name, type: getImageType(file.type), path: window.URL.createObjectURL(file), state: 0 });
        this.forceUpdate();
        return false;
    };

    startUpload = async (index: number) => {
        console.log('开始上传', index);
        const { imglist } = this.state;
        const item = imglist[index];
        item.state = 1;
        // 计算md5
        await this.getmd5(item);
        //检查是否重复
        await this.checkUrl(item);
        //进入上传队列
    };
    getmd5 = (item: any) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (e: any) => {
                item.state = 2;
                const md5str = md5(e.target.result);
                item.md5 = md5str;
                this.forceUpdate();
                resolve(md5str);
            };
            fileReader.onerror = () => {
                item.state = 99;
                this.forceUpdate();
                reject('解析失败');
            };
            fileReader.readAsBinaryString(item.file);
        });
    };
    // 检查是否重复
    checkUrl(item: any) {
        item.state = 3;
    }
    uploadQueue = new Set();
    appendQueue = async (index: number) => {
        if (this.uploadQueue.size >= 10) {
            console.log(index, '排队中');
            return;
        }
        const { imglist } = this.state;
        const item = imglist[index];
        try {
            item.state = 4;
            this.forceUpdate();
            const data = await PostUploadImage(item.file, {});
            console.log(data);
            item.state = 5;
            item.width = data.width;
            item.height = data.height;
            item.url = data.url;
        } catch (error) {
            console.log(error);
            item.state = 99;
        }
        this.forceUpdate();
    };
}

function getImageType(type: string) {
    type = type.toLowerCase();
    if (type.includes('jpeg')) return 'jpg';
    if (type.includes('png')) return 'png';
    if (type.includes('webp')) return 'webp';
    if (type.includes('gif')) return 'gif';
    return '';
}
