# 중고거래 플랫폼

이 프로젝트는 Next.js를 사용하여 개발된 중고거래 플랫폼입니다. 사용자는 상품을 등록하고, 다른 사용자와 채팅을 통해 거래할 수 있습니다.

## 프로젝트 개발 방식

- **v0**로 Next.js 기반의 기본 프로젝트 프레임을 생성하였습니다.
- 이후 **Windsurf** 기반의 AI IDE를 활용하여 주요 기능 추가 및 UI/UX 개선을 빠르게 진행하였습니다.

## 주요 변경 및 개선 내역

- **관리자 페이지 탭별 분리**: 신고 관리, 사용자 관리, 상품 관리 탭에서 각기 다른 내용을 볼 수 있도록 개선.
- **레이아웃 개선**: 관리자, 채팅, 상품 목록 등 주요 화면에 중앙 정렬 및 좌우 여백이 적용되어 더 깔끔한 UI 제공.
- **컴포넌트 분기 렌더링**: 각 탭/화면에서 전달받은 prop에 따라 적절한 UI만 렌더링하도록 컴포넌트 구조 개선.

## 기능

- 사용자 인증 (회원가입, 로그인)
- 상품 등록 및 관리
- 상품 검색 및 조회
- 실시간 채팅
- 신고 기능
- 관리자 페이지 (신고/사용자/상품 관리 탭, 각기 다른 관리 기능)
- 프로필에서 내 잔액/거래내역 확인
- 물건 구매 시, 송금 기능

## 기술 스택

- **프론트엔드**: Next.js, React, Tailwind CSS, shadcn/ui
- **백엔드**: Next.js API Routes
- **데이터베이스**: SQLite, Drizzle ORM
- **인증**: JWT

## 로컬 환경에서 실행하기

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 방법

1. 저장소를 클론합니다:

```bash
git clone https://github.com/yourusername/tinysecondhandplatform.git
cd tinysecondhandplatform
```

2. 의존성을 설치합니다:

```bash
npm install
# 또는
yarn install
```

3. 환경 변수를 설정합니다:

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```bash
JWT_SECRET=your-secret-key
```

4. 개발 서버를 실행합니다:

```bash
npm run dev
# 또는
yarn dev
```

5. 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속합니다.

### 테스트 계정

다음 계정으로 로그인할 수 있습니다:

- **관리자 계정**:

  - 이메일: admin@example.com
  - 비밀번호: Admin123!

- **일반 사용자 계정**:
  - 이메일: user1@example.com
  - 비밀번호: User123!

## 데이터베이스

이 프로젝트는 SQLite를 사용합니다. 데이터베이스 파일은 `sqlite.db`로 프로젝트 루트에 생성됩니다.

### 데이터베이스 스키마

- **users**: 사용자 정보
- **products**: 상품 정보
- **reports**: 신고 정보
- **chatRooms**: 채팅방 정보
- **chatMessages**: 채팅 메시지

## 데이터베이스 설정

이 프로젝트는 SQLite 데이터베이스를 사용합니다. SQLite는 파일 기반 데이터베이스이므로 별도의 데이터베이스 서버 실행이 필요하지 않습니다.

### 초기 설정

처음 프로젝트를 설정할 때 다음 명령어를 실행하세요:

1. 데이터베이스 스키마 생성:

```bash
npx prisma db push
```

2. (선택사항) 초기 데이터 생성:

```bash
npx prisma db seed
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 시작되면 SQLite 데이터베이스는 자동으로 연결됩니다. 데이터베이스 파일은 `prisma/dev.db`에 저장됩니다.
