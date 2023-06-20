import * as s from "./style"
import React from "react"
import { SbtOwner } from "@/types/SbtOwner"

type Props = {
  sbtOwners: SbtOwner[]
}

const ProjectMembers: React.FC<Props> = ({ sbtOwners }) => {
  return (
    <ul>
      {sbtOwners.map((owner, index) => (
        <li key={index}>
          <p>{owner.name}</p>
        </li>
      ))}
    </ul>
  )
}

export default ProjectMembers
