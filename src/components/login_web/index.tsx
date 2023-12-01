import { SendOutlined } from '@ant-design/icons';
import { Button, Input, notification } from 'antd';
import { useEffect, useState } from 'react';
import md5 from 'js-md5';
import LoginWebScss from './login_web.module.scss';
import Image from 'next/image';
import { login } from '../../api/channel';

import web_logo from '../../assets/login/web_logo.jpg';
import { localDb, LOCALDBKEYS } from '../../utils/localDb';
import { isLoc } from '../../api/config';

interface IProps {
    onLogin: (jwtToken: string) => void;
}

//运营平台的登录逻辑
export default function LoginWeb(props: IProps) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [phone, setPhone] = useState('');
    const [password, setPwd] = useState('');
    const [notice, contextHolder] = notification.useNotification();

    useEffect(() => {
        const phone = localDb.get(LOCALDBKEYS.PHONE);
        const pwd = localDb.get(LOCALDBKEYS.PASSWORD);
        setPhone(phone || '');
        if (isLoc) {
            setPwd(pwd || '');
        }
    }, []);

    async function toLogin() {
        if (!/^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(phone)) {
            return notice.error({ message: '手机号错误', description: '请输入11位手机号' });
        }
        if (password.length < 6 || password.length > 20) {
            return notice.error({ message: '密码长度错误', description: '请输入6-20英文或数字' });
        }
        if (!/^[0-9a-zA-Z]+$/.test(password)) {
            return notice.error({ message: '密码错误', description: '请输入6-20英文或数字' });
        }
        setLoading(true);
        try {
            const data: any = await login({ phone, password: md5(password) });
            setLoading(false);
            if (data) {
                props.onLogin(data.jwtToken);
                localDb.set(LOCALDBKEYS.PHONE, phone);
                localDb.set(LOCALDBKEYS.PASSWORD, password);
                localDb.setjwtToken(`jwtToken`, data.jwtToken);
            }
        } catch (error: any) {
            notice.error({ message: '登录失败', description: error.message });
            setLoading(false);
        }
    }

    return (
        <div className={LoginWebScss.loginBox}>
            {contextHolder}
            <Image src="https://ossprod.jrdaimao.com/file/1680589045071439.jpg" width={178.5} height={125.5} alt="" />
            <div className={LoginWebScss.loginLabel}>
                <Input className={LoginWebScss.loginInput} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" maxLength={15} />
            </div>
            <div className={LoginWebScss.loginLabel}>
                <Input.Password
                    className={LoginWebScss.loginInput}
                    value={password}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="请输入密码"
                    visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                    onPressEnter={toLogin}
                />
            </div>
            <Button loading={loading} onClick={toLogin} type="primary" icon={<SendOutlined />} size="large">
                登&nbsp;&nbsp;&nbsp;&nbsp;录
            </Button>
        </div>
    );
}
