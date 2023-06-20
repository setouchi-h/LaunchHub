import LoadingCircle from "../LoadingCircle/LoadingCircle"
import * as s from "./style"

type Props = {
  onClick: React.MouseEventHandler<HTMLButtonElement>,
  isEnabled?: boolean,
  isLoading?: boolean,
  style?: "contained" | "outlined"
  children?: React.ReactNode
}

const Button: React.FC<Props> = ({ onClick, isEnabled = true, isLoading = false, style = "contained", children }) => {
  return (
    <button
      onClick={onClick}
      disabled={!isEnabled}
      css={() => s.buttonStyle({ isEnabled: isEnabled, style: style })}
    >
      {children}
      {isLoading &&
        <LoadingCircle />
      }
    </button>
  )
}

export default Button