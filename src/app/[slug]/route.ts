import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

// 미러링된 원본 페이지를 그대로 서빙 (자산은 /public/mirror/a 에 로컬 보관)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!/^user_[A-Za-z0-9]+$/.test(slug)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const html = await fs.readFile(
    path.join(process.cwd(), "src", "mirror", "page.html"),
    "utf-8"
  );
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}
