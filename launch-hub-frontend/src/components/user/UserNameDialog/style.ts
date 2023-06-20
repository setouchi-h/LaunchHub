import { dialogWidth } from "@/styles/constants";
import { css } from "@emotion/react";

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
  min-width: 35vw;
  max-width: ${dialogWidth};
  max-height: 85vh;
  overflow-y: scroll;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`