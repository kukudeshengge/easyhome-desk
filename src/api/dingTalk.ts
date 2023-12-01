import { CreateOapi } from './fetch';

const Request = CreateOapi();

const config = {
    appkey: 'dingqxc8i3cjaelbs2ga',
    appsecret: 'GNEpXzUivNW1NkpL1f9GnELlQD9iQTd6fnwfh7MZGBZioQHpCz9aCuUtxE6vu93h',
};
// 获取token
export function getToken() {
    return Request.get(`/gettoken?appkey=${config.appkey}&appsecret=${config.appsecret}`);
}
// 发送通知
export function postSend_v2(access_token: string, data: any) {
    return Request.post(`/topapi/message/corpconversation/asyncsend_v2?access_token=${access_token}`, data);
}
