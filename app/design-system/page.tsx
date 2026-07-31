"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import Card, { SectionTitle } from "@/components/ui/card";
import Chip from "@/components/ui/chip";
import DateField from "@/components/ui/date-field";
import Field, { CheckboxRow, Select, TextInput } from "@/components/ui/field";
import Segmented from "@/components/ui/segmented";
import Sheet from "@/components/ui/sheet";

const SURFACES = [
  ["paper", "#f6f0e1", "페이지 배경"],
  ["paper-soft", "#efe7d2", "눌린 블록"],
  ["card", "#fefcf5", "카드 표면"],
] as const;

const INK = [
  ["ink", "#26221c", "본문"],
  ["ink-soft", "#6d6558", "보조"],
  ["ink-faint", "#b4aa96", "캡션·비활성"],
] as const;

const ELEMENTS = [
  ["wood", "bg-wood", "목"],
  ["fire", "bg-fire", "화"],
  ["earth", "bg-earth", "토"],
  ["metal", "bg-metal", "금"],
  ["water", "bg-water", "수"],
] as const;

/** Living reference for design-system/MASTER.md. Keep the two in sync. */
export default function DesignSystemPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [date, setDate] = useState("");
  const [seg, setSeg] = useState<"solar" | "lunar">("solar");
  const [checked, setChecked] = useState(false);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-tag uppercase text-vermilion">design system</p>
        <h1 className="font-serif text-3xl font-bold leading-tight">팀사주 디자인 시스템</h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          한지 × 먹 × 오방색. 규칙의 원본은 <code className="text-ink">design-system/MASTER.md</code>,
          이 페이지는 그 규칙이 실제로 렌더된 모습이에요.
        </p>
      </header>

      <Row title="색" eyebrow="color">
        <Swatches items={SURFACES} />
        <Swatches items={INK} />
        <div className="flex flex-wrap gap-2">
          <Chip tone="seal">vermilion · 도장</Chip>
          {ELEMENTS.map(([name, cls, ko]) => (
            <Chip key={name} dot={cls}>{ko} {name}</Chip>
          ))}
        </div>
      </Row>

      <Row title="타이포" eyebrow="type">
        <Card className="space-y-3">
          <p className="text-tag uppercase text-ink-faint">text-tag · 아이브로우</p>
          <p className="font-serif text-3xl font-bold leading-tight">MaruBuri 제목 3xl</p>
          <p className="font-serif text-lg font-bold">MaruBuri 제목 lg</p>
          <p className="text-base">Noto Sans KR 본문 base — 컨트롤은 항상 16px</p>
          <p className="text-sm text-ink-soft">본문 sm · 보조 텍스트</p>
          <p className="text-xs text-ink-faint">캡션 xs</p>
        </Card>
      </Row>

      <Row title="반경" eyebrow="radius">
        <div className="flex flex-wrap items-end gap-3">
          {[
            ["rounded-card", "3px", "카드"],
            ["rounded-control", "8px", "버튼·입력"],
            ["rounded-full", "∞", "칩"],
          ].map(([cls, px, use]) => (
            <div key={cls} className="space-y-1.5 text-center">
              <div className={`h-16 w-20 border border-ink/25 bg-card ${cls}`} />
              <p className="text-xs text-ink">{px}</p>
              <p className="text-xs text-ink-faint">{use}</p>
            </div>
          ))}
        </div>
      </Row>

      <Row title="버튼" eyebrow="button">
        <div className="space-y-2.5">
          <Button full size="lg">primary · lg</Button>
          <Button full variant="seal">seal · md</Button>
          <Button full variant="outline">outline · md</Button>
          <Button full loading>loading</Button>
          <Button full disabled>disabled</Button>
          <div className="pt-1"><Button variant="quiet">quiet</Button></div>
          <p className="text-xs text-ink-faint">
            모든 버튼의 최소 높이는 44px(<code>min-h-touch</code>)예요.
          </p>
        </div>
      </Row>

      <Row title="입력" eyebrow="form">
        <Card className="space-y-4">
          <Field label="닉네임" hint="라벨·에러·aria는 Field가 자동으로 연결해요">
            {(aria) => <TextInput {...aria} placeholder="예: 석현" />}
          </Field>
          <Field label="에러 상태" error="이 값은 필요해요.">
            {(aria) => <TextInput {...aria} defaultValue="" />}
          </Field>
          <Field label="선택">
            {(aria) => (
              <Select {...aria} defaultValue="INTP">
                {["INTP", "ENTJ", "ISFP"].map((m) => <option key={m}>{m}</option>)}
              </Select>
            )}
          </Field>
          <Segmented
            label="세그먼티드 (2~3지 선다)"
            value={seg}
            onChange={setSeg}
            options={[{ value: "solar", label: "양력" }, { value: "lunar", label: "음력" }]}
          />
          <CheckboxRow checked={checked} onChange={setChecked}>
            체크박스는 행 전체가 탭 영역이에요
          </CheckboxRow>
        </Card>
      </Row>

      <Row title="날짜" eyebrow="date-field">
        <Card className="space-y-3">
          <DateField label="생년월일" value={date} onChange={setDate} />
          <p className="text-xs leading-relaxed text-ink-faint">
            네이티브 <code>type=&quot;date&quot;</code>를 쓰지 않아요. 브라우저 로케일을 따라가
            mm/dd/yyyy로 뜨고, 320px에서 폭이 안 나오고, 1999년 생일까지 가는 데 탭이 수십 번
            들어요. 숫자만 쳐도 <code>yyyy-mm-dd</code>로 맞춰지고, 연·월은 셀렉트로 한 번에 점프해요.
          </p>
        </Card>
      </Row>

      <Row title="시트" eyebrow="sheet">
        <div className="space-y-2">
          <Button full variant="outline" onClick={() => setSheetOpen(true)}>
            바텀 시트 열기
          </Button>
          <p className="text-xs text-ink-faint">
            포커스 진입·복귀, Tab 가둠, ESC 닫기, 배경 스크롤 잠금까지 시트가 소유해요.
          </p>
        </div>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="시트 예시">
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">
              엄지로 닿는 아래쪽에서 올라와요. 멤버 추가 폼이 이 안에 들어갑니다.
            </p>
            <Button full onClick={() => setSheetOpen(false)}>닫기</Button>
          </div>
        </Sheet>
      </Row>

      <Row title="오행 룰" eyebrow="brand">
        <div className="space-y-2">
          <div className="ohaeng-rule" aria-hidden><i /><i /><i /><i /><i /></div>
          <p className="text-xs text-ink-faint">
            페이지 크롬 · 시트 손잡이 · 로딩 펄스. 이 세 곳 밖에서는 오방색을 장식으로 쓰지 않아요.
          </p>
        </div>
      </Row>
    </div>
  );
}

function Row({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <SectionTitle eyebrow={eyebrow}>{title}</SectionTitle>
      {children}
    </section>
  );
}

function Swatches({ items }: { items: readonly (readonly [string, string, string])[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map(([name, hex, use]) => (
        <div key={name} className="space-y-1.5">
          <div className="h-14 w-24 rounded-card border border-ink/20" style={{ background: hex }} />
          <p className="text-xs text-ink">{name}</p>
          <p className="text-xs text-ink-faint">{use}</p>
        </div>
      ))}
    </div>
  );
}
