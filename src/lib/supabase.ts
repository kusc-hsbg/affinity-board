import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
// 서버 전용 키(service_role). RLS를 우회하므로 절대 클라이언트에 노출 금지.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface GalleryItem {
  id: number;
  studentId: string;
  imageUrl: string;
  linkUrl: string;
  title: string;
  date: string;
}

export interface PostItem {
  id: number;
  category: string;
  title: string;
  body: string;
  thumbUrl: string;
  date: string;
}

export interface BoardData {
  studentName: string;
  settings: Record<string, string>;
  items: GalleryItem[];
  posts: PostItem[];
}

// 구글 드라이브 공유 링크를 이미지 직링크로 자동 변환 (Supabase Storage URL은 그대로 통과)
function normalizeImageUrl(url: string): string {
  const m =
    url.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ||
    url.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([\w-]+)/);
  if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200`;
  return url;
}

function dbConfigured(): boolean {
  return Boolean(supabase);
}

// 비밀번호 검증: students 테이블 우선, DB 미설정 시 URL 규칙(user_XXXX → XXXX) 대체
export async function verifyStudent(
  slug: string,
  password: string
): Promise<{ ok: boolean; name: string }> {
  const fallbackPw = slug.replace(/^user_/, "");

  if (dbConfigured()) {
    const { data, error } = await supabase!
      .from("students")
      .select("password, name")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("students 조회 실패, URL 규칙으로 대체:", error.message);
    } else if (data) {
      return { ok: (data.password ?? "").trim() === password, name: (data.name ?? "").trim() };
    } else {
      // 등록되지 않은 학생 페이지는 접근 불가
      return { ok: false, name: "" };
    }
  }
  return { ok: password === fallbackPw && fallbackPw.length > 0, name: "" };
}

// 갤러리: student_id가 비어있으면 전체 공통, 일치하면 해당 학생 전용
function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export async function getBoardData(slug: string): Promise<BoardData> {
  const data: BoardData = { studentName: "", settings: {}, items: [], posts: [] };
  if (!dbConfigured()) return data;

  const [studentRes, galleryRes, settingsRes, postsRes] = await Promise.all([
    supabase!.from("students").select("name").eq("slug", slug).maybeSingle(),
    supabase!
      .from("gallery")
      .select("id, student_id, image_url, link_url, title, date, visible")
      .or(`student_id.is.null,student_id.eq.,student_id.eq.${slug}`)
      .order("created_at", { ascending: false }),
    supabase!.from("settings").select("key, value"),
    supabase!
      .from("posts")
      .select("id, category, title, body, thumb_url, created_at")
      .or(`student_id.is.null,student_id.eq.,student_id.eq.${slug}`)
      .order("created_at", { ascending: false }),
  ]);

  if (postsRes && !postsRes.error && postsRes.data) {
    data.posts = postsRes.data.map((p) => ({
      id: p.id,
      category: (p.category ?? "").trim(),
      title: (p.title ?? "").trim(),
      body: p.body ?? "",
      thumbUrl: (p.thumb_url ?? "").trim(),
      date: fmtDate(p.created_at),
    }));
  }

  if (studentRes.data) data.studentName = (studentRes.data.name ?? "").trim();

  if (settingsRes.data) {
    for (const r of settingsRes.data) {
      if (r.key) data.settings[String(r.key).trim()] = String(r.value ?? "");
    }
  }

  if (galleryRes.data) {
    data.items = galleryRes.data
      .filter((r) => r.visible !== false && (r.image_url ?? "").trim() !== "")
      .map((r) => ({
        id: r.id,
        studentId: (r.student_id ?? "").trim(),
        imageUrl: normalizeImageUrl((r.image_url ?? "").trim()),
        linkUrl: (r.link_url ?? "").trim(),
        title: (r.title ?? "").trim(),
        date: (r.date ?? "").trim(),
      }));
  }

  if (galleryRes.error) console.error("gallery 조회 실패:", galleryRes.error.message);
  return data;
}

// Storage에 이미지 업로드 후 공개 URL 반환
export async function uploadImage(
  file: ArrayBuffer,
  contentType: string,
  ext: string
): Promise<string | null> {
  if (!supabase) return null;
  const safeExt = (ext || "jpg").replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  // 파일명은 랜덤성 대신 카운터/타임스탬프 대신 crypto 사용 불가 환경 고려 → 경로에 uuid 유사값
  const name = `${Date.now()}-${Math.floor(Math.random() * 1e9)}.${safeExt}`;
  const { error } = await supabase.storage
    .from("gallery")
    .upload(name, file, { contentType: contentType || "image/jpeg", upsert: false });
  if (error) {
    console.error("이미지 업로드 실패:", error.message);
    return null;
  }
  const { data } = supabase.storage.from("gallery").getPublicUrl(name);
  return data.publicUrl;
}

// 갤러리 항목 추가
export async function addGalleryItem(item: {
  studentId: string;
  imageUrl: string;
  linkUrl?: string;
  title?: string;
  date?: string;
}): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: "DB가 설정되지 않았습니다." };
  const { error } = await supabase.from("gallery").insert({
    student_id: item.studentId || null,
    image_url: item.imageUrl,
    link_url: item.linkUrl || "",
    title: item.title || "",
    date: item.date || "",
    visible: true,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// 갤러리 항목 삭제 (스토리지 파일도 정리)
export async function deleteGalleryItem(id: number): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: "DB가 설정되지 않았습니다." };
  const { data } = await supabase.from("gallery").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  if (data?.image_url) await deleteStorageByUrls([data.image_url]);
  return { ok: true };
}

// Storage 공개 URL에서 gallery 버킷 경로만 뽑아 삭제 (best-effort)
export async function deleteStorageByUrls(urls: string[]): Promise<void> {
  if (!supabase) return;
  const marker = "/storage/v1/object/public/gallery/";
  const paths = urls
    .map((u) => {
      const i = u.indexOf(marker);
      return i >= 0 ? decodeURIComponent(u.slice(i + marker.length).split("?")[0]) : "";
    })
    .filter(Boolean);
  if (paths.length) {
    try {
      await supabase.storage.from("gallery").remove(paths);
    } catch (e) {
      console.error("스토리지 삭제 실패:", e);
    }
  }
}

// 블로그 글 추가 (날짜는 created_at 기본값 = 올린 날 자동)
export async function addPost(item: {
  studentId: string;
  category?: string;
  title?: string;
  body?: string;
  thumbUrl?: string;
}): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: "DB가 설정되지 않았습니다." };
  const { error } = await supabase.from("posts").insert({
    student_id: item.studentId || null,
    category: item.category || "",
    title: item.title || "",
    body: item.body || "",
    thumb_url: item.thumbUrl || "",
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// 단건 글 조회 (편집용). 공통글 또는 본인(slug) 글만 반환
export async function getPost(id: number, slug: string): Promise<PostItem | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("posts")
    .select("id, student_id, category, title, body, thumb_url, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const owner = (data.student_id ?? "").trim();
  if (owner && owner !== slug) return null;
  return {
    id: data.id,
    category: (data.category ?? "").trim(),
    title: (data.title ?? "").trim(),
    body: data.body ?? "",
    thumbUrl: (data.thumb_url ?? "").trim(),
    date: fmtDate(data.created_at),
  };
}

// 글 수정
export async function updatePost(
  id: number,
  slug: string,
  patch: { category?: string; title?: string; body?: string; thumbUrl?: string }
): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: "DB가 설정되지 않았습니다." };
  const existing = await getPost(id, slug);
  if (!existing) return { ok: false, message: "글을 찾을 수 없거나 권한이 없습니다." };
  const upd: Record<string, string> = {};
  if (patch.category !== undefined) upd.category = patch.category;
  if (patch.title !== undefined) upd.title = patch.title;
  if (patch.body !== undefined) upd.body = patch.body;
  if (patch.thumbUrl !== undefined && patch.thumbUrl !== "") upd.thumb_url = patch.thumbUrl;
  const { error } = await supabase.from("posts").update(upd).eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

// 글 삭제 (본문/썸네일 이미지도 스토리지에서 정리)
export async function deletePost(id: number, slug: string): Promise<{ ok: boolean; message?: string }> {
  if (!supabase) return { ok: false, message: "DB가 설정되지 않았습니다." };
  const existing = await getPost(id, slug);
  if (!existing) return { ok: false, message: "글을 찾을 수 없거나 권한이 없습니다." };
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  const urls: string[] = [];
  if (existing.thumbUrl) urls.push(existing.thumbUrl);
  const re = /<img[^>]+src="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(existing.body)) !== null) urls.push(m[1]);
  await deleteStorageByUrls(urls);
  return { ok: true };
}
