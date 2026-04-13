import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../supabase";
import { TRPCError } from "@trpc/server";
import type { User } from "../../drizzle/schema";

function isCreatorRole(role: User["role"]) {
  return role === "creator" || role === "admin";
}

async function getMarketplaceUserOrThrow(user: User) {
  const marketplaceUser = await db.ensureMarketplaceUser({
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    avatar: user.avatar ?? null,
    bio: user.bio ?? null,
    isCreator: isCreatorRole(user.role),
  });

  if (!marketplaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User profile not found",
    });
  }

  return marketplaceUser;
}

export const marketplaceRouter = router({
  // Category operations
  categories: {
    list: publicProcedure.query(async () => {
      return await db.getCategories();
    }),
  },

  // Product operations
  products: {
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
          categoryId: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        if (input.categoryId) {
          return await db.getProductsByCategory(input.categoryId, input.limit, input.offset);
        }
        return await db.getPublishedProducts(input.limit, input.offset);
      }),

    search: publicProcedure
      .input(
        z.object({
          query: z.string().min(1),
          categoryId: z.number().optional(),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        return await db.searchProducts(input.query, input.categoryId, input.limit);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductBySlug(input.slug);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }
        return product;
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          description: z.string().optional(),
          shortDescription: z.string().optional(),
          price: z.string().regex(/^\d+(\.\d{2})?$/),
          categoryId: z.number(),
          previewImages: z.array(z.string()).optional(),
          downloadUrl: z.string().optional(),
          fileSize: z.number().optional(),
          fileType: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        if (!user.is_creator) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only creators can upload products",
          });
        }

        return await db.createProduct(user.id, {
          title: input.title,
          slug: input.slug,
          description: input.description,
          short_description: input.shortDescription,
          price: input.price as any,
          category_id: input.categoryId,
          preview_images: input.previewImages,
          download_url: input.downloadUrl,
          file_size: input.fileSize,
          file_type: input.fileType,
          status: "draft",
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          previewImages: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        // Verify ownership
        const product = await db.getProductById(input.productId);
        if (!product || product.creator_id !== user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only edit your own products",
          });
        }

        return await db.updateProduct(input.productId, {
          title: input.title,
          description: input.description,
          price: input.price as any,
          status: input.status,
          preview_images: input.previewImages,
        });
      }),
  },

  // Review operations
  reviews: {
    getByProduct: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductReviews(input.productId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        return await db.createReview(input.productId, user.id, input.rating, input.comment);
      }),
  },

  // Cart operations
  cart: {
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getMarketplaceUserOrThrow(ctx.user);

      return await db.getUserCart(user.id);
    }),

    addItem: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        return await db.addToCart(user.id, input.productId);
      }),

    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);
        await db.removeFromCart(input.cartItemId, user.id);
        return { success: true };
      }),
  },

  // Order operations
  orders: {
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = await getMarketplaceUserOrThrow(ctx.user);

      return await db.getUserOrders(user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          items: z.array(
            z.object({
              product_id: z.number(),
              price: z.string(),
              creator_id: z.number(),
            })
          ),
          totalAmount: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        return await db.createOrder(user.id, input.items, input.totalAmount);
      }),

    get: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        const order = await db.getOrder(input.orderId);
        if (!order || order.buyer_id !== user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only view your own orders",
          });
        }

        return order;
      }),
  },

  // Creator operations
  creators: {
    topCreators: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return await db.getTopCreators(input.limit);
      }),

    follow: protectedProcedure
      .input(z.object({ creatorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        return await db.followCreator(user.id, input.creatorId);
      }),

    unfollow: protectedProcedure
      .input(z.object({ creatorId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        await db.unfollowCreator(user.id, input.creatorId);
        return { success: true };
      }),
  },

  // Wishlist operations
  wishlist: {
    get: protectedProcedure.query(async ({ ctx }) => {
      const user = await getMarketplaceUserOrThrow(ctx.user);

      return await db.getUserWishlist(user.id);
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        return await db.addToWishlist(user.id, input.productId);
      }),

    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = await getMarketplaceUserOrThrow(ctx.user);

        await db.removeFromWishlist(user.id, input.productId);
        return { success: true };
      }),
  },
});
