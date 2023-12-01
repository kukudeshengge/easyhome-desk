import styles from '../styles/dingtalkStep.module.scss';
import { Button, Image, message, Popover, Row, Space, Table, Upload, Card, InputNumber, Input, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import { formatBaseInfo, formatDingTalkSteps } from '../utils/xlsxTools';
import { getToken, postSend_v2 } from '../api/dingTalk';

/**
 * 高管运动
 */
const DingtalkStep = () => {
    const [allSteps, setAllSteps] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const BaseInfoRef = useRef<any>(); // 用户基础信息
    const StepsInfoRef = useRef<any>(); // 用户步数信息
    const loading = useRef(false);
    const token = useRef('');

    const onUploadBaseInfo = (file: any) => {
        BaseInfoRef.current = file;
        setRefreshing(!refreshing);
    };
    const onUploadStepnfo = (file: any) => {
        StepsInfoRef.current = file;
        setRefreshing(!refreshing);
    };
    const onStartJobClick = async () => {
        if (!BaseInfoRef.current || !StepsInfoRef.current) {
            message.error('请先上传用户基础信息和用户步数信息');
            return;
        }
        if (allSteps <= 0) {
            message.error('请填写每月目标步数');
            return;
        }
        let tlogs: any = [];
        if (loading.current) return message.info('数据处理中');
        loading.current = true;
        try {
            const date = formatDayMonth();
            const stepInfo: any = await formatDingTalkSteps(StepsInfoRef.current);
            const baseinfo: any = await formatBaseInfo(BaseInfoRef.current);
            // console.log("stepInfo=",stepInfo);
            // console.log("baseinfo=",baseinfo);

            Object.keys(stepInfo).forEach((k) => {
                let name = k;
                let step_count = stepInfo[k].steps.reduce((accumulator: any, currentValue: any) => accumulator + currentValue.step_count, 0);
                const progress = (Number(Number(step_count / allSteps).toFixed(4)) * 100).toFixed(2);
                const content = `${name},您好！截止${date.month}月${date.day}日完成步数为${step_count}，${date.month}月应完成步数为${allSteps}，${date.month}月完成进度${progress}%。`;
                const userId = baseinfo[name]?.userId;
                tlogs.push({ content, userId, sendType: userId ? 0 : 2 });
                setLogs(tlogs.slice());
            });
            // console.log('tlogs=', tlogs);
        } catch (error: any) {
            message.error(error.message || '解析数据失败');
            console.log('%c [ error ]-42', 'font-size:13px; background:pink; color:#bf2c9f;', error);
        } finally {
            loading.current = false;
        }
    };
    const onSendMessageClick = async () => {
        try {
            if (!token.current) {
                const data: any = await getToken();
                token.current = data.access_token || '';
            }
            // const content = 'test';
            // const userid = '10057860';
            // await postSend_v2(token.current, { agent_id: '1482461996', userid_list: userid, msg: { msgtype: 'text', text: { content } } });
        } catch (error: any) {
            message.error(error.message || '获取token失败');
        }

        for (let index = 0; index < logs.length; index++) {
            const item = logs[index];
            if (!item.userId) {
                return;
            }
            try {
                const userId = item.userId;
                // const userId = '10057860';
                const res: any = await postSend_v2(token.current, { agent_id: '1482461996', userid_list: userId, msg: { msgtype: 'text', text: { content: item.content } } });
                if (res.errcode === 0) {
                    item.sendType = 1;
                } else {
                    item.sendType = 2;
                    item.errmsg = res.errmsg;
                }
            } catch (error: any) {
                item.sendType = 2;
                item.errmsg = error.message;
            } finally {
                setLogs([...logs]);
            }
        }
    };

    function formatDayMonth() {
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate();
        return { year, month, day };
    }
    const onAllStepChange = (e: any) => {
        setAllSteps(Number(e.target.value) || 1);
        setLogs([]);
    };
    return (
        <div className={styles.ggyd}>
            <Space>
                <Input width={200} placeholder="请输入月目标步数" onChange={onAllStepChange} />
                <Upload accept=".xlsx, .xls" beforeUpload={onUploadBaseInfo} showUploadList={false}>
                    <Button>上传用户基础信息</Button>
                </Upload>
                <Upload accept=".xlsx, .xls" beforeUpload={onUploadStepnfo} showUploadList={false}>
                    <Button>上传步数信息</Button>
                </Upload>
                <Button onClick={onStartJobClick}>开始解析</Button>
            </Space>
            <p></p>
            <Space direction="vertical">
                <div>已选择用户基础信息: {BaseInfoRef.current?.name || ''}</div>
                <div>已选择用户步数信息: {StepsInfoRef.current?.name || ''}</div>
            </Space>
            <p></p>

            <Card style={{ width: '100%', height: '60vh', overflow: 'scroll' }}>
                {logs.map((item, index) => (
                    <p key={index} style={{ color: !item.userId || item.sendType == 2 ? 'red' : 'black' }}>
                        <i>{index + 1}. </i>
                        用户ID:{item.userId}
                        <br />
                        发送内容:{item.content}
                        {item.sendType !== 0 && (
                            <>
                                <br />
                                发送状态:{item.sendType === 1 ? '成功' : '失败'}
                                {item.errmsg || ''}
                            </>
                        )}
                    </p>
                ))}
            </Card>
            <p></p>
            <Popconfirm title="提示" description="确认所有数据都正常" okText="发送" cancelText="取消" onConfirm={onSendMessageClick}>
                <Button type="primary">数据检查无误，发送钉钉通知</Button>
            </Popconfirm>
        </div>
    );
};

export default DingtalkStep;
