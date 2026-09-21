import { NextRequest, NextResponse } from "next/server";
import { verifyStudent, verifyAdmin, getBoardData } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST { slug, password } → 검증 후 게시판 데이터 반환
export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    if (typeof slug !== "string" || !/^user_[A-Za-z0-9]+$/.test(slug)) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }

    const pw = String(password ?? "");
    if (typeof pw !== "string" || pw.length === 0) {
      return NextResponse.json(
        { ok: false, message: "비밀번호를 입력해 주세요." },
        { status: 401 }
      );
    }

    // 마스터 비밀번호면 편집 권한(admin), 아니면 학생 비밀번호(열람) 확인
    const admin = verifyAdmin(pw);
    let name = "";
    if (!admin) {
      const result = await verifyStudent(slug, pw);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, message: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
      name = result.name;
    }

    const data = await getBoardData(slug);
    if (!data.studentName && name) data.studentName = name;

    return NextResponse.json({ ok: true, admin, ...data });
  } catch {
    return NextResponse.json(
      { ok: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
