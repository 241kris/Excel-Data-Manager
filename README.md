# 📊 Excel Data Manager

Une application Next.js performante et responsive pour importer, afficher, modifier et exporter des données employé(e)s depuis/vers des fichiers Excel (.xlsx), avec intégration d’une base de données relationnelle.

## 🚀 Fonctionnalités

- 📁 **Importation de fichiers Excel (.xlsx)**
- 🧩 **Parsing & validation sécurisée** des données via `zod`
- 🗄 **Insertion dans une base de données MySQL** avec Prisma ORM
 
- 📝 **Modification en temps réel via une interface Web moderne**
- 📤 **Export des résultats** au format `.xlsx`
- 📦 Interface responsive avec **DaisyUI** et retour utilisateur avec **React Hot Toast**

---

## ⚙️ Technologies utilisées

| Catégorie             | Outils / Librairies                        |
|----------------------|--------------------------------------------|
| Framework Web        | [Next.js 15](https://nextjs.org/)          |
| ORM / BDD            | [Prisma ORM](https://www.prisma.io/) + postgresql |
| Validation données   | [Zod](https://zod.dev/)                    |
| Requêtes API         | [React Query](https://tanstack.com/query) |
| UI Components        | [DaisyUI](https://daisyui.com/) + [React Icons](https://react-icons.github.io/react-icons/) |
| Notifications        | [React Hot Toast](https://react-hot-toast.com/) |
| Manipulation Excel   | [`xlsx`](https://www.npmjs.com/package/xlsx) |

---

## 🧱 Structure de la base de données

```prisma
model FileImport {
  id         Int         @id @default(autoincrement())
  fileName   String
  importedAt DateTime    @default(now())
  employees  Employee[]  @relation("FileImportEmployees")

  @@map("file_imports")
}

model Employee {
  id           Int        @id @default(autoincrement())
  nom          String
  email        String
  salaire      Float
  poste        String
  createdAt    DateTime   @default(now())
  fileImportId Int
  fileImport   FileImport @relation(fields: [fileImportId], references: [id], name: "FileImportEmployees")

  @@map("employees")
}

🌐 Déploiement & Architecture
L’application est déployée selon une architecture moderne orientée cloud, qui facilite les tests et l’intégration en conditions proches de la production.

📂 Base de données PostgreSQL sur Neon
La base de données relationnelle est hébergée sur Neon, un service cloud PostgreSQL as-a-Service.
Neon offre un hébergement PostgreSQL scalable, sans maintenance, avec des fonctionnalités avancées comme :

Provisionnement rapide : création d’environnements en quelques secondes.

Branches de données : possibilité de cloner instantanément la base pour des tests isolés.

Sauvegardes automatiques et haute disponibilité.

Cela permet de bénéficier d’un vrai SGBD relationnel robuste, accessible sur Internet, sans avoir à gérer un serveur dédié. Idéal pour tester et valider les schémas et les migrations en conditions réelles.

🚀 Application Next.js sur Vercel
L’application frontend/backend est déployée sur Vercel, la plateforme cloud optimisée pour Next.js.
Vercel fournit :

Déploiement continu à chaque git push.

URLs d’aperçu (Preview Deployments) pour chaque pull request.

Hébergement serverless et auto-scalable.

Cela garantit que l’application est accessible publiquement dans un environnement très proche de la production finale, tout en permettant d’itérer rapidement et de tester les fonctionnalités sans friction.

✅ Avantages de cette approche
Tests réalistes : application et base tournent dans le cloud, dans des environnements semblables à la prod. On peut détecter des problèmes réseau, de latence ou de configuration qui n’apparaîtraient pas en local.

Collaboration facilitée : développeurs, testeurs et parties prenantes peuvent accéder à l’application déployée via une simple URL.

CI/CD intégré : les mises à jour de code sont automatiquement déployées et testées.

Séparation des responsabilités : la base est indépendante de l’application, ce qui respecte les bonnes pratiques et permet de switcher d’un provider à un autre facilement.

💡 Cette configuration est idéale pour valider l’application en conditions quasi-production avant un lancement officiel.

 

# 📆 API - Gestion des Fichiers Importés (`file-imports`)

Cette API permet de gérer des **fichiers d'import contenant des employés**, en assurant la création, la lecture, la modification, la suppression, ainsi que l’**export au format Excel**.
Elle est structurée de façon RESTful, avec des conventions de nommage claires, une validation stricte via **Zod** et une base de données gérée via **Prisma ORM**.

---

## 📁 Structure des routes

| Route                           | Méthode  | Description                                     |
| ------------------------------- | -------- | ----------------------------------------------- |
| `/api/file-imports`             | `POST`   | Créer un nouvel import + employés               |
| `/api/file-imports`             | `GET`    | Récupérer tous les imports (avec employés)      |
| `/api/file-imports/[id]`        | `GET`    | Récupérer un import par ID                      |
| `/api/file-imports/[id]`        | `PUT`    | Modifier un import et synchroniser les employés |
| `/api/file-imports/[id]`        | `DELETE` | Supprimer un import et ses employés             |
| `/api/file-imports/[id]/export` | `GET`    | Exporter les employés d’un import en `.xlsx`    |

---

## ✅ Convention générale

* Toutes les routes renvoient des réponses **JSON** sauf `/export` qui retourne un **fichier Excel téléchargeable**.
* Les données sont validées avec **Zod** côté serveur (`fileImportSchema`).
* Les erreurs sont retournées avec un code HTTP adapté (`400`, `404`, `500`) et un message explicite.
* Toutes les interactions avec la base de données sont faites via Prisma.
* Le champ `employees` est une liste d’objets `{ nom, email, salaire, poste, id? }`.

---

## 📌 1. Créer un fichier d’import (`POST /api/file-imports`)

### 🔧 Body attendu :

```json
{
  "fileName": "employes_juillet.csv",
  "employees": [
    { "nom": "Alice", "email": "alice@mail.com", "poste": "RH", "salaire": 2500 },
    { "nom": "Bob", "email": "bob@mail.com", "poste": "Dév", "salaire": 3200 }
  ]
}
```

### ✅ Réponse :

```json
{
  "id": 1,
  "fileName": "employes_juillet.csv",
  "importedAt": "2025-07-19T13:12:45.000Z",
  "employees": [ ... ]
}
```

---

## 📌 2. Récupérer tous les imports (`GET /api/file-imports`)

### ✅ Réponse :

```json
[
  {
    "id": 1,
    "fileName": "employes_juillet.csv",
    "importedAt": "2025-07-19T13:12:45.000Z",
    "employees": [ ... ]
  },
  ...
]
```

---

## 📌 3. Récupérer un import par ID (`GET /api/file-imports/[id]`)

### ✅ Réponse :

```json
{
  "id": 1,
  "fileName": "employes_juillet.csv",
  "importedAt": "2025-07-19T13:12:45.000Z",
  "employees": [
    { "id": 101, "nom": "Alice", "email": "alice@mail.com", "poste": "RH", "salaire": 2500 }
  ]
}
```

---

## ✏️ 4. Modifier un import (`PUT /api/file-imports/[id]`)

* Cette méthode :

  * Met à jour le nom du fichier et la date d’import
  * Supprime les employés supprimés
  * Met à jour les existants (avec leur ID)
  * Crée les nouveaux (sans ID)

### 🔧 Body attendu :

```json
{
  "fileName": "maj_juillet.csv",
  "importedAt": "2025-07-19T15:00:00Z",
  "employees": [
    { "id": 101, "nom": "Alice", "email": "alice@new.com", "poste": "RH", "salaire": 2700 },
    { "nom": "Charlie", "email": "charlie@mail.com", "poste": "Admin", "salaire": 2400 }
  ]
}
```

### ✅ Réponse :

```json
{
  "id": 1,
  "fileName": "maj_juillet.csv",
  "importedAt": "2025-07-19T15:00:00Z"
}
```

---

## 🗑️ 5. Supprimer un import (`DELETE /api/file-imports/[id]`)

* Supprime l'importation et tous les employés associés.

### ✅ Réponse :

```json
{
  "message": "Importation supprimée avec succès"
}
```

---

## 📄 6. Exporter en fichier Excel (`GET /api/file-imports/[id]/export`)

* Retourne un fichier `.xlsx` contenant les colonnes : `Nom`, `Email`, `Salaire`, `Poste`.

### 📅 Réponse :

* Header :

  * `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  * `Content-Disposition: attachment; filename=employes_[id].xlsx`
* Body : Fichier Excel à télécharger

---

## 🛡️ Recommandations de développement

* Toujours valider les données côté client **et** serveur.
* Utiliser l’ID d’un employé pour détecter s’il s’agit d’une mise à jour ou d’une création.
* Les opérations critiques (`PUT`, `DELETE`) sont **transactionnelles** pour assurer la cohérence des données.
* Prévoir une protection par authentification ou token sur les routes sensibles (`PUT`, `DELETE`, `/export`).

---

## 📚 Technologies utilisées

* **Next.js API Routes** (`app/api`)
* **Prisma ORM** (PostgreSQL, SQLite, etc.)
* **Zod** (validation de schéma)
* **xlsx** (`SheetJS`) pour la génération de fichiers Excel

---

## 🚀 Pour aller plus loin

* Ajouter un champ `status` à l’import pour suivre le traitement (en attente, traité, rejeté).
* Permettre l’import via fichier CSV au lieu de données JSON.
* Ajouter des tests via `Jest` ou `Supertest`.
