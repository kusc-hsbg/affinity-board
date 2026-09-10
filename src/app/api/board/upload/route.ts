import { NextRequest, NextResponse } from "next/server";
import { verifyStudent, addGalleryItem, deleteGalleryItem, uploadImage, getBoardData } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// DELETE ?slug=&id=&password= → 갤러리 이미지 삭제
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") || "";
  const id = Number(url.searchParams.get("id") || "0");
  const password = url.searchParams.get("password") || "";
  if (!/^user_[A-Za-z0-9]+$/.test(slug) || !id) {
    return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
  }
  const auth = await verifyStudent(slug, password);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
  }
  const res = await deleteGalleryItem(id);
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
  }
  const data = await getBoardData(slug);
  return NextResponse.json({ ok: true, ...data });
}

// POST (multipart/form-data): slug, password, title, date, link, imageUrl?, image(file)?
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const slug = String(form.get("slug") || "");
    const password = String(form.get("password") || "");
    const title = String(form.get("title") || "");
    const date = String(form.get("date") || "");
    const link = String(form.get("link") || "");
    let imageUrl = String(form.get("imageUrl") || "").trim();

    if (!/^user_[A-Za-z0-9]+$/.test(slug)) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }

    // 비밀번호 재검증 (아무나 업로드 못 하도록)
    const auth = await verifyStudent(slug, password);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }

    // 파일이 있으면 Storage 업로드, 없으면 imageUrl 사용
    const file = form.get("image");
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const f = file as File;
      const buf = await f.arrayBuffer();
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const url = await uploadImage(buf, f.type, ext);
      if (!url) {
        return NextResponse.json({ ok: false, message: "이미지 업로드에 실패했습니다." }, { status: 500 });
      }
      imageUrl = url;
    }

    if (!imageUrl) {
      return NextResponse.json({ ok: false, message: "이미지를 첨부하거나 이미지 주소를 입력하세요." }, { status: 400 });
    }

    const res = await addGalleryItem({ studentId: slug, imageUrl, linkUrl: link, title, date });
    if (!res.ok) {
      return NextResponse.json({ ok: false, message: res.message || "등록에 실패했습니다." }, { status: 500 });
    }

    // 최신 목록 반환 → 프런트에서 즉시 다시 렌더
    const data = await getBoardData(slug);
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
