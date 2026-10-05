# Reseller API

Base path: `/api/reseller`. Every endpoint requires `Authorization: Bearer <token>` (the same JWT
returned by `/api/auth` login) **and** a user whose `role` is `reseller`.

| Status | When |
|---|---|
| 401 | No/invalid token, user not found or deactivated |
| 403 | Logged in but not a reseller (`"Reseller access required"`) |

All responses use the existing `{ success, message?, ... }` format.

## Becoming a reseller

An admin sets the role through the existing users API:

```http
PUT /api/admin/users/:id
{ "role": "reseller" }
```

## Products

### `GET /api/reseller/products`

Query: `page` (default 1), `limit` (default 12, max 100), `search`, `category`, `subCategory`.

Only products that are **active**, have **Available for resellers** enabled, and have a
**reseller price > 0** are returned.

```json
{
  "success": true,
  "products": [
    {
      "id": "665f…",
      "title": "Nike Air Max 90",
      "description": "…",
      "image": "https://res.cloudinary.com/…/1.jpg",
      "images": ["…/1.jpg", "…/2.jpg"],
      "sizes": [
        { "size": "41", "available": true },
        { "size": "42", "available": false }
      ],
      "isAvailable": true,
      "resellingPrice": 2500
    }
  ],
  "pagination": { "currentPage": 1, "totalPages": 3, "totalProducts": 30, "limit": 12 }
}
```

Stock quantities, SKUs and retail prices are never included. Products without size variants
have a single size `"One Size"`.

### `GET /api/reseller/products/:id`

`{ "success": true, "product": { …same shape… } }` — 404 if the product does not exist or is
not available for reselling.

## Orders

### `POST /api/reseller/orders`

```json
{
  "items": [
    { "productId": "665f…", "size": "42", "quantity": 2 }
  ],
  "addressInfo": {
    "name": "Customer name",
    "phone": "01711000000",
    "address": "House, road, area",
    "city": "Dhaka",
    "pincode": "1207",
    "notes": "optional"
  },
  "shippingType": "inside",
  "paymentMethod": "COD"
}
```

- A single item can also be sent as top-level `productId`, `size`, `quantity`.
- Up to 20 items; quantity is a whole number from 1 to 50.
- `shippingType`: `inside` (default) or `outside` Dhaka. `paymentMethod`: `COD` (default), `Online`, `Card`.
- **Anything else is ignored**: price, title, image, totals, shipping charge, coupons, status, user IDs.

Server-side pricing:

```
line price   = product.resellerPrice (admin-configured, read at order time)
subtotal     = Σ resellerPrice × quantity
shipping     = same rules as website checkout (sneakers 100/150, others 80/120 inside/outside)
totalAmount  = subtotal + shipping
```

Stock is reserved atomically, so two concurrent orders cannot oversell the last item.

Response `201`:

```json
{
  "success": true,
  "message": "Order placed successfully",
  "order": {
    "id": "…",
    "orderNumber": "SLAB12-CD34-EF",
    "orderStatus": "pending",
    "paymentMethod": "COD",
    "paymentStatus": "pending",
    "items": [
      { "productId": "…", "title": "…", "image": "…", "size": "42", "quantity": 2, "price": 2500, "lineTotal": 5000 }
    ],
    "subtotal": 5000,
    "shippingType": "inside",
    "shippingCharge": 100,
    "totalAmount": 5100,
    "addressInfo": { "…": "…" },
    "trackingNumber": null,
    "courierService": null,
    "statusHistory": [{ "status": "pending", "timestamp": "…", "note": "Order created" }],
    "createdAt": "…",
    "updatedAt": "…",
    "cancelledAt": null
  }
}
```

Errors:

| Status | Message |
|---|---|
| 400 | Validation errors (quantity, address, shippingType, paymentMethod, items) |
| 404 | `Product not found` (unknown, malformed or inactive product) |
| 400 | `<name> is not available for reselling` |
| 400 | `Size X does not exist for <name>` (includes `availableSizes`) |
| 400 | `Size X of <name> is out of stock` |
| 400 | `Requested quantity is not available for <name> (size X)` — the remaining count is not revealed |
| 409 | Stock was taken by another order while this one was being placed |

### `GET /api/reseller/orders`

Query: `page`, `limit` (max 100), `status` (`pending`, `confirmed`, `processing`, `shipped`,
`delivered`, `cancelled`). Returns only the authenticated reseller's orders:

```json
{ "success": true, "orders": [ … ], "pagination": { "currentPage": 1, "totalPages": 1, "totalOrders": 4, "limit": 12 } }
```

### `GET /api/reseller/orders/:id`

`:id` is the order's id or order number. Another reseller's order returns 404.

### `PUT /api/reseller/orders/:id/cancel`

Body (optional): `{ "reason": "Customer changed mind" }`.
Allowed only while the order is `pending`; stock is restored. After the admin confirms the
order, cancellation goes through the admin panel (`PUT /api/admin/orders/:id/cancel`).

## Admin

- Product form (Basic Info tab → **Reseller Program**): "Available for resellers" checkbox and
  "Reseller Price". `POST/PUT /api/admin/products` accept `isResellerAvailable` (boolean) and
  `resellerPrice` (positive number, or `null` to clear). Enabling without a price is rejected.
- Stock is managed exactly as before; reseller availability follows it automatically.
- Reseller orders appear in the normal admin orders list. Filter with
  `GET /api/admin/orders?orderSource=reseller` (or `website`); `resellerId` is populated.
