import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import IconButton from '@mui/material/IconButton';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import { loginRegister } from '../api/member';
import { getShortKey, auotPageList } from '../api/hotConfig';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import React, { useEffect, useState } from 'react';
import { CreateSortLink } from '../api/sortlink';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
const top100Films = [
    { label: '自定义小程序路径', path: '' },
    {
        label: '居然会',
        path: 'share/pages/jrVip/index',
        paramArr: [
            { key: 'source', value: 'share' },
            { key: 'memberId', value: '' },
            { key: 'phone', value: '' },
            { key: 'inviteName', value: '' },
        ],
    },
    { label: '卖场首页', path: 'market/pages/market/index', paramArr: [{ key: 'marketId', value: '' }] },
    {
        label: '店铺首页',
        path: 'shopStore/pages/storeDetail/index',
        paramArr: [
            {
                key: 'shopId',
                value: '',
            },
        ],
    },
    {
        label: '商品详情',
        path: 'goods/pages/goodsDetail/index',
        paramArr: [{ key: 'goodsId', value: '' }],
    },
    { label: '城市站首页', path: 'pages/home/index' },
    { label: '邀请有礼', path: 'pages/freeGift/index' },
    { label: '地推页面', path: 'guide/pages/customLogin/index' },
    {
        label: '导购拉新',
        path: 'guide/pages/guideLogin/index',
        paramArr: [
            { key: 'type', value: 'marketId' },
            { key: 'memberId', value: '' },
            { key: 'marketId', value: '' },
        ],
    },
];
export default function wxQRCode() {
    const [showChild, setShowChild] = useState(false);
    const [allPathList, setAllPathList] = useState<any>([]);
    const [path, setPath] = useState<any>('');
    const [phone, setPhone] = useState<string>('');
    const [alignment, setAlignment] = React.useState<string | null>('keyvalue');
    const [params, setParams] = React.useState('');
    const [paramArr, setParamArr] = React.useState([{ key: '', value: '' }]);
    const [envVersion, setEnvVersion] = React.useState('release');
    const [env, setEnv] = React.useState('production');
    const [urlLink, setUrlLink] = React.useState('');
    const [qrCodeUrl, setQrCodeUrl] = React.useState('');
    const [phoneLoginData, setPhoneLoginData] = React.useState<string | null>(null);
    const [messageData, setMessageData] = React.useState<any>({
        open: false,
        message: '',
    });
    const { message, open } = messageData;

    useEffect(() => {
        setShowChild(true);
    }, []);
    useEffect(() => {
        setEnvVersion('release');
        setEnv('production');
        getConfigList();
    }, [showChild]);

    const getConfigList = async () => {
        try {
            let basUrl = env === 'production' ? 'https://ac.jrdaimao.com' : 'https://acsit.jrdaimao.com';
            const data = await auotPageList(basUrl);
            setAllPathList(data?.top100Films ?? []);
            setPath(data?.top100Films[0] ?? {});
        } catch (error) {
            console.log('%c [ error ]-90', 'font-size:13px; background:pink; color:#bf2c9f;', error);
            setAllPathList(top100Films);
            setPath(top100Films[0]);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParams(event.target.value);
    };
    const handlePhoneLogin = async () => {
        try {
            if (phone && phone.length === 11) {
                const data: any = await loginRegister(phone);
                const { memberId, nickname, acMemberId } = data;
                let jdata = JSON.stringify({ memberId, nickname, acMemberId, phone }, null, 4);
                setPhoneLoginData(jdata);
            } else {
                setMessageData({ open: true, message: '请输入正确的手机号' });
            }
        } catch (error: any) {
            setMessageData({ open: true, message: error.message || '请输入正确的手机号' });
        }
    };
    // 获取小程序码
    const handleQRCodeLink = async () => {
        if (!path || !path.path) {
            setMessageData({ open: true, message: '请选择小程序页面路径' });
            return;
        }
        setQrCodeUrl('');
        let param: any = {};
        if (alignment === 'keyvalue') {
            paramArr.forEach((v) => {
                param[v.key] = v.value;
            });
        } else if (alignment === 'json' && params && !!params.trim()) {
            try {
                param = JSON.parse(params);
            } catch (error) {
                setMessageData({ open: true, message: 'JSON格式不正确哦' });
                return;
            }
        }

        try {
            let s = 'null';
            let topicUrl = env === 'production' ? 'https://topic.jrdaimao.com' : 'https://topicdev3.jrdaimao.com';
            if (Object.keys(param).length > 0) {
                const data = await getShortKey({ type: 1, data: param }, topicUrl);
                s = `s=${data.key}`;
            }
            let qrCodeUrl = `${topicUrl}/page/qrcode/wxapp?page=${path.path}&scene=${encodeURIComponent(s)}&env_version=${envVersion}`;
            console.log(qrCodeUrl, 'img');
            setQrCodeUrl(qrCodeUrl);
        } catch (error) {
            console.log('%c [ error ]-126', 'font-size:13px; background:pink; color:#bf2c9f;', error);
            //
        }
    };
    // 获取短链
    const handleShortLink = async () => {
        if (!path || !path.path) {
            setMessageData({ open: true, message: '请选择小程序页面路径' });
            return;
        }
        let topicUrl = env === 'production' ? 'https://topic.jrdaimao.com' : 'https://topicdev3.jrdaimao.com';

        let url = `${topicUrl}/page/jump/wxapp2?path=${path.path}&env_version=${envVersion}`;
        if (alignment === 'keyvalue') {
            paramArr.forEach((v) => {
                url += '&' + v.key + '=' + v.value;
            });
        } else if (alignment === 'json' && params && !!params.trim()) {
            try {
                const pj = JSON.parse(params);
                Object.keys(pj).forEach((k) => {
                    url += '&' + k + '=' + pj[k];
                });
            } catch (error) {
                setMessageData({ open: true, message: 'JSON格式不正确哦' });
                return;
            }
        }

        try {
            const res = await CreateSortLink({ type: 0, text: url });
            // url = 'https://ac.jrdaimao.com/s/' + res.key;
            url = 'https://rfrl.cn/' + res.key;
            console.log('%c [ res ]-61', 'font-size:13px; background:pink; color:#bf2c9f;', res);
        } catch (error) {
            console.log('%c [ error ]-63', 'font-size:13px; background:pink; color:#bf2c9f;', error);
        }
        setUrlLink(url);
    };

    if (!showChild) {
        return null;
    }
    return (
        <div>
            <h2>获取微信小程序码/短链</h2>
            <Stack spacing={3} direction="row" justifyContent="space-around">
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2}>
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={allPathList}
                            sx={{ width: 300 }}
                            renderInput={(params) => <TextField {...params} label="请选择小程序页面" />}
                            value={path}
                            onChange={(e, v) => {
                                setPath(v);
                                if (v.paramArr) {
                                    setAlignment('keyvalue');
                                    setParamArr(v.paramArr);
                                } else {
                                    setAlignment('noparams');
                                    setParamArr([{ key: '', value: '' }]);
                                }
                            }}
                        />
                        <TextField
                            variant="outlined"
                            label="小程序页面路径"
                            value={(path && path.path) || ''}
                            onChange={(e) => {
                                setPath({ label: '自定义小程序路径', path: e.target.value });
                            }}
                        />
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <div>小程序页面参数:</div>
                        <ToggleButtonGroup value={alignment} exclusive onChange={(_, v) => setAlignment(v)} aria-label="text alignment">
                            <ToggleButton value="noparams" aria-label="centered">
                                不需要参数
                            </ToggleButton>
                            <ToggleButton value="keyvalue" aria-label="centered">
                                key-value格式
                            </ToggleButton>
                            <ToggleButton value="json" aria-label="centered">
                                JSON格式
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    {alignment === 'json' && <TextField id="outlined-multiline-static" label="请输入JSON格式的参数" multiline rows={10} value={params} onChange={handleChange} />}
                    {alignment === 'keyvalue' && (
                        <Stack spacing={2}>
                            {Array.isArray(paramArr) &&
                                paramArr.map((v, i) => (
                                    <Stack key={i + ''} direction="row" spacing={2} alignItems="center">
                                        <TextField
                                            variant="outlined"
                                            label="请输入key"
                                            value={v.key || ''}
                                            onChange={(e) => {
                                                v.key = e.target.value;
                                                setParamArr(paramArr.slice());
                                            }}
                                        />
                                        <TextField
                                            variant="outlined"
                                            label="请输入Value"
                                            value={v.value || ''}
                                            onChange={(e) => {
                                                v.value = e.target.value;
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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                            variant="outlined"
                            label="请输入已注册洞窝手机号码"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                            }}
                        />
                        <Button variant="contained" onClick={handlePhoneLogin}>
                            通过手机号获取memberId
                        </Button>
                    </Stack>
                    {phoneLoginData ? (
                        <div className="jdata">
                            <pre>{phoneLoginData}</pre>
                        </div>
                    ) : null}
                </Stack>
                <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <div>请选择小程序版本:</div>
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
                        <div>请选择小程序:</div>
                        <ToggleButtonGroup value={env} exclusive onChange={(_, v) => setEnv(v)} aria-label="text alignment">
                            <ToggleButton value="production" aria-label="centered">
                                洞窝家居
                            </ToggleButton>
                            <ToggleButton value="test" aria-label="centered">
                                云上洞窝
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Button variant="contained" endIcon={<SendIcon />} onClick={handleQRCodeLink}>
                        生成二维码
                    </Button>
                    {qrCodeUrl ? <img src={qrCodeUrl} alt="" /> : null}
                    <Button variant="contained" endIcon={<SendIcon />} onClick={handleShortLink}>
                        生成小程序短链
                    </Button>
                    {urlLink ? <div>小程序短链:{urlLink}</div> : null}
                </Stack>
            </Stack>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                onClose={() => {
                    setMessageData({ open: false });
                }}
                open={open}
                autoHideDuration={3000}
            >
                <Alert severity="error" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
}
