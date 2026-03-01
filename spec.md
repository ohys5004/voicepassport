# VoicePassport — Product Spec

> "Your voice. Every language. One link."
> AI-powered multilingual voice business card. Like Linktree, but with your voice.

---

## 1. Core Concept

VoicePassport는 **AI 음성 명함**이다.
사용자가 30초 자기소개를 녹음하면, 본인 목소리 그대로 10개 언어 자기소개가 생성되고,
LinkedIn·GitHub 등 소셜 링크와 함께 **공유 가능한 프로필 링크 하나**로 완성된다.

**한 줄 비유**: Linktree + AI Voice Cloning = VoicePassport

---

## 2. User Flow

```
[Landing Page] — "Create Your VoicePassport" CTA
    ↓
[Step 1: Profile Setup]
    - 이름, 직함/한 줄 소개
    - 프로필 사진 (선택)
    - LinkedIn URL
    - GitHub URL (선택)
    - 추가 링크 (포트폴리오, 개인사이트, Twitter/X 등 — 최대 5개)
    ↓
[Step 2: Voice Recording]
    - 30초 녹음 (마이크 버튼)
    - 녹음 후 미리듣기 → 재녹음 가능
    ↓
[Step 3: Generate]
    - AI가 목소리 복제 + 텍스트 변환 + 10개 언어 음성 생성
    - 프로그레스 표시 (자연어 단계별)
    ↓
[Step 4: My VoicePassport — 공유 프로필 페이지]
    - 이름·직함·사진
    - 소셜 링크 버튼들 (각 링크 QR코드 포함)
    - 언어별 음성 카드 (클릭하면 재생)
    - 고유 URL: voicepassport.vercel.app/kelly-oh
    - 전체 프로필 QR코드
```

---

## 3. Pages

### 3.1 Landing Page (`/`)
- **스타일**: Framer 느낌, 프로페셔널 + 역동적 애니메이션
- **히어로 섹션**: 큰 타이틀 + "Create Your VoicePassport" CTA
- **데모 섹션**: 언어 카드가 순서대로 나타나는 애니메이션
- **How It Works**: 3단계 (Record → AI Generates → Share)
- **기술 용어 최소화**: "AI가 당신의 목소리로 10개 언어를 만듭니다" 수준
- 하단: "Powered by ElevenLabs" 배지

### 3.2 Create Page (`/create`)
- Step 1: 프로필 정보 입력 폼
- Step 2: 녹음 UI (큰 마이크 버튼, 타이머, 웨이브폼)
- Step 3: 생성 중 프로그레스
- 완료 후 → 프로필 페이지로 리다이렉트

### 3.3 Profile Page (`/[slug]` — 공유용)
- **명함 카드**: 이름, 직함, 사진, 소셜 아이콘들
- **QR 코드**: 프로필 링크 QR (명함 옆)
- **소셜 링크**: LinkedIn, GitHub 등 각각 버튼
- **Voice Section**: 언어별 카드 그리드 (국기 + 언어명 + 재생 버튼)
- 원본 녹음도 재생 가능
- **Share 버튼**: 링크 복사, QR 다운로드

---

## 4. 기능 상세

### 4.1 Voice Generation
- **속도**: 기본 속도보다 1.2x (약간 빠르게)
- **번역 톤**: 격식체가 아닌 **구어체/자연스러운 대화 톤**
  - 한국어: "안녕하세요, 저는 ~입니다" (존댓말이지만 딱딱하지 않게)
  - 일본어: "こんにちは、~と申します" (자기소개 자연 표현)
  - 각 언어 문화에 맞게 톤 조정
- **Voice Cloning**: ElevenLabs Instant Voice Clone
- **TTS**: eleven_multilingual_v2, stability 0.5, similarity 0.75, speed 1.2

### 4.2 Profile Links
- **필수**: 이름
- **선택**: 직함, 사진, LinkedIn, GitHub
- **추가 링크**: 최대 5개 (URL + 라벨)
  - 아이콘 자동 감지: linkedin.com → LinkedIn 아이콘, github.com → GitHub 아이콘 등
  - 나머지: 링크 아이콘

### 4.3 QR Code
- 프로필 전체 QR (메인)
- 각 소셜 링크별 작은 QR (선택적 표시)
- 다운로드 가능 (PNG)

### 4.4 Languages (v1: 10개)
| # | 언어 | 국기 |
|---|------|------|
| 1 | Korean | KR |
| 2 | Japanese | JP |
| 3 | Chinese (Mandarin) | CN |
| 4 | Spanish | ES |
| 5 | French | FR |
| 6 | German | DE |
| 7 | Portuguese | BR |
| 8 | Hindi | IN |
| 9 | Arabic | SA |
| 10 | Thai | TH |

---

## 5. Design Principles

1. **비개발자도 즉시 이해**: 기술 용어 노출 금지. "Scribe V2" → "AI Transcription" 조차 안 씀. 그냥 동작함.
2. **Framer 느낌**: 깔끔한 그래디언트, 부드러운 스크롤 애니메이션, 마이크로 인터랙션
3. **다크 모드 기본**: 보라~핑크 그래디언트 배경
4. **모바일 퍼스트**: 프로필 페이지는 모바일에서 가장 많이 열림

---

## 6. Tech Stack

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Animation | CSS animations + Framer Motion (선택) |
| Voice Clone | ElevenLabs Voice Clone API |
| STT | ElevenLabs Scribe V2 |
| TTS | ElevenLabs Multilingual v2 |
| Translation | OpenAI GPT-4o-mini |
| QR | qrcode 라이브러리 |
| Storage | 해커톤 v1: in-memory (localStorage) |
| Deploy | Vercel |

---

## 7. Data Model (v1: localStorage)

```typescript
interface VoicePassport {
  id: string;           // URL slug
  name: string;
  title?: string;       // 직함/한 줄 소개
  photo?: string;       // base64 or URL
  links: {
    url: string;
    label: string;
    type: 'linkedin' | 'github' | 'twitter' | 'website' | 'other';
  }[];
  originalAudio: string;    // base64
  transcript: string;
  voiceId: string;          // ElevenLabs voice clone ID
  languages: {
    code: string;
    name: string;
    flag: string;
    text: string;           // 번역된 텍스트
    audio: string;          // base64
  }[];
  createdAt: string;
}
```

---

## 8. Scope for Hackathon

### Must Have (MVP)
- [x] 녹음 + Voice Clone + 다국어 TTS (완료)
- [x] Landing page (Framer 스타일) — Framer Motion 애니메이션 적용
- [x] Profile setup (이름, 직함, LinkedIn, GitHub, 추가 링크)
- [x] Profile page (명함 + QR + Voice 카드)
- [x] 자연스러운 구어체 번역 + 속도 1.2x
- [ ] Vercel 배포

### Nice to Have
- [x] 프로필 사진 업로드 — base64 인코딩, 프로필 카드에 표시
- [x] 링크 아이콘 자동 감지 — SVG 아이콘 (LinkedIn, GitHub, X, Instagram, YouTube, Dribbble, Behance, Medium + 일반 링크)
- [x] QR 다운로드 (PNG) — QR 클릭 시 다운로드 + Download QR 버튼
- [x] Share 버튼 (링크 복사) — 서버 저장 + /p/[id] 공유 URL 생성 + 복사 피드백
- [x] Framer Motion 애니메이션 — 페이지 전환, 스태거 입장, 호버/탭 인터랙션, 오디오 비주얼라이저
