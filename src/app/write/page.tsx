"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function WriteInner() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get("slug") || "";
  const editorRef = useRef<HTMLDivElement>(null);

  const [password, setPassword] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [thumb, setThumb] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;
    const pw = localStorage.getItem("pw:" + slug);
    if (pw) setPassword(pw);
    else setNeedPw(true);
  }, [slug]);

  const exec = (cmd: string, value?: string) => {
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const insertImageUrl = () => {
    const url = window.prompt("본문에 넣을 이미지 주소(URL)를 입력하세요");
    if (url) insertImages([url]);
  };

  const insertImages = (urls: string[]) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    const html = urls
      .map((u) => `<img src="${u}" style="max-width:100%;height:auto;display:block;margin:8px 0;">`)
      .join("");
    // 커서 위치에 삽입, 실패 시 끝에 추가
    if (!document.execCommand("insertHTML", false, html)) {
      ed.innerHTML += html;
    }
  };

  const onPickImages = async (files: FileList | null) => {
    if (!files || !files.length || !slug) return;
    setUploading(true);
    setMsg(`이미지 ${files.length}장 업로드 중...`);
    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("password", password);
    Array.from(files).forEach((f) => fd.append("images", f));
    try {
      const r = await fetch("/api/board/image", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok && j.urls?.length) {
        insertImages(j.urls);
        setMsg(`이미지 ${j.urls.length}장 추가됨`);
      } else {
        setMsg(j.message || "이미지 업로드에 실패했습니다.");
      }
    } catch {
      setMsg("이미지 업로드 중 네트워크 오류입니다.");
    } finally {
      setUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  const save = async () => {
    if (!slug) return;
    const body = editorRef.current?.innerHTML || "";
    if (!title.trim() && !body.replace(/<[^>]*>/g, "").trim()) {
      setMsg("제목이나 내용을 입력하세요.");
      return;
    }
    setSaving(true);
    setMsg("등록 중...");
    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("password", password);
    fd.append("title", title);
    fd.append("category", category);
    fd.append("body", body);
    if (thumb) fd.append("thumb", thumb);
    try {
      const r = await fetch("/api/board/post", { method: "POST", body: fd });
      const j = await r.json();
      if (j.ok) {
        localStorage.setItem("pw:" + slug, password);
        router.push("/" + slug);
      } else {
        setSaving(false);
        setMsg(j.message || "등록에 실패했습니다.");
      }
    } catch {
      setSaving(false);
      setMsg("네트워크 오류입니다.");
    }
  };

  if (!slug) return <div style={{ padding: 40 }}>잘못된 접근입니다. (slug 없음)</div>;

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.head}>
          <button style={S.back} onClick={() => router.push("/" + slug)}>← 뒤로</button>
          <strong>새 글 쓰기</strong>
          <button style={S.save} disabled={saving} onClick={save}>등록</button>
        </div>

        {needPw && (
          <input
            style={S.input}
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <input style={S.input} placeholder="분류 (예: 마케팅, 공지)" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input style={{ ...S.input, fontSize: 22, fontWeight: 700 }} placeholder="제목" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label style={S.thumbLabel}>
          대표 이미지(썸네일, 선택): <input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] || null)} />
        </label>

        <div style={S.toolbar}>
          <select style={S.sel} defaultValue="" onChange={(e) => { exec("fontSize", e.target.value); e.target.value = ""; }}>
            <option value="" disabled>글자 크기</option>
            <option value="2">작게</option>
            <option value="3">보통</option>
            <option value="5">크게</option>
            <option value="6">아주 크게</option>
          </select>
          <button style={S.tb} onClick={() => exec("bold")}><b>굵게</b></button>
          <button style={S.tb} onClick={() => exec("italic")}><i>기울임</i></button>
          <button style={S.tb} onClick={() => exec("underline")}><u>밑줄</u></button>
          <button style={S.tb} onClick={() => exec("strikeThrough")}><s>취소선</s></button>
          <label style={S.tb}>글자색 <input type="color" onChange={(e) => exec("foreColor", e.target.value)} style={{ verticalAlign: "middle" }} /></label>
          <button style={S.tb} onClick={() => exec("formatBlock", "<h2>")}>제목</button>
          <button style={S.tb} onClick={() => exec("insertUnorderedList")}>• 목록</button>
          <button style={S.tb} onClick={() => exec("insertOrderedList")}>1. 목록</button>
          <button style={S.tb} onClick={() => exec("justifyLeft")}>왼쪽</button>
          <button style={S.tb} onClick={() => exec("justifyCenter")}>가운데</button>
          <button style={S.tb} onClick={() => exec("justifyRight")}>오른쪽</button>
          <button style={S.tb} disabled={uploading} onClick={() => imgInputRef.current?.click()}>
            {uploading ? "업로드 중..." : "🖼 이미지 추가(여러 장)"}
          </button>
          <button style={S.tb} onClick={insertImageUrl}>이미지 URL</button>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => onPickImages(e.target.files)}
          />
        </div>

        <div ref={editorRef} contentEditable suppressContentEditableWarning style={S.editor} data-ph="여기에 내용을 작성하세요..." />

        {msg && <div style={S.msg}>{msg}</div>}
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>로딩 중...</div>}>
      <WriteInner />
    </Suspense>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#f4f5f7", padding: "24px 12px" },
  wrap: { maxWidth: 780, margin: "0 auto", background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,.06)" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  back: { border: 0, background: "none", fontSize: 15, cursor: "pointer", color: "#555" },
  save: { border: 0, background: "#0063ff", color: "#fff", padding: "9px 22px", borderRadius: 6, fontSize: 15, cursor: "pointer" },
  input: { display: "block", width: "100%", boxSizing: "border-box", border: "1px solid #e2e2e2", borderRadius: 6, padding: "12px 14px", fontSize: 15, marginBottom: 10 },
  thumbLabel: { display: "block", fontSize: 13, color: "#666", margin: "6px 0 14px" },
  toolbar: { display: "flex", flexWrap: "wrap", gap: 6, padding: "10px", border: "1px solid #eee", borderRadius: 6, background: "#fafafa", marginBottom: 10 },
  sel: { border: "1px solid #ddd", borderRadius: 4, padding: "4px 6px", fontSize: 13 },
  tb: { border: "1px solid #ddd", borderRadius: 4, background: "#fff", padding: "5px 9px", fontSize: 13, cursor: "pointer" },
  editor: { minHeight: 360, border: "1px solid #e2e2e2", borderRadius: 6, padding: 16, fontSize: 16, lineHeight: 1.7, outline: "none" },
  msg: { marginTop: 12, fontSize: 14, color: "#d33" },
};
