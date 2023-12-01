// 导购上传
import { CreateOpsWebApp } from './fetch';
const opsRequest = CreateOpsWebApp();

// 激励规则上传
export function uploadRuleFile(file: any, params={}) {
    const form = new FormData();
    form.append('file', file);
    return opsRequest.post_heads('/guideOrder/earnMoney/stimulateRuleImport', form, params, { 'Content-Type': 'multipart/form-data' });
}

// 上传激励明细
export function uploadDetailFile(file: any, params={}) {
    const form = new FormData();
    form.append('file', file);
    return opsRequest.post_heads('/guider/uploadGuiderExcitationRecords', form, params, { 'Content-Type': 'multipart/form-data' });
}
