import * as AvatarPrimitive from "@radix-ui/react-avatar"
import * as s from './style'

type Props = {
  src?: string,
  alt?: string,
  fallback: string,
  size?: "normal" | "sideTab"
}

export const Avatar: React.FC<Props> = ({ src, alt, fallback, size = "normal" }) => {
  return (
    <AvatarPrimitive.Root css={() => s.rootStyle(size)}>
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        css={s.imageStyle}
      />

      <AvatarPrimitive.Fallback css={s.fallbackStyle}>
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
