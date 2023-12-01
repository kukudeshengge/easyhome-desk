import { UploadOutlined } from '@ant-design/icons';
import { Button, Image, message, Popover, Row, Space, Table, Upload } from 'antd';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { queryGoodsDetails } from '../api/goods';
import { describe, getImageBuffer, imagine, queryTask } from '../api/mj';
import { saveImage } from '../utils/electronAPI';

const GenerateGoodsImage = () => {
    const intervalId = useRef<any>();
    const currentIndex = useRef<number>(0);
    const loading = useRef<boolean>(false);
    const noContinue = useRef<boolean>(false);
    //文件夹名称
    const folderName = useRef<any>(dayjs().format('YYYYMMDDHH'));
    const [columns, setColumns] = useState<any[]>([]);
    const [dataSource, setDataSource] = useState<any[]>([]);

    const onOneClick = (record: any) => {
        currentIndex.current = record.key;
        noContinue.current = true;
        onStartClick();
    };
    const onUploadChange = (file: any) => {
        //上传excel
        if (!file) return;
        const reader = new FileReader();

        reader.onload = (event: any) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            // 这里可以进一步处理jsonData，比如将其存储到组件的state中
            console.log(jsonData);
            const title = jsonData[1];
            if (Array.isArray(title)) {
                let columns: any = [];
                title.forEach((element, index) => {
                    if ([1, 3].includes(index)) {
                        columns.push({
                            title: element,
                            dataIndex: index,
                            key: index,
                        });
                    }
                });
                columns.push({
                    dataIndex: 'goodsMainPic',
                    title: '商品主图',
                    key: 'goodsMainPic',
                    render: (text: string) => (text ? <Image width={100} height={100} src={text} alt="" /> : '-'),
                });
                columns.push({
                    dataIndex: 'image',
                    title: '生成图',
                    key: 'image',
                    render: (text: string, record: any) => (text ? <Image width={100} height={100} src={text} alt="" /> : record.status),
                });
                // columns.push({
                //     dataIndex: 'status',
                //     title: '状态',
                //     key: 'status',
                // });
                columns.push({
                    dataIndex: 'actions',
                    title: '操作',
                    key: 'actions',
                });
                setColumns(columns);
            }
            let dataSource = [];
            for (let index = 2; index < jsonData.length; index++) {
                const element = jsonData[index];
                if (Array.isArray(element)) {
                    let item: any = {};
                    element.forEach((element, i) => {
                        item[i] = element;
                    });
                    item.key = dataSource.length;
                    item.goodsMainPic = '';
                    item.status = '-';
                    item.image = '';
                    dataSource.push(item);
                }
            }
            setDataSource(dataSource);
            folderName.current = dayjs().format('YYYYMMDDHH');
        };
        reader.readAsArrayBuffer(file);
    };

    const onStartClick = async () => {
        if (!dataSource.length) return message.info('没有数据,请先上传excel');
        if (loading.current) return;
        loading.current = true;
        const element = dataSource[currentIndex.current];
        if (!element) return message.info('没有获取到数据');
        const goodsMainPic = await getGoodsImage(element);
        element['goodsMainPic'] = goodsMainPic;
        const list = dataSource.slice();
        setDataSource(list);
        let taskId = '';
        if (element.describeTaskId) {
            taskId = element.describeTaskId;
        } else {
            element['status'] = '解析图片中';
            const list = dataSource.slice();
            setDataSource(list);
            taskId = await sendGoodsImage(goodsMainPic);
            element.describeTaskId = taskId;
            setDataSource(dataSource);
        }

        // let taskId = '6814733539408043';
        if (!taskId) {
            element['status'] = '解析图片失败';
            const list = dataSource.slice();
            setDataSource(list);
            loading.current = false;
            return;
        }

        await checkTask(taskId);
    };

    // 获取商品主图
    const getGoodsImage = async (element: any) => {
        try {
            const data: any = await queryGoodsDetails({ goodId: element[3] });
            return data?.goodsMainPic || '';
            // 1577634068559092
        } catch (error) {
            return null;
        }
    };

    // 发送图片base64 到mj
    const sendGoodsImage = async (imageUrl: string) => {
        try {
            const response = await getImageBuffer(imageUrl);
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            const data: any = await describe({ base64: `data:image/jpeg;base64,${base64}` });
            return data.result;
        } catch (error) {
            return null;
        }
    };

    if (columns) {
        columns.some((e) => {
            if (e.key === 'actions') {
                e.render = (text: string, record: any) => {
                    return (
                        <Space>
                            <Popover content={'只会重新生成当前图片'} title={null}>
                                <Button
                                    onClick={() => {
                                        onOneClick(record);
                                    }}
                                >
                                    生成
                                </Button>
                            </Popover>
                            <Popover content={'从当前图片开始重新生成一直到最后'} title={null}>
                                <Button
                                    onClick={() => {
                                        currentIndex.current = record.key;
                                        noContinue.current = false;
                                        onStartClick();
                                    }}
                                >
                                    继续
                                </Button>
                            </Popover>
                            {record.image ? (
                                <Popover content={'仅下载当前图片'} title={null}>
                                    <Button
                                        onClick={() => {
                                            onDownLoadOneClick(record.key);
                                        }}
                                    >
                                        下载
                                    </Button>
                                </Popover>
                            ) : null}
                        </Space>
                    );
                };
            }
        });
    }

    const checkTask = async (taskId: string) => {
        // 查询任务状态
        const element = dataSource[currentIndex.current];
        element['status'] = '解析图片中...';
        const list = dataSource.slice();
        setDataSource(list);
        intervalId.current = setInterval(async () => {
            try {
                const data: any = await queryTask(taskId);
                if (data.status === 'SUCCESS') {
                    intervalId.current && clearInterval(intervalId.current); // 停止定时请求
                    const prompt = formatPrompt(data.prompt);
                    const element = dataSource[currentIndex.current];
                    element['status'] = '图片生成中...';
                    const list = dataSource.slice();
                    setDataSource(list);
                    const res: any = await imagine(element.goodsMainPic + ' ' + prompt);
                    if (res.result) {
                        checkImageTask(res.result);
                    } else {
                        const element = dataSource[currentIndex.current];
                        element['status'] = res.description;
                        const list = dataSource.slice();
                        setDataSource(list);
                    }
                }
                return data;
            } catch (error) {
                message.error('图片解析失败');
                console.log('图片解析失败');
            }
        }, 2000);
    };
    // 格式化提示词
    const formatPrompt = (prompt: string) => {
        const prompts = prompt.split('\n\n');
        const regex1 = /--ar\s+\d+:\d+\b/g;
        const index = parseInt(Math.random() * 10 + '') % 4;
        let text = prompts[index];
        text = text.replace('1️⃣ ', ''); // 删除表情
        text = text.replace('2️⃣ ', ''); // 删除表情
        text = text.replace('3️⃣ ', ''); // 删除表情
        text = text.replace('4️⃣ ', ''); // 删除表情
        text = text.replace(regex1, ''); // 替换图片比例
        text += ' in Room'; // 在客厅
        text += ' --no people'; // 去掉人
        text += ' --ar 1:1'; // 限制比例
        text += ' --iw 2'; // 图片权重
        text += ' --v 5.1';
        return text;
    };
    const replaceHostUrl = (text: string) => {
        if (typeof text !== 'string') return text;
        if (text.includes('https://cdn.discordapp.com')) {
            return text.replace('https://cdn.discordapp.com', 'https://discord.jrdaimao.com');
        }
        return text;
    };
    const checkImageTask = (taskId: string) => {
        intervalId.current = setInterval(async () => {
            try {
                const data: any = await queryTask(taskId);
                if (data.status === 'SUCCESS') {
                    intervalId.current && clearInterval(intervalId.current); // 停止定时请求
                    const element = dataSource[currentIndex.current];
                    element['status'] = '图片生成完成';
                    element['image'] = replaceHostUrl(data.imageUrl);
                    const list = dataSource.slice();
                    setDataSource(list);
                    loading.current = false;
                    // 下一张
                    if (!noContinue) {
                        currentIndex.current += 1;
                        onStartClick();
                    }
                } else if (data.status === 'FAILURE') {
                    intervalId.current && clearInterval(intervalId.current); // 停止定时请求
                    const element = dataSource[currentIndex.current];
                    element['status'] = '图片生成失败:' + data.failReason;
                    const list = dataSource.slice();
                    setDataSource(list);
                    loading.current = false;
                }
            } catch (error) {
                const element = dataSource[currentIndex.current];
                element['status'] = '图片生成失败';
                const list = dataSource.slice();
                setDataSource(list);
                loading.current = false;
                console.log('%c [ error ]-190', 'font-size:13px; background:pink; color:#bf2c9f;', error);
            }
        }, 2000);
    };

    // 一键下载
    const onDownLoadClick = () => {
        if (!dataSource.length) return message.info('没有数据，请先上传excel');
        const imgArr: { fileName: string; fileUrl: string }[] = [];
        dataSource.map((e) => {
            if (e.image) {
                imgArr.push({
                    fileName: `${e[3]}_商品主图`,
                    fileUrl: e.goodsMainPic,
                });

                imgArr.push({
                    fileName: `${e[3]}_AI生成图`,
                    fileUrl: e.image,
                });
            }
        });
        const param = {
            folderName: folderName.current, //文件夹名称
            imgArr: imgArr,
            fileType: 'jpeg',
        };
        message.loading('开始下载中');
        saveImage(param);
    };

    const onDownLoadOneClick = (index: number) => {
        if (!dataSource.length) return message.info('没有数据');
        const imgArr: { fileName: string; fileUrl: string }[] = [];
        const item = dataSource[index];
        if (item.image) {
            imgArr.push({
                fileName: `${item[3]}_AI生成图`,
                fileUrl: item.image,
            });
        }
        const param = {
            folderName: folderName.current, //文件夹名称
            imgArr: imgArr,
            fileType: 'jpeg',
        };
        saveImage(param);
    };
    const onDownLoadxlsClick = () => {
        const imgArr = [
            {
                fileName: '根据商品主图生成图片模版',
                fileUrl: 'https://ossprod.jrdaimao.com/file/1687264657485131.xls',
            },
        ];
        //下载excel模版
        const param = {
            folderName: folderName.current, //文件夹名称
            imgArr: imgArr,
            fileType: 'xls',
        };
        saveImage(param);
    };

    return (
        <div id="gci">
            <Space direction="vertical">
                <Space>
                    <Button onClick={onDownLoadxlsClick}>下载模版</Button>
                    <Upload accept=".xlsx, .xls" beforeUpload={onUploadChange} showUploadList={false}>
                        <Button>上传Excel</Button>
                    </Upload>
                    <Button
                        onClick={() => {
                            noContinue.current = false;
                            onStartClick();
                        }}
                    >
                        一键生成
                    </Button>
                    <Button onClick={onDownLoadClick}>一键下载</Button>
                </Space>
                <Table scroll={{ x: 600, y: 500 }} dataSource={dataSource} columns={columns} />
            </Space>
        </div>
    );
};

export default GenerateGoodsImage;
