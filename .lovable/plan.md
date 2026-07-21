Add a shared, per-product rating and reviews system so any user analyzing the same product sees the community's stars and comments.

## Data model (migration)

New table `public.products` (canonical catalog, auto-populated when someone analyzes a product):
- `name`, `brand`, `category`, `image_url`
- `normalized_key` (unique, lowercase `brand|name`) — used to dedupe entries
- `avg_rating` numeric(3,2) default 0, `reviews_count` int default 0

New table `public.product_reviews`:
- `product_id` → products.id (on delete cascade)
- `user_id` → auth.users.id
- `rating` smallint 1–5 (CHECK constraint)
- `comment` text, max 1000 chars (CHECK)
- `UNIQUE(product_id, user_id)` — one review per user, editable
- `created_at`, `updated_at` (+ trigger)

Aggregation:
- Trigger `refresh_product_rating()` on insert/update/delete of `product_reviews` recomputes `avg_rating` and `reviews_count` on `products`.

RLS + GRANTs:
- `products`: SELECT to `authenticated`; INSERT/UPDATE to `authenticated` (upsert on analyze; only safe fields).
- `product_reviews`: SELECT to `authenticated` (public feed); INSERT/UPDATE/DELETE only where `auth.uid() = user_id`.
- No `anon` grants.
- Reviewer display name comes from existing `profiles.display_name` (already readable per current policy) — no schema change there.

## Backend flow

In `Products.tsx`, after a successful analysis:
1. Upsert into `products` by `normalized_key` (name/brand/category/image_url). Store returned `product_id` alongside the result.
2. Load reviews for that `product_id` joined with `profiles.display_name`, ordered by newest.
3. Show aggregate: big star + `avg_rating` (1 decimal) + `(reviews_count) avaliações`.

When user opens a past search from history, resolve `product_id` the same way (upsert-by-key) so reviews still show.

## UI (Products.tsx)

Below the "Veredicto" card, add a "Avaliações da comunidade" card:
- Header: 5-star row (filled by `avg_rating`), numeric average, review count.
- User's own review block (top): star picker (1–5) + textarea (max 500 chars, live counter) + Salvar/Atualizar/Excluir. If the user already reviewed, prefill.
- Reviews list: each row shows author display name (or "Usuário"), date, filled stars, comment. Empty state: "Seja a primeira pessoa a avaliar".

Validation with `zod`:
```ts
const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});
```

Toast on save/delete errors. No console logging of form values.

## Files touched

- New migration `supabase/migrations/<ts>_product_reviews.sql` (tables, trigger, RLS, grants).
- `src/pages/Products.tsx`: upsert product after analysis, new Reviews section + form.
- No changes to edge functions or types file (types regenerate post-migration).

## Out of scope

- Moderation, reporting, upvotes, replies, avatars, image uploads in reviews — can be added later if you want the "social" surface to grow.
