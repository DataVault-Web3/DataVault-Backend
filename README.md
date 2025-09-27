# Datasets API with X402 Payment Integration

A NestJS REST API server for displaying various datasets information with MongoDB integration and X402 payment system for premium access.

## Features

- **Dataset Management**: CRUD operations for datasets with categories, tags, and metadata
- **MongoDB Integration**: Full database support with Mongoose ODM
- **X402 Payment Integration**: Blockchain-based payment system for premium access
- **JWT Authentication**: Secure user authentication with wallet-based login
- **Paid Access Control**: Middleware to restrict access to premium datasets
- **Public/Private Datasets**: Support for both free and paid datasets

## API Endpoints

### Authentication
- `POST /auth/login` - Login with wallet signature
- `POST /auth/grant-access` - Grant paid access (admin)
- `POST /auth/revoke-access` - Revoke paid access (admin)
- `GET /auth/check-access` - Check if user has paid access

### Datasets
- `GET /datasets` - Get all public datasets
- `GET /datasets/all` - Get all datasets (requires paid access)
- `GET /datasets/stats` - Get dataset statistics
- `GET /datasets/search?q=query` - Search datasets
- `GET /datasets/category/:category` - Get datasets by category
- `GET /datasets/:id` - Get specific dataset
- `POST /datasets` - Create dataset (requires auth)
- `PATCH /datasets/:id` - Update dataset (requires auth)
- `DELETE /datasets/:id` - Delete dataset (requires auth)

### Payment
- `POST /payment/create` - Create payment request
- `POST /payment/verify/:transactionHash` - Verify payment
- `GET /payment/status/:transactionHash` - Get payment status
- `GET /payment/user/:userAddress` - Get user payments (requires auth)
- `GET /payment/validate` - Validate access token

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
```

3. Configure your `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/datasets-api
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
X402_PRIVATE_KEY=your-private-key
X402_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
X402_FACILITATOR_URL=https://your-facilitator-url.com
X402_AMOUNT=1000000000000000000
PORT=3000
NODE_ENV=development
```

4. Start the development server:
```bash
npm run start:dev
```

## Usage

### 1. User Authentication
```javascript
// Login with wallet signature
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: '0x...',
    username: 'user123',
    email: 'user@example.com',
    signature: '0x...' // Signature of "Login to Datasets API"
  })
});
```

### 2. Create Payment Request
```javascript
const payment = await fetch('/payment/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userAddress: '0x...',
    amount: '1000000000000000000' // 1 MATIC in wei
  })
});
```

### 3. Verify Payment
```javascript
const verification = await fetch(`/payment/verify/${transactionHash}`, {
  method: 'POST'
});
```

### 4. Access Premium Datasets
```javascript
// After payment verification, grant access
await fetch('/auth/grant-access', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    userAddress: '0x...',
    accessToken: 'access-token-from-payment'
  })
});

// Now you can access all datasets
const allDatasets = await fetch('/datasets/all', {
  headers: { 'Authorization': `Bearer ${jwtToken}` }
});
```

## X402 Integration

This API integrates with the X402 payment protocol for blockchain-based payments. The integration includes:

- Payment request creation
- Transaction verification
- Access token generation
- Payment status tracking

The X402 service handles:
- Creating payment requests to facilitators
- Verifying on-chain transactions
- Generating access tokens for paid users
- Managing payment status and expiration

## Database Schema

### Dataset Schema
```typescript
{
  name: string;
  description: string;
  category: string;
  size: number;
  format: string;
  source: string;
  lastUpdated: Date;
  tags: string[];
  isPublic: boolean;
  price: number; // in wei
  metadata?: Record<string, any>;
}
```

### Payment Schema
```typescript
{
  userAddress: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  transactionHash: string;
  facilitatorUrl: string;
  accessToken: string;
  expiresAt: Date;
  metadata?: Record<string, any>;
}
```

### User Schema
```typescript
{
  walletAddress: string;
  username: string;
  email: string;
  hasPaidAccess: boolean;
  accessToken?: string;
  accessExpiresAt?: Date;
  lastLoginAt: Date;
}
```

## Development

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## License

ISC
