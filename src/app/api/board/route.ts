import { NextRequest, NextResponse } from "next/server";
import { verifyStudent, getBoardData } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST { slug, password? } → 게시판 데이터 반환
//  - 비밀번호 없이: 공개 열람 (admin:false)
//  - 비밀번호 일치: 편집 권한 (admin:true) / 불일치: 401
export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();

    if (typeof slug !== "string" || !/^user_[A-Za-z0-9]+$/.test(slug)) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }

    const hasPw = typeof password === "string" && password.length > 0;
    let admin = false;
    let name = "";

    if (hasPw) {
      const result = await verifyStudent(slug, String(password));
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, message: "비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }
      admin = true;
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
