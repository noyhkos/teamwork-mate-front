import Link from "next/link";

export default function ReportNotFound() {
  return (
    <div className="space-y-5 pt-10 text-center">
      <p className="font-serif text-2xl font-bold">리포트를 찾을 수 없어요</p>
      <p className="text-sm leading-relaxed text-ink-soft">
        링크가 잘못되었거나, 아직 분석이 끝나지 않은 팀일 수 있어요.
      </p>
      <Link
        href="/"
        className="focus-seal inline-flex min-h-touch items-center rounded-control bg-ink px-5 text-sm font-semibold text-paper"
      >
        우리 팀 뽑아보기
      </Link>
    </div>
  );
}
