import { NextRequest, NextResponse } from "next/server";
import { verifyStudent, uploadImage } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST (multipart/form-data): slug, password, images(file, 여러 개) → { ok, urls: [] }
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const slug = String(form.get("slug") || "");
    const password = String(form.get("password") || "");

    if (!/^user_[A-Za-z0-9]+$/.test(slug)) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }
    const auth = await verifyStudent(slug, password);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    const files = form.getAll("images").filter((f) => typeof f === "object" && "arrayBuffer" in f) as File[];
    if (!files.length) {
      return NextResponse.json({ ok: false, message: "이미지가 없습니다." }, { status: 400 });
    }

    const urls: string[] = [];
    for (const f of files) {
      const buf = await f.arrayBuffer();
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const url = await uploadImage(buf, f.type, ext);
      if (url) urls.push(url);
    }

    if (!urls.length) {
      return NextResponse.json({ ok: false, message: "이미지 업로드에 실패했습니다." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, urls });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
