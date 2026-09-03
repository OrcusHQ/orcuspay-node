# OrcusPay Node.js SDK

Official Node.js SDK for the [OrcusPay](https://orcuspay.com) payment API. Zero dependencies.

## Installation

```bash
npm install @orcustech/orcuspay
```

## Quick Start

```typescript
import { OrcusPay } from '@orcustech/orcuspay'

const orcus = new OrcusPay({
  accessKey: 'your_access_key',
  secretKey: 'your_secret_key',
})

// Create a checkout session
const session = await orcus.createCheckoutSession({
  success_url: 'https://yoursite.com/success?session={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yoursite.com/cancel',
  line_items: [
    {
      quantity: 1,
      price_data: {
        unit_amount: 50000, // 500.00 BDT in paisa
        product_data: {
          name: 'Premium Plan',
        },
      },
    },
  ],
})

// Redirect customer to session.url
console.log(session.url)
```

## Authentication

Get your API keys from the [OrcusPay Dashboard](https://dash.orcuspay.com) under **Developers > API Keys**.

- Keys prefixed with `_test_` use sandbox mode
- Keys prefixed with `_prod_` use live mode

```typescript
// Test mode
const testClient = new OrcusPay({
  accessKey: 'ak_test_...',
  secretKey: 'sk_test_...',
})

// Live mode
const liveClient = new OrcusPay({
  accessKey: 'ak_prod_...',
  secretKey: 'sk_prod_...',
})
```

## API Reference

### `new OrcusPay(config)`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `accessKey` | `string` | Yes | Your API access key |
| `secretKey` | `string` | Yes | Your API secret key |
| `baseUrl` | `string` | No | API base URL (default: `https://brain.orcuspay.com/api/v1`) |

---

### Checkout Sessions

#### `createCheckoutSession(params)`

Create a hosted checkout page for collecting payments.

```typescript
const session = await orcus.createCheckoutSession({
  success_url: 'https://yoursite.com/success?session={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://yoursite.com/cancel',
  line_items: [
    {
      quantity: 1,
      price_data: {
        unit_amount: 50000, // amount in paisa (500.00 BDT)
        product_data: {
          name: 'T-Shirt',
          description: 'Cotton t-shirt, size M',
        },
      },
    },
  ],
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '01712345678',
  },
  meta_data: {
    order_id: 'ORD-123',
  },
})
```

URL placeholders in `success_url` and `cancel_url`:
- `{CHECKOUT_SESSION_ID}` — the checkout session ID
- `{PAYMENT_ID}` — the payment ID
- `{REFERENCE}` — the payment reference

#### `getCheckoutSession(id)`

Retrieve a checkout session by ID.

```typescript
const session = await orcus.getCheckoutSession('pay_abc123')
console.log(session.payment_status) // 'SUCCEEDED' | 'PENDING' | 'FAILED'
```

---

### Payments

#### `listPayments(params?)`

List payments with cursor-based pagination.

```typescript
const { data: payments, meta } = await orcus.listPayments({
  limit: 10,
  status: 'SUCCEEDED',
})

// Next page
if (meta.has_more) {
  const next = await orcus.listPayments({
    cursor: meta.next_cursor!,
  })
}
```

#### `getPayment(id)`

Retrieve a single payment.

```typescript
const payment = await orcus.getPayment('pay_abc123')
```

---

### Payment Links

#### `createPaymentLink(params)`

Create a shareable payment link.

```typescript
const link = await orcus.createPaymentLink({
  title: 'Donation',
  amount: 500, // 500 BDT
  description: 'Support our cause',
  is_reusable: true,
  success_url: 'https://yoursite.com/thanks',
})

console.log(link.url)
```

#### `listPaymentLinks(params?)`

```typescript
const { data: links, meta } = await orcus.listPaymentLinks({ limit: 20 })
```

#### `getPaymentLink(id)`

```typescript
const link = await orcus.getPaymentLink('pl_abc123')
```

---

### Status

#### `status()`

Check the API status.

```typescript
const info = await orcus.status()
// { name: 'OrcusPay API', version: '2026-05-13', status: 'ok', ... }
```

---

## Error Handling

```typescript
import { OrcusPay, OrcusPayError } from '@orcustech/orcuspay'

try {
  const payment = await orcus.getPayment('invalid_id')
} catch (err) {
  if (err instanceof OrcusPayError) {
    console.log(err.code)    // 'not_found'
    console.log(err.message) // 'Payment not found'
    console.log(err.status)  // 404
  }
}
```

## Webhook Verification

When a payment completes, OrcusPay sends a webhook to your configured URL. See the [webhook documentation](https://dash.orcuspay.com/developers) for setup instructions.

## License

MIT
