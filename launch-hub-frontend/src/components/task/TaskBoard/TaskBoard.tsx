import React, { useState } from "react"
import * as s from "./style"
import DroppableTaskColumn from "../DroppableTaskColumn/DroppableTaskColumn"
import * as ScrollArea from "@radix-ui/react-scroll-area"
import Button from "@/components/ui/Button"
import Spacer from "@/components/ui/Spacer"
import { Configuration, OpenAIApi } from "openai"
import { useRouter } from "next/router"
import { useGetProject } from "@/models/project/useGetProject"

const TaskBoard: React.FC = () => {
  const router = useRouter()
  const { projectId } = router.query
  const { project } = useGetProject(projectId)
  const [response, setResponse] = useState<any>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const configuration = new Configuration({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  })
  delete configuration.baseOptions.headers["User-Agent"]
  const openai = new OpenAIApi(configuration)

  const onQuery = async () => {
    setIsLoading(true)
    if (!project || !project.id) {
      return
    }

    // GPTとのやりとり
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an excellent task manager." },
        {
          role: "system",
          content:
            "Please break down the tasks required to accomplish a given {Goal} into as much detail as possible.",
        },
        { role: "system", content: "Do not make {Goal} one of your tasks." },
        {
          role: "system",
          content:
            "Please put the output of all decomposed tasks in json format with the following items.",
        },
        {
          role: "system",
          content: "{title : string\noutline : string\ndetails : string\nbountySbt : num}",
        },
        {
          role: "system",
          content:
            'title is the title of the task\noutline is the outline of the task\ndetails is the details of the task. Please describe the task in as much detail as possible, e.g., by providing an "example".\nbountySbt outputs the amount of token which is distributed based on the importance and burden of task. The standard amount of token is 10',
        },
        {
          role: "system",
          content: `Goal is ${project.details}`,
        },
        { role: "system", content: "lang:jp\noutput must be json only" },
        {
          role: "system",
          content:
            'For example\n{\n"title": "AA",\n"outline": "BB",\n"details": "CC",\n"bountySbt": 1\n},\n{\n"title": "DD",\n"outline": "EE",\n"details": "FF",\n"bountySbt": 1\n}',
        },
      ],
    })

    const resultString = completion.data.choices[0].message?.content
    const result = JSON.parse(`[${resultString}]`)
    console.log(result)
    setResponse(result)
    setIsLoading(false)
  }

  return (
    <div css={s.containerStyle}>
      <ScrollArea.Root css={s.scrollRootStyle}>
        <ScrollArea.Viewport>
          <div css={s.boardStyle}>
            <DroppableTaskColumn columnStage="todo" title="To Do" />
            <DroppableTaskColumn columnStage="inProgress" title="In Progress" />
            <DroppableTaskColumn columnStage="inReview" title="In Review" />
            <DroppableTaskColumn columnStage="done" title="Done" />
          </div>
        </ScrollArea.Viewport>

        <div>
          <Spacer size={30} />
          <h2>Tasks that AI suggests your team to do</h2>
          <Spacer size={10} />
          {!isLoading && !response && (
            <Button onClick={onQuery} style="outlined">
              Ask AI
            </Button>
          )}
          {isLoading && <p>AI is thinking...</p>}
          {response && (
            <>
              <div>
                {response.map((item: any, index: string) => (
                  <div key={index}>
                    <h3>{`Task ${index + 1}: ${item.title}`}</h3>
                    <div>Outline: {item.outline}</div>
                    <div>Details: {item.details}</div>
                    <div>Amount of SBT: {item.bountySbt}</div>
                    <hr />
                    <Spacer size={10} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  )
}

export default TaskBoard
