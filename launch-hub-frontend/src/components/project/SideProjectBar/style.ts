import { colors } from "@/styles/colors"
import { css } from "@emotion/react"

export const sideProjectBarStyle = css`
  width: 220px;
  background-color: ${colors.sideBar};
  padding: 6px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: scroll;
`

export const labelStyle = css`
  font-size: 16px;
  color: #fff;
`