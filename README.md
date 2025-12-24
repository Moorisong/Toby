# 🎯 TOBY - 선생님을 위한 랜덤 도구

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)

교실에서 사용하는 랜덤 도구 모음입니다. 전자칠판/TV에서 사용하기 좋게 큰 UI로 설계되었습니다.

## ✨ 주요 기능

### 🎲 번호 뽑기
- 1~N번 학생 중 랜덤으로 번호 선택
- 제외 번호 설정 가능
- 슬롯머신 스타일 애니메이션

### 🎱 공 튀기기 (Ball Race)
- 물리 시뮬레이션 기반 공 레이스
- 고정 맵 / 랜덤 맵 모드
- 다양한 장애물: 기어, 범퍼, 스프링, 회전판, 바람 등
- 최대 50개 공 지원

### 🪑 자리 배치
- 짝꿍(2인 1조) 랜덤 배치
- 번호 모드 / 이름 모드 선택
- 고정석 설정 (특정 학생 위치 고정)
- PNG 이미지로 내보내기

## 🚀 시작하기

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🛠️ 기술 스택

- **프레임워크**: React 19 + TypeScript
- **빌드 도구**: Vite 7
- **라우팅**: React Router DOM
- **스타일링**: Vanilla CSS (인라인)
- **캔버스**: HTML5 Canvas API
- **이미지 내보내기**: html-to-image

## 📁 프로젝트 구조

```
src/
├── components/     # 공통 컴포넌트
│   └── Header.tsx
├── routes/         # 페이지 컴포넌트
│   ├── Home.tsx          # 메인 페이지
│   ├── NumberPicker.tsx  # 번호 뽑기
│   ├── BallPicker.tsx    # 공 튀기기
│   ├── SeatRandom.tsx    # 자리 배치
│   └── SeatSettings.tsx  # 자리 설정
├── canvas/         # 캔버스 관련
│   ├── Ball.ts
│   └── PhysicsEngine.ts
└── styles/
    └── global.css
```

## 💾 데이터 저장

- **localStorage**: 설정값 (줄 수, 학생 수, 모드, 이름 목록)
- **sessionStorage**: 고정석 데이터 (탭 닫으면 초기화)

## 🎨 디자인 원칙

1. **큰 UI**: 전자칠판에서도 잘 보이도록 1.5~2배 크기
2. **심플함**: 원클릭으로 핵심 기능 수행
3. **반응형**: 전체화면 모드에서도 레이아웃 유지
4. **모던**: 그라데이션, 호버 애니메이션, 카드 UI

## 📝 라이선스

Made with ❤️ for teachers
