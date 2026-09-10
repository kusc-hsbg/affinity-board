import { NextRequest, NextResponse } from "next/server";
import { verifyStudent, addPost, uploadImage, getBoardData } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST (multipart/form-data): slug, password, title, category, body(HTML), thumb(file)?, thumbUrl?
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const slug = String(form.get("slug") || "");
    const password = String(form.get("password") || "");
    const title = String(form.get("title") || "");
    const category = String(form.get("category") || "");
    const body = String(form.get("body") || "");
    let thumbUrl = String(form.get("thumbUrl") || "").trim();

    if (!/^user_[A-Za-z0-9]+$/.test(slug)) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }
    const auth = await verifyStudent(slug, password);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }
    if (!title.trim() && !body.trim()) {
      return NextResponse.json({ ok: false, message: "제목 또는 내용을 입력하세요." }, { status: 400 });
    }

    const thumb = form.get("thumb");
    if (thumb && typeof thumb === "object" && "arrayBuffer" in thumb) {
      const f = thumb as File;
      const buf = await f.arrayBuffer();
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const url = await uploadImage(buf, f.type, ext);
      if (url) thumbUrl = url;
    }

    const res = await addPost({ studentId: slug, category, title, body, thumbUrl });
    if (!res.ok) {
      return NextResponse.json({ ok: false, message: res.message || "등록에 실패했습니다." }, { status: 500 });
    }

    const data = await getBoardData(slug);
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
