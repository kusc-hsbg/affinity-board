"use client";
import { useEffect, useState, FormEvent } from "react";
import { useParams, notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface GalleryItem {
  studentId: string;
  imageUrl: string;
  linkUrl: string;
  title: string;
  date: string;
}
interface BoardResponse {
  ok: boolean;
  message?: string;
  studentName?: string;
  settings?: Record<string, string>;
  items?: GalleryItem[];
}

const SNS = [
  {
    href: "https://www.instagram.com/affinity_universe",
    color: "#000",
    path: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.36 1.05.42 2.2.06 1.27.07 1.65.07 4.85s0 3.6-.07 4.85c-.06 1.17-.25 1.8-.42 2.2-.22.57-.48.97-.9 1.39-.42.42-.82.68-1.38.9-.42.16-1.05.35-2.2.41-1.27.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.06-1.8-.25-2.2-.41a3.7 3.7 0 0 1-1.39-.9 3.7 3.7 0 0 1-.9-1.39c-.16-.42-.35-1.05-.41-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.06-1.17.25-1.8.41-2.2.22-.57.48-.97.9-1.39.42-.42.82-.68 1.39-.9.42-.16 1.05-.35 2.2-.41C8.4 2.2 8.8 2.2 12 2.2m0-2.2C8.7 0 8.3 0 7.05.07 5.78.13 4.9.33 4.14.63a5.9 5.9 0 0 0-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05 0 8.33 0 8.74 0 12s0 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.8.72 1.47 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 24 8.74 24 12 24s3.67 0 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.07-1.28.07-1.69.07-4.95s0-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67 0 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.15A4 4 0 1 1 16 12a4 4 0 0 1-4 4ZM19.85 5.6a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
      </svg>
    ),
  },
  {
    href: "https://blog.naver.com/affinityuniverse",
    color: "#0cb754",
    path: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 2h-15A2.5 2.5 0 0 0 2 4.5v11A2.5 2.5 0 0 0 4.5 18H9l2.4 3.6a.7.7 0 0 0 1.2 0L15 18h4.5a2.5 2.5 0 0 0 2.5-2.5v-11A2.5 2.5 0 0 0 19.5 2Zm-5.06 8.34c0 .93-.62 1.66-1.75 1.66-.62 0-1.05-.24-1.34-.62V12h-1.7V6.5h1.7v2.05c.3-.36.72-.6 1.34-.6 1.13 0 1.75.73 1.75 1.65Zm-1.72.15c0-.5-.3-.83-.75-.83s-.76.33-.76.83.3.83.76.83.75-.32.75-.83Z" />
      </svg>
    ),
  },
  {
    href: "https://www.youtube.com/@affinityuniverse",
    color: "#dd1b1b",
    path: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
      </svg>
    ),
  },
];

export default function UserBoardPage() {
  const params = useParams();
  const slug = String(params.slug || "");
  const valid = /^user_[A-Za-z0-9]+$/.test(slug);

  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BoardResponse | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);

  // 새로고침 시 세션 유지
  useEffect(() => {
    if (!valid) return;
    const saved = sessionStorage.getItem(`pw:${slug}`);
    if (saved) submit(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!valid) notFound();

  async function submit(password: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, password }),
      });
      const json: BoardResponse = await res.json();
      if (json.ok) {
        sessionStorage.setItem(`pw:${slug}`, password);
        setData(json);
        setUnlocked(true);
      } else {
        sessionStorage.removeItem(`pw:${slug}`);
        setError(json.message || "비밀번호가 일치하지 않습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!loading) submit(pw);
  }

  const settings = data?.settings || {};
  const items = data?.items || [];
  const title1 = settings["제목1"] || "수강생 작품과";
  const title2 = settings["제목2"] || "수업 현황을 한 번에!";
  const subtitle =
    settings["부제목"] ||
    "공식 인스타그램, 유튜브, 블로그 채널을 통해\n학습 과정과 결과를 기록하고 있습니다.";

  return (
    <div>
      <Header />

      {!unlocked ? (
        <div className="menu_password">
          <p className="lock-icon">
            <svg
              width="110"
              height="128"
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ display: "inline-block" }}
            >
              <path d="M12 1a5.5 5.5 0 0 0-5.5 5.5V10H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3h-.5V6.5A5.5 5.5 0 0 0 12 1Zm-3.5 5.5a3.5 3.5 0 1 1 7 0V10h-7V6.5ZM12 14a1.75 1.75 0 0 1 .9 3.25v1.9a.9.9 0 0 1-1.8 0v-1.9A1.75 1.75 0 0 1 12 14Z" />
            </svg>
          </p>
          <h6>
            You&apos;ve accessed a private page.
            <br />
            Enter the password to view this page.
          </h6>
          <form onSubmit={onSubmit}>
            <input
              type="password"
              placeholder="Password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
            <a onClick={onSubmit} role="button">
              {loading ? "..." : "Confirm"}
            </a>
          </form>
          {error && <p className="error-msg">{error}</p>}
          <a className="back" href="https://affinityuniverse.com">
            Back to main page
          </a>
        </div>
      ) : (
        <main className="board-main">
          <div className="inside">
            <div className="board-title">
              <h6>
                <strong>{title1}</strong>
              </h6>
              <h6>
                <strong>{title2}</strong>
              </h6>
              <p>
                {subtitle.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              {data?.studentName && (
                <p style={{ marginTop: 8, fontSize: 14, color: "#555" }}>
                  {data.studentName}님의 수업현황 페이지입니다.
                </p>
              )}
            </div>

            <div className="sns-icons">
              {SNS.map((s) => (
                <div className="col" key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: s.color }}>
                    {s.path}
                  </a>
                </div>
              ))}
            </div>

            <div className="gallery2">
              {items.slice(0, visibleCount).map((item, i) => (
                <a
                  key={i}
                  className="item"
                  href={item.linkUrl || "#"}
                  target={item.linkUrl ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  <div
                    className="img_wrap"
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                  />
                  <div className="slide_overlay">
                    <p>
                      {item.title}
                      {item.date ? ` · ${item.date}` : ""}
                    </p>
                  </div>
                </a>
              ))}
            </div>
            {items.length === 0 && (
              <p style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
                아직 등록된 콘텐츠가 없습니다. 구글 시트에 내용을 추가해 주세요.
              </p>
            )}

            {items.length > visibleCount && (
              <div className="more-wrap">
                <a
                  href="#"
                  className="btn-primary more_btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setVisibleCount((c) => c + 25);
                  }}
                >
                  More
                </a>
              </div>
            )}
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}
