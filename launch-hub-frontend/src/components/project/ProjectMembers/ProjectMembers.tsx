import * as s from "./style"
import React from "react"
import { SbtOwner } from "@/types/SbtOwner"

type Props = {
  projectMembers: SbtOwner[]
}

const ProjectMembers: React.FC<Props> = ({ projectMembers }) => {
  console.log(projectMembers)

  return (
    <ul>
      {projectMembers.map((owner, index) => (
        <li key={index} css={s.container}>
          <p css={s.ownerName}>{owner.name}</p>
          <p>{owner.amount}</p>
        </li>
      ))}
    </ul>
  )
}

export default ProjectMembers
