import { colors } from "@/styles/colors";
import { css } from "@emotion/react";

export const assignmentsStyle = css`
  display: flex;
  justify-content: center;
`

export const assignmentsContainerStyle = css`
  min-width: 400px;
  max-width: 600px;
  display: inline;
  margin: 0 30px;
`

export const tableStyle = css`
  background-color: ${colors.card};
  border-radius: 6px;
  padding: 5px;
  min-height: 160px;
`