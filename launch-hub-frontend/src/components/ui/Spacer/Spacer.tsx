import * as s from './style'

type Props = {
  size: number
  isVertical?: boolean
}

const Spacer: React.FC<Props> = (props) => {
  const isVertical = props.isVertical ?? true

  if (isVertical) {
    return (
      <div css={() => s.verticalSpacerStyle(props.size)} />
    )
  } else {
    return (
      <div css={() => s.horizontalSpacerStyle(props.size)} />
    )
  }
}

export default Spacer