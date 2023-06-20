import { css } from '@emotion/react'

export const titleStyle = (style: "title" | "subtitle") => css`
  color: #000;
  font-family: 'Noto Sans JP', sans-serif;
  font-size: ${style === "title" ? "26px" : "20px"};
  text-align: left;
`