import { colors } from "@/styles/colors"
import { css } from "@emotion/react"

export const buttonStyle = ({ isEnabled, style }: { isEnabled: boolean, style: "contained" | "outlined" }) => css`
  min-width: 95px;
  min-height: 42px;
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  border-radius: 6px;
  cursor: ${isEnabled ? "pointer" : "default"};
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 12px;
  &:hover {
    cursor: ${isEnabled ? "pointer" : "default"};
  }
  transition: 0.1s ease-in-out;
  ${style === "contained" && containedButtonStyle(isEnabled)}
  ${style === "outlined" && outlinedButtonStyle(isEnabled)}
`

const containedButtonStyle = (isEnabled: boolean) => css`
  background-color: ${isEnabled ? colors.primary : colors.primaryDisabled};
  color: #fff;
  border: solid 1px transparent;
  &:hover {
    background-color: ${isEnabled ? colors.primaryElevated : colors.primaryDisabled};
    box-shadow: ${isEnabled ? `0 6px 9px 0 ${colors.primaryShadow}` : "none"}
  }
`

const outlinedButtonStyle = (isEnabled: boolean) => css`
  background-color: transparent;
  color: ${isEnabled ? colors.primary : colors.primaryDisabled};
  border: solid 1px ${colors.primary};
  &:hover {
    background-color: ${isEnabled ? colors.primarySelected : ""};
  }
`