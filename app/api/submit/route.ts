import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool_name, tool_url, category_slug, description, submitter_email } = body;

    if (!tool_name || !tool_url || !description) {
      return NextResponse.json(
        { message: "请填写必填字段" },
        { status: 400 }
      );
    }

    await pool.query(
      "INSERT INTO submissions (tool_name, tool_url, category_slug, description, submitter_email, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      [tool_name, tool_url, category_slug || null, description, submitter_email || null]
    );

    return NextResponse.json({ message: "提交成功" }, { status: 200 });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      { message: "服务器错误，请稍后重试" },
      { status: 500 }
    );
  }
}
