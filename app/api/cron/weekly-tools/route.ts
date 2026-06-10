import { NextRequest, NextResponse } from "next/server";
import { validateCronAuth } from "@/lib/cron-auth";
import { generateTools } from "@/lib/content-generator";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron:weekly-tools] Starting weekly tool generation...");

    const tools = await generateTools(5);
    let inserted = 0;

    for (const tool of tools) {
      try {
        await pool.query(
          `INSERT INTO tools (name, slug, category_slug, description, url, logo_url, pricing, features, source, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ai_generated', 'published', NOW())`,
          [
            tool.name,
            tool.slug,
            tool.category_slug,
            tool.description,
            tool.url,
            tool.logo_url,
            tool.pricing,
            tool.features,
          ]
        );
        inserted++;
        console.log(`[cron:weekly-tools] Inserted: ${tool.name}`);
      } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
          console.log(`[cron:weekly-tools] Duplicate slug, skipping: ${tool.slug}`);
          continue;
        }
        console.error(`[cron:weekly-tools] Failed to insert tool:`, err.message);
      }
    }

    console.log(`[cron:weekly-tools] Done. Inserted ${inserted}/${tools.length} tools.`);

    return NextResponse.json({
      success: true,
      generated: tools.length,
      inserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[cron:weekly-tools] Error:", error.message);
    return NextResponse.json(
      { error: "Generation failed", detail: error.message },
      { status: 500 }
    );
  }
}

export { GET as POST };
