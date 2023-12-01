import React, { useEffect, useState } from 'react';
import styles from '../styles/miniPath.module.scss';
import { Select, Form, Row, Col, Input, message, InputNumber } from 'antd';
import { getCityStationList, getMarketList } from '../api/miniPath';
import copy from 'copy-to-clipboard';

const TextArea = Input.TextArea;

const pageTypeList = [
    {
        label: '卖场首页',
        value: '1',
        path: 'market/pages/market/index',
    },
    {
        label: '城市站首页',
        value: '2',
        path: 'pages/home/index',
    },
    {
        label: '商品详情页',
        value: '3',
        path: 'goods/pages/goodsDetail/index',
    },
    {
        label: '活动落地页',
        value: '4',
        path: 'wish/pages/webView/index',
    },
];

export default function MiniPath() {
    const [form] = Form.useForm();
    const [cityList, setCityList] = useState<any[]>([]); // 城市站列表
    const [pageType, setPageType] = useState('1'); // 选择的页面
    const [marketList, setMarketList] = useState([]); // 卖场列表
    // const

    // 设置默认值
    const initFormData = async () => {
        const cityStationId = localStorage.getItem('miniPath-cityStationId');
        const marketStr: string = localStorage.getItem('miniPath-market') || '{}';
        const marketObj = JSON.parse(marketStr);
        form.setFieldsValue({
            cityStationId,
            ...marketObj,
        });
        if (marketObj.cityId) {
            await queryMarketList(marketObj.cityId);
        }
        handlerGenerate();
    };

    useEffect(() => {
        queryCityList();
        // initFormData();
    }, []);

    // 查询城市站
    const queryCityList = async () => {
        try {
            const data = await getCityStationList();
            const cityData: any[] = data.map((item) => {
                return {
                    value: item.cityStationId,
                    label: item.cityName,
                };
            });
            setCityList(cityData);
        } catch (error) {
            console.log(error);
        }
    };

    // 页面变化
    const handlerChangeType = (type: string) => {
        setPageType(type);
        handlerGenerate();
    };

    // 复制
    const handlerCopy = () => {
        const path = form.getFieldValue('path');
        if (path) {
            copy(path);
            message.success('复制完成');
        } else {
            message.success('没有生成内容');
        }
    };

    // 生成
    const handlerGenerate = () => {
        const formData = form.getFieldsValue(true);
        const currentObj: any = pageTypeList.find((item) => item.value === formData.pageType);
        let search = '';
        if (formData.pageType === '1') {
            // 卖场首页
            if (formData.marketId) {
                search = `marketId=${formData.marketId}`;
                const obj = {
                    marketId: formData.marketId,
                    cityId: formData.cityId,
                };
                // localStorage.setItem('miniPath-market', JSON.stringify(obj));
            }
        } else if (formData.pageType === '2') {
            // 城市站首页
            if (formData.cityStationId) {
                const city: any = cityList.find((item: any) => item.value === formData.cityStationId);
                search = `csi=${formData.cityStationId}&cn=${encodeURIComponent(city.label)}`;
                // localStorage.setItem('miniPath-cityStationId', formData.cityStationId);
            }
        } else if (formData.pageType === '3') {
            // 商品详情页
            if (formData.skuId) {
                search = `goodsId=${formData.skuId}`;
            }
        } else if (formData.pageType === '4') {
            // 活动落地页
            if (formData.url) {
                if (!validataUrl(formData.url)) {
                    form.setFieldValue('path', '该网页不支持在小程序中打开');
                    return;
                }
                search = `url=${encodeURIComponent(formData.url)}`;
            }
        }

        const url = search ? `${currentObj.path}?${search}` : currentObj.path;
        form.setFieldValue('path', url);
    };

    // 校验url
    const validataUrl = (url: string) => {
        // if (!url.startsWith('https://')) {
        //     return false;
        // }

        // if (allowUrlList.some(allowUrl => url.startsWith(allowUrl))) {
        //     return true;
        // }

        if (/https:\/\/[\w|\W]*.jrdaimao.com[\w|\W]*/.test(url)) {
            return true;
        }

        return false;
    };

    // 修改城市 获取卖场列表
    const handlerChangeCity = (cityStationId: string) => {
        if (form.getFieldValue('marketId')) {
            form.setFieldValue('marketId', null);
        }
        form.setFieldValue('path', '');
        queryMarketList(cityStationId);
    };

    // 查询卖场列表
    const queryMarketList = async (cityStationId: string) => {
        try {
            const data: any = await getMarketList({ cityStationId, page: 1, pageSize: 500 });
            const list = data.list.map((item: any) => {
                return {
                    label: item.marketName,
                    value: item.marketId,
                };
            });
            setMarketList(list);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Form form={form} style={{ width: 500 }} labelCol={{ span: 5 }} initialValues={{ pageType: '1' }}>
            <Form.Item name="pageType" label="请选择页面">
                <Select
                    onChange={handlerChangeType}
                    options={pageTypeList}
                    showSearch
                    filterOption={(input, option: any) => {
                        const label = option.label as string;
                        return label?.includes(input);
                    }}
                />
            </Form.Item>
            {pageType === '1' && (
                <Form.Item label="请选择卖场">
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="cityId">
                                <Select
                                    placeholder="请选择城市"
                                    showSearch
                                    filterOption={(input, option: any) => {
                                        const label = option.label as string;
                                        return label?.includes(input);
                                    }}
                                    onChange={handlerChangeCity}
                                    options={cityList}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="marketId">
                                <Select placeholder="选择卖场" onChange={handlerGenerate} options={marketList}></Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form.Item>
            )}
            {pageType === '2' && (
                <Form.Item name="cityStationId" label="请选择城市站">
                    <Select
                        placeholder="请选择城市站"
                        showSearch
                        filterOption={(input, option: any) => {
                            const label = option.label as string;
                            return label?.includes(input);
                        }}
                        onChange={handlerGenerate}
                        options={cityList}
                    />
                </Form.Item>
            )}
            {pageType === '3' && (
                <Form.Item name="skuId" label="请输入商品id">
                    <Input style={{ width: '100%' }} placeholder="商品id" onChange={handlerGenerate} />
                </Form.Item>
            )}
            {pageType === '4' && (
                <Form.Item name="url" label="请输入URL">
                    <Input onChange={handlerGenerate} placeholder="请输入URL" />
                </Form.Item>
            )}
            <div className={styles.copy_con}>
                <Form.Item name="path" label="小程序路径">
                    <TextArea disabled autoSize={{ minRows: 3, maxRows: 3 }} />
                </Form.Item>
                <div onClick={handlerCopy} className={styles.copy_btn}>
                    复制
                </div>
            </div>
        </Form>
    );
}
