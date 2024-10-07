/*
  Warnings:

  - Added the required column `categoryId` to the `Food` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Food" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Food_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Food_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Food" ("calories", "createdAt", "id", "name", "updatedAt", "userId") SELECT "calories", "createdAt", "id", "name", "updatedAt", "userId" FROM "Food";
DROP TABLE "Food";
ALTER TABLE "new_Food" RENAME TO "Food";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
