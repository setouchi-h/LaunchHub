import { Project } from "@/types/Project";
import * as s from "./style";
import React from "react"
import Spacer from "@/components/ui/Spacer"
import Avatar from "@/components/radix/Avatar"

type Props = {
  project: Project
}

const ProjectHeader: React.FC<Props> = ({ project }) => {

  return (
    <div css={s.projectHeaderContainerStyle}>
      {project.downloadImageUrl ? (
        <div>
          <Avatar
            src={project.downloadImageUrl}
            alt="project icon"
            fallback={project.title.substring(0, 1)}
          />
        </div>
      ) : (
        <div>
          <Avatar fallback={project.title.substring(0, 1)} />
        </div>
      )}
      <Spacer size={10} isVertical={false} />
      <h1 css={s.projectTitleStyle}>
        {project.title}
      </h1>
    </div>
  )
}

export default ProjectHeader
