// 루트 페이지: 학생 이름 링크만 노출 (그 외 아무것도 표시하지 않음)
const STUDENTS: { name: string; slug: string }[] = [
  { name: "최준원", slug: "user_090406" },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        background: "#fff",
        fontFamily: "'Times New Roman', Georgia, 'Nanum Myeongjo', serif",
      }}
    >
      {STUDENTS.map((s) => (
        <a
          key={s.slug}
          href={"/" + s.slug}
          style={{ fontSize: 22, letterSpacing: 1, color: "#111", textDecoration: "none" }}
        >
          {s.name}
        </a>
      ))}
    </main>
  );
}
