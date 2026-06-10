import { NextRequest, NextResponse } from "next/server";
import { validateCronAuth } from "@/lib/cron-auth";
import { generateArticles } from "@/lib/content-generator";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  if (!validateCronAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[cron:daily-articles] Starting daily article generation...");

    const articles = await generateArticles(3);
    let inserted = 0;

    for (const article of articles) {
      try {
        await pool.query(
          `INSERT INTO articles (title, slug, excerpt, content, category, tags, source, status, published_at)
           VALUES (?, ?, ?, ?, ?, ?, 'ai_generated', 'published', NOW())`,
          [
            article.title,
            article.slug,
            article.excerpt,
            article.content,
            article.category,
            article.tags,
          ]
        );
        inserted++;
        console.log(`[cron:daily-articles] Inserted: ${article.title}`);
      } catch (err: any) {
        // Skip duplicates (slug conflict)
        if (err.code === "ER_DUP_ENTRY") {
          console.log(`[cron:daily-articles] Duplicate slug, skipping: ${article.slug}`);
          continue;
        }
        console.error(`[cron:daily-articles] Failed to insert article:`, err.message);
      }
    }

    console.log(`[cron:daily-articles] Done. Inserted ${inserted}/${articles.length} articles.`);

    return NextResponse.json({
      success: true,
      generated: articles.length,
      inserted,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[cron:daily-articles] Error:", error.message);
    return NextResponse.json(
      { error: "Generation failed", detail: error.message },
      { status: 500 }
    );
  }
}

// Also support POST from GitHub Actions
export { GET as POST };
