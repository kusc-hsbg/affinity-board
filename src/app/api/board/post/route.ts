import { NextRequest, NextResponse } from "next/server";
import {
  verifyStudent,
  addPost,
  updatePost,
  deletePost,
  getPost,
  uploadImage,
  getBoardData,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET ?slug=&id=&password= → 편집용 단건 글 조회 (비번 검증)
export async function GET(req: NextRequest) {
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
  const post = await getPost(id, slug);
  if (!post) {
    return NextResponse.json({ ok: false, message: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, post });
}

// PUT (multipart/form-data): slug, password, id, title, category, body, thumb(file)?, thumbUrl? → 수정
export async function PUT(req: NextRequest) {
  try {
    const form = await req.formData();
    const slug = String(form.get("slug") || "");
    const password = String(form.get("password") || "");
    const id = Number(form.get("id") || "0");
    if (!/^user_[A-Za-z0-9]+$/.test(slug) || !id) {
      return NextResponse.json({ ok: false, message: "잘못된 접근입니다." }, { status: 400 });
    }
    const auth = await verifyStudent(slug, password);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, message: "비밀번호가 일치하지 않습니다." }, { status: 401 });
    }
    let thumbUrl = String(form.get("thumbUrl") || "").trim();
    const thumb = form.get("thumb");
    if (thumb && typeof thumb === "object" && "arrayBuffer" in thumb) {
      const f = thumb as File;
      const buf = await f.arrayBuffer();
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const u = await uploadImage(buf, f.type, ext);
      if (u) thumbUrl = u;
    }
    const res = await updatePost(id, slug, {
      title: String(form.get("title") || ""),
      category: String(form.get("category") || ""),
      body: String(form.get("body") || ""),
      thumbUrl,
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
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

// DELETE ?slug=&id=&password= → 글 삭제
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
  const res = await deletePost(id, slug);
  if (!res.ok) {
    return NextResponse.json({ ok: false, message: res.message }, { status: 400 });
  }
  const data = await getBoardData(slug);
  return NextResponse.json({ ok: true, ...data });
}

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
