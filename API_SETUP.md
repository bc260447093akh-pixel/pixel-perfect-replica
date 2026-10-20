# Connect your marketplace

1. Set `VITE_API_BASE_URL` in `.env` to the complete base URL including `/api`, for example `https://your-domain.com/api`. The URL is public, not a secret.
2. Allow the preview and published website origins in your backend CORS configuration. Allow `Accept`, `Content-Type`, and `Authorization` headers and GET/POST/PUT/PATCH/DELETE/OPTIONS. Production needs HTTPS.
3. Rebuild/publish after changing a Vite environment variable. Blank URL shows clearly labelled sample products. Failed live requests show errors, never fake success or silently substitute preview data.

## Implemented endpoints

- Auth: register, login, me, logout, refresh.
- Public catalog: paginated products, search, vendor ID filter, single product by slug.
- Customer: checkout with PKR shipping amount and jazzcash/easypaisa/cod, paginated orders.
- Vendor: profile read/update, public products filtered to the shop, product create/update/delete, orders, earnings.
- Admin: stats, paginated vendor approvals/rejections, earnings.

Tokens are stored in localStorage as permitted by your guide, attached as bearer tokens, and cleared on 401 with navigation to login. Keep the website free of untrusted scripts; HttpOnly cookies would require a backend auth contract change. Protected data is fetched only after a session is restored; backend permissions remain authoritative. Cart is tab-local sessionStorage, not a server-side cart endpoint (none was supplied).

## Contract details to confirm with your backend

- Product samples are invented placeholders, including their prices and seller names. They are never submitted to checkout. Replace them with real catalog rows by setting the base URL.
- Your guide does not define how flat and percentage discounts combine. The preview uses flat discount first; backend checkout totals are authoritative. Change this rule if your backend differs.
- Shipping has no quoted rate endpoint. Checkout exposes the documented `shipping_amount` field, starting at zero rather than inventing a fee. Backend must validate or calculate shipping amounts itself.
- No shipping address, phone, or JazzCash/Easypaisa authorization/redirect contract was supplied. Checkout submits exactly the provided contract; the server response is shown, without pretending that an external payment flow ran.
- No private vendor-product listing endpoint was supplied. The seller table uses `GET /products?vendor_id=...`, so inactive products are visible only if that public endpoint returns them. Add a private listing endpoint to manage hidden products comprehensively.
- Orders, ledgers and vendor lists assume `data` arrays plus optional pagination links; raw arrays are also supported for rows. Adjust adapters if these unspecified response envelopes differ.

No browser automation was performed. Live API checks remain blocked until the reachable API base URL is supplied.