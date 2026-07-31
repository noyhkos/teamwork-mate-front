import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const maruburi = localFont({
  src: [
    { path: "../fonts/MaruBuri-Regular.ttf", weight: "400" },
    { path: "../fonts/MaruBuri-Bold.ttf", weight: "700" },
  ],
  variable: "--font-maruburi",
});

const body = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  // Report pages set a relative OG image; without a base it cannot be resolved
  // to the absolute URL that link previews require.
  metadataBase: new URL("https://teamsaju.com"),
  title: "팀사주 · MBTI 팀궁합 분석",
  description: "팀원들의 사주와 MBTI를 조합해 역할 추천, 케미, 팀 밸런스를 알려주는 재미용 리포트",
  openGraph: {
    siteName: "팀사주",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${maruburi.variable} ${body.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <div className="ohaeng-rule" aria-hidden><i /><i /><i /><i /><i /></div>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">{children}</main>
        <footer className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 text-center text-xs text-ink-faint">
          teamwork-mate · 전통 이론을 참고한 재미용 해석입니다
        </footer>
      </body>
    </html>
  );
}
