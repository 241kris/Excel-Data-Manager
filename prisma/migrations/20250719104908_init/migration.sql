-- CreateTable
CREATE TABLE "file_imports" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "salaire" DOUBLE PRECISION NOT NULL,
    "poste" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileImportId" INTEGER NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_fileImportId_fkey" FOREIGN KEY ("fileImportId") REFERENCES "file_imports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
