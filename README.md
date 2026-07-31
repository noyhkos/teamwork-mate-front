# teamwork-mate · front

TeamworkMate의 웹 프론트엔드.

🔗 **https://teamsaju.com**

👉 전체 프로젝트 설명은 [api 저장소](https://github.com/noyhkos/teamwork-mate-api)에 있습니다.

## 화면

| 경로 | 용도 |
|---|---|
| `/` | 팀 생성 + 초대 링크 복사 |
| `/t/[invite]` | 팀원 본인 입력 (생일·MBTI, "시간 몰라요" 토글) |
| `/a/[admin]` | 관리자 — 대리 입력, 분석 실행, 진행 상태 폴링 |
| `/r/[slug]` | 공개 리포트 (서버 컴포넌트, OG 카드 메타 포함) |

## 디자인

**한지 × 먹 × 오방색.** 사주라는 소재에 맞춰 종이 질감의 배경(`#f6f0e1`)과 먹색 본문, 낙관을 연상시키는 주색(`#c3402b`) 포인트로 구성했습니다. 오행 다섯 색은 헤더 괘선과 원소 배지에 쓰입니다. 본문은 Noto Sans KR, 제목은 MaruBuri 세리프.

## 비동기 분석 처리

`POST /analyze`가 `202`를 반환하고 실제 작업은 워커가 처리하므로, 관리자 화면은 상태가 `processing`인 동안 2초 간격으로 폴링하다가 완료되면 리포트 링크를 띄웁니다.

## 실행

```bash
npm install
npm run dev
```

`/api` 요청은 `next.config.ts`의 rewrite로 백엔드에 프록시됩니다. 백엔드 주소는 `API_BASE_URL` 환경변수로 바꿀 수 있습니다 (기본 `http://localhost:8080`).

```bash
API_BASE_URL=https://<lambda-function-url> npm run dev
```

## 스택

Next.js 16 (App Router) · Tailwind CSS v4 · TypeScript
