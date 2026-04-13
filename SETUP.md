# Snackify Marketplace - Setup Guide

## Database Setup (Supabase)

### Step 1: Create Tables Manually in Supabase

Since the automated SQL execution might have limitations, please follow these steps to create the database schema:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: **gjfgpvzrvziricirffcb**
3. Navigate to **SQL Editor**
4. Create a new query
5. Copy the entire content from `supabase/init.sql`
6. Execute the SQL

This will create all necessary tables with proper relationships and Row Level Security (RLS) policies.

### Step 2: Insert Sample Categories

After creating the tables, run this SQL in the Supabase SQL Editor:

```sql
INSERT INTO categories (name, slug, description, color, display_order) VALUES
  ('Food & Snacks', 'food-snacks', 'Digital products for food and snack businesses', '#FF6B6B', 1),
  ('Design Resources', 'design-resources', 'Design templates, icons, and creative assets', '#4ECDC4', 2),
  ('Business Tools', 'business-tools', 'Templates and tools for business operations', '#95E1D3', 3);
```

### Step 3: Configure RLS Policies

The SQL schema includes Row Level Security policies. Verify they are enabled:

1. Go to **Authentication → Policies** in Supabase
2. Ensure RLS is enabled for all marketplace tables
3. Verify the policies match those in `supabase/init.sql`

## Environment Variables

The following environment variables are already configured in your Manus project:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key for frontend
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for backend

## Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `categories` | Product categories (Food & Snacks, Design Resources, Business Tools) |
| `marketplace_users` | Extended user profiles with creator information |
| `products` | Digital products available for sale |
| `reviews` | Product reviews and ratings |
| `orders` | Purchase orders and transaction history |
| `cart_items` | Shopping cart items |
| `payouts` | Creator earnings and payouts |
| `followers` | Creator-follower relationships |
| `wishlists` | User favorite products |

### Key Relationships

- **Users → Products**: One creator has many products
- **Users → Orders**: One buyer has many orders
- **Products → Reviews**: One product has many reviews
- **Products → Orders**: Products are ordered through orders
- **Users → Followers**: Users can follow creators

## API Endpoints

All marketplace features are available through tRPC procedures:

### Products
- `marketplace.products.list` - Get published products with pagination
- `marketplace.products.search` - Search products by query and filters
- `marketplace.products.getBySlug` - Get single product details
- `marketplace.products.create` - Create new product (creator only)
- `marketplace.products.update` - Update product details (creator only)

### Categories
- `marketplace.categories.list` - Get all categories

### Reviews
- `marketplace.reviews.getByProduct` - Get product reviews
- `marketplace.reviews.create` - Submit product review (authenticated)

### Cart
- `marketplace.cart.get` - Get user's cart items
- `marketplace.cart.addItem` - Add product to cart
- `marketplace.cart.removeItem` - Remove from cart

### Orders
- `marketplace.orders.list` - Get user's order history
- `marketplace.orders.create` - Create new order
- `marketplace.orders.get` - Get order details

### Creators
- `marketplace.creators.topCreators` - Get featured creators
- `marketplace.creators.follow` - Follow a creator
- `marketplace.creators.unfollow` - Unfollow a creator

### Wishlist
- `marketplace.wishlist.get` - Get user's wishlist
- `marketplace.wishlist.add` - Add product to wishlist
- `marketplace.wishlist.remove` - Remove from wishlist

## File Upload & Storage

Products use S3 storage for download files:

1. Use `storagePut()` from `server/storage.ts` to upload product files
2. Store the returned URL in the `download_url` field
3. Files are automatically available for download after purchase

## Stripe Integration

Stripe integration is configured for payment processing:

1. Add your Stripe keys in **Settings → Payment**
2. Stripe webhook endpoint: `/api/stripe/webhook`
3. Payment flow: Cart → Checkout → Order Creation → Download

## Next Steps

1. ✅ Database schema created
2. ✅ API endpoints configured
3. ⏳ Build frontend UI components
4. ⏳ Implement Stripe checkout
5. ⏳ Add product upload forms
6. ⏳ Create admin dashboard

## Troubleshooting

### RLS Policy Errors

If you get "permission denied" errors:
1. Check that RLS is enabled on the table
2. Verify the policy allows the operation
3. Ensure `auth.uid()` matches the user's auth ID

### Missing Tables

If queries fail with "table does not exist":
1. Re-run the SQL schema from `supabase/init.sql`
2. Check the Supabase SQL Editor for errors
3. Verify the project URL and keys are correct

### Authentication Issues

If users can't log in:
1. Verify Manus OAuth is configured
2. Check that `marketplace_users` table has the user's auth ID
3. Ensure RLS policies allow user access

## Support

For issues with Supabase, visit: https://supabase.com/docs
For Snackify-specific questions, check the project README.
