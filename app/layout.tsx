import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamworkMate — 재미로 보는 팀 사주×MBTI",
  description: "팀원들의 사주와 MBTI를 조합해 역할 추천, 케미, 팀 밸런스를 알려주는 재미용 리포트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10">{children}</main>
        <footer className="py-6 text-center text-xs text-slate-600">
          teamwork-mate · 전통 이론을 참고한 재미용 해석입니다
        </footer>
      </body>
    </html>
  );
}
