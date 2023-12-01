import { CreateAppWebApp, CreateMiniApp } from './fetch';
const appRequest = CreateMiniApp();

export function queryGoodsDetails(param: { goodId: string }) {
    return appRequest.post('/app/mini/goodsPage/queryGoodsDetails', param);
}
