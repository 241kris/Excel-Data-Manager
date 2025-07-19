import { useQuery } from "@tanstack/react-query";

export function useGetFileImport(id: number) {
  return useQuery({
    queryKey: ["fileImport", id],
    queryFn: async () => {
      const res = await fetch(`/api/file-imports/${id}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération");
      return res.json();
    },
    enabled: !!id, 
  });
}
