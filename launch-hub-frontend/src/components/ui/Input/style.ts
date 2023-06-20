import { colors } from '@/styles/colors'
import { css } from '@emotion/react'

export const inputTextStyle = css`
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