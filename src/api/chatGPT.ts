import CreateFetch, { CreateGPTApp } from './fetch';

const Request = CreateFetch('');
const chatRequest = CreateGPTApp();

export const sendChatGLM6B = (prompt: string) => {
    return Request.get('http://10.230.221.249:81/ChatGLM6B', {
        prompt,
        act: 1,
    });
};

interface IGTPResponse {
    finish_reason: string;
    index: number;
    message: {
        content: string;
        role: string;
    };
    //stream模式
    delta: {
        content: string;
    };
}

export const sendChatGPT = async (message: string): Promise<IGTPResponse[]> => {
    const res = await chatRequest.post(
        '/v1/chat/completions',
        {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
            stream: true,
        },
        {
            transformResponse: function (data, headers) {
                console.log('单次', data);
            },
            responseType: 'stream',
        }
    );
    // console.log(res);

    return [];
};

interface IStreamJSON {
    choices: IGTPResponse[];
    id: string;
}
export const sendChatGPTStream = async (message: string, fn: (id: string, content: string) => void, done?: () => void) => {
    const res = await fetch('https://openai.9l9.cc/v1/chat/completions', {
        headers: {
            authorization: 'Bearer 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',
            'content-type': 'application/json; charset=utf-8',
        },
        method: 'POST',
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: message }],
            stream: true,
        }),
        keepalive: true,
    });
    if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const data = await reader?.read();
            if (data?.done) {
                console.log('结束');
                break;
            } else {
                try {
                    const text = decoder.decode(data?.value);
                    const msgs = text.split('\n');
                    let id = '';
                    let content = '';
                    for (const line of msgs) {
                        const json = line.substring(6).trim();
                        if (!json) continue;
                        if (json === '[DONE]') {
                            console.log('通知结束');
                            done && done();
                            break;
                        }
                        const result: IStreamJSON = JSON.parse(json);
                        id = result.id;
                        result.choices.forEach((item) => (content += item.delta.content || ''));
                    }
                    fn && content && fn(id, content);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    } else {
        throw new Error('连接失败');
    }
};
