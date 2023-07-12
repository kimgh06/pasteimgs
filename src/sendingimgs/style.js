import { styled } from "styled-components";

export const SendingImgs = styled.div`
  input[type="file"]{ 
    width: 75px;
    cursor: pointer;
    /* height: 1px;  */
  }
  img{
    object-fit: scale-down;
    max-width: 500px;
  }
`