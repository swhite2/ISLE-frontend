import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

export interface dataObject {
  x: number,
  y: number,
  hand: string,
  hex?: any,
  currentGrid: number
}

enum messageType {
  lightbarConfiguration = 'lightbarConfiguration',
  requestForStreaming = 'requestForStreaming',
  enableLightbars = 'enableLightbars',
  disableLightbars = 'disableLightbars'
}

export interface lightBarsConfiguration {
  type: messageType
  num_grids: number,
  hex_size: number,
  orientation: string,
  grid_offset: number,
  grid_width: number,
  grid_height: number
}


@Injectable({
  providedIn: 'root'
})
export class LeapDataService {

  dataWebSocket: WebSocketSubject<any> = webSocket(`ws://192.168.1.10:3050`);
  //ws://192.168.0.108.xip.io:3050
  messages: {}[] = [];

  constructor() { }

  getData(): Observable<dataObject> {
    return this.dataWebSocket.asObservable();
  }

  closeConnection(): void {
    this.dataWebSocket.complete();
  }

  add(message: dataObject) {
    console.log(message);
    //const parsedMessage = JSON.parse(message);
    this.messages.push({x: message.x , y: message.y, hand: message.hand});
  }

  clear() {
    this.messages = [];
  }

  sendConfigurationMessage(message: lightBarsConfiguration) {
    if (!this.dataWebSocket.closed) {
      message.type = messageType.lightbarConfiguration;
      // i left it here
      this.dataWebSocket.next(message);
    }
  }

  sendRequestForStreamingMessage(): Observable<dataObject> {
    if (!this.dataWebSocket.closed) {
      this.dataWebSocket.next({type: messageType.requestForStreaming});
      return this.dataWebSocket.asObservable();
    } else {
      console.log('WebSocket has already been completed');
    }
  }

  enableLightbars() {
    if(!this.dataWebSocket.closed) {
      this.dataWebSocket.next({type: messageType.enableLightbars});
    } else {
      console.error(new Date() + ' websocket closed');
    }
  }

  disableLightbars() {
    if(!this.dataWebSocket.closed) {
      this.dataWebSocket.next({type: messageType.disableLightbars});
    } else {
      console.error(new Date() + ' websocket closed');
    }
  }
}
