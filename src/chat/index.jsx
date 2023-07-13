import { useEffect, useState } from "react"
import * as S from "./style";
import axios from "axios";

export default function Chat(e) {
  const [toput, setToput] = useState('');
  const [able, setAble] = useState(null);
  const [logininfo, setLogininfo] = useState({ nickname: '', pw: '' });
  const [signupinfo, setSignupinfo] = useState({ nickname: '', pw: '' });
  const [accesstokenAvailable, setAccessTokenAvailable] = useState(false);
  const [refreshtokenAvailable, setRefreshTokenAvailable] = useState(false);
  const [areheretokens, setAreheretokens] = useState(false);
  const [roomid2make, setRoomid2make] = useState('');
  const url = "http://localhost:8888";
  useEffect(e => {
    document.title = 'chat';
    axios.defaults.withCredentials = true;
  }, []);
  return <S.Chat>
    <form className="checkId" onSubmit={async e => {
      e.preventDefault();
      await axios.get(`${url}/chat/checkid?id=${toput}`)
        .then(e => {
          setAble(e.data);
        })
        .catch(e => {
          console.log(e);
        })
    }}>
      <input onChange={e => setToput(e.target.value)} placeholder="확인할 id" />
      {able === null ? '' : able === true ? "사용할 수 없는 아이디 입니다." : "사용할 수 있는 아이디 입니다."}
    </form>

    <form className="signup" onSubmit={async e => {
      e.preventDefault();
      await axios.post(`${url}/chat/signup`, { nickname: signupinfo.nickname, pw: signupinfo.pw })
        .then(e => {
          console.log(e.data);
        })
        .catch(e => console.log(e));
    }}>
      <input onChange={e => setSignupinfo(a => ({ ...a, nickname: e.target.value }))} placeholder="회원가입 닉네임" />
      <input onChange={e => setSignupinfo(a => ({ ...a, pw: e.target.value }))} placeholder="회원가입 비밀번호" />
      <button>회원가입</button>
    </form>

    <form className="login" onSubmit={async e => {
      e.preventDefault();
      setAreheretokens(false);
      await axios.post(`${url}/chat/deltokens`, { nickname: logininfo.nickname })
        .then(async e => {
          if (e.data.affectedRows >= 0) {
            await axios.post(`${url}/chat/gettokens`, {
              nickname: logininfo.nickname,
              pw: logininfo.pw
            }).then(e => {
              const d = e.data;
              if (d?.message === "not found") {
                alert("아이디 혹은 비밀번호가 일치하지 않습니다.");
              } else {
                axios.defaults.headers.common['Authorization'] = `Bearer ${d.accessToken}`;
                localStorage.setItem('logininfo', JSON.stringify({
                  id: d.id,
                  nickname: logininfo.nickname,
                  refreshToken: d.refreshToken,
                  accessExpireTime: d.accessExpireTime
                }));
                setAccessTokenAvailable(false);
                setRefreshTokenAvailable(false);
                setAreheretokens(true);
              }
            }).catch(e => {
              console.log(e);
            });
          }
        })
        .catch(e => console.log(e));
    }}>
      <input onChange={e => setLogininfo(a => ({ ...a, nickname: e.target.value }))} placeholder="로그인 닉네임" />
      <input onChange={e => setLogininfo(a => ({ ...a, pw: e.target.value }))} placeholder="로그인 비밀번호" />
      <button>토큰 발급</button>
    </form>

    <form className="checkAccessToken" onSubmit={async e => {
      e.preventDefault();
      const Tokens = JSON.parse(localStorage.getItem("logininfo"));
      await axios.post(`${url}/chat/checkaccesstoken`, { id: Tokens.id })
        .then(e => {
          setAccessTokenAvailable(e.data);
        })
    }}>
      <button disabled={!areheretokens}>checkAccessTokens</button>
      <p>{accesstokenAvailable ? "사용가능한 엑세스토큰입니다." : "사용 불가능한 엑세스토큰"}</p>
    </form>

    <form className="checkRefreshToken" onSubmit={async e => {
      e.preventDefault();
      const Tokens = JSON.parse(localStorage.getItem("logininfo"));
      await axios.post(`${url}/chat/checkrefreshtoken`, { id: Tokens.id, refreshToken: Tokens.refreshToken })
        .then(e => {
          setRefreshTokenAvailable(e.data);
        })
    }}>
      <button disabled={!areheretokens}>checkRefreshTokens</button>
      <p>{refreshtokenAvailable ? "사용가능한 리프레시토큰입니다." : "사용 불가능한 리프레시토큰"}</p>
    </form>

    <form className="makeroom" onSubmit={async e => {
      e.preventDefault();
      const Tokens = JSON.parse(localStorage.getItem("logininfo"));
      await axios.post(`${url}/chat/newroom`, { id: Tokens.id, roomid2make: roomid2make })
        .then(e => {
          const data = e.data;
          if (data?.message) {
            alert(data.message);
          } else if (data === 'Created') {
            alert("생성되었습니다.");
          }
        })
    }}>
      <input onChange={e => setRoomid2make(e.target.value)} placeholder="newroomname" />
      <button>새로운 방 추가</button>
    </form>

    <form>

    </form>
  </S.Chat>
}