import axios from 'axios';

class RError extends Error {
    constructor(msg: string, code = 0) {
        super(msg);
        this.code = code;
    }
    code = 0;
}

const service = axios.create({ timeout: 10000 });

async function request(url: string, method: any, params: any, data?: any) {
    try {
        let res = await service({
            method,
            url,
            data,
            params,
        });
        const body = res.data;
        if (body.code !== 1) {
            throw new RError(body.message || '请求失败', body.code);
        }
        return body.data;
    } catch (error) {
        throw new RError('网络连接失败');
    }
}

const RequestAc = {
    get(url: string, params: any) {
        return request(url, 'GET', params);
    },
    post(url: string, data: any) {
        return request(url, 'POST', null, data);
    },
};
export default RequestAc;
