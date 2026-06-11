-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Wallet_userId_isDefault_idx" ON "Wallet"("userId", "isDefault");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_senderId_idx" ON "Transaction"("senderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_senderId_status_idx" ON "Transaction"("senderId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_senderId_createdAt_idx" ON "Transaction"("senderId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_recipient_idx" ON "Transaction"("recipient");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BlacklistedToken_expiresAt_idx" ON "BlacklistedToken"("expiresAt");
