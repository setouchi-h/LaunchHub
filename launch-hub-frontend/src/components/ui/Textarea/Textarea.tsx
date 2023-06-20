import * as s from './style'

type Props = React.ComponentProps<"textarea">

const Textarea: React.FC<Props> = ({ placeholder }) => {
  return (
    <textarea
      placeholder={placeholder}
      css={s.textareaStyle}
    />
  )
}

export default Textarea