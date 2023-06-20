import { colors } from '@/styles/colors'
import { css } from '@emotion/react'

export const textareaStyle = css`
  min-width: 300px;
  width: 100%;
  min-height: 100px;
  padding: 6px;
  font-size: 16px;
  border: solid 1px ${colors.inputBorder};
  border-radius: 4px;
  background-color: ${colors.input};
  font-family: Noto Sans JP;
  font-weight: 400;
  resize: vertical;
  &:focus {
    border-color: ${colors.primary};
  }
`