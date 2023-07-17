import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
const url = "http://localhost:8888";

export default function Room() {
  let { id } = useParams();
  const socket = io.connect(url);
  function send_message(message) {
    socket.emit('message', {
      message: message
    });
  }
  const [chatRoomName, setChatRoomName] = useState('');
  async function getRoomInfomation() {
    await axios.get(`${url}/chat/getroominfo?id=${id}`)
      .then(e => {
        setChatRoomName(e.data);
        document.title = `${e.data}`
      });
  }
  useEffect(e => {
    getRoomInfomation();
    //eslint-disable-next-line
  }, []);
  useEffect(e => {
    socket.on("received", data => {
      console.log(data.message);
    })
  }, [socket]);
  return <div>
    <h1>{chatRoomName}</h1>
    <button onClick={e => send_message('hello')}>메시지 보내기</button>
  </div>;
}