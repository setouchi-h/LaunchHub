import { colors } from "@/styles/colors"
import { pageMaxWidth } from "@/styles/constants"
import { css } from "@emotion/react"

export const projectSearchContainerStyle = css`
  max-width: ${pageMaxWidth};
  margin: 0 auto;
`

export const searchBarContainerStyle = css`
  display: flex;
  justify-content: center;
`

export const inputContainerStyle = css`
  flex-grow: 1;
  margin: auto 0;
`

export const inputStyle = css`
  min-width: 300px;
  width: 100%;
  height: 30px;
  padding: 6px;
  font-size: 16px;
  border: solid 1px ${colors.inputBorder};
  border-radius: 4px;
  background-color: ${colors.input};
   &:focus {
    border-color: ${colors.primary};
  }
`