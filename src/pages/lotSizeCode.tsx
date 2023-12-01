import React, { useEffect, useState } from 'react';
import { useSetState } from 'ahooks';
import { Select } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { getChannelQuery, login, addChannelLevel, addChannel } from '../api/channel';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { localDb, LOCALDBKEYS } from '../utils/localDb';
import { getShortKey, auotPageList } from '../api/hotConfig';
import { saveImage, openFile, saveLotDownFile } from '../utils/electronAPI';
import { isLoc } from '../api/config';
import dayjs from 'dayjs';
import { CreateSortLink } from '../api/sortlink';
import LoginWeb from '../components/login_web';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
interface StateTs {
    pageType: number;
    pagePathId: any;
    firstLevelId: number;
    countNumber: any | number;
    inputpagePath: string;
    isLogin: boolean;
    phoneNumber: string;
    secretCode: string;
    secType: boolean;
    firstLevelName: any;
}

// 页面数据
// 城市站首页
// 卖场列表页
// 卖场详情页
// 店铺详情页
// 商品详情页
const pagePathList = [
    {
        id: 1,
        name: '城市站首页',
        path: 'pages/home/index',
    },
    {
        id: 2,
        name: '卖场列表⻚',
        path: 'pages/marketList/index',
    },
    {
        id: 3,
        name: '卖场详情⻚',
        path: 'market/pages/market/index',
    },
    {
        id: 4,
        name: '店铺详情⻚',
        path: 'shopStore/pages/storeDetail/index',
    },
    {
        id: 5,
        name: '商品详情⻚',
        path: 'goods/pages/goodsDetail/index',
    },
];
const pageParamas: any = {
    3: [{ key: 'marketId', value: '' }],
    4: [{ key: 'shopId', value: '' }],
    5: [{ key: 'goodsId', value: '' }],
};

let shortLinkList: Array<any> = []; // 生成的短链的集合
let qRCodeLinkList: Array<any> = []; // 生成的二维码的集合
let nameFile = '';

const LotSizeCode = () => {
    const [showChild, setShowChild] = useState(false);
    // state
    const [alignment, setAlignment] = React.useState<string | null>('keyvalue');
    const [paramArr, setParamArr] = React.useState([{ key: '', value: '' }]);
    const [params, setParams] = React.useState('');
    const [levelList, setLevelList] = React.useState([]); // 一级渠道集合
    const [levelPage, setLevelPage] = React.useState(1); // 一级渠道页码
    const [levelSecondList, setLevelSecondList] = React.useState([]); // 二级渠道集合
    const [levelSecondPage, setLevelSecondPage] = React.useState(1); // 二级渠道页码
    const [levelThreeList, setLevelThreeList] = React.useState([]); // 三级渠道集合
    const [levelThreePage, setLevelThreePage] = React.useState(1); // 三级渠道页码
    const [selectLvSecondList, setSelectLvSecondList] = useState([]); // 已选择的二级渠道
    const [env, setEnv] = React.useState('production');
    const [envVersion, setEnvVersion] = React.useState('release');
    const [reFreshSec, setReFreshSec] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toolsChannleParams, setToolsChannleParams] = useState<any>({});
    const [autoPageList, setAutoPageList] = useState<Array<any>>([]);
    const [lotMaxNum, setLotMaxNum] = useState(50);
    const [state, setState] = useSetState<StateTs>({
        pageType: 0, // 类型 1:原生 2:h5链接
        pagePathId: 0, // 页面路径
        firstLevelId: 0, // 一级渠道
        countNumber: null, // 数量
        inputpagePath: '', // 输入h5 地址
        isLogin: true, // 是否登录
        phoneNumber: '', // 手机号
        secretCode: '', // 密码
        secType: true, // 密码类型
        firstLevelName: null, // 一级渠道的名字
    });
    const [messageData, setMessageData] = React.useState<any>({
        open: false,
        message: '',
    });
    const { message, open } = messageData;
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParams(event.target.value);
    };

    useEffect(() => {
        setShowChild(true);
    }, []);

    // 数据整合
    useEffect(() => {
        setEnvVersion('release');
        setEnv('production');
        getConfigList();
        const authorization = localDb.getjwtToken(`jwtToken`) || '';
        setState({
            isLogin: !!authorization,
        });
    }, []);

    const getConfigList = async () => {
        try {
            let basUrl = env === 'production' ? 'https://ac.jrdaimao.com' : 'https://acsit.jrdaimao.com';
            const data = await auotPageList(basUrl);
            if (data) {
                setLotMaxNum(data?.lotMaxNum);
                setAutoPageList(data?.lotAutoPage || pagePathList);
                setToolsChannleParams(data?.toolsChannleParams || {});
            }
        } catch (error) {
            console.log(error);
            setAutoPageList(pagePathList);
        }
    };

    // 获取一级渠道数据
    useEffect(() => {
        getChannelData();
    }, [levelPage, state.isLogin]);

    // 获取二级渠道数据
    useEffect(() => {
        if (state.firstLevelId !== 0) {
            getChannelSecondData();
        }
    }, [levelSecondPage, reFreshSec]);

    // 获取一级渠道数据
    const getChannelData = async () => {
        try {
            let resList = [];
            const data: any = await getChannelQuery({
                channelLevel: 1, // 获取一级渠道
                channelLevelName: '',
                channelStatus: 0,
                channelLevelParent: '',
                page: levelPage,
                pageSize: 200,
                isAbandon: 0,
                isDeleted: 0,
            });
            resList = levelList.concat(data.list);
            setLevelList(resList);
            if (data.hasNextPage) {
                setLevelPage(levelPage + 1);
            }
        } catch (error: any) {
            console.log('-=', error.message);
            if (error.message === '用户认证失败，请重新登录') {
                setState({
                    isLogin: false,
                });
            }
        }
    };
    // 获取二级渠道数据
    const getChannelSecondData = async () => {
        try {
            let resList = [];
            const data: any = await getChannelQuery({
                channelLevel: 2, // 获取一级渠道
                channelLevelName: '',
                channelStatus: 0,
                channelLevelParent: state.firstLevelId === 0 ? '' : state.firstLevelId,
                page: levelSecondPage,
                pageSize: 200,
                isAbandon: 0,
                isDeleted: 0,
            });
            resList = levelSecondList.concat(data.list);
            setLevelSecondList(resList);
            if (data.hasNextPage) {
                setLevelSecondPage(levelSecondPage + 1);
            }
        } catch (error: any) {
            console.log('-=', error.message);
            if (error.message === '用户认证失败，请重新登录') {
                setState({
                    isLogin: false,
                });
            }
        }
    };
    let maxNUm: any = null;
    // 获取已经有的三级渠道数据
    const getChannelThreeData = async (secItem: any) => {
        try {
            const data: any = await getChannelQuery({
                channelLevel: 3, // 获取一级渠道
                channelLevelName: '',
                channelStatus: 0,
                channelLevelParent: secItem.channelLevelId,
                page: 1,
                pageSize: 10,
                // isAbandon: 0,
                // isDeleted: 0,
            });
            if (data) {
                maxNUm = Number(data.total);
            }
        } catch (error: any) {
            setLoading(false);
            console.log('-=', error.message);
            if (error.message === '用户认证失败，请重新登录') {
                setState({
                    isLogin: false,
                });
            }
        }
    };
    // 切换密码类型
    const handleType = () => {
        setState({
            secType: !state.secType,
        });
    };

    // 登录回调
    function onLogin(jwtToken: string) {
        localDb.setjwtToken(`jwtToken`, jwtToken);
        setState({ isLogin: true });
    }
    // 通用数据修改
    const onChangeData = (e: any, whitch: string) => {
        const value = e.target?.value || 0;
        switch (whitch) {
            case 'pageType':
                setState({ pageType: value });
                break;
            case 'pagePathId':
                setState({ pagePathId: value });
                if (pageParamas[value]) {
                    setParamArr(pageParamas[value]);
                } else {
                    setParamArr([{ key: '', value: '' }]);
                }
                break;
            case 'countNumber':
                setState({ countNumber: value });
                break;
            case 'inputpagePath':
                setState({ inputpagePath: value.trim() });
                break;
            case 'phoneNumber':
                setState({ phoneNumber: value });
                break;
            case 'secretCode':
                setState({ secretCode: value });
                break;
        }
    };
    // 获取小程序码
    const handleQRCodeLink = async (paramsNew: Array<any>, name: string, secondLevelName: string, j: number) => {
        const { pagePathId, pageType, inputpagePath, countNumber } = state;
        let pathUse: any = '';
        let param: any = {};
        if (pageType === 1) {
            const dataItem: any = autoPageList.filter((item) => item.id === pagePathId);
            pathUse = dataItem[0]?.path;
        } else if (pageType === 2) {
            pathUse = 'wish/pages/webView/index';
            param.url = inputpagePath;
        }
        if (alignment === 'keyvalue') {
            const paramsList = paramArr.concat(paramsNew);
            paramsList.forEach((v) => {
                if (v.value !== '') {
                    param[v.key] = v.value;
                }
            });
        }
        try {
            let s = 'null';
            let topicUrl = env === 'production' ? 'https://topic.jrdaimao.com' : 'https://topicuat.jrdaimao.com';
            if (Object.keys(param).length > 0) {
                const data = await getShortKey({ type: 1, data: param }, topicUrl);
                s = `s=${data.key}`;
            }
            let qrCodeUrl = `${topicUrl}/page/qrcode/wxapp?page=${pathUse}&scene=${encodeURIComponent(s)}&env_version=${envVersion}`;
            qRCodeLinkList.push({
                name: name,
                value: qrCodeUrl,
            });
            if (qRCodeLinkList.length && qRCodeLinkList.length === Number(countNumber)) {
                // 下载压缩zip
                await downloadImage(qRCodeLinkList, secondLevelName, j);
            }
        } catch (error) {
            setLoading(false);
            console.log('%c [ error ]-126', 'font-size:13px; background:pink; color:#bf2c9f;', error);
        }
    };
    // 获取短链
    const handleShortLink = async (paramsNew: Array<any>, name: string, secondLevelName: string) => {
        const { pagePathId, pageType, inputpagePath, countNumber } = state;
        let pathUse: any = '';
        let param: any = {};
        if (pageType === 1) {
            const dataItem: any = autoPageList.filter((item) => item.id === pagePathId);
            pathUse = dataItem[0]?.path;
        } else if (pageType === 2) {
            pathUse = 'wish/pages/webView/index';
            param.url = inputpagePath;
        }
        if (alignment === 'keyvalue') {
            const paramsList = paramArr.concat(paramsNew);
            paramsList.forEach((v) => {
                if (v.value !== '') {
                    param[v.key] = v.value;
                }
            });
        }
        try {
            let s = 'null';
            let topicUrl = env === 'production' ? 'https://topic.jrdaimao.com' : 'https://topicuat.jrdaimao.com';
            let preShortUrl = env === 'production' ? 'https://rfrl.cn/' : 'https://acsit.jrdaimao.com/s/';
            let preac = env === 'production' ? 'https://ac.jrdaimao.com' : 'https://acsit.jrdaimao.com';
            if (Object.keys(param).length > 0) {
                const data = await getShortKey({ type: 1, data: param }, topicUrl);
                s = `s=${data.key}`;
            }
            let originUrl = pathUse + `?scene=${encodeURIComponent(s)}`;
            let httpUrl = ''; //短链
            try {
                const tempurl = `${topicUrl}/page/jump/wxapp2?path=${pathUse}&scene=${encodeURIComponent(s)}&channelId=${param.channelId}&env_version=${envVersion}`;
                const sdata = await CreateSortLink({ type: 0, text: tempurl }, preac);
                httpUrl = `${preShortUrl}${sdata.key}`;
            } catch (error) {
                console.log(error);
            }

            console.log('%c [ res ]-61', 'font-size:13px; background:pink; color:#bf2c9f;', s);
            shortLinkList.push({
                name: name,
                url: originUrl,
                httpUrl: httpUrl, //短链
                channelId: param.channelId, //异业渠道ID
            });
            if (shortLinkList.length && shortLinkList.length === Number(countNumber)) {
                await tableToExcel(shortLinkList, nameFile, secondLevelName);
            }
        } catch (error) {
            setLoading(false);
            console.log('%c [ error ]-63', 'font-size:13px; background:pink; color:#bf2c9f;', error);
        }
    };
    // 下载优化
    const getNewList = async (list: any) => {
        let imageList: any = [];
        if (list) {
            for (let i = 0; i < list.length; i++) {
                if (list[i]) {
                    imageList.push({
                        fileUrl: list[i].value,
                        fileName: list[i].name,
                    });
                }
                if (i === list.length) {
                    return imageList;
                }
            }
        }
        return imageList;
    };
    // 下载打包图片
    const downloadImage = async (list: any, secondLevelName: string, j: number) => {
        const imageList = await getNewList(list);
        const param = {
            folderName: nameFile, //文件夹名称
            imgArr: imageList,
            fileType: 'jpeg',
            secondLevelName: secondLevelName,
        };
        await saveImage(param);
        qRCodeLinkList = [];
        if (j === selectLvSecondList.length - 1) {
            await openFile({ folderName: nameFile });
            await changeLoading();
        }
    };

    const changeLoading = async () => {
        setMessageData({ open: false });
        setLoading(false);
    };

    // 导出数据
    const tableToExcel = async (list: Array<any>, fileName: string, secondLevelName: string) => {
        await saveLotDownFile({ folderName: fileName, listData: list, secondLevelName: secondLevelName });
        shortLinkList = [];
    };
    // 获取渠道的数据
    const getChannleData = async (addNum: number, secItem: any, j: number) => {
        try {
            await getChannelThreeData(secItem);
            const { firstLevelId } = state;
            // 一级渠道当前的item
            const levelOneItem: any = levelList.filter((item: any) => item.channelLevelId === firstLevelId);
            const firstLevelName = levelOneItem[0]?.channelLevelName || '';
            // 二级渠道当前的item
            const levelTwoItem: any = levelSecondList.filter((item: any) => item.channelLevelId === secItem.channelLevelId);
            const secondLevelName = levelTwoItem[0]?.channelLevelName || '';
            // 处理渠道名称
            let threeLevelName = '';
            // 重新获取三级渠道数据
            // 三级渠道已经有最大的值
            if (maxNUm) {
                threeLevelName = secondLevelName + '-' + (Number(maxNUm) + 1);
            } else {
                threeLevelName = secondLevelName + '-' + addNum;
            }
            // 新增三级渠道
            const data = await addChannelLevel({
                channelLevelName: threeLevelName,
                channelLevel: 3,
                channelLevelParent: secItem.channelLevelId,
            });
            setLevelThreeList([]);
            maxNUm = null;
            console.log('-=', data);
            // 新增肄业渠道并且拿到ID
            let params: any = {
                channelName: `异业渠道${threeLevelName}`,
                memberType: 1,
                firstLevelId: firstLevelId,
                secondLevelId: secItem.channelLevelId,
                threeLevelId: data,
                firstLevelName: firstLevelName,
                secondLevelName: secondLevelName,
                threeLevelName: threeLevelName,
            };
            params.cityIdList = toolsChannleParams.cityIdList || [];
            params.marketIdList = toolsChannleParams.marketIdList || [];
            const channelData = await addChannel(params);
            // 生成链接和二维码
            const paramsNew = [
                {
                    key: 'channelName',
                    value: threeLevelName,
                },
                {
                    key: 'channelId',
                    value: channelData,
                },
            ];
            await handleShortLink(paramsNew, threeLevelName, secondLevelName);
            await handleQRCodeLink(paramsNew, threeLevelName, secondLevelName, j);
        } catch (error) {
            console.log('-==', error);
            setLoading(false);
        }
    };

    // 下载之前的校验
    const checkToast = async () => {
        let emptyNum = 0;
        shortLinkList = [];
        qRCodeLinkList = [];
        const pathIdList = [3, 4, 5];
        const messageList = ['marketId', 'shopId', 'goodsId'];
        const { pageType, pagePathId, firstLevelId, countNumber, inputpagePath } = state;
        if (pageType === 0) {
            setMessageData({ open: true, message: '请选择要生成的页面类型' });
            return false;
        }
        if (pageType === 1 && pagePathId === 0) {
            setMessageData({ open: true, message: '请选择要生成的原生页面路径' });
            return false;
        }
        if (pageType === 2 && inputpagePath === '') {
            setMessageData({ open: true, message: '请输入h5页面路径' });
            return false;
        }
        if (pageType === 1 && pathIdList.includes(pagePathId)) {
            for (const key in paramArr) {
                if (paramArr[key].value === '') {
                    emptyNum = emptyNum + 1;
                }
            }
            if (emptyNum === paramArr.length) {
                let message = '请输入必要的参数值';
                setMessageData({ open: true, message: `请输入必要的参数值${messageList[pagePathId - 3]}` || message });
                return false;
            }
        }
        if (firstLevelId === 0) {
            setMessageData({ open: true, message: '请选择一级渠道' });
            return false;
        }
        if (selectLvSecondList.length === 0) {
            setMessageData({ open: true, message: '请选择至少一个二级渠道' });
            return false;
        }
        if (!countNumber) {
            setMessageData({ open: true, message: '请输入生成参数数量' });
            return false;
        }
        const reg = /^[1-9]\d*$/;
        if (!reg.test(countNumber) || Number(countNumber) === 0) {
            setMessageData({ open: true, message: '请输入正确的生成参数数量' });
            return false;
        }
        if (Number(countNumber) > lotMaxNum) {
            setMessageData({ open: true, message: `最大数量为${lotMaxNum}，请您重新输入` });
            return false;
        }
        return true;
    };

    // 提交下载
    const submit = async () => {
        const data = await checkToast();
        if (data) {
            if (loading) return;
            setLoading(true);
            setMessageData({ open: true, message: '正在生成中，请稍等一会～' });
            const fileName = '批量生成' + dayjs(Date.now()).format('YYYYMMDDHHmmss');
            nameFile = fileName;
            for (let j = 0; j < selectLvSecondList.length; j++) {
                await timer(selectLvSecondList[j], j);
            }
        }
    };
    const timer = async (item: any, j: number) => {
        return new Promise<void>((resolve, reject) => {
            setTimeout(async () => {
                setLevelThreePage(1);
                setLevelThreeList([]);
                await moreSec(item, j);
                resolve();
            }, j * 2500);
        });
    };
    // 渲染处理
    const moreSec = async (item: any, j: number) => {
        for (let i = 0; i < state.countNumber; i++) {
            await getChannleData(i + 1, item, j);
        }
    };
    // 渲染环境切换
    const envRender = () => {
        return (
            <div className="text-left" style={{ marginBottom: '20px' }}>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <div className="text-title">小程序版本:</div>
                        <ToggleButtonGroup value={envVersion} exclusive onChange={(_, v) => setEnvVersion(v)} aria-label="text alignment">
                            <ToggleButton value="release" aria-label="centered">
                                正式版
                            </ToggleButton>
                            <ToggleButton value="trial" aria-label="centered">
                                体验版
                            </ToggleButton>
                            <ToggleButton value="develop" aria-label="centered">
                                开发版
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <div className="text-title">请选择小程序:</div>
                        <ToggleButtonGroup value={env} exclusive onChange={(_, v) => setEnv(v)} aria-label="text alignment">
                            {envVersion !== 'develop' && (
                                <ToggleButton value="production" aria-label="centered">
                                    洞窝家居
                                </ToggleButton>
                            )}
                            {envVersion !== 'release' && (
                                <ToggleButton value="test" aria-label="centered">
                                    云上洞窝
                                </ToggleButton>
                            )}
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>
            </div>
        );
    };
    // 添加参数渲染
    const paramsRender = () => {
        return (
            <div className="text-left mar-top">
                <Stack direction="row" spacing={2} alignItems="center">
                    <div style={{ marginRight: '10px' }}>小程序页面参数:</div>
                    <ToggleButtonGroup value={alignment} exclusive aria-label="text alignment">
                        <ToggleButton value="keyvalue" aria-label="centered">
                            key-value格式
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {alignment === 'json' && (
                    <TextField id="outlined-multiline-static" className="mar-top" label="请输入JSON格式的参数" multiline rows={10} value={params} onChange={handleChange} />
                )}
                {alignment === 'keyvalue' && (
                    <Stack className="mar-top mar-left" spacing={2}>
                        {Array.isArray(paramArr) &&
                            paramArr.map((v, i) => (
                                <Stack key={i + ''} direction="row" spacing={2} alignItems="center">
                                    <TextField
                                        variant="outlined"
                                        label="请输入key"
                                        value={v.key || ''}
                                        onChange={(e) => {
                                            v.key = e.target.value.trim();
                                            setParamArr(paramArr.slice());
                                        }}
                                    />
                                    <TextField
                                        variant="outlined"
                                        label="请输入Value"
                                        value={v.value || ''}
                                        onChange={(e) => {
                                            v.value = e.target.value.trim();
                                            setParamArr(paramArr.slice());
                                        }}
                                    />
                                    <IconButton
                                        aria-label="add"
                                        onClick={() => {
                                            let arr = paramArr.concat([{ key: '', value: '' }]);
                                            setParamArr(arr);
                                        }}
                                    >
                                        <AddCircleIcon />
                                    </IconButton>
                                    <IconButton
                                        aria-label="remove"
                                        onClick={() => {
                                            if (paramArr.length > 1) {
                                                paramArr.splice(i, 1);
                                                setParamArr(paramArr.slice());
                                            }
                                        }}
                                    >
                                        <RemoveCircleOutlinedIcon />
                                    </IconButton>
                                </Stack>
                            ))}
                    </Stack>
                )}
            </div>
        );
    };

    // 编辑落地页渲染
    const editRender = () => {
        return (
            <div id="lotSizeCode">
                {isLoc && envRender()}
                <div className="page-type">
                    <div className="com-flex-cen mar-top">
                        <span className="before-text">落地页类型: </span>
                        <Select onChange={(e) => onChangeData(e, 'pageType')} value={state.pageType} className="select-box">
                            <MenuItem disabled value={0}>
                                请选择落地页类型
                            </MenuItem>
                            <MenuItem value={1}>小程序原生路径</MenuItem>
                            <MenuItem value={2}>h5落地⻚链接</MenuItem>
                        </Select>
                    </div>
                    <div className="com-flex-cen mar-top">
                        <span className="before-text">落地页路径: </span>
                        {state.pageType === 2 ? (
                            <TextField
                                sx={{ width: 260 }}
                                variant="outlined"
                                label="请输入落地⻚链接"
                                value={state.inputpagePath || ''}
                                onChange={(e) => onChangeData(e, 'inputpagePath')}
                            />
                        ) : (
                            <Select defaultValue={0} onChange={(e) => onChangeData(e, 'pagePathId')} value={state.pagePathId} className="select-box">
                                <MenuItem disabled value={0}>
                                    请选择落地页路径
                                </MenuItem>
                                {autoPageList.map((item, index) => {
                                    return (
                                        <MenuItem key={index} value={item.id}>
                                            {item.name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        )}
                    </div>
                </div>
                {state.pageType === 1 ? paramsRender() : <div></div>}
                <div className="page-type">
                    <div className="com-flex-cen mar-top">
                        <span className="before-text">一级渠道: </span>
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={levelList}
                            sx={{ width: 260 }}
                            noOptionsText="无数据"
                            getOptionLabel={(option: any) => option.channelLevelName || state.firstLevelName}
                            renderInput={(params) => <TextField {...params} label="请选择一级渠道" variant="outlined" />}
                            isOptionEqualToValue={(option, value) => option.channelLevelName === value.title}
                            onChange={(e, v) => {
                                console.log('-=一级渠道===', v);
                                if (v?.channelLevelId !== state.firstLevelId) {
                                    setSelectLvSecondList([]);
                                }
                                setState({ firstLevelId: v?.channelLevelId || '', firstLevelName: v?.channelLevelName || null });
                                setLevelSecondList([]);
                                setLevelSecondPage(1);
                                setReFreshSec(!reFreshSec);
                            }}
                        />
                    </div>
                    <div className="com-flex-cen mar-top">
                        <span className="before-text">二级渠道: </span>
                        <Autocomplete
                            multiple
                            disablePortal
                            id="combo-box-demo-2"
                            noOptionsText="无数据"
                            value={selectLvSecondList}
                            options={levelSecondList}
                            sx={{ width: 260 }}
                            disableCloseOnSelect
                            getOptionLabel={(option: any) => option.channelLevelName}
                            renderInput={(params) => <TextField {...params} variant="outlined" label="请选择二级渠道" />}
                            onChange={(e, v: any) => {
                                console.log('-==二级渠道=====', v);
                                if (v && v.length > 10) {
                                    return setMessageData({ open: true, message: '二级渠道最多选择10个' });
                                } else {
                                    setSelectLvSecondList(v);
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="com-flex-left mar-top">
                    <span className="before-text">生成渠道参数数量: </span>
                    <TextField
                        sx={{ width: 260 }}
                        variant="outlined"
                        label={state.countNumber ? '' : '请输入生成参数数量'}
                        value={state.countNumber ? state.countNumber : ''}
                        onChange={(e) => onChangeData(e, 'countNumber')}
                    />
                </div>
                <div className="page-type mar-top">
                    <div className="doneBox">
                        {!loading && <div onClick={() => submit()}>生成链接&二维码</div>}
                        {loading && (
                            <div>
                                <span>生成中</span>
                                <div className="loding-box">
                                    <img src="https://ossprod.jrdaimao.com/file/167031873731490.gif" className="loding-img" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (!showChild) {
        return null;
    }
    if (!state.isLogin) return <LoginWeb onLogin={onLogin} />;

    return (
        <div>
            {editRender()}
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                onClose={() => {
                    setMessageData({ open: false });
                }}
                open={open}
                autoHideDuration={2000}
            >
                <Alert severity="error" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default LotSizeCode;
