import { colors } from "@/styles/colors"
import { css } from "@emotion/react"

export const projectOverviewStyle = css`
  max-width: 800px;
  margin: 0 auto;
`

export const informationToShareStyle = css`
  background-color: ${colors.warning};
  border-radius: 6px;
  padding: 5px;
`

export const linkStyle = css`
  color: ${colors.primary};
  cursor: pointer;
  text-decoration: underline;
`

export const textWithBreakStyle = css`
  white-space: pre-wrap;
`