-- Migrates marketplace identity from Supabase auth UUIDs to Manus openId.
-- Apply this on existing databases before deploying the updated server code.

ALTER TABLE marketplace_users
  ADD COLUMN IF NOT EXISTS open_id TEXT;

ALTER TABLE marketplace_users
  ALTER COLUMN auth_id DROP NOT NULL;

ALTER TABLE marketplace_users
  DROP CONSTRAINT IF EXISTS marketplace_users_auth_id_fkey;

ALTER TABLE marketplace_users
  DROP CONSTRAINT IF EXISTS marketplace_users_auth_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS marketplace_users_open_id_key
  ON marketplace_users(open_id)
  WHERE open_id IS NOT NULL;

DROP POLICY IF EXISTS "Users can update their own profile" ON marketplace_users;
DROP POLICY IF EXISTS "Creators can manage their own products" ON products;
DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can create reviews for products they purchased" ON reviews;
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Users can follow creators" ON followers;
DROP POLICY IF EXISTS "Users can unfollow creators" ON followers;

DROP POLICY IF EXISTS "Anyone can view published products" ON products;
CREATE POLICY "Anyone can view published products" ON products
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
CREATE POLICY "Users can view their own cart items" ON cart_items
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (false);

DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlists;
CREATE POLICY "Users can view their own wishlist" ON wishlists
  FOR SELECT USING (false);
