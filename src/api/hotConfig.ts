import { acUrl } from './config';
import { CreateTopicFetch, CreateAConfigFetch } from './fetch';
import requestAc from './requestAc';

const topicRequest = CreateTopicFetch();
const acRquest = CreateAConfigFetch();
interface iShortKeyParam {
    type: 0 | 1;
    data: any;
}

/**
 * 生成短链
 * type 1 json
 * data
 * @param param
 * @returns
 */
export const getShortKey = (param: iShortKeyParam, url = '') => {
    return topicRequest.post<{ key: string }>(`${url}/api_link/add`, param);
};

/**
 * 自定义页面
 * type  0 url 1 json
 * text
 * @param param
 * @returns
 */
export const auotPageList = (basUrl: string) => {
    return requestAc.get(basUrl + '/api_config/mpwx', {});
};

interface ISortUrlParam {
    type: 0 | 1;
    text: string;
}
export const getSortUrl = (param: ISortUrlParam): Promise<any> => {
    return acRquest.post('/api_sort/add', param);
};
