import React from 'react';
import { localDb } from '../utils/localDb';
import { Input, Button, Table, notification } from 'antd';
import axios from 'axios';
import * as XLSX from 'xlsx';
import LoginWeb from '../components/login_web';
import styles from './tingche.module.scss';

function setCookie(list: null | string[]) {
    let cookies = '';
    if (Array.isArray(list)) {
        list.forEach((item) => {
            if (item.length > 0) cookies += item.split(';')[0];
        });
    }
    if (cookies.length > 10) {
        localDb.set('juyng_cookies', cookies);
        console.log('设置cookie', cookies);
    }
}
interface ITCLogin {
    headers: any;
    data: {
        code: number;
        count: number;
        data: {
            access_token: string;
            merchantType: number;
            userName: string;
        };
        msg: string;
        totalRow: any;
    };
}
// 登录停车网
async function LoginTC() {
    const res: ITCLogin = await window.electronAPI.axios_post('http://juyng.com/merchant/login', 'username=jrzj&password=83679872&authorization_admin=', {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            cookie: localDb.get('juyng_cookies'),
        },
    });
    if (res.data.code === 0) {
        setCookie(res.headers['set-cookie']);
        localDb.setjwtToken('juyng_token', res.data.data.access_token);
        return res.data.data;
    }
    return null;
}

interface ICheckLogin {
    headers: any;
    data: {
        code: number;
        data: {
            name: string;
        };
    };
}
async function checkLogin() {
    const authorization = localDb.getjwtToken(`juyng_token`) || '';
    console.log('获取缓存', authorization);
    if (!authorization) return false;
    const res: ICheckLogin = await window.electronAPI.axios_get(`http://juyng.com/merchant/clogin?authorization_admin=${authorization}`, {
        headers: {
            cookie: localDb.get('juyng_cookies'),
        },
    });
    setCookie(res.headers['set-cookie']);
    return res.data.code === 0;
}

async function findDetail(id: string) {
    const res = await axios.get('https://topic.jrdaimao.com/api_topic/find?id=' + id);
    return res.data;
}

async function downLoadExcel(params: any) {
    if (!params) return;
    const authorization = localDb.getjwtToken(`jwtToken`) || '';
    console.log(params);
    const res = await axios.post('https://gateway.jrdaimao.com/easyhome-ops-web-application/operation/applets/operActivity/exportActivityUserInfo', params, {
        headers: {
            authorization: authorization,
            platform: 'operation',
        },
        responseType: 'arraybuffer',
    });

    return res.data;
}
async function getPailist() {
    const res = await window.electronAPI.axios_get('http://juyng.com/merchant/history?page=1&limit=50&timestamp=' + Date.now(), {
        headers: {
            cookie: localDb.get('juyng_cookies'),
        },
    });
    console.log(res.data.data);
    if (res.data.code === 0) {
        const list: string[] = [];
        res.data.data.forEach((item: any) => {
            list.push(item.plateNumber);
            // list.push({
            //     pai: item.plateNumber,
            //     usedata: item.provideDate,
            // });
        });
        return list;
    }
    return [];
}

async function sendQuan(pai: string, hour: number) {
    const authorization = localDb.getjwtToken(`juyng_token`) || '';

    const marketres = await window.electronAPI.axios_get('http://juyng.com/merchant/detail?authorization_admin=' + authorization, {
        headers: {
            Authorization_admin: authorization,
            cookie: localDb.get('juyng_cookies'),
        },
    });
    if (marketres.data.code !== 0) throw new Error('信息获取失败');
    const marktmodel = marketres.data.data.merchant;
    // console.log('卖场信息', marktmodel);
    const res = await window.electronAPI.axios_post(
        'http://juyng.com/merchant/provide',
        `countLimitDayRemain=${marktmodel.countLimitDayRemain}&residueHour=${marktmodel.residueHour}&freeResidueHour=${marktmodel.freeResidueHour}&singleMax=${
            marktmodel.singleMax
        }&plateNumber=${encodeURIComponent(pai)}&hour=${hour}&authorization_admin=${authorization}`,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                cookie: localDb.get('juyng_cookies'),
            },
        }
    );
    console.log(res.data);
    if (res.data.code === 1) return res.data.data;
    if (res.data.code !== 0) throw new Error(res.data.msg || '信息获取失败');
    return res.data.data;
}

interface iState {
    isLogin: boolean;
    list: any[];
    appState: number; // 应用状态，0未登录，1登录中，3登录成功
    atlook: boolean;
    load: boolean;
    url: string;
    id: string;
    aid: string;
    usehour: string;
}
export default class Tingche extends React.Component<any, iState> {
    state = {
        isLogin: false,
        list: [],
        appState: 0, // 应用状态，0未登录，1登录中，3登录成功
        atlook: false,
        load: false,
        url: '',
        id: '',
        aid: '',
        usehour: '1',
    };
    usedlist: any[] = [];
    params: any = null;
    timer: any = null;
    timer2: any = null;
    columns = [
        {
            dataIndex: 'tell',
            title: '手机号',
            key: 'tell',
        },
        {
            dataIndex: 'pai',
            title: '车牌',
            key: 'pai',
        },
        {
            dataIndex: 'use',
            title: '是否提交',
            key: 'use',
            render: (text: boolean) => (text ? '已提交' : '未提交'),
        },
        {
            dataIndex: 'tell',
            title: '操作',
            key: 'tell',
            render: (text: string, record: any) => {
                return (
                    <div>
                        <Button onClick={() => this.submit(record)}>提交</Button>
                        <Button onClick={() => this.submit2(record)}>设为提交</Button>
                    </div>
                );
            },
        },
    ];
    render() {
        const { isLogin, list, appState, atlook, id, aid, url, usehour } = this.state;
        const { onLogin, autoLogin, columns, createTimer, cancelTimer, parseURL } = this;
        if (!isLogin) return <LoginWeb onLogin={onLogin} />;
        return (
            <div>
                {/* {contextHolder} */}
                <div className={styles.status}>
                    <div className={styles.status1}>
                        <span className={styles.tags}>{appState === 0 ? '未登录' : appState === 3 ? '已登录' : '登录中'}</span>
                        {appState !== 3 && <Button onClick={autoLogin}>手动登录</Button>}
                    </div>
                    <div>
                        <span className={styles.tags}>{atlook ? '表单监听中' : '表单监听未启动'}</span>
                        {!atlook && <Button onClick={createTimer}>开始监听</Button>}
                        {atlook && <Button onClick={cancelTimer}>取消监听</Button>}
                    </div>
                    <div className={styles.hour}>
                        <Input
                            addonBefore="优惠时长"
                            placeholder="请输入要使用时长"
                            addonAfter="小时"
                            onChange={(e) => this.setState({ usehour: e.target.value })}
                            value={usehour}
                        />
                    </div>
                </div>
                <div className={styles.waiturl}>
                    <Input addonBefore="URL" placeholder="请输入链接" onChange={(e) => parseURL(e.target.value)} value={url} />
                    <div className={styles.waittext}>
                        落地页id:<span>{id}</span>,活动id:<span>{aid}</span>
                    </div>
                </div>

                <Table dataSource={list} columns={columns} />
            </div>
        );
    }
    componentDidMount(): void {
        const authorization = localDb.getjwtToken(`jwtToken`) || '';
        this.setState({
            isLogin: !!authorization,
        });
        this.autoLogin();
        this.checkList();
    }
    componentWillUnmount(): void {
        this.cancelTimer();
    }

    autoLogin = async () => {
        if (this.state.load) return;
        this.setState({
            load: true,
            appState: 1,
        });
        try {
            const testLogin = await checkLogin();
            if (!testLogin) {
                const res = await LoginTC();
                if (res?.access_token) {
                    this.setState({
                        appState: 3,
                    });
                } else {
                    this.setState({
                        appState: 0,
                    });
                }
            } else {
                this.setState({
                    appState: 3,
                });
            }
            this.setState({
                load: false,
            });
        } catch (error: any) {
            console.log(error);
            this.setState({
                load: false,
                appState: 0,
            });
            notification.error({
                message: error.message,
            });
        }
    };

    // 登录回调
    onLogin = (jwtToken: string) => {
        localDb.setjwtToken(`jwtToken`, jwtToken);
        this.setState({
            isLogin: true,
        });
    };
    cancelTimer = () => {
        console.log('清空定时器');
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            clearInterval(this.timer2);
            this.timer2 = null;
        }
        this.setState({
            atlook: false,
        });
    };
    createTimer = () => {
        console.log('创建定时器');
        this.setState({
            atlook: true,
        });

        if (!this.timer)
            this.timer = setInterval(() => {
                this.execTimer();
            }, 10000);
        if (!this.timer2)
            this.timer2 = setInterval(() => {
                this.execSubmit();
            }, 5000);
    };
    execTimer = async () => {
        const { isLogin, list } = this.state;
        console.log('执行一次', isLogin);
        this.setState({
            atlook: true,
        });
        if (!isLogin) return;
        if (!this.params) return;
        const arrbuff = await downLoadExcel(this.params);
        const workbook = XLSX.read(arrbuff, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // console.log(jsonData);
        const tabels = new Map();
        list.forEach((item: any) => {
            tabels.set(item.tell, item);
        });

        jsonData.forEach((item: string[], index: number) => {
            if (index === 0) return;
            if (!tabels.has(item[2])) tabels.set(item[2], { tell: item[2], pai: item[3], use: this.usedlist.includes(item[3]) });
        });

        const newlist = [];
        for (const data of tabels.values()) {
            newlist.push(data);
        }
        this.setState({
            list: newlist,
        });
    };
    execSubmit = async () => {
        const { isLogin, list } = this.state;
        console.log('主动提交一次', isLogin);
        this.setState({
            atlook: true,
        });
        if (!isLogin) return;

        let model = null;
        for (let index = 0; index < list.length; index++) {
            const item: any = list[index];
            if (!item.use) {
                console.log(item);
                model = item;
                break;
            }
        }
        console.log('找到一个', model);
        if (model) this.submit(model);
    };
    checkList = async () => {
        try {
            const pailist = await getPailist();
            this.usedlist = pailist;
        } catch (error: any) {
            notification.error({
                message: error.message,
            });
        }
    };
    parseURL = async (url: string) => {
        this.setState({
            url,
        });
        const href = url.split('?')[0];
        const list = href.split('/');
        if (list.length < 3) return;
        const did = list[list.length - 1];
        if (did.length < 4 && did.length > 10) return;
        this.setState({
            id: did,
        });
        try {
            const res = await findDetail(did);
            if (res.status === 1) {
                const blocks = res.data.blocks;
                this.setState({
                    aid: res.data.page.lid,
                });
                blocks.forEach((item: any) => {
                    if (item.type === 'dynamicForm') {
                        console.log(item.formList);
                        this.params = {
                            activityId: res.data.page.lid,
                            formList: item.formList,
                        };
                    }
                });
            }
        } catch (error: any) {
            console.log(error);
            notification.error({
                message: error.message,
            });
        }
    };
    submit = async (data: any) => {
        const { usehour, list } = this.state;
        try {
            await sendQuan(data.pai, parseInt(usehour));
            const list1 = Array.from(list);
            list1.forEach((item: any) => {
                if (item.tell === data.tell) {
                    item.use = true;
                }
            });
            this.setState({
                list: list1,
            });
        } catch (error: any) {
            console.log(error.message);
            notification.error({
                message: error.message,
            });
        }
    };
    submit2 = async (data: any) => {
        const { list } = this.state;
        const list1 = Array.from(list);
        list1.forEach((item: any) => {
            if (item.tell === data.tell) {
                item.use = true;
            }
        });
        this.setState({
            list: list1,
        });
    };
}
