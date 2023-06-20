import * as s from './style'

type Props = React.ComponentProps<"input"> & {
  label: string,
  file: File
}

const InputFile: React.FC<Props> = ({ label, file }) => {

  console.log(file)

  return (
    <div css={s.inputFileLabelContainerStyle}>
      <label htmlFor="file" css={s.inputFileLabelStyle}>
        {label}
        <input
          type="file"
          css={s.inputFileStyle}
        />
      </label>
      {file &&
        <span css={s.fileNameStyle}>
          {file.name}
        </span>
      }
    </div>
  )
}

export default InputFile