-- Drop the unique constraint on Wallet.userId
ALTER TABLE "Wallet" DROP CONSTRAINT IF EXISTS "Wallet_userId_key";

-- Add new columns to Wallet
ALTER TABLE "Wallet" ADD COLUMN IF NOT EXISTS "label" TEXT;
ALTER TABLE "Wallet" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Wallet" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
