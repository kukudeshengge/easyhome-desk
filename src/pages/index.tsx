import styles from '../styles/Home.module.scss';
import { Drawer } from 'antd';
import { useEffect, useState } from 'react';
import SortLink from '../components/tools/sort_link';
import Encode from '../components/tools/encode';
import QrcodeBox from '../components/tools/qrcode_box';
import { onLoginInfo, shellCall } from '../utils/electronAPI';

interface IToolItem {
    key: string;
    title: string;
    icon: string;
    component: any;
}

export default function Home() {
    const [open, setOpen] = useState(false);
    const [tool, setTool] = useState<IToolItem | null>(null);

    const Tools: IToolItem[] = [
        { key: 'sortlink', title: '生成短链', icon: 'https://c.runoob.com/wp-content/uploads/2017/09/unicode_convert.png', component: () => <SortLink /> },
        {
            key: 'encode',
            title: '编码转换',
            icon: 'https://c.runoob.com/wp-content/uploads/2016/09/1473407898_Coding-Html.png',
            component: () => <Encode />,
        },
        {
            key: 'qrcodebox',
            title: '生成二维码',
            icon: 'https://ossprod.jrdaimao.com/ac/1690184652257_402x402.png',
            component: () => <QrcodeBox />,
        },
        // {
        //     key: 'login',
        //     title: '登录',
        //     icon: 'https://ossprod.jrdaimao.com/ac/1690184652257_402x402.png',
        //     component: () => null,
        // },
    ];

    function onClose() {
        setOpen(false);
        setTool(null);
    }
    function showTool(item: IToolItem) {
        // if (item.key === 'login') {
        //     shellCall({
        //         fnName: 'openExternal',
        //         params: 'http://localhost:8000/sharelogin',
        //     });
        //     return;
        // }
        setTool(item);
        setOpen(true);
    }
    return (
        <div>
            <h1 className={styles.title}>欢迎使用洞窝客户端</h1>
            <div className={styles.list}>
                {Tools.map((item, index) => (
                    <div className={styles.item} key={index} onClick={() => showTool(item)}>
                        <img src={item.icon} alt="" />
                        <div className={styles.tit}>{item.title}</div>
                    </div>
                ))}
            </div>

            <Drawer title={tool ? tool.title : ''} open={open} onClose={onClose} size="large">
                {tool && tool.component()}
            </Drawer>
        </div>
    );
}
