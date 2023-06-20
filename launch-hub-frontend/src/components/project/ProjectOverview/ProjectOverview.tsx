import { Project } from "@/types/Project"
import * as s from "./style"
import React from "react"
import Link from "next/link"
import Spacer from "@/components/ui/Spacer"

type Props = {
  project: Project
  isProjectOwner: boolean
}

const ProjectOverview: React.FC<Props> = ({ project, isProjectOwner }) => {

  return (
    <div css={s.projectOverviewStyle}>
      {isProjectOwner && (
        <>
          <Spacer size={30} />
          <div css={s.informationToShareStyle}>
            <p>Share the following information with project members.</p>
            <Spacer size={10} />
            <p>Invitation code</p>
            <p>{project.invitationCode}</p>
          </div>
        </>
      )}

      {project.twitterUrl && (
        <div>
          <Spacer size={30} />
          <p>Twitter</p>
          <Link href={project.twitterUrl} css={s.linkStyle}>
            {project.twitterUrl}
          </Link>
        </div>
      )}

      {project.discordUrl && (
        <div>
          <Spacer size={30} />
          <p>Discord</p>
          <Link href={project.discordUrl} css={s.linkStyle}>
            {project.discordUrl}
          </Link>
        </div>
      )}

      {project.details && (
        <div>
          <Spacer size={30} />
          <p>Details</p>
          <p css={s.textWithBreakStyle}>{project.details}</p>
        </div>
      )}

      <div>
        <Spacer size={30} />
        <p>Project Treasury Address</p>
        <p>{project.vaultAddress}</p>
      </div>
    </div>
  )
}

export default ProjectOverview
