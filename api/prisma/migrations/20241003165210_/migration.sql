/*
  Warnings:

  - You are about to drop the `_MoodTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_MoodTags";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "MoodTag" (
    "moodId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("moodId", "tagId"),
    CONSTRAINT "MoodTag_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "Mood" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MoodTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
