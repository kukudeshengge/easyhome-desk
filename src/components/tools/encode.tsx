import { Button, Input, message } from 'antd';
import { useState } from 'react';
import styles from '../../styles/Tool.module.scss';
import md5 from 'js-md5';

const TextArea = Input.TextArea;

export default function Encode() {
    const [messageApi, contextHolder] = message.useMessage();
    const [value, SetValue] = useState('');
    const [result, setResult] = useState('');

    function transcode1() {
        if (!value) {
            messageApi.warning('请输入内容');
            return;
        }
        setResult(encodeURIComponent(value));
    }
    function transcode2() {
        if (!value) {
            messageApi.warning('请输入内容');
            return;
        }
        setResult(decodeURIComponent(value));
    }
    function transcode3() {
        if (!value) {
            messageApi.warning('请输入内容');
            return;
        }
        setResult(md5(value));
    }

    return (
        <>
            {contextHolder}
            <TextArea rows={4} placeholder="请输入需要转换的内容" onChange={(e) => SetValue(e.target.value)} />
            <div className={styles.encode_btns}>
                <Button type="primary" onClick={transcode1} className={styles.encode_btn}>
                    URL编码
                </Button>
                <Button type="primary" onClick={transcode2} className={styles.encode_btn}>
                    URL解码
                </Button>
                <Button type="primary" onClick={transcode3} className={styles.encode_btn}>
                    MD5加密
                </Button>
            </div>
            <div className={styles.btn_center}>{result}</div>
        </>
    );
}
