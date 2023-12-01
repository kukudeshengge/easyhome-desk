import QRCode from 'qrcode.react';
import { Input, Button, Divider, message } from 'antd';
import { useState } from 'react';
import styles from '../../styles/Tool.module.scss';

export default function qrcodeBox() {
    const [messageApi, contextHolder] = message.useMessage();
    const [url, setUrl] = useState('');

    async function createLink() {
        if (!url) {
            messageApi.warning('请输入二维码内容');
            return;
        }
    }

    return (
        <div>
            {contextHolder}
            <Input addonBefore="URL|TXT" placeholder="请输入二维码内容" onChange={(e) => setUrl(e.target.value)} value={url} />
            <div className={styles.btn_center}>
                <QRCode value={url} level="M" size={200} />
            </div>
            {url.length > 0 && <div className={styles.btn_center}>二维码内容:{url}</div>}
        </div>
    );
}
