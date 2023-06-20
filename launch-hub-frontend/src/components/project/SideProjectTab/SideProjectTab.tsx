import Link from "next/link"
import * as s from "./style"
import { useRouter } from "next/router"
import { Avatar } from "@/components/radix/Avatar/Avatar"
import { Project } from "@/types/Project"
import { PATHS } from "@/components/pages/paths"

type Props = {
  type: "home" | "new" | "project",
  project: Project | null
}

const SideProjectTab: React.FC<Props> = ({ type, project }) => {

  const router = useRouter()
  const href = type === "project" ? PATHS.PROJECT(project?.id ?? "")
    : type === "home" ? PATHS.INDEX
      : type === "new" ? PATHS.NEW_PROJECT.ABOUT_PROJECT
        : ""
  const isActive = router.asPath === href

  return (
    <Link href={href} css={() => s.sideTabStyle(isActive)}>
      {type === "project"
        ? project &&
        <>
          <div css={s.avatarContainerStyle}>
            <Avatar
              src={project.downloadImageUrl ?? ""}
              alt="project icon"
              fallback={project.title.substring(0, 1)}
              size="sideTab"
            />
          </div>
          <span css={s.textStyle}>
            {project.title}
          </span>
        </>
        : type === "home"
          ? <>
            <div css={s.avatarContainerStyle}>
              <Avatar
                fallback="🏠"
                size="sideTab"
              />
            </div>
            <span css={s.textStyle}>
              Home
            </span>
          </>
          : type === "new"
            ? <>
              <div css={s.avatarContainerStyle}>
                <Avatar
                  fallback="+"
                  size="sideTab"
                />
              </div>
              <span css={s.textStyle}>
                Create new
              </span>
            </>
            : <div></div>
      }

    </Link>
  )
}

export default SideProjectTab