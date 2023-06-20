import React from 'react'
import * as s from './style'

type Props = React.ComponentProps<"input"> & {
  name: string
}

const Input: React.FC<Props> = ({ type, placeholder }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      css={s.inputTextStyle}
    />
  )
}

export default Input