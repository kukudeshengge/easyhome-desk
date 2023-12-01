// 渠道推广数据查询
import { CreateOpsWebApp } from './fetch';
const opsRequest = CreateOpsWebApp();

// 登录
export const login = (params: any) => {
    return opsRequest.post('/user/accountLogin', params);
};

// 获取渠道数据
export const getChannelQuery = (params: any) => {
    return opsRequest.post('/operation/channelLevel/query', params);
};

// 多级渠道新增
export const addChannelLevel = (params: any) => {
    return opsRequest.post('/operation/channelLevel/add', params);
};

// 新增异业渠道
export const addChannel = (params: any) => {
    return opsRequest.post<any>('/operation/operChannel/addOperChannel', params);
};
