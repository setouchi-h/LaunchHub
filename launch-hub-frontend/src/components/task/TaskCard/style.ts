import { colors } from "@/styles/colors"
import { dialogWidth } from "@/styles/constants"
import { css } from "@emotion/react"

export const taskCardStyle = (isMarked: boolean) => css`
  border: solid 1px ${colors.divider};
  text-align: left;
  width: 100%;
  height: 90px;
  background-color: ${isMarked ? colors.markedCard : "#fff"};
  margin: 10px 0;
  overflow: hidden;
  border-radius: 6px;
  padding: 6px;
  &:hover {
    cursor: pointer;
  }
`

export const dialogOverlayStyle = css`
  background-color: rgba(0, 0, 0, 0.1);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`

export const dialogContentStyle = css`
  background-color: white;
  border-radius: 6px;
  box-shadow: hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${dialogWidth};
  height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: scroll;
`

export const titleContainerStyle = css`
  display: flex;
`

export const closeButtonSpacerStyle = css`
  flex-grow: 1;
`

export const closeButtonStyle = css`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background-color: ${colors.card};
  &:hover {
    cursor: pointer;
  }
`

const badgeStyle = css`
  padding: 3px 8px;
  margin-right: 12px;
  border-radius: 6px;
`

export const taskStageBadgeStyle = css`
  background-color: ${colors.stageBadge};
  ${badgeStyle}
`

export const bountySbtBadgeStyle = css`
  background-color: ${colors.bountyBadge};
  ${badgeStyle}
`

export const textWithBreakStyle = css`
  white-space: pre-wrap;
`

export const commentsContainerStyle = css`
  background-color: ${colors.warning};
  margin: 6px;
  padding: 6px;
  border-radius: 6px;
`
