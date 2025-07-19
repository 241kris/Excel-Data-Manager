import { fileImportSchema } from '@/schemas'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { z } from 'zod'


type FileImportInput = z.infer<typeof fileImportSchema>

export function useSaveFileImport() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: FileImportInput) => {
            // Valide les données côté client avant d'envoyer
            const parsed = fileImportSchema.safeParse(data)
            if (!parsed.success) {
                throw new Error('Les données envoyées sont invalides.')
            }

            const res = await fetch('/api/file-imports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed.data),
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Erreur lors de la sauvegarde.')
            }

            return res.json()
        },

        onSuccess: () => {
            toast.success('Importation sauvegardée avec succès 🎉')
            queryClient.invalidateQueries({ queryKey: ['file-imports'] })

        },

        onError: (error: unknown) => {
            const message =
                error instanceof Error ? error.message : 'Une erreur est survenue.'
            toast.error(message)
        },
    })
}
