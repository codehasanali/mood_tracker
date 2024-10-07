/*
  Warnings:

  - You are about to drop the `UserFood` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Food` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Food` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserFood";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Food" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Food_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Food" ("calories", "id", "name") SELECT "calories", "id", "name" FROM "Food";
DROP TABLE "Food";
ALTER TABLE "new_Food" RENAME TO "Food";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
