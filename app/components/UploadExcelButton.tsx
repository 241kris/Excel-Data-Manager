import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import * as XLSX from 'xlsx'

export interface UploadExcelButtonHandle {
  reset: () => void
}

type RawEmployee = {
  nom: string
  email: string
  poste: string
  salaire: string
}

type Props = {
  onFileSelectAction: (file: File, jsonData: RawEmployee[]) => void
}

const UploadExcelButton = forwardRef<UploadExcelButtonHandle, Props>(
  ({ onFileSelectAction }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null)

    // Permet de reset l'input via le parent
    useImperativeHandle(ref, () => ({
      reset() {
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      },
    }))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (evt) => {
        const data = evt.target?.result
        if (!data) return

        // Lire le fichier Excel en binaire
        const workbook = XLSX.read(data, { type: 'binary' })

        // Prendre la première feuille
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convertir la feuille en JSON
        const jsonData: RawEmployee[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

        // Appeler la fonction passée en prop avec le fichier et les données JSON
        onFileSelectAction(file, jsonData)
      }

      reader.readAsBinaryString(file)
    }

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
          id="upload-excel"
        />
        <label
          htmlFor="upload-excel"
          className="btn btn-primary cursor-pointer rounded-3xl btn-sm"
        >
          Choisir un fichier Excel
        </label>
      </>
    )
  }
)

UploadExcelButton.displayName = 'UploadExcelButton'

export default UploadExcelButton
