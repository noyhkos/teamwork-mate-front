# teamwork-mate · front

TeamworkMate의 웹 프론트엔드.

🔗 **https://teamsaju.com**

👉 전체 프로젝트 설명은 [api 저장소](https://github.com/noyhkos/teamwork-mate-api)에 있습니다.

## 화면

| 경로 | 용도 |
|---|---|
| `/` | 팀 생성 (이름 필수) + 최근 만든 팀 |
| `/t/[token]` | **대기실** — 초대 링크, 팀원 목록, 추가·삭제, 분석 실행, 리포트 열람 |
| `/r/[slug]` | 공개 리포트 — 요약 · 관계 · 역할 3탭 (서버 컴포넌트) |
| `/design-system` | 토큰과 컴포넌트를 한 페이지에 렌더한 살아있는 레퍼런스 |

초대용 화면(`/t/[invite]`)과 관리자 화면(`/a/[admin]`)이 따로 있었지만 **대기실 하나로 합쳤습니다.** 단톡방에 링크를 던지는 서비스에 "관리자"라는 역할이 없기 때문입니다 — 설계 배경은 [api README의 권한 모델 항목](https://github.com/noyhkos/teamwork-mate-api#설계-결정)에 적어뒀습니다.

## 디자인 시스템

**한지 × 먹 × 오방색.** 종이 질감 배경(`#f6f0e1`)에 먹색 본문, 낙관을 연상시키는 주색(`#c3402b`)이 화면당 딱 하나의 행동만 표시합니다. 규칙 전문은 [`design-system/MASTER.md`](design-system/MASTER.md)에 있고, `/design-system`이 그걸 그대로 렌더합니다.

컴포넌트 라이브러리를 쓰지 않고 프리미티브 7종을 직접 만들었습니다. 화면이 네 개뿐이고, 정작 필요한 컨트롤(원하는 연도에서 열리는 생년월일 달력)은 범용 데이트피커와 싸워야 했을 것이기 때문입니다.

모바일에서 실제로 깨졌던 것들을 규칙으로 박아뒀습니다.

- **컨트롤은 전부 16px** — iOS Safari는 그보다 작은 입력에 포커스가 가면 페이지를 확대하고 **다시 되돌리지 않습니다.** 크기는 폰트가 아니라 패딩으로 만듭니다.
- **탭 타겟 44px 이상** — 패딩이 아니라 `min-h-touch`로 강제합니다. 유일한 예외는 달력 날짜 칸(320px에 7열이 들어가야 해서 ~29px, WCAG 2.5.8 최소 24px 위)이고 문서에 예외로 명시돼 있습니다.
- **배경 그라데이션은 뷰포트에 고정** — `body`에 그리면 문서 전체 높이로 늘어나 색 단계가 수백 px에 퍼지면서 눈에 띄게 띠가 집니다. `background-attachment: fixed`는 iOS Safari가 가장 못 다루는 속성이라 쓰지 않고 `body::before`로 처리했습니다.

## 비동기 분석과 폴링

`POST /analyze`가 `202`를 반환하고 워커가 뒤에서 처리하므로, 대기실은 `collecting`일 때 5초·`processing`일 때 2초 간격으로 폴링합니다. **모으는 중에도 폴링합니다** — 팀원이 들어오는 게 정확히 그 구간이라, 그때 멈춰 있으면 다른 기기에서 추가한 멤버가 안 보입니다. 백그라운드 탭에서는 `visibilitychange`로 요청을 멈춥니다.

리포트가 나온 뒤 명단이 바뀌면 **리포트가 설명하는 사람들과 현재 명단을 집합으로 비교해** 다시 분석 버튼을 띄웁니다. 타임스탬프 대신 집합을 쓰는 이유는 삭제와 동수 교체까지 잡히기 때문입니다.

## 링크 미리보기

`opengraph-image.tsx` 규약으로 OG 카드를 만듭니다. 초대 링크 카드는 서버에서 팀을 읽어 이름과 인원을 넣고, 분석이 끝나면 문구가 `나도 참여하기`에서 `리포트 보러 가기`로 바뀝니다. satori에는 한글 글리프가 없어 폰트를 요청마다 함께 실어 보냅니다.

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
