import * as s from './style'

type Props = {
  children: React.ReactNode
}

const PageContainer: React.FC<Props> = ({ children }) => {

  return (
    <div css={s.pageContainerStyle}>
      {children}
    </div>
  )
}

export default PageContainer