'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { FaFileDownload } from 'react-icons/fa'
import { MdDelete } from "react-icons/md"
import { useFileImports } from '@/hooks/useFileImports'
import { FileImport } from '@/schemas'
import { useDeleteFileImport } from '@/hooks/useDeleteFileImport'
import { toast } from 'react-hot-toast'
import Breadcrumbs from '../components/Breadcrumbs'

export default function DataTable() {
  // ✅ État local pour gérer le téléchargement d’un fichier spécifique
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  // ✅ Récupère tous les fichiers importés depuis le backend
  const { data, isLoading, error } = useFileImports()

  // ✅ Hook custom pour supprimer un fichier importé
  const deleteFileImport = useDeleteFileImport()

  // ✅ États pour gérer la modale de confirmation de suppression
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedName, setSelectedName] = useState<string>("")
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  // ✅ Ouvre la boîte de dialogue de confirmation pour un fichier donné
  const openConfirmationModal = (id: number, fileName: string) => {
    setSelectedId(id)
    setSelectedName(fileName)
    dialogRef.current?.showModal()
  }

  // ✅ Gère la suppression du fichier sélectionné
  const handleConfirmDelete = () => {
    if (selectedId != null) {
      deleteFileImport.mutate(selectedId, {
        onSettled: () => {
          dialogRef.current?.close()
        }
      })
    }
  }

  // ✅ Téléchargement du fichier via un endpoint backend + toast + spinner
  function downloadExcel(fileImportId: number, fileName: string) {
    setDownloadingId(fileImportId)

    const promise = fetch(`/api/file-imports/${fileImportId}/export`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erreur lors du téléchargement')
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `${fileName}.xlsx`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      })
      .finally(() => {
        setDownloadingId(null)
      })

    toast.promise(promise, {
      loading: 'Téléchargement en cours...',
      success: <b>Fichier téléchargé avec succès 📥</b>,
      error: <b>Échec du téléchargement 😥</b>,
    })
  }

  // ✅ Affichage en cas de chargement initial
  if (isLoading) return <p className="text-center mt-8">Chargement...</p>
  if (error) return <p className="text-center mt-8 text-red-600">Erreur : {(error as Error).message}</p>

  return (
    <div className='px-2'>

      {/* ✅ Modale de confirmation de suppression */}
      <dialog id="confirmation" ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-semibold text-sm text-center">Confirmer votre action</h3>
          <div className='my-4 text-start'>
            <p className='text-sm'>
              Êtes-vous sûr de vouloir supprimer le fichier <span className='font-semibold'>{selectedName}</span> ?
            </p>
            <div className='mt-3 flex gap-3 items-center'>
              <button
                className='btn btn-error btn-sm rounded-3xl'
                onClick={handleConfirmDelete}
                disabled={deleteFileImport.status === 'pending'}
              >
                {deleteFileImport.status === 'pending' ? "Suppression..." : "Oui, supprimer"}
              </button>
              <button
                className='btn btn-sm rounded-3xl'
                onClick={() => dialogRef.current?.close()}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Fermer</button>
        </form>
      </dialog>
      <div>
        <Breadcrumbs />
      </div>
      {/* ✅ En-tête avec nombre dynamique de fichiers */}
      <div className="flex flex-col justify-center my-7">
        <h1 className="stat-value text-center">mes fichiers</h1>
        <span className='stat-desc text-center'>
          {(data as FileImport[])?.length ?? 0} fichier(s)
        </span>
      </div>

      {/* ✅ Tableau des fichiers importés */}
      <div className="overflow-x-auto w-full">
        <table className="table">
          <thead>
            <tr>
              <th>fichier</th>
              <th>élément(s)</th>
              <th>créé le</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {(data as FileImport[])?.length > 0 ? (
              (data as FileImport[]).map((fileImport) => (
                <tr key={fileImport.id}>
                  <td>
                    <Link href={`/files/${fileImport.id}`} className="link text-warning">
                      {fileImport.fileName}
                    </Link>
                  </td>
                  <td>{fileImport.employees.length}</td>
                  <td>{new Date(fileImport.importedAt).toLocaleDateString()}</td>
                  <td>
                    {/* ✅ Bouton de téléchargement avec loading par ID */}
                    <button
                      className='btn btn-warning btn-xs rounded-2xl'
                      onClick={() => downloadExcel(fileImport.id!, fileImport.fileName)}
                      disabled={downloadingId === fileImport.id}
                    >
                      {downloadingId === fileImport.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <FaFileDownload className="text-sm" />
                      )}
                    </button>

                    {/* ✅ Bouton de suppression */}
                    <button
                      onClick={() => openConfirmationModal(fileImport.id!, fileImport.fileName)}
                      className='btn ms-2 btn-error btn-xs rounded-2xl'
                    >
                      <MdDelete className='text-sm' />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center">Aucun fichier importé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
