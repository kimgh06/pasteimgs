import { styled } from "styled-components";

export const Chat = styled.div`
  .chatlist{
    height: 300px;
    width: 500px;
    overflow-y: scroll;
    p{
      word-wrap:break-word;
    }
  }
  input{
    width: 400px;
  }
  img{
    object-fit: scale-down;
    width: 200px;
  }
`