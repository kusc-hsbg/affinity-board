import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "어피니티 유니버스 수강생 수업현황 알림 게시판",
  description: "수강생 작품과 수업 현황을 한 번에!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
