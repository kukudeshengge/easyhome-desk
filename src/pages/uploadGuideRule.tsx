import React, { useState, useEffect } from 'react';
import { Modal, Upload, message, Table } from 'antd';
import { uploadRuleFile } from '../api/guideUpload';
import LoginWeb from '../components/login_web';
import { localDb } from '../utils/localDb';
import { InboxOutlined } from '@ant-design/icons';
import styles from '../styles/uploadImage.module.scss';
const { Dragger } = Upload;
interface TableData {
    name: string;
    result?: number;
    reason?: string;
}
const Index = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [dataList, setDataList] = useState<TableData[]>([]);
    const columns:any = [
        {
            title: '上传文件名称',
            dataIndex: 'name',
            width: 100,
        },
        {
            title: '上传结果',
            dataIndex: 'result',
            width: 100,
            render:(data:any) => data === 1 ? '成功' : '失败',
        },
        {
            title: '失败原因',
            dataIndex: 'reason',
            width: 200,
        },
    ];
    useEffect(()=>{
        const authorization = localDb.getjwtToken(`jwtToken`) || '';
        setIsLogin(!!authorization)
    },[])

    const beforeUpload = (file:any) => {
        setLoading(true);
        const dataListTem:TableData[] = [...dataList];
        const fileName = file?.name;
        const resultJson:TableData = {
            name:fileName,
        }
        uploadRuleFile(file).then((data)=>{
            resultJson.result = 1;
            dataListTem.push(resultJson);
            setDataList(dataListTem);
            setLoading(false);
        }).catch((err)=>{
            if (err.code === 401) {
                // 未登录
                setIsLogin(false);
                localDb.clear('jwtToken');
            }else{
                resultJson.result = 0;
                resultJson.reason = err.message;
                dataListTem.push(resultJson);
                setDataList(dataListTem);
            }
            setLoading(false);
        })
        return true;
    };
    // 登录成功
    const onLogin = () => {
        setIsLogin(true);
    }
    return (
        <>
            {
                !isLogin ? (
                    <LoginWeb onLogin={onLogin} />
                ) : (
                    <>
                        <div>
                            <Dragger
                                name="file"
                                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                disabled={loading}
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">点击选择或者拖拽文件到上传区域</p>
                                <p className="ant-upload-hint">支持单文件上传</p>
                            </Dragger>
                            {dataList.length > 0 && (
                                <div className={styles.dataList} style={{marginTop:30}}>
                                    <Table rowKey={(record) => record.name} dataSource={dataList} columns={columns} bordered pagination={false} />
                                </div>
                            )}
                        </div>
                    </>

                )
            }
        </>
    );
};

export default Index;
