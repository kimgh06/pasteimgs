import { styled } from "styled-components";

export const Chat = styled.div`
  button{
    border: 1px solid #d9d9d9;
    background-color: white;
    padding: 5px 15px;
    color: blue;
    font-size: 15px;
    border-radius: 10px;
    cursor: pointer;
    &:disabled{
      border: 1px solid #f6f6f6;
      color: lightblue;
    }
  }
`