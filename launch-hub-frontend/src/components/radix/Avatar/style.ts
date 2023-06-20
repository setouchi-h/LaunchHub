import { css } from '@emotion/react'

export const rootStyle = (size: "normal" | "sideTab") => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  overflow: hidden;
  user-select: none;
  width: ${size === "normal" ? "60px" : "34px"};
  height: ${size === "normal" ? "60px" : "34px"};
  border-radius: 100%;
  background-color: #fff;
`

export const imageStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
`

export const fallbackStyle = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
  font-weight: 500;
  background-color: #f6f2fc;
`