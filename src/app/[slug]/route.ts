import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

function htmlResponse(html: string) {
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, must-revalidate",
    },
  });
}

// user_XXXX → 학생 게시판(미러) / 그 외 → 자사 사이트 미러 페이지(public/site/<slug>.html)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (/^user_[A-Za-z0-9]+$/.test(slug)) {
    const html = await fs.readFile(
      path.join(process.cwd(), "src", "mirror", "page.html"),
      "utf-8"
    );
    return htmlResponse(html);
  }

  if (/^[A-Za-z0-9_-]+$/.test(slug)) {
    const dir = path.join(process.cwd(), "public", "site");
    try {
      return htmlResponse(await fs.readFile(path.join(dir, slug + ".html"), "utf-8"));
    } catch {
      // 대소문자 무시 대체 매칭
      try {
        const target = (slug + ".html").toLowerCase();
        const files = await fs.readdir(dir);
        const hit = files.find((f) => f.toLowerCase() === target);
        if (hit) return htmlResponse(await fs.readFile(path.join(dir, hit), "utf-8"));
      } catch {
        /* noop */
      }
    }
  }

  return new NextResponse("Not Found", { status: 404 });
}
