import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // Client Prisma pour interagir avec la base de données
import { fileImportSchema } from '@/schemas' // Schéma de validation Zod pour le corps de la requête

// Handler pour la méthode POST - Création d'un nouvel import de fichier avec ses employés
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ✅ Validation du corps de la requête via Zod
    const parsed = fileImportSchema.safeParse(body)
    if (!parsed.success) {
      // ❌ Si validation échoue, retourner une erreur 400 avec les détails des erreurs
      return NextResponse.json(
        { error: 'Données invalides', issues: parsed.error.format() },
        { status: 400 }
      )
    }

    const { fileName, employees = [] } = parsed.data

    // 📦 Création de l'entrée `fileImport` dans la base de données avec les employés associés
    const createdImport = await prisma.fileImport.create({
      data: {
        fileName,
        employees: {
          create: employees.map((emp) => ({
            nom: emp.nom,
            email: emp.email,
            poste: emp.poste,
            salaire: emp.salaire,
          })),
        },
      },
      include: {
        employees: true, // 👁️ Inclure les données des employés dans la réponse
      },
    })

    // ✅ Retourner la ressource créée avec un statut HTTP 201
    return NextResponse.json(createdImport, { status: 201 })
  } catch (error) {
    // 🔥 En cas d'erreur serveur, logguer l'erreur et retourner une réponse 500
    console.error('Erreur POST /api/file-imports :', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la sauvegarde.' },
      { status: 500 }
    )
  }
}

// Handler pour la méthode GET - Récupération des imports de fichiers avec leurs employés
export async function GET() {
  try {
    // 📥 Récupère tous les imports de fichiers avec les employés associés
    const imports = await prisma.fileImport.findMany({
      include: {
        employees: true,
      },
      orderBy: {
        importedAt: 'desc', // 🔽 Trie du plus récent au plus ancien
      },
    })

    // ✅ Retourner la liste des imports avec un statut HTTP 200
    return NextResponse.json(imports, { status: 200 })
  } catch (error) {
    // 🔥 Gestion des erreurs serveur
    console.error('Erreur GET /api/file-imports :', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des imports.' },
      { status: 500 }
    )
  }
}
