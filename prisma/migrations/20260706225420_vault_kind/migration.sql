-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EnvFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'ENV',
    "contentEncrypted" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnvFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EnvFile" ("contentEncrypted", "createdAt", "id", "name", "updatedAt", "userId") SELECT "contentEncrypted", "createdAt", "id", "name", "updatedAt", "userId" FROM "EnvFile";
DROP TABLE "EnvFile";
ALTER TABLE "new_EnvFile" RENAME TO "EnvFile";
CREATE INDEX "EnvFile_userId_kind_idx" ON "EnvFile"("userId", "kind");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
