import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import logo from '../../public/imgs/logo.png';
import Socket from './socket';
import packageJson from '../../package.json';
import { onLoginInfo, removeLoginInfo, shellCall } from '../utils/electronAPI';
import { localDb } from '../utils/localDb';
import { OmUrl } from '../api/config';
import { Popconfirm } from 'antd';

interface IProps {
    children: any;
}

const routes = [
    {
        path: '/',
        name: '工具导航',
    },
    // {
    //     path: '/wxQRCode',
    //     name: '生成小程序码',
    // },
    // {
    //     path: '/batchQRCode',
    //     name: '批量小程序码',
    // },
    {
        path: '/lotSizeCode',
        name: '批量生成', // 地推二维码
    },
    {
        path: '/h5wxapp',
        name: '落地页小程序码',
    },
    {
        path:'/testNav',
        name: '测试导航'
    },
    // 图书已废弃
    // {
    //     path: '/books',
    //     name: '图书管理',
    // },
    // {
    //     path: '/miniPath',
    //     name: '小程序路径',
    // },
    // 临时工具，已废弃
    // {
    //     path: '/md5Phone',
    //     name: 'MD5加密',
    // },
    {
        path: '/makeWxH5',
        name: '小程序渠道落地页',
    },
    // 试验工具，已废弃
    // {
    //     path: '/ehchat',
    //     name: 'EHChat助手',
    // },
    {
        path: '/uploadImage',
        name: '上传助手',
    },
    // {
    //     path: '/generateGoodsImage',
    //     name: '商品主图生成图片',
    // },
    // {
    //     path: '/uploadGuideRule',
    //     name: '上传导购带单激励规则',
    // },
    // {
    //     path: '/uploadGuideDetail',
    //     name: '上传导购带单激励明细',
    // },
    // {
    //     path: '/tingche',
    //     name: '停车助手',
    // },
    // {
    //     path: '/dingtalkStep',
    //     name: '高管运动',
    // },
];

export default function Layout(props: IProps) {
    const [pageActive, setPageActive] = useState(-1);
    const [count, setCount] = useState(0);
    const timer = useRef<any>(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        initUser();
        onLoginInfo(handleLoginInfo);
        return () => {
            removeLoginInfo();
        };
    }, []);

    useEffect(() => {
        getOnlineUserLoop();
        Socket.on('client_count', onCount);
        return () => {
            if (timer.current) clearInterval(timer.current);
            Socket.off('client_count', onCount);
        };
    }, []);

    const initUser = () => {
        const userInfo = localDb.getUserInfo(`userInfo`) || '';
        if (userInfo.userName) {
            setUserName(userInfo.userName);
        }
    };

    const handleLoginInfo = (e: any, data: any) => {
        try {
            const userInfo = JSON.parse(data);
            //{"userId":"740090623903621120","userName":"乐凯","phone":"17600209465","status":null,"jwtToken":"Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3NDAwOTA2MjM5MDM2MjExMjAiLCJpYXQiOjE2OTM5MTk2OTksImV4cCI6MTY5Mzk2Mjg5OX0.1jhODM4lGXPPw7hKfZtE1Y6ZOdJIhSeFiRiVvdrpKyaFcG9bLjZHZrEy2VMEmfw4TPTz1VdT_ka4ACDouKpBQg","roleIds":null}
            localDb.setjwtToken('jwtToken', userInfo.jwtToken);
            localDb.setUserInfo('userInfo', userInfo);
            setUserName(userInfo.userName);
        } catch (error) {}
    };

    const handleLogOut = () => {
        localDb.clear('jwtToken');
        localDb.clear('userInfo');
        setUserName('');
    };

    function onCount(msg: number) {
        if (!isNaN(msg)) setCount(msg);
    }

    function getOnlineUserLoop() {
        if (timer.current) {
            clearInterval(timer.current);
        }
        timer.current = setInterval(() => {
            Socket.emit('get_client_count');
        }, 5000);
    }

    function handleLogin() {
        shellCall({
            fnName: 'openExternal',
            params: OmUrl + '/sharelogin',
        });
    }

    function testClick() {
        Socket.emit('get_client_count');
    }
    return (
        <div id="desk">
            <div id="container">
                <main className="main">{props.children}</main>
            </div>
            <div id="menus-wrapper">
                <div className="logo" onClick={testClick}>
                    <Image src={logo} alt="" width={55} height={55} />
                    <div>
                        <span className="name">洞窝桌面端</span>
                        <br />
                        <span className="version">v{packageJson.version}</span>
                    </div>
                </div>
                <hr className="line"></hr>
                {routes.map((item, index) => (
                    <div className={pageActive === index ? 'item active' : 'item'} key={index}>
                        <Link href={item.path} className="menu" onClick={() => setPageActive(index)}>
                            {item.name}
                        </Link>
                    </div>
                ))}
                <div className="layout_bottom_row">
                    {count > 0 && <div className="online">在线人数&nbsp;[{count}]</div>}
                    <div className="right-content">
                        {userName ? (
                            <Popconfirm title="是否退出当前登录账号?" okText="退出" cancelText="取消" onConfirm={handleLogOut}>
                                <div className="user">当前用户&nbsp;[{userName}]</div>
                            </Popconfirm>
                        ) : (
                            <div onClick={handleLogin} className="user">
                                去登录
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* <header id="header">toubu</header> */}
        </div>
    );
}
