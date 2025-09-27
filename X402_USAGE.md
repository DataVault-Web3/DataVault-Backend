# X402 Payment Middleware Usage

This backend uses the official `x402-express` middleware for web3 payments without requiring user login/signup.

## How it works

1. **Public endpoints** - Available without payment:
   - `GET /datasets` - List public datasets
   - `GET /datasets/:id` - View dataset details
   - `GET /datasets/search?q=query` - Search datasets
   - `GET /datasets/category/:category` - Filter by category
   - `GET /datasets/stats` - Get statistics

2. **Protected endpoints** - Require X402 payment ($0.01 each):
   - `GET /datasets/all` - List all datasets (including private)
   - `GET /datasets/:id/download` - Download dataset

3. **Payment endpoints**:
   - `GET /payment/instructions` - Get payment instructions
   - `GET /payment/verify` - Verify payment status

## Client Integration

The X402 middleware automatically handles payment verification. When accessing protected endpoints:

1. Client makes request to protected endpoint
2. If no valid payment, server returns 402 with payment instructions
3. Client processes payment using X402 protocol
4. Client retries request with payment proof
5. Server grants access after verification

### Example client flow:

```javascript
// 1. Access protected resource (will return 402 if no payment)
const response = await fetch('/datasets/all');

if (response.status === 402) {
  // 2. Get payment instructions from 402 response
  const paymentInstructions = await response.json();
  
  // 3. Process payment (using X402 client library)
  const paymentProof = await x402Client.pay(paymentInstructions);
  
  // 4. Retry request with payment proof
  const datasets = await fetch('/datasets/all', {
    headers: {
      'X-PAYMENT': JSON.stringify(paymentProof)
    }
  }).then(r => r.json());
}
```

## Environment Variables

```env
X402_WALLET_ADDRESS=0xCA3953e536bDA86D1F152eEfA8aC7b0C82b6eC00
X402_FACILITATOR_URL=https://x402.polygon.technology
```

## Response Codes

- `200` - Success (payment verified)
- `402` - Payment Required (includes payment instructions in response body)

The middleware automatically handles payment verification and route protection.
