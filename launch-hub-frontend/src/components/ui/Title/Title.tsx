import * as s from './style'

type Props = {
  style?: "title" | "subtitle",
  children: React.ReactNode
}

const Title: React.FC<Props> = ({ style = "title", children }) => {
  if (style === "title") {
    return (
      <h1 css={() => s.titleStyle(style)}>
        {children}
      </h1>
    )
  } else {
    return (
      <h2 css={() => s.titleStyle(style)}>
        {children}
      </h2>
    )
  }
}

export default Title