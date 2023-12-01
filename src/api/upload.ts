// 渠道推广数据查询
import { CreateAcFetch } from './fetch';
const acRequest = CreateAcFetch();

interface IParams {
    w?: number;
    h?: number;
    t?: 'png' | 'jpg' | 'webp';
}
// 上传图片
export function PostUploadImage(file: any, params: IParams) {
    const form = new FormData();
    form.append('file', file);
    return acRequest.post_heads<IUploadResult>('/api_image/upload', form, params, { 'Content-Type': 'multipart/form-data' });
}
interface IUploadResult {
    downloadUrl: string;
    height: number;
    name: string;
    url: string;
    width: number;
}
