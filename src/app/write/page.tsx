"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function WriteInner() {
  const params = useSearchParams();
  const router = useRouter();
  const slug = params.get("slug") || "";
  const editId = params.get("id") || "";
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
    // 편집 모드: 기존 글 불러오기
    if (editId && pw) {
      fetch(`/api/board/post?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(editId)}&password=${encodeURIComponent(pw)}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok && j.post) {
            setTitle(j.post.title || "");
            setCategory(j.post.category || "");
            if (editorRef.current) editorRef.current.innerHTML = j.post.body || "";
          } else {
            setMsg(j.message || "글을 불러오지 못했습니다.");
          }
        })
        .catch(() => setMsg("글을 불러오지 못했습니다."));
    }
  }, [slug, editId]);

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
    if (editId) fd.append("id", editId);
    if (thumb) fd.append("thumb", thumb);
    try {
      const r = await fetch("/api/board/post", { method: editId ? "PUT" : "POST", body: fd });
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
      {/* 상단 브랜드 헤더 */}
      <div style={S.topbar}>
        <div style={S.brand}>
          <span style={S.logoBox}>AU</span>
          <span style={S.brandText}>
            <span style={S.brandBlue}>A</span>FFINITY&nbsp;<span style={S.brandBlue}>U</span>NIVERSE
          </span>
        </div>
        <div style={S.topActions}>
          <button style={S.back} onClick={() => router.push("/" + slug)}>← Back</button>
          <button style={S.save} disabled={saving} onClick={save}>{editId ? "Update" : "Publish"}</button>
        </div>
      </div>

      <div style={S.wrap}>
        {needPw && (
          <input
            style={{ ...S.lineInput, marginBottom: 18 }}
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* Category | Title 한 줄 */}
        <div style={S.metaRow}>
          <div style={S.catCell}>
            <input style={{ ...S.lineInput, ...S.metaText }} placeholder="CATEGORY" value={category} onChange={(e) => setCategory(e.target.value)} />
            <span style={S.caret}>▾</span>
          </div>
          <div style={S.titleCell}>
            <input style={{ ...S.lineInput, ...S.metaText }} placeholder="TITLE" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
        </div>

        {/* 다크 툴바 */}
        <div style={S.toolbar}>
          <button style={S.tb} title="굵게" onClick={() => exec("bold")}><b>B</b></button>
          <button style={S.tb} title="기울임" onClick={() => exec("italic")}><i>I</i></button>
          <button style={S.tb} title="밑줄" onClick={() => exec("underline")}><u>U</u></button>
          <button style={S.tb} title="취소선" onClick={() => exec("strikeThrough")}><s>S</s></button>
          <label style={S.tb} title="글자 크기">
            <select style={S.sel} defaultValue="" onChange={(e) => { exec("fontSize", e.target.value); e.target.value = ""; }}>
              <option value="" disabled>T</option>
              <option value="2">작게</option>
              <option value="3">보통</option>
              <option value="5">크게</option>
              <option value="6">아주 크게</option>
            </select>
          </label>
          <label style={S.tb} title="글자색">🎨<input type="color" onChange={(e) => exec("foreColor", e.target.value)} style={S.colorInput} /></label>
          <span style={S.divider} />
          <button style={S.tb} title="제목" onClick={() => exec("formatBlock", "<h2>")}>¶</button>
          <button style={S.tb} title="왼쪽 정렬" onClick={() => exec("justifyLeft")}>⯇</button>
          <button style={S.tb} title="가운데 정렬" onClick={() => exec("justifyCenter")}>≡</button>
          <button style={S.tb} title="오른쪽 정렬" onClick={() => exec("justifyRight")}>⯈</button>
          <button style={S.tb} title="번호 목록" onClick={() => exec("insertOrderedList")}>1.</button>
          <button style={S.tb} title="점 목록" onClick={() => exec("insertUnorderedList")}>•</button>
          <span style={S.divider} />
          <button style={S.tb} disabled={uploading} title="이미지 추가" onClick={() => imgInputRef.current?.click()}>
            {uploading ? "…" : "🖼"}
          </button>
          <button style={S.tb} title="이미지 URL" onClick={insertImageUrl}>🔗</button>
          <span style={S.divider} />
          <button style={S.tb} title="실행 취소" onClick={() => exec("undo")}>↺</button>
          <button style={S.tb} title="다시 실행" onClick={() => exec("redo")}>↻</button>
          <input
            ref={imgInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => onPickImages(e.target.files)}
          />
        </div>

        <div ref={editorRef} contentEditable suppressContentEditableWarning style={S.editor} data-ph="ADD TEXT" />

        <label style={S.thumbLabel}>
          대표 이미지(썸네일, 선택): <input type="file" accept="image/*" onChange={(e) => setThumb(e.target.files?.[0] || null)} />
        </label>

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

const SERIF = "'Times New Roman', Georgia, 'Nanum Myeongjo', serif";
const BLUE = "#3b4bd8";

const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#fff", fontFamily: SERIF, color: "#333" },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 28px", borderBottom: "1px solid #f0f0f0",
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logoBox: {
    width: 34, height: 34, background: "#1a1a1a", color: "#fff", borderRadius: 4,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
  },
  brandText: { fontFamily: SERIF, fontSize: 15, letterSpacing: 1.5, color: "#1a1a1a", fontVariant: "small-caps" as React.CSSProperties["fontVariant"] },
  brandBlue: { color: BLUE },
  topActions: { display: "flex", alignItems: "center", gap: 14 },
  back: { border: 0, background: "none", fontSize: 14, cursor: "pointer", color: "#888", fontFamily: SERIF },
  save: { border: 0, background: BLUE, color: "#fff", padding: "8px 22px", borderRadius: 4, fontSize: 14, letterSpacing: 0.5, cursor: "pointer", fontFamily: SERIF },

  wrap: { maxWidth: 860, margin: "0 auto", padding: "26px 28px 60px" },

  metaRow: { display: "flex", gap: 26, marginBottom: 20 },
  catCell: { position: "relative", width: 220 },
  titleCell: { flex: 1 },
  caret: { position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", color: "#bbb", fontSize: 12, pointerEvents: "none" },
  lineInput: {
    display: "block", width: "100%", boxSizing: "border-box", border: 0,
    borderBottom: "1px solid #d9d9d9", background: "transparent", padding: "10px 2px",
    outline: "none", fontFamily: SERIF,
  },
  metaText: { fontSize: 19, letterSpacing: 1, color: "#444", fontVariant: "small-caps" as React.CSSProperties["fontVariant"] },

  toolbar: {
    display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2,
    padding: "6px 10px", background: "#4a4a4a", borderRadius: 4, marginBottom: 22,
  },
  tb: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 30, height: 30, border: 0, borderRadius: 3, background: "transparent",
    color: "#e8e8e8", fontSize: 14, cursor: "pointer", padding: "0 6px", fontFamily: SERIF,
  },
  sel: { border: 0, background: "transparent", color: "#e8e8e8", fontSize: 14, cursor: "pointer", outline: "none" },
  colorInput: { width: 16, height: 16, border: 0, background: "none", padding: 0, marginLeft: 3, verticalAlign: "middle", cursor: "pointer" },
  divider: { width: 1, height: 18, background: "rgba(255,255,255,.22)", margin: "0 6px" },

  editor: {
    minHeight: 420, border: 0, padding: "4px 2px", fontSize: 17, lineHeight: 1.8,
    outline: "none", color: "#333", fontFamily: SERIF, letterSpacing: 0.3,
  },
  thumbLabel: { display: "block", fontSize: 13, color: "#999", marginTop: 24, fontFamily: SERIF },
  msg: { marginTop: 14, fontSize: 14, color: "#d33", fontFamily: SERIF },
};
