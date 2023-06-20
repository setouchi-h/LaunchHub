import * as s from './style'

type Props = {
  children: React.ReactNode
}

const ErrorMessage: React.FC<Props> = ({ children }) => {
  return (
    <p css={s.errorMessageStyle}>
      {children}
    </p>
  )
}

export default ErrorMessage