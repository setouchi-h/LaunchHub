import Footer from "../Footer"
import SideBar from "../../project/SideProjectBar"
import * as s from "./style"
import { useRouter } from "next/router"
import { PATHS } from "@/components/pages/paths"

type Props = {
  children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter()
  const hideSideBar = router.asPath.startsWith(PATHS.NEW_PROJECT_PAGE)

  return (
    <div css={s.contentContainerStyle}>
      {!hideSideBar &&
        <SideBar />
      }
      <div css={s.layoutStyle}>
        {children}
        <Footer />
      </div>
    </div>
  )
}

export default Layout
