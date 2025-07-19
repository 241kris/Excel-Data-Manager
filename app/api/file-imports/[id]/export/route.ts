import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const fileImportId = Number(id);

    if (isNaN(fileImportId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const employees = await prisma.employee.findMany({
      where: { fileImportId },
      select: {
        nom: true,
        email: true,
        salaire: true,
        poste: true,
      },
    });

    if (!employees.length) {
      return NextResponse.json({ error: "Aucun employé trouvé" }, { status: 404 });
    }

    const data = employees.map((emp: {
      nom: string;
      email: string;
      salaire: number;
      poste: string;
    }) => ({
      Nom: emp.nom,
      Email: emp.email,
      Salaire: emp.salaire,
      Poste: emp.poste,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employés");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=employes_${fileImportId}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Erreur export Excel:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
