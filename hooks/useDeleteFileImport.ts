import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type DeleteFileImportResponse = {
  message?: string;
  error?: string;
};

export const useDeleteFileImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<DeleteFileImportResponse> => {
      const res = await fetch(`/api/file-imports/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression.");
      }

      return data;
    },

    onSuccess: (data) => {
      toast.success(data.message || "Importation supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["fileImports"] });
    },

    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Erreur inconnue.";
      toast.error(message);
    },
  });
};
