import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import SendingImgs from './sendingimgs/index';
import Chat from './chat';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path='/sendingimgs' element={<SendingImgs />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  </>
);
