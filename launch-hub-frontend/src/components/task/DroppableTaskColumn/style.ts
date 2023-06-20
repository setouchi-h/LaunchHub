import { colors } from "@/styles/colors";
import { css } from "@emotion/react";

export const colmnStyle = css`
  min-height: 225px;
  height: 100%;
  margin: 10px 10px;
  width: 300px;
  padding: 10px;
  background-color: ${colors.card};
  display: flex;
  flex-direction: column;
`

export const titleStyle = css`
  font-size: 16px;
`

export const draggableAreaStyle = css`
  flex-grow: 1;
  width: 100%;
`
