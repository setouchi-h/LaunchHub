import * as TabsPrimitive from "@radix-ui/react-tabs"
import * as s from './style'

type RootProps = {
  defaultValue: string,
  children: React.ReactNode
}

export const Root: React.FC<RootProps> = ({ defaultValue, children, ...props }) => (
  <TabsPrimitive.Root
    defaultValue={defaultValue}
    {...props}
    css={s.rootStyle}
  >
    {children}
  </TabsPrimitive.Root>
)

type ListProps = {
  children: React.ReactNode
}

export const List: React.FC<ListProps> = ({ children, ...props }) => (
  <TabsPrimitive.List
    {...props}
    css={s.listStyle}
  >
    {children}
  </TabsPrimitive.List>
)

type TriggerProps = {
  value: string,
  children: React.ReactNode
}

export const Trigger: React.FC<TriggerProps> = ({ value, children, ...props }) => (
  <TabsPrimitive.Trigger
    value={value}
    {...props}
    css={s.triggerStyle}
  >
    <div css={s.triggerLabelStyle}>
      {children}
    </div>
    <div />
  </TabsPrimitive.Trigger>
)

type ContentProps = {
  value: string,
  children: React.ReactNode
}

export const Content: React.FC<ContentProps> = ({ value, children, ...props }) => (
  <TabsPrimitive.Content
    value={value}
    {...props}
    css={s.contentStyle}
  >
    {children}
  </TabsPrimitive.Content>
)