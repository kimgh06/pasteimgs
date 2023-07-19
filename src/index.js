import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SendingImgs from './sendingimgs/index';
import Chat from './chat';
import Room from './chat/room';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<>루트<a href='/chat'>채팅방 ㄱㄱ</a></>} />
        <Route path='/sendingimgs' element={<SendingImgs />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/chat/:id' element={<Room />} />
      </Routes>
    </BrowserRouter>
  </>
);
