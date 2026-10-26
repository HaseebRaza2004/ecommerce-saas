import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

/**
 * 🌱 IDEMPOTENT DATABASE SEEDER
 * Why: Creates the first Master Merchant safely without crashing if run multiple times.
 */
const sql = neon(process.env.DATABASE_URL);

const seedDatabase = async () => {
  try {
    console.log("⏳ Seeding Master Merchant into NeonDB...");

    //  Hash the password for security
    const hashedPassword = await bcrypt.hash("admin123", 12);

    // Parameterized Template Literal
    const result = await sql`
      INSERT INTO merchants (
        store_name,
        domain_url,
        email,
        password,
        theme_config,
        ui_components,
        geo_settings,
        localization
      ) VALUES (
        'Master Store',
        'master.local',
        'admin@store.com',
        ${hashedPassword},
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb,
        '{}'::jsonb
      )
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, domain_url;
    `;

    if (result.length > 0) {
      console.log("✅ First Admin Seeded! ID:", result[0].id);
    } else {
      console.log("ℹ️ Admin (admin@store.com) already exists in NeonDB.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

seedDatabase();