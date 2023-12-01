import { CreateAcFetch } from './fetch';
const request = CreateAcFetch();

interface ILinkData {
    type: number;
    text: string;
}
export async function CreateSortLink(data: ILinkData, preac="") {
    return request.post<{ key: string }>(`${preac}/api_sort/add`, data);
}
