declare namespace NodeJS {
    interface ProcessEnv {
        /**
         * websocket的连接地址
         */
        wss: string;
    }
}

declare module 'react-markdown';
declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/dist/cjs/styles/prism';
