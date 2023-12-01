import { PlusOutlined } from '@ant-design/icons';
import { Input, Button, Divider, message } from 'antd';
import styles from '../../styles/Tool.module.scss';
import { CreateSortLink } from '../../api/sortlink';
import { useState } from 'react';
import dayjs from 'dayjs';
import copy from 'copy-to-clipboard';

interface IListItem {
    key: string;
    time: number;
}
export default function SortLink() {
    const [url, setUrl] = useState('');
    const [list, setList] = useState<IListItem[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    async function createLink() {
        if (!url) {
            messageApi.warning('请输入网页地址');
            return;
        }
        try {
            const data: any = await CreateSortLink({ type: 0, text: url });
            const list2 = Array.from(list);
            list2.unshift({ key: data.key, time: Date.now() });
            setList(list2);
        } catch (error) {
            console.log(error);
        }
    }

    function onCopy(key: string) {
        copy(`https://rfrl.cn/${key}`);
        messageApi.info('短链已复制');
    }

    return (
        <div>
            {contextHolder}
            <Input addonBefore="URL:" placeholder="请输入网页地址" onChange={(e) => setUrl(e.target.value)} value={url} />
            <div className={styles.btn_center}>
                <Button type="primary" icon={<PlusOutlined />} onClick={createLink}>
                    生成短链
                </Button>
            </div>
            <div className={styles.btn_center}>
                <small>链接有效期一年。</small>
            </div>
            <Divider />
            {list.map((item: any, index: number) => (
                <div key={index} className={styles.sl_list}>
                    短链：https://rfrl.cn/{item.key} &nbsp;&nbsp;{dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')} &nbsp;&nbsp;
                    <Button onClick={() => onCopy(item.key)} size="small">
                        复制
                    </Button>
                </div>
            ))}
        </div>
    );
}
