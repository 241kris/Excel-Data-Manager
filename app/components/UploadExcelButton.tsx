'use client'

import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react'

export type UploadExcelButtonHandle = {
  reset: () => void
}

type Props = {
  onFileSelectAction: (file: File) => void
}

const UploadExcelButton = forwardRef<UploadExcelButtonHandle, Props>(
  ({ onFileSelectAction }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const [ ,setFileName ] = useState<string>('')

    const handleClick = () => {
      inputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        setFileName(file.name)
        onFileSelectAction(file)
      }
    }

    useImperativeHandle(ref, () => ({
      reset: () => {
        setFileName('')
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      },
    }))

    return (
      <div className="w-full flex flex-col items-center">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          ref={inputRef}
          className="hidden"
        />

        <div
          onClick={handleClick}
          className="cursor-pointer w-full max-w-md border-2 border-dashed border-gray-400 rounded-2xl p-6 text-center hover:bg-gray-100 transition duration-200"
        >
          <p className="text-sm text-gray-500">
            Cliquez ici ou glissez un fichier Excel (.xlsx)
          </p>
          <p className="text-sm mt-2 text-blue-600 font-medium">
            Formats acceptés : .xlsx
          </p>
        </div>


      </div>
    )
  }
)

UploadExcelButton.displayName = 'UploadExcelButton'
export default UploadExcelButton
