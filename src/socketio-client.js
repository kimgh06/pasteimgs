import { io } from "socket.io-client";
const url = "http://localhost:8888";

export let socket = io(`${url}`, { path: 'http://localhost:3002' });
export const initSocketConnection = e => {
  if (socket) return;
  socket.connect();
}

export const sendSocketMessage = (cmd, body = null) => {
  if (socket === null && socket.connected === false) {
    initSocketConnection();
  }
  socket.emit("message", {
    message: 'hello'
  });
}

let cbMap = new Map();
export const socketInfoReceived = (cbType, cb) => {
  cbMap.set(cbType, cb);
  if (socket.hasListeners('message')) {
    socket.off('message');
  }
  socket.on('message', r => {
    for (let [, cbValue] of cbMap) {
      cbValue(null, r);
    }
  });
}

export const disconnectSocket = () => {
  if (socket == null || socket.connected === false) {
    return;
  }
  socket.disconnect();
  socket = undefined;
};