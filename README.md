# StellarRemit Backend

Production-ready NestJS API for a Stellar-based remittance platform.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Stellar SDK (Testnet/Mainnet)

## Project Structure

```
src/
  auth/           Register, login, JWT strategy & guard
  users/          User profile endpoints
  wallet/         Stellar wallet management & balance fetching
  transactions/   Transaction records & history
  stellar/        Stellar SDK integration (XLM, USDC payments)
  prisma/         Global Prisma service
prisma/
  schema.prisma   User, Wallet, Transaction models
```

## Setup

### 1. Clone & install

```bash
git clone https://github.com/HorizonBridgeLabs/StellarRemit-Backend.git
cd StellarRemit-Backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, STELLAR_SECRET_KEY
```

### 3. Run with Docker

```bash
docker-compose up --build
```

### 4. Run locally

```bash
# Start Postgres, then:
npx prisma migrate dev
npm run start:dev
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | — | Register new user |
| POST | /api/v1/auth/login | — | Login, returns JWT |
| GET | /api/v1/users/me | ✓ | Get current user |
| POST | /api/v1/wallet | ✓ | Set wallet public key |
| GET | /api/v1/wallet/balance | ✓ | Fetch Stellar balances |
| POST | /api/v1/transactions | ✓ | Create transaction |
| GET | /api/v1/transactions | ✓ | List transactions |

## Example Requests

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get balance (replace TOKEN)
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer TOKEN"

# Create transaction
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"GXXXXXX","amount":10,"asset":"XLM"}'
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `STELLAR_NETWORK` | `testnet` or `mainnet` |
| `STELLAR_SECRET_KEY` | Stellar keypair secret for signing transactions |
| `PORT` | Server port (default: 3000) |

## Testing

```bash
npm test
npm run test:cov
```

## Contributing

See [open issues](https://github.com/HorizonBridgeLabs/StellarRemit-Backend/issues) — 50 issues are ready to be assigned.
