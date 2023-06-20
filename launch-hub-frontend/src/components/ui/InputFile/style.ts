import { colors } from '@/styles/colors'
import { css } from '@emotion/react'

export const inputFileStyle = css`
  padding: 0 12px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  border: solid 1px #0080ff;
  color: ${colors.primary};
  background-color: #fff;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;

  &:hover {
    transition: all 0.2s;
    background-color: ${colors.primarySelected};
  }

`

export const inputFileLabelContainerStyle = css`
  padding: 16px 0;
`

export const inputFileLabelStyle = css`
  position: relative;

  padding: 6px 12px;
  font-size: 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: solid 1px #0080ff;
  color: ${colors.primary};
  background-color: #fff;

  &:hover {
    transition: all 0.2s;
    background-color: ${colors.primarySelected};
  }
`

export const fileNameStyle = css`
  padding: 8px 16px;
`