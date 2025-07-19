'use client'

import React, { useRef, useState } from 'react'
import { FaFileExcel } from 'react-icons/fa'
import UploadExcelButton, { UploadExcelButtonHandle } from './components/UploadExcelButton'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import { fileImportSchema, employeeSchema } from '@/schemas'
import { useSaveFileImport } from '@/hooks/useSaveFileImport'
import toast from 'react-hot-toast'
import Breadcrumbs from './components/Breadcrumbs'


type RawEmployee = {
  nom: string
  email: string
  poste: string
  salaire: string
}

type EmployeeField = keyof z.infer<typeof employeeSchema>
type ZodFieldErrors = Partial<Record<EmployeeField, string[]>>

type EmployeeWithErrors = {
  current: RawEmployee
  original: RawEmployee
  errors: Partial<Record<EmployeeField, string>>
}

export default function Home() {
  const [employees, setEmployees] = useState<EmployeeWithErrors[]>([])
  const [fileName, setFileName] = useState<string>('')
  const mutation = useSaveFileImport()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadButtonRef = useRef<UploadExcelButtonHandle>(null)

  const handleUpload = (file: File) => {
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      if (!data) return

      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const jsonData = XLSX.utils.sheet_to_json<RawEmployee>(worksheet, { defval: '' })

      const loaded: EmployeeWithErrors[] = jsonData.map((row) => ({
        current: {
          nom: row.nom || '',
          email: row.email || '',
          poste: row.poste || '',
          salaire: row.salaire || '',
        },
        original: {
          nom: row.nom || '',
          email: row.email || '',
          poste: row.poste || '',
          salaire: row.salaire || '',
        },
        errors: {},
      }))

      setEmployees(loaded)

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    reader.readAsBinaryString(file)
  }

 const handleSubmit = () => {
  const dataToValidate = employees.map((emp) => {
    const salaireStr = emp.current.salaire.replace(/[^0-9]+/g, '')
    const salaireInt = parseInt(salaireStr, 10)
    return {
      nom: emp.current.nom,
      email: emp.current.email,
      poste: emp.current.poste,
      salaire: isNaN(salaireInt) ? 0 : salaireInt,
    }
  })

  const validation = fileImportSchema.safeParse({
    fileName,
    importedAt: new Date().toISOString(),
    employees: dataToValidate,
  })

  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors.employees

    if (fieldErrors) {
      setEmployees((prev) =>
        prev.map((emp, idx) => {
          const empErrors = fieldErrors[idx] as ZodFieldErrors | undefined

          return {
            ...emp,
            errors: {
              nom: empErrors?.nom?.[0] ?? '',
              email: empErrors?.email?.[0] ?? '',
              poste: empErrors?.poste?.[0] ?? '',
              salaire: empErrors?.salaire?.[0] ?? '',
            },
          }
        })
      )
    }

    toast.error('Merci de corriger les erreurs dans le fichier Excel.')
    return
  }

  mutation.mutate(validation.data, {
    onSuccess: () => {
      
      setEmployees([])
      setFileName('')
    },
  })
}

  const handleForget = () => {
    setEmployees([])
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    uploadButtonRef.current?.reset?.() // si tu as défini une méthode reset dans UploadExcelButton
    toast.success('Import réinitialisé.')
  }

  return (


    <main className="flex flex-col items-center justify-center h-screen px-4">
      <div>
        <Breadcrumbs />
      </div>
      <div>
        <h1 className="stat-value text-2xl mb-5 flex items-center gap-3">
          Importer votre fichier .xlsx <FaFileExcel className="text-white" />
        </h1>
        <UploadExcelButton
          onFileSelectAction={handleUpload}
          ref={uploadButtonRef}
        />
      </div>

      {employees.length > 0 && (

        <div className="overflow-x-auto mt-14 w-full max-w-5xl">

          <h1 className="stat-desc text-base">
            {employees.length} élément(s) -  <span className='text-green-600 font-semibold'>{fileName}</span>
          </h1>

          <div className="flex items-center gap-2 mt-2">
            <button
              disabled={mutation.status === 'pending'}
              onClick={handleSubmit}
              className="btn btn-soft btn-primary rounded-3xl btn-sm flex items-center gap-2"
            >
              {mutation.status === 'pending' && (
                <span className="loading loading-spinner loading-sm" />
              )}
              sauvegarder
            </button>
            <button
              className="btn btn-error rounded-3xl btn-sm btn-soft"
              onClick={handleForget}
            >
              oublier
            </button>

          </div>

          {/*table affichant les données du fichier*/}
          <table className="table w-full text-xs">
            <thead>
              <tr>
                <th>nom</th>
                <th>email</th>
                <th>poste</th>
                <th>salaire</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => (
                <tr key={i}>
                  <td className={emp.errors.nom ? 'text-error' : ''}>{emp.current.nom}</td>
                  <td className={emp.errors.email ? 'text-error' : ''}>{emp.current.email}</td>
                  <td className={emp.errors.poste ? 'text-error' : ''}>{emp.current.poste}</td>
                  <td className={emp.errors.salaire ? 'text-error' : ''}>{emp.current.salaire}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}
    </main>
  )
}
