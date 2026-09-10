import { NextRequest, NextResponse } from "next/server";
import { verifyStudent, getBoardData } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST { slug, password } → 검증 후 게시판 데이터 반환
export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    if (typeof slug !== "string" || !/^user_[A-Za-z0-9]+$/.test(slug)) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }

    const result = await verifyStudent(slug, String(password ?? ""));
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    const data = await getBoardData(slug);
    if (!data.studentName && result.name) data.studentName = result.name;

    return NextResponse.json({ ok: true, ...data });
  } catch {
    return NextResponse.json(
      { ok: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
