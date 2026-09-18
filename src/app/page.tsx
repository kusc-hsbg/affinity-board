// 루트 페이지: 등록된 학생 이름을 모두 링크로 표시 (Supabase에서 자동 조회)
import { listStudents } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const students = await listStudents();
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        background: "#fff",
        fontFamily: "'Times New Roman', Georgia, 'Nanum Myeongjo', serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "14px 26px",
          maxWidth: 900,
        }}
      >
        {students.map((s) => (
          <a
            key={s.slug}
            href={"/" + s.slug}
            style={{ fontSize: 20, letterSpacing: 1, color: "#111", textDecoration: "none" }}
          >
            {s.name}
          </a>
        ))}
      </div>
    </main>
  );
}
