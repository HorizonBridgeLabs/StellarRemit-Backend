-- Add email verification fields to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;

-- Add fee field to Transaction
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "fee" DECIMAL(20, 7) NOT NULL DEFAULT 0;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS "User_verificationToken_idx" ON "User"("verificationToken");
