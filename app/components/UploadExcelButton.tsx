'use client'

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'
import * as XLSX from 'xlsx'

export type UploadExcelButtonHandle = {
  reset: () => void
}

type RawEmployee = {
  nom: string
  email: string
  poste: string
  salaire: string
}

type Props = {
  onFileSelectAction: (file: File, parsedData: RawEmployee[]) => void
}

const UploadExcelButton = forwardRef<UploadExcelButtonHandle, Props>(
  ({ onFileSelectAction }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const handleClick = () => {
      inputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })

          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]

          const jsonData = XLSX.utils.sheet_to_json<RawEmployee>(worksheet, { defval: '' })

          onFileSelectAction(file, jsonData)
        } catch (err) {
          console.error('Erreur lors de la lecture du fichier Excel :', err)
        }
      }

      reader.readAsArrayBuffer(file)
    }

    useImperativeHandle(ref, () => ({
      reset: () => {
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
