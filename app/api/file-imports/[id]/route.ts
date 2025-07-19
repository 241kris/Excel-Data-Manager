import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ZodError } from "zod";
import { fileImportSchema } from "@/schemas";


type IncomingEmployee = {
  id?: number;
  nom: string;
  email: string;
  salaire: number;
  poste: string;
};

type ExistingEmployee = {
  id: number;
  nom: string;
  email: string;
  salaire: number;
  poste: string;
};

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // 🔍 Vérifie si l'import existe
    const existing = await prisma.fileImport.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Importation non trouvée" }, { status: 404 });
    }

    // ❌ Supprime les employés liés, puis le fichier import, dans une transaction
    await prisma.$transaction([
      prisma.employee.deleteMany({ where: { fileImportId: numericId } }),
      prisma.fileImport.delete({ where: { id: numericId } }),
    ]);

    // ✅ Confirmation de la suppression
    return NextResponse.json({ message: "Importation supprimée avec succès" }, { status: 200 });
  } catch (error) {
    console.error("Erreur DELETE /file-imports/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur lors de la suppression" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    // 🔍 Récupère l'import et les employés associés
    const fileImport = await prisma.fileImport.findUnique({
      where: { id: numericId },
      include: { employees: true },
    });

    if (!fileImport) {
      return NextResponse.json({ error: "Importation non trouvée" }, { status: 404 });
    }

    // ✅ Retourne les données
    return NextResponse.json(fileImport);
  } catch (error) {
    console.error("Erreur GET /file-imports/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const body = await req.json();

    const validatedData = fileImportSchema.parse(body);

    const existing = await prisma.fileImport.findUnique({
      where: { id: numericId },
      include: { employees: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Importation non trouvée" }, { status: 404 });
    }

    const incomingEmployees: IncomingEmployee[] = validatedData.employees;
    const existingEmployees: ExistingEmployee[] = existing.employees;

    const incomingIds = incomingEmployees
      .filter((e: IncomingEmployee) => e.id !== undefined)
      .map((e: IncomingEmployee) => e.id!) as number[];

    const existingIds = existingEmployees.map((e: ExistingEmployee) => e.id);

    const idsToDelete = existingIds.filter(
      (id: number) => !incomingIds.includes(id)
    );

    const employeesToUpdate = incomingEmployees.filter(
      (e: IncomingEmployee) => e.id !== undefined
    );
    const employeesToCreate = incomingEmployees.filter(
      (e: IncomingEmployee) => e.id === undefined
    );

    const updated = await prisma.$transaction(async (tx) => {
      if (idsToDelete.length > 0) {
        await tx.employee.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }

      for (const emp of employeesToUpdate) {
        const { id, salaire, ...rest } = emp;
        await tx.employee.update({
          where: { id: id! },
          data: {
            ...rest,
            salaire: Number(salaire),
          },
        });
      }

      if (employeesToCreate.length > 0) {
        await tx.employee.createMany({
          data: employeesToCreate.map((emp: IncomingEmployee) => ({
            ...emp,
            salaire: Number(emp.salaire),
            fileImportId: numericId,
          })),
        });
      }

      return tx.fileImport.update({
        where: { id: numericId },
        data: {
          fileName: validatedData.fileName,
          importedAt: validatedData.importedAt,
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Erreur PUT /file-imports/[id]:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
