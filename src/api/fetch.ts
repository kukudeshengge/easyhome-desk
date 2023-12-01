import HttpRequest, { QF } from '@dm/http_request';
import { localDb } from '../utils/localDb';
import { baseDomain, topicUrl, AcUrl } from './config';
import axios from 'axios';

class MyError extends Error {
    constructor(msg: string, code: number) {
        super(msg);
        this.code = code;
    }
    code: number;
}

export default function CreateFetch(prePath: string) {
    const RFetch = new QF(prePath);
    RFetch.afterFetch = async function (data) {
        if (data?.code == '401') {
            localDb.clear('jwtToken');
            localDb.clear('userInfo');
        }
        //跳转登录
        if (data && (data.code === 302 || data.code === '302' || data.code === 303 || data.code === '303')) {
            throw new MyError(data.message, data.code);
        }
    };
    // 重置head参数
    RFetch.setHeads = async function (fromHead: any) {
        const authorization = localDb.getjwtToken(`jwtToken`) || '';
        return Object.assign(
            {
                authorization: authorization,
                platform: 'operation',
            },
            fromHead
        );
    };
    return RFetch;
}

export const CreateOpsWebApp = () => CreateFetch(baseDomain + '/easyhome-ops-web-application');

export const CreateAppWebApp = () => CreateFetch(baseDomain + '/easyhome-app-application');

export const CreateMiniApp = () => CreateFetch(baseDomain + '/easyhome-mini-application');

export const CreateTopicFetch = () => CreateFetch(topicUrl);
export const CreateAConfigFetch = () => {
    const RFetch = new QF(AcUrl);
    RFetch.afterFetch = async function (data) {};
    RFetch.code = 1;
    return RFetch;
};

export function CreateMJFetch() {
    const RFetch = new QF('http://8.222.253.142:1260/dw-smartai-center');
    RFetch.returnBody = true;
    RFetch.code = 1;
    RFetch.timeout = 30000;
    RFetch._checkCode = function (data) {};
    return RFetch;
}
export const CreateMJApp = () => CreateMJFetch();

export function CreateAcFetch() {
    const RFetch = new QF('https://ac.jrdaimao.com');
    RFetch.code = 1;
    return RFetch;
}

export const CreateBookApp = () => {
    const RFetch = new QF('https://recorner.jrdaimao.com/api');
    RFetch.code = 1;
    return RFetch;
};
export const CreateOapi = () => {
    const RFetch = new QF('https://oapi.dingtalk.com');
    RFetch._checkCode = () => {};
    RFetch.returnBody = true;
    return RFetch;
};

export const CreateGPTApp = () => {
    const server = axios.create({});

    server.interceptors.request.use(function (config) {
        config.baseURL = 'https://openai.9l9.cc';
        config.headers = { authorization: 'Bearer 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' };
        return config;
    });

    return server;
};
