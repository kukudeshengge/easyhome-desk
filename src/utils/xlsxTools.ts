import * as XLSX from 'xlsx';

// 格式化步数excel
/**
 *
 * @param file
 * @returns {XXX:{steps:[{date:"20230901",step:24590}]}}
 */
export const formatDingTalkSteps = (file: any) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject({ message: '获取步数数据失败' });
        }
        const reader = new FileReader();
        reader.onload = (event: any) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            let obj: any = {};
            const header:any = jsonData[1]||[]
            if (header[5] != "步数") reject({ message: "上传的步数信息表不正确.正确表头为['姓名', '日期', '部门', '千卡', '是否达标', '步数']" });
            jsonData.forEach((element: any, index: number) => {
                if (index < 2) return;
                if (!element[0]) return console.log('[ 没有用户名 ] >', element);
                if (!element[1]) return console.log('[ 没有日期 ] >', element);
                if (!element[5]) return console.log('[ 没有步数信息 ] >', element);
                const username = String(element[0]).trim();
                if (!obj[username]) obj[username] = {};
                let person = obj[username];
                if (!person.steps) person.steps = [];
                person.steps.push({ date: element[1], step_count: element[5] });
            });
            resolve(obj);
        };
        reader.readAsArrayBuffer(file);
    });
};

export const formatBaseInfo = (file: any) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject({ message: '获取个人信息数据失败' });
        }
        const reader = new FileReader();
        reader.onload = (event: any) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            let obj: any = {};
            const header:any = jsonData[0]||[]
            if (header[2] != "员工UserID") reject({ message: "上传的个人信息表不正确.正确表头为['工号','姓名','员工UserID']" });
            jsonData.forEach((element: any, index: number) => {
                if (index < 1) return;
                if (!element[0]) return console.log('[ 没有工号 ] >', element);
                if (!element[1]) return console.log('[ 没有用户名 ] >', element);
                if (!element[2]) return console.log('[ 没有用户ID ] >', element);
                const username = String(element[1]).trim();
                if (!obj[username]) obj[username] = {};
                let person = obj[username];
                person.userId = element[2];
                person.workerId = element[2];
            });
            resolve(obj);
        };
        reader.readAsArrayBuffer(file);
    });
};
