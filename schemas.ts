import { z } from "zod";

export const employeeSchema = z.object({
  id: z.number().optional(),
  nom: z.string().nonempty("Nom requis"),
  email: z.string().email("Email invalide"),
  poste: z.string().nonempty("Poste requis"),
  salaire: z
    .number()
    .int()
    .gt(0)
    .refine((val) => Number.isInteger(val), {
      message: "Salaire doit être un entier",
    })
    .refine((val) => val > 0, {
      message: "Salaire doit être supérieur à zéro",
    }),

});

export const fileImportSchema = z.object({
  id: z.number().optional(),
  fileName: z.string().nonempty(),
  importedAt: z.string().nonempty(),
  employees: z.array(employeeSchema),
});
// --- Types ---
export type FileImport = z.infer<typeof fileImportSchema>;      // pour lecture
export type FileImportForm = Omit<FileImport, "id">;     