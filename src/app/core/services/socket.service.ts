import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

const WS_URL = (window as any).__env?.API_WS || (location.protocol + '//' + location.hostname + ':5000');

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket && this.socket.connected) return;
    this.socket = io(WS_URL, { transports: ['websocket'], autoConnect: true });
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  on<T = any>(event: string): Observable<T> {
    return new Observable(observer => {
      if (!this.socket) this.connect();
      const handler = (payload: T) => observer.next(payload);
      this.socket!.on(event, handler);
      return () => { this.socket?.off(event, handler); };
    });
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }
}
