import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

// 루트(/) = 미러링된 자사 메인 페이지
export async function GET() {
  try {
    const html = await fs.readFile(
      path.join(process.cwd(), "public", "site", "_home.html"),
      "utf-8"
    );
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
