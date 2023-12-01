import axios from 'axios';
import { CreateMJApp } from './fetch';

const mjRequest = CreateMJApp();

export function describe(params: { base64: string }) {
    return mjRequest.post('/submit/describe', params);
}

// http://8.222.253.142:1260/dw-smartai-center/submit/imagine
export function imagine(prompt: string) {
    return mjRequest.post('/submit/imagine', { prompt });
}

// 获取图片base64
export function getImageBuffer(imageUrl: string) {
    return axios.get(imageUrl, {
        responseType: 'arraybuffer',
    });
    // .then((response) => {
    //     const base64 = Buffer.from(response.data, 'binary').toString('base64');
    //     console.log(base64);
    //     // 这里可以进一步处理base64字符串，比如将其存储到组件的state中
    // })
    // .catch((error) => {
    //     console.log(error);
    // });
}
// 查询任务
export function queryTask(taskId: string) {
    return mjRequest.get(`/task/${taskId}/fetch`);
}
