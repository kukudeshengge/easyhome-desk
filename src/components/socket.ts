import { io, Socket } from 'socket.io-client';

class ScoketModel {
    constructor() {
        this._init();
        this._onEvent();
    }
    socket: Socket | null = null;
    _init() {
        if (!global.window) return;
        if (this.socket) return;
        const socket = io(process.env.wss, {
            path: '/api_socket',
            withCredentials: false,
        });

        this.socket = socket;
    }
    _onEvent() {
        if (!this.socket) return;
        const socket = this.socket;
        // socket.on('client_count', function (count) {
        //     console.log('消息2', count);
        // });
    }
    emit(key: string, ...args: any[]) {
        if (!this.socket) return;
        this.socket.emit(key, ...args);
    }
    on(key: string, fn: any) {
        if (!this.socket) return;
        this.socket.on(key, fn);
    }
    off(key: string, fn: any) {
        if (!this.socket) return;
        this.socket.off(key, fn);
    }
    once(key: string, fn: any) {
        if (!this.socket) return;
        this.socket.once(key, fn);
    }
}

export default new ScoketModel();
