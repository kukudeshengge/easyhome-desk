import { useCallback, useEffect, useRef, useState } from 'react';
import { getChannelQuery, addChannelLevel, addChannel } from '../api/channel';
import { localDb } from '../utils/localDb';
import LoginWeb from '../components/login_web';
import { Checkbox, Input, Select, Space, Button, notification, Table, Progress } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import { topicUrl } from '../api/config';

import MakeScss from '../styles/makeWxH5.module.scss';
import { getShortKey, getSortUrl } from '../api/hotConfig';
import { openFile, saveImage, saveLotDownFile } from '../utils/electronAPI';

const useSyncCallback = (callback: any) => {
    const [proxyState, setProxyState] = useState({ current: false });

    const Func = useCallback(() => {
        setProxyState({ current: true });
    }, [proxyState]);

    useEffect(() => {
        if (proxyState.current === true) setProxyState({ current: false });
    }, [proxyState]);

    useEffect(() => {
        proxyState.current && callback();
    });

    return Func;
};

interface IBuildListItem {
    id: string;
    title: string;
    link: string;
    state: number;
    path?: number;
    channel2ID?: string;
    channel2Name?: string;
    httpUrl?: string;
}

export default function MakeWxH5() {
    const [isOpen, setOpen] = useState(false);
    const [isLogin, setLogin] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [notice, contextHolder] = notification.useNotification();
    // 一级渠道列表
    const [list1, setList1] = useState<any[]>([]);
    // 一级渠道选中结果
    const [channel1ID, setChannel1ID] = useState('');
    const [channel1Name, setChannel1Name] = useState('');
    // 二级渠道列表
    const [list2, setList2] = useState<any[]>([]);
    // 二级渠道的多选
    const [channel2List, setChannel2List] = useState<Array<any>>([]);
    // 是否登录
    const [needLogin, setNeedLogin] = useState(true);
    // 生成二维码
    const [needCode, setNeedCode] = useState(true);
    // 生成小程序路径
    const [needPath, setNeedPath] = useState(false);
    // 生成短链
    const [needLink, setNeedLink] = useState(false);
    // 三级渠道总数
    const [lastIndex, setLastIndex] = useState(0);
    //链接地址
    const [h5url, setH5Url] = useState('');
    //生成的数量
    const [count, setCount] = useState(1);
    // 生成中
    const [isbuild, setBuild] = useState(false);
    // 正在生成的列表
    const [buildlist, setBuildList] = useState<IBuildListItem[]>([]);
    // 定时器
    const timer = useRef<any>(null);
    const folderName = useRef('批量生成');

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 100,
        },
        {
            title: '渠道名',
            dataIndex: 'title',
        },
        {
            title: '短链',
            dataIndex: 'link',
            width: 100,
        },
        {
            title: '进度',
            dataIndex: 'state',
            width: 130,
            render: (state: number) => <Progress steps={4} percent={(state / 4) * 100} />,
        },
        {
            title: '状态',
            dataIndex: 'state',
            width: 130,
            render: (state: number) => {
                if (state === 4) return '完成';
                return '处理中';
            },
        },
    ];

    useEffect(() => {
        setOpen(true);
        //启动检查
        const authorization = localDb.getjwtToken(`jwtToken`) || '';
        setLogin(!!authorization);
        return () => {
            if (timer.current) clearInterval(timer.current);
        };
    }, []);
    useEffect(() => {
        if (isLogin) {
            getChannelData();
        }
    }, [isLogin]);
    useEffect(() => {
        if (channel1ID) getChannelData2();
    }, [channel1ID]);
    // 获取一级渠道数据
    async function getChannelData(channelLevelName = '') {
        setLoading1(true);
        try {
            const data: any = await getChannelQuery({
                channelLevel: 1, // 获取一级渠道
                channelLevelName,
                channelStatus: 0,
                channelLevelParent: '',
                page: 1,
                pageSize: 200,
                isAbandon: 0,
                isDeleted: 0,
            });
            if (data.list) {
                const list: any[] = [];
                data.list.forEach((item: any) => {
                    list.push({ value: item.channelLevelName, label: item.channelLevelName, id: item.channelLevelId });
                });
                setList1(list);
            }
            setLoading1(false);
        } catch (error: any) {
            setLoading1(false);
            if (error.code === 401) {
                console.log('重新登录');
                setLogin(false);
            }
        }
    }
    //获取二级渠道数据
    async function getChannelData2(channelLevelName = '') {
        try {
            const data: any = await getChannelQuery({
                channelLevel: 2, // 获取一级渠道
                channelLevelName,
                channelStatus: 0,
                channelLevelParent: channel1ID,
                page: 1,
                pageSize: 200,
                isAbandon: 0,
                isDeleted: 0,
            });
            if (data.list) {
                const list: any[] = [];
                data.list.forEach((item: any) => {
                    list.push({ value: item.channelLevelName, label: item.channelLevelName, id: item.channelLevelId });
                });
                setList2(list);
            }
        } catch (error: any) {
            if (error.code === 401) {
                console.log('重新登录');
                setLogin(false);
            }
        }
    }
    //获取三级渠道的总值
    async function getChannelCount3(channel2ID: string) {
        try {
            const data: any = await getChannelQuery({
                channelLevel: 3, // 获取一级渠道
                channelLevelName: '',
                channelStatus: 0,
                channelLevelParent: channel2ID,
                page: 1,
                pageSize: 10,
                isAbandon: 0,
                isDeleted: 0,
            });
            setLastIndex(data.total);
            return data.total || 0;
        } catch (error: any) {
            if (error.code === 401) {
                console.log('重新登录');
                setLogin(false);
            }
            return 0;
        }
    }
    // 登录回调
    function onLogin(jwtToken: string) {
        localDb.setjwtToken(`jwtToken`, jwtToken);
        setLogin(!!jwtToken);
    }
    //渠道1选中
    function onChannel1Select(val: string, data: any) {
        setChannel1ID(data?.id || '');
        setChannel1Name(val || '');
    }
    //渠道2选中
    function onChannel2Select(val: string, data: any) {
        if (data.length > 10) return notice.error({ message: '二级渠道数量限制', description: '二级渠道数量不能大于10个' });
        setChannel2List(data || []);
    }
    //开启编译
    async function buildH5() {
        if (!channel1ID) {
            return notice.error({ message: '一级渠道不存在', description: '请选择一个一级渠道' });
        }
        if (!channel2List.length) {
            return notice.error({ message: '二级渠道不存在', description: '请选择一个二级渠道' });
        }
        if (!h5url) {
            return notice.error({ message: '链接不存在', description: '请输入一个h5链接' });
        }
        if (!h5url.includes('topic') || h5url.includes('localhost') || h5url.includes('127.0.0.1')) {
            return notice.error({ message: '链接不正确', description: '请输入落地页h5链接' });
        }
        setBuildList([]);
        setBuild(true);
        folderName.current = '批量生成' + Date.now();
        startBuild();
    }
    const startBuild = async () => {
        const list: any = [];
        for (let j = 0; j < channel2List.length; j++) {
            const channel2ID = channel2List[j].id;
            const channel2Name = channel2List[j].value;
            const total: number = await getChannelCount3(channel2ID);
            for (let index = 0; index < count; index++) {
                list.push({
                    id: '',
                    title: channel2Name + '-' + (total + index + 1),
                    link: '',
                    state: 0,
                    channel2Name: channel2Name,
                    channel2ID: channel2ID,
                });
            }
        }
        setBuildList(list);
        execTimer();
    };
    // 每一秒执行一次函数
    const execTimer = useSyncCallback(() => {
        let index = 0;
        timer.current = setInterval(() => {
            if (index < buildlist.length) {
                execBuild(index);
                index++;
            } else {
                clearInterval(timer.current);
                timer.current = null;
                buildEnd();
            }
        }, 1000);
    });
    // 编译结束
    async function buildEnd() {
        if (needPath || needLink) buildExcel();
        setTimeout(() => {
            setBuild(false);
            openFile({ folderName: folderName.current });
        }, 1000);
    }
    //编译失败
    function buildError(index: number) {}
    // 执行生成操作,index从0开始
    async function execBuild(index: number) {
        const model = buildlist[index];
        const threeLevelName = model.title;
        let levelID = '';
        // 生成三级渠道
        try {
            const res = await addChannelLevel({
                channelLevelName: threeLevelName,
                channelLevel: 3,
                channelLevelParent: model.channel2ID,
            });
            levelID = res as string;
        } catch (error) {
            console.log(error);
        }
        updateData(index, { state: 1 });
        if (!levelID) {
            return buildError(index);
        }
        // 生成要使用的渠道
        try {
            let params: any = {
                channelName: `异业渠道${threeLevelName}`,
                memberType: 1,
                firstLevelId: channel1ID,
                secondLevelId: model.channel2ID,
                threeLevelId: levelID,
                firstLevelName: channel1Name,
                secondLevelName: model.channel2Name,
                threeLevelName: threeLevelName,
                cityIdList: [{ name: '北京市', id: '824358401244008410' }],
                marketIdList: [{ name: '北京金源店', id: '844742135839330304' }],
            };
            const channelid = await addChannel(params);
            updateData(index, { state: 2, id: channelid });
        } catch (error) {
            console.log(error);
            updateData(index, { state: 2 });
        }

        buildLink(index);
    }
    // 编译二维码或者路径前的短链
    async function buildLink(index: number) {
        const model = buildlist[index];
        const threeLevelName = model.title;
        if (needLogin) {
            // 需要登录
            // page=guide/pages/customLogin/index
            const linkdata = {
                channelId: model.id,
                toPage: '/wish/pages/webView/index?url=' + encodeURIComponent(buildUrl(h5url, model.id, threeLevelName)),
                // registeredChannel:""
            };
            let key = '';
            try {
                const data = await getShortKey({ type: 1, data: linkdata });
                updateData(index, { state: 3, link: data.key });
                key = data.key;
            } catch (error) {
                console.log(error);
                return buildError(index);
            }
            //更新路径
            if (needPath) {
                updateData(index, { state: 4, path: `guide/pages/customLogin/index?s=${key}` });
            }
            // 需要生成短链
            if (needLink) {
                const data = await getSortUrl({
                    type: 0,
                    text: `${topicUrl}/page/jump/wxapp2?path=guide/pages/customLogin/index&s=${key}`,
                });
                updateData(index, { state: 4, httpUrl: 'https://rfrl.cn/' + data.key });
            }
            //更新二维码
            if (needCode) {
                const url = `${topicUrl}/page/qrcode/wxapp?page=guide/pages/customLogin/index&scene=${encodeURIComponent('s=' + key)}`;
                const param = {
                    folderName: folderName.current, //文件夹名称
                    imgArr: [
                        {
                            fileName: threeLevelName,
                            fileUrl: url,
                        },
                    ],
                    fileType: 'jpeg',
                    secondLevelName: model.channel2Name,
                };
                await saveImage(param);
                updateData(index, { state: 4 });
            }
        } else {
            // 不需要登录
            // page=wish/pages/webView/index
            const linkdata = {
                title: threeLevelName,
                url: buildUrl(h5url, model.id, threeLevelName),
            };
            let key = '';
            try {
                const data = await getShortKey({ type: 1, data: linkdata });
                updateData(index, { link: data.key });
                key = data.key;
            } catch (error) {
                console.log(error);
                return buildError(index);
            }
            //更新路径
            if (needPath) {
                updateData(index, { state: 4, path: `wish/pages/webView/index?scene=${encodeURIComponent('s=' + key)}` });
            }
            // 需要生成短链
            if (needLink) {
                const linkdata = await getShortKey({ type: 1, data: { url: buildUrl(h5url, model.id, threeLevelName) } });
                const data = await getSortUrl({
                    type: 0,
                    text: `${topicUrl}/page/jump/wxapp2?path=wish/pages/webView/index&s=${linkdata.key}&title=${threeLevelName}`,
                });
                updateData(index, { state: 4, httpUrl: 'https://rfrl.cn/' + data.key });
            }
            //更新二维码
            if (needCode) {
                const url = `${topicUrl}/page/qrcode/wxapp?page=wish/pages/webView/index&scene=${encodeURIComponent('s=' + key)}`;
                const param = {
                    folderName: folderName.current, //文件夹名称
                    imgArr: [
                        {
                            fileName: threeLevelName,
                            fileUrl: url,
                        },
                    ],
                    fileType: 'jpeg',
                    secondLevelName: model.channel2Name,
                };
                await saveImage(param);
                updateData(index, { state: 4 });
            }
        }
    }
    async function buildExcel() {
        for (let index = 0; index < channel2List.length; index++) {
            const newBuildList = [];
            for (let j = 0; j < buildlist.length; j++) {
                if (channel2List[index].id === buildlist[j].channel2ID) {
                    newBuildList.push({
                        name: buildlist[j].title,
                        url: buildlist[j].path,
                        httpUrl: buildlist[j].httpUrl || '',
                    });
                }
            }
            saveLotDownFile({ folderName: folderName.current, listData: newBuildList, secondLevelName: channel2List[index].value });
        }
    }
    //替换url中的内容
    function buildUrl(url: string, id: string, name: string) {
        const [href, search] = url.split('?');
        const params = new URLSearchParams(search);
        params.set('channelId', id);
        params.set('channelName', name);
        return href + '?' + params.toString();
    }

    // 更新某行的值
    function updateData(index: number, data: any) {
        const list = Array.from(buildlist);
        list[index] = Object.assign(list[index], data);
        setBuildList(list);
    }

    if (!isOpen) return null;
    if (!isLogin) return <LoginWeb onLogin={onLogin} />;
    return (
        <div className={MakeScss.container}>
            {contextHolder}
            <div className={MakeScss.line}>
                <Select
                    size="large"
                    className={MakeScss.list}
                    loading={loading1}
                    options={list1}
                    onSearch={(val: string) => getChannelData(val)}
                    onChange={onChannel1Select}
                    showSearch
                    allowClear
                    autoClearSearchValue
                    showArrow
                    placeholder="请输入一级渠道"
                ></Select>
            </div>
            <div className={MakeScss.line}>
                <Select
                    mode="multiple"
                    size="large"
                    maxTagCount={10}
                    className={MakeScss.list}
                    loading={loading1}
                    options={list2}
                    value={channel2List as any}
                    onSearch={(val: string) => getChannelData2(val)}
                    onChange={onChannel2Select}
                    showSearch
                    allowClear
                    autoClearSearchValue
                    showArrow
                    placeholder="请输入二级渠道"
                ></Select>
            </div>
            <div className={MakeScss.line}>
                <Space size={20}>
                    <Input onChange={(e) => setH5Url(e.target.value)} size="large" style={{ width: 470 }} placeholder="请填入落地页链接"></Input>
                    <Select
                        size="large"
                        onChange={(e) => setCount(parseInt(e))}
                        defaultValue="1"
                        style={{ width: 120 }}
                        options={[
                            { value: '1' },
                            { value: '2' },
                            { value: '3' },
                            { value: '4' },
                            { value: '5' },
                            { value: '6' },
                            { value: '7' },
                            { value: '8' },
                            { value: '9' },
                            { value: '10' },
                        ]}
                    />
                </Space>
            </div>
            <div className={MakeScss.typecontain}>
                <div>
                    <Checkbox defaultChecked onChange={(e) => setNeedLogin(e.target.checked)}>
                        需要登录
                    </Checkbox>
                    <Checkbox defaultChecked onChange={(e) => setNeedCode(e.target.checked)}>
                        生成二维码
                    </Checkbox>
                    <Checkbox onChange={(e) => setNeedPath(e.target.checked)}>生成小程序路径</Checkbox>
                    <Checkbox onChange={(e) => setNeedLink(e.target.checked)}>生成短链</Checkbox>
                </div>
                <div className={MakeScss.btnbox}>
                    <Button loading={isbuild} onClick={buildH5} type="primary" icon={<ThunderboltOutlined />} size="large">
                        批量生成
                    </Button>
                </div>
            </div>
            {buildlist.length > 0 && (
                <div>
                    <Table rowKey={(record) => record.title} dataSource={buildlist} columns={columns} bordered pagination={false} />
                </div>
            )}
        </div>
    );
}
