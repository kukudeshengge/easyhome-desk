import { CreateMiniApp } from './fetch';
const opsRequest = CreateMiniApp();

export interface ICityStation {
    cityName: string;
    cityStationId: string;
}

type ICityStationData = ICityStation[];

// 城市站列表
export const getCityStationList = () => {
    return opsRequest.post<ICityStationData>('/miniApp/cityPage/cityStationDropDown', {});
};

export interface IMarket {
    marketId: string;
    marketName: string;
}

interface IMarketData {
    list: IMarket[];
    total: number;
}

interface IMarketQueryParams {
    cityStationId: string;
    page: number;
    pageSize: number;
}

// 卖场列表
export const getMarketList = (params: IMarketQueryParams) => {
    return opsRequest.post<IMarketData>('/miniApp/cityPage/marketList', params);
};
