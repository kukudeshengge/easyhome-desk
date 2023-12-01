import { CreateAppWebApp } from './fetch';
const appRequest = CreateAppWebApp();
export const loginRegister = (phone: string) => {
    // return appRequest.post('/member/loginRegister', { phone });
    return appRequest.post('/member/memberInfo', {}, { phone });
};
