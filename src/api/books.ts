// 图书角
import { CreateBookApp } from './fetch';
const opsRequest = CreateBookApp();

interface IListData {
    count: number;
    rows: IListRow[];
}

export interface IListRow {
    author: string;
    bid: string;
    cls: string;
    img: string;
    nickname: string;
    operator: string;
    reason: string;
    title: string;
    updatedAt: string;
}

// 列表
export const getBooksApi = (params: any) => {
    return opsRequest.get<IListData>('/list', params);
};
