import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// 🚀 DATABASE SEEDER SCRIPT
// Maqsad: System ko test karne ke liye ek Master Merchant insert karna.

const sql = neon(process.env.DATABASE_URL);

const seedDatabase = async () => {
  try {
    console.log("⏳ Seeding database...");

    // 1. Password Hash (Bcrypt)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt); // Default testing password

    // 2. Raw SQL Insert (using Drizzle's Neon connection)
    // Blueprint: Hybrid schema with JSONB defaults
    await sql`
            INSERT INTO merchants (
                store_name, domain_url, email, password, 
                theme_config, ui_components, geo_settings, localization
            ) VALUES (
                'Master Store', 'master.local', 'admin@store.com', ${hashedPassword},
                '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
            )
        `;

    console.log(
      "✅ First Admin seeded successfully! Email: admin@store.com | Pass: admin123",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
