"use client";

import { useState } from "react";
import Button from "@/components/ui/button";

/** Sharing is the whole point of the report, so it gets a first-class control. */
export default function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    // Native sheet on mobile (KakaoTalk, Messages…); clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // user dismissed the sheet — fall through to copying
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button size="lg" full onClick={share}>
      {copied ? "링크가 복사됐어요" : "이 리포트 공유하기"}
    </Button>
  );
}
