// hooks/useFileImports.ts
import { useQuery } from "@tanstack/react-query";
import { fileImportSchema } from "@/schemas";
import { z } from "zod";
import { FileImport } from "@/schemas";

const fileImportArraySchema = z.array(fileImportSchema);

export const useFileImports = () => {
  return useQuery<FileImport[]>({
    queryKey: ["fileImports"],
    queryFn: async () => {
      const res = await fetch("/api/file-imports");
      if (!res.ok) throw new Error("Erreur lors du chargement");
      const data = await res.json();
      return fileImportArraySchema.parse(data); // ✅ Zod valide ET types sécurisés
    },
  });
};
