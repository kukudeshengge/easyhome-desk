import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { useState } from 'react';
import styles from '../styles/Home.module.scss';
import AddIcon from '@mui/icons-material/Add';
import { saveImage } from '../utils/electronAPI';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { CreateSortLink } from '../api/sortlink';

const BaseUrl = 'https://topic.jrdaimao.com';

export default function CreateWxappH5() {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [open, setOpen] = useState(false);
    const [key, setKey] = useState('');

    function createTitle(val: string) {
        setUrl(val);
        console.log(val);
        const list1 = val.split('?');
        if (list1.length < 2) return;
        const params = list1[1].split('&');
        params.forEach((item) => {
            const list2 = item.split('=');
            if (list2[0] === 'activeName' && !title) {
                setTitle(list2[1]);
                console.log(list2[1]);
            }
        });
    }
    function createLink() {
        const param = {
            folderName: Date.now(), //文件夹名称
            imgArr: [
                {
                    fileUrl: `${BaseUrl}/page/qrcode/wxapp2?page=wish/pages/webView/index&title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
                    fileName: title,
                },
            ],
            fileType: 'jpeg',
        };
        saveImage(param);
    }
    async function createsortLink() {
        try {
            const data: any = await CreateSortLink({
                type: 0,
                text: `${BaseUrl}/page/jump/wxapp2?path=wish/pages/webView/index&title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            });
            console.log(data);
            setKey(data.key);
            setOpen(true);
        } catch (error) {
            console.log(error);
        }
    }
    function handleClose() {
        setOpen(false);
    }
    return (
        <div className={styles.container}>
            <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount1">自定义标题</InputLabel>
                <OutlinedInput
                    onChange={(e) => setTitle(e.target.value)}
                    id="outlined-adornment-amount1"
                    value={title}
                    startAdornment={<InputAdornment position="start">标题</InputAdornment>}
                    label="自定义标题"
                />
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }}>
                <InputLabel htmlFor="outlined-adornment-amount">落地页链接</InputLabel>
                <OutlinedInput
                    onChange={(e) => createTitle(e.target.value)}
                    id="outlined-adornment-amount"
                    startAdornment={<InputAdornment position="start">URL</InputAdornment>}
                    label="落地页链接"
                />
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }}>
                <Button startIcon={<AddIcon />} variant="contained" onClick={createLink}>
                    下载小程序二维码
                </Button>
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }}>
                <Button startIcon={<AddIcon />} variant="contained" onClick={createsortLink}>
                    生成跳转小程序的短链
                </Button>
            </FormControl>
            <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogContent>
                    <div>原链接：{url}</div>
                    <div>生成的链接: https://rfrl.cn/{key}</div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} autoFocus>
                        关闭
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
