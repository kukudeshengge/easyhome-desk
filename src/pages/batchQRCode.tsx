import { Stack, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { saveImage } from '../utils/electronAPI';
import styles from '../styles/batchQrCode.module.scss';

const BatchQRCode = () => {
    const [phones, setPhones] = useState<string>('');
    const [showChild, setShowChild] = useState(false);

    useEffect(() => {
        setShowChild(true);
    }, []);

    const handlePhoneLogin = () => {
        // savePictureAs('', '');
        if (!phones) return;
        let arr = phones.replaceAll(' ', ',').replaceAll('\n', ',').replaceAll('\r\n', ',').split(',');
        let imgArr: { fileUrl: string; fileName: string }[] = [];
        const path = 'guide/pages/customLogin/index';
        let topicUrl = 'https://topic.jrdaimao.com'; // : 'https://topicdev3.jrdaimao.com';
        arr.forEach((v) => {
            if (v) {
                let qrCodeUrl = `${topicUrl}/page/qrcode/wxapp?scene=${phones}&page=${path}`;
                imgArr.push({
                    fileUrl: qrCodeUrl,
                    fileName: v,
                });
            }
        });

        const param = {
            folderName: Date.now(), //文件夹名称
            imgArr: imgArr,
            fileType: 'jpeg',
        };
        saveImage(param);
    };

    if (!showChild) {
        return null;
    }

    return (
        <div id="batchQRCode">
            <h1>批量生成二维码</h1>
            <Stack spacing={2} alignItems="center">
                <TextField
                    className={styles.content}
                    variant="outlined"
                    label="请输入已注册洞窝手机号码,请使用逗号空格分隔,或从Excel复制"
                    value={phones}
                    multiline
                    rows={10}
                    onChange={(e) => {
                        setPhones(e.target.value);
                    }}
                />
                <Button variant="contained" onClick={handlePhoneLogin} endIcon={<FileDownloadIcon />}>
                    一键下载小程序码
                </Button>
            </Stack>
        </div>
    );
};
export default BatchQRCode;
