import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

let _supabaseAdmin: SupabaseClient | null = null;

function assertSupabaseEnv() {
  if (!ENV.supabaseUrl) {
    throw new Error("supabaseUrl is required.");
  }
  if (!ENV.supabaseServiceRoleKey) {
    throw new Error("supabaseServiceRoleKey is required.");
  }
}

export function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  assertSupabaseEnv();

  _supabaseAdmin = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

// Keeps existing imports working while delaying creation until first real use.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getSupabaseAdmin(), prop, receiver);
  },
});

export interface MarketplaceUser {
  id: number;
  open_id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  is_creator: boolean;
  creator_verified: boolean;
  stripe_customer_id: string | null;
  stripe_connect_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: number;
  creator_id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: string;
  currency: string;
  preview_images: string[] | null;
  download_url: string | null;
  file_size: number | null;
  file_type: string | null;
  rating: string;
  review_count: number;
  download_count: number;
  status: "draft" | "published" | "archived";
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  buyer_id: number;
  rating: number;
  comment: string | null;
  helpful: number;
  unhelpful: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  stripe_payment_intent_id: string | null;
  total_amount: string;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded" | "cancelled";
  items: Array<{
    product_id: number;
    price: string;
    creator_id: number;
  }> | null;
  download_links: Array<{
    product_id: number;
    url: string;
    expires_at: string;
  }> | null;
  shipping_address: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  added_at: string;
}

export interface Wishlist {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
}

export interface Follower {
  id: number;
  follower_id: number;
  creator_id: number;
  created_at: string;
}

type EnsureMarketplaceUserInput = {
  openId: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  isCreator?: boolean;
};

function client() {
  return getSupabaseAdmin();
}

export const db = {
  async getUserByOpenId(openId: string) {
    const { data, error } = await client()
      .from("marketplace_users")
      .select("*")
      .eq("open_id", openId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as MarketplaceUser | null;
  },

  async createUser(openId: string, email: string | null, name: string | null) {
    const { data, error } = await client()
      .from("marketplace_users")
      .insert([{ open_id: openId, email, name }])
      .select()
      .single();

    if (error) throw error;
    return data as MarketplaceUser;
  },

  async updateUser(userId: number, updates: Partial<MarketplaceUser>) {
    const { data, error } = await client()
      .from("marketplace_users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as MarketplaceUser;
  },

  async ensureMarketplaceUser(input: EnsureMarketplaceUserInput) {
    const existingUser = await this.getUserByOpenId(input.openId);
    const creatorFlag = Boolean(input.isCreator);

    if (!existingUser) {
      const { data, error } = await client()
        .from("marketplace_users")
        .insert([
          {
            open_id: input.openId,
            name: input.name ?? null,
            email: input.email ?? null,
            avatar: input.avatar ?? null,
            bio: input.bio ?? null,
            is_creator: creatorFlag,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as MarketplaceUser;
    }

    const updates: Partial<MarketplaceUser> = {};

    if (input.name !== undefined && input.name !== existingUser.name) {
      updates.name = input.name;
    }
    if (input.email !== undefined && input.email !== existingUser.email) {
      updates.email = input.email;
    }
    if (input.avatar !== undefined && input.avatar !== existingUser.avatar) {
      updates.avatar = input.avatar;
    }
    if (input.bio !== undefined && input.bio !== existingUser.bio) {
      updates.bio = input.bio;
    }
    if (creatorFlag && !existingUser.is_creator) {
      updates.is_creator = true;
    }

    if (Object.keys(updates).length === 0) {
      return existingUser;
    }

    return await this.updateUser(existingUser.id, updates);
  },

  async getPublishedProducts(limit = 50, offset = 0) {
    const { data, error } = await client()
      .from("products")
      .select("*, creator:marketplace_users(name, avatar, is_creator)")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getProductsByCategory(categoryId: number, limit = 50, offset = 0) {
    const { data, error } = await client()
      .from("products")
      .select("*, creator:marketplace_users(name, avatar, is_creator)")
      .eq("category_id", categoryId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  },

  async getProductBySlug(slug: string) {
    const { data, error } = await client()
      .from("products")
      .select("*, creator:marketplace_users(name, avatar, bio, is_creator)")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async getProductById(productId: number) {
    const { data, error } = await client()
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as Product | null;
  },

  async searchProducts(query: string, categoryId?: number, limit = 50) {
    let qb = client()
      .from("products")
      .select("*, creator:marketplace_users(name, avatar, is_creator)")
      .eq("status", "published")
      .ilike("title", `%${query}%`);

    if (categoryId) {
      qb = qb.eq("category_id", categoryId);
    }

    const { data, error } = await qb.limit(limit);
    if (error) throw error;
    return data;
  },

  async createProduct(creatorId: number, productData: Partial<Product>) {
    const { data, error } = await client()
      .from("products")
      .insert([{ creator_id: creatorId, ...productData }])
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async updateProduct(productId: number, updates: Partial<Product>) {
    const { data, error } = await client()
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async getCategories() {
    const { data, error } = await client()
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data as Category[];
  },

  async createOrder(buyerId: number, items: Order["items"], totalAmount: string) {
    const { data, error } = await client()
      .from("orders")
      .insert([
        {
          buyer_id: buyerId,
          items,
          total_amount: totalAmount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async updateOrder(orderId: number, updates: Partial<Order>) {
    const { data, error } = await client()
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async getOrder(orderId: number) {
    const { data, error } = await client()
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as Order | null;
  },

  async getUserOrders(userId: number) {
    const { data, error } = await client()
      .from("orders")
      .select("*")
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  async createReview(productId: number, buyerId: number, rating: number, comment?: string) {
    const { data, error } = await client()
      .from("reviews")
      .insert([{ product_id: productId, buyer_id: buyerId, rating, comment }])
      .select()
      .single();

    if (error) throw error;
    return data as Review;
  },

  async getProductReviews(productId: number) {
    const { data, error } = await client()
      .from("reviews")
      .select("*, buyer:marketplace_users(name, avatar)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToCart(userId: number, productId: number) {
    const { data, error } = await client()
      .from("cart_items")
      .insert([{ user_id: userId, product_id: productId }])
      .select()
      .single();

    if (error) throw error;
    return data as CartItem;
  },

  async removeFromCart(cartItemId: number, userId?: number) {
    let query = client()
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (userId !== undefined) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;

    if (error) throw error;
  },

  async getUserCart(userId: number) {
    const { data, error } = await client()
      .from("cart_items")
      .select("*, product:products(*, creator:marketplace_users(name))")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async getTopCreators(limit = 10) {
    const { data, error } = await client()
      .from("marketplace_users")
      .select(
        `
        id,
        name,
        avatar,
        bio,
        is_creator,
        creator_verified,
        products:products(count),
        followers:followers(count)
      `
      )
      .eq("is_creator", true)
      .eq("creator_verified", true)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async addToWishlist(userId: number, productId: number) {
    const { data, error } = await client()
      .from("wishlists")
      .insert([{ user_id: userId, product_id: productId }])
      .select()
      .single();

    if (error) throw error;
    return data as Wishlist;
  },

  async removeFromWishlist(userId: number, productId: number) {
    const { error } = await client()
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
  },

  async getUserWishlist(userId: number) {
    const { data, error } = await client()
      .from("wishlists")
      .select("*, product:products(*)")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async followCreator(followerId: number, creatorId: number) {
    const { data, error } = await client()
      .from("followers")
      .insert([{ follower_id: followerId, creator_id: creatorId }])
      .select()
      .single();

    if (error) throw error;
    return data as Follower;
  },

  async unfollowCreator(followerId: number, creatorId: number) {
    const { error } = await client()
      .from("followers")
      .delete()
      .eq("follower_id", followerId)
      .eq("creator_id", creatorId);

    if (error) throw error;
  },

  async getCreatorFollowers(creatorId: number) {
    const { data, error } = await client()
      .from("followers")
      .select("count")
      .eq("creator_id", creatorId);

    if (error) throw error;
    return data?.[0]?.count ?? 0;
  },
};
