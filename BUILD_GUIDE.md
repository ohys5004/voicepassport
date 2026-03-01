# VoicePassport — 해커톤 빌딩 가이드

## 컨셉
30초 영어 자기소개 → 내 목소리 그대로 30+ 언어 자기소개 생성 → QR코드로 공유

## 사용하는 ElevenLabs 기능 (4가지)
1. **Voice Cloning** — 사용자 목소리 복제
2. **Scribe V2** — 녹음 → 텍스트 변환
3. **TTS v3** — 번역된 텍스트 → 사용자 목소리로 음성 생성
4. **Conversational AI Agent** (보너스) — "이 사람에 대해 더 알려줘" 챗봇

## 기술 스택
- **Frontend**: Next.js 14 (App Router)
- **API**: ElevenLabs API (Voice Clone, Scribe, TTS)
- **번역**: OpenAI API (GPT-4o) 또는 Google Translate
- **QR**: qrcode 라이브러리
- **배포**: Vercel

## 빌딩 순서

### Phase 1: 기본 구조 (1시간)
- [ ] Next.js 프로젝트 생성
- [ ] ElevenLabs API 키 설정
- [ ] 녹음 기능 (브라우저 MediaRecorder)
- [ ] 기본 UI (녹음 → 재생)

### Phase 2: Voice Clone + 텍스트 변환 (1시간)
- [ ] 녹음 파일 → ElevenLabs Voice Clone API
- [ ] 녹음 파일 → Scribe V2 (텍스트 변환)
- [ ] 변환된 텍스트 표시

### Phase 3: 다국어 생성 (1시간)
- [ ] 텍스트 → GPT-4o로 10개 언어 번역
- [ ] 각 번역 → TTS v3 (클론된 목소리)로 음성 생성
- [ ] 언어별 오디오 플레이어

### Phase 4: QR + 공유 (30분)
- [ ] 고유 URL 생성
- [ ] QR코드 생성
- [ ] 공유 페이지 (언어 선택 → 재생)

### Phase 5: Agent 보너스 (30분)
- [ ] ElevenLabs Conversational AI Agent 연동
- [ ] "이 사람에 대해 더 알려줘" 음성 챗봇

## API 엔드포인트 정리

### Voice Cloning (Instant)
```
POST https://api.elevenlabs.io/v1/voices/add
- name: "user_voice"
- files: [녹음 파일]
→ voice_id 반환
```

### Scribe V2 (Speech-to-Text)
```
POST https://api.elevenlabs.io/v1/speech-to-text
- file: 녹음 파일
- model_id: "scribe_v2"
→ transcription 반환
```

### TTS (Text-to-Speech)
```
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
- text: 번역된 텍스트
- model_id: "eleven_multilingual_v2"
→ 오디오 파일 반환
```

## 데모 시나리오
1. Kelly가 30초 영어 자기소개 녹음
2. 실시간으로 텍스트 변환 표시
3. "Generate Passport" 버튼 클릭
4. 10개 언어로 Kelly 목소리 자기소개 생성
5. QR코드 생성 → 관객이 스캔 → 자기 언어로 들음
6. (보너스) "Ask about Kelly" 버튼 → AI 에이전트와 대화
