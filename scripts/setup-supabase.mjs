#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

console.log("🔧 Initializing Supabase database...");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read and execute SQL schema
const sqlPath = path.join(__dirname, "../supabase/init.sql");
const sql = fs.readFileSync(sqlPath, "utf-8");

// Split SQL into individual statements
const statements = sql
  .split("--")
  .filter((stmt) => stmt.trim() && !stmt.startsWith(">"))
  .map((stmt) => {
    // Remove comments and clean up
    return stmt
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim();
  })
  .filter((stmt) => stmt.length > 0);

async function executeSql() {
  try {
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.substring(0, 50) + "...");
        const { error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          console.warn("⚠️  Statement warning:", error.message);
        }
      }
    }

    console.log("✅ Database initialized successfully!");

    // Insert sample categories
    console.log("\n📁 Adding sample categories...");
    const categories = [
      {
        name: "Food & Snacks",
        slug: "food-snacks",
        description: "Digital products for food and snack businesses",
        color: "#FF6B6B",
        display_order: 1,
      },
      {
        name: "Design Resources",
        slug: "design-resources",
        description: "Design templates, icons, and creative assets",
        color: "#4ECDC4",
        display_order: 2,
      },
      {
        name: "Business Tools",
        slug: "business-tools",
        description: "Templates and tools for business operations",
        color: "#95E1D3",
        display_order: 3,
      },
    ];

    const { error: catError } = await supabase
      .from("categories")
      .insert(categories);

    if (catError) {
      console.warn("⚠️  Could not insert categories:", catError.message);
    } else {
      console.log("✅ Categories added successfully!");
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

executeSql();
