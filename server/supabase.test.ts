import { describe, it, expect, beforeAll } from "vitest";
import { db, getSupabaseAdmin } from "./supabase";

const hasSupabaseEnv = Boolean(
  process.env.VITE_SUPABASE_URL &&
    process.env.VITE_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const describeSupabase = hasSupabaseEnv ? describe : describe.skip;

describeSupabase("Supabase Integration", () => {
  beforeAll(() => {
    // Verify environment variables are set
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
  });

  it("should connect to Supabase with valid credentials", async () => {
    // Test basic connection by querying categories
    const categories = await db.getCategories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it("should have categories table with sample data", async () => {
    const categories = await db.getCategories();
    expect(categories.length).toBeGreaterThan(0);

    // Check for expected categories
    const categoryNames = categories.map((c) => c.name);
    expect(categoryNames).toContain("Food & Snacks");
    expect(categoryNames).toContain("Design Resources");
    expect(categoryNames).toContain("Business Tools");
  });

  it("should handle database queries without errors", async () => {
    // Test that we can query products (even if empty)
    const products = await db.getPublishedProducts(10, 0);
    expect(Array.isArray(products)).toBe(true);
  });

  it("should verify Supabase admin client is initialized", () => {
    const supabaseAdmin = getSupabaseAdmin();
    expect(supabaseAdmin).toBeDefined();
    expect(supabaseAdmin.from).toBeDefined();
  });
});
