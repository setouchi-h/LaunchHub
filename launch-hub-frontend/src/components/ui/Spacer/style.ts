import { css } from '@emotion/react'

export const verticalSpacerStyle = (size: number) => css`
  display: block;
  height: ${size}px;
`
export const horizontalSpacerStyle = (size: number) => css`
  display: inline-block;
  width: ${size}px;
`