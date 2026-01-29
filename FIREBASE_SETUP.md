# Firebase 설정 및 연동 가이드

## 1. Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에 접속하여 구글 계정으로 로그인합니다.
2. **"프로젝트 만들기"** (또는 "Create a project")를 클릭합니다.
3. 프로젝트 이름을 입력하고(예: `myspace-dashboard`), 계속 진행하여 프로젝트를 생성합니다.

## 2. 웹 앱 등록 및 설정 가져오기
1. 프로젝트 개요 페이지에서 중앙의 **웹 아이콘 (</>)** 을 클릭하여 웹 앱을 추가합니다.
2. 앱 닉네임을 입력하고 **"앱 등록"**을 누릅니다.
3. 등록 후 나타나는 `firebaseConfig` 객체의 내용을 확인합니다. 이 값들이 `.env` 파일에 들어갈 내용입니다.
   - `apiKey`, `authDomain`, `projectId` 등을 메모장이나 클립보드에 복사해 두세요.

## 3. Authentication (인증) 설정
1. 왼쪽 메뉴에서 **빌드(Build) > Authentication**을 클릭합니다.
2. **"시작하기"** 버튼을 누릅니다.
3. **Sign-in method** 탭에서 **Google**을 선택합니다.
4. 우측 상단의 **사용 설정(Enable)** 토글을 켭니다.
5. **프로젝트 지원 이메일**을 선택하고 **"저장"**을 클릭합니다.

## 4. Firestore Database 설정
1. 왼쪽 메뉴에서 **빌드(Build) > Firestore Database**를 클릭합니다.
2. **"데이터베이스 만들기"**를 클릭합니다.
3. 보안 규칙 설정에서 **"테스트 모드에서 시작"**을 선택하고 **"다음"**을 누릅니다.
   - *주의: 테스트 모드는 30일 동안 모든 사용자의 접근을 허용합니다. 개발 후에는 보안 규칙을 강화해야 합니다.*
4. Cloud Firestore 위치를 선택합니다 (예: `asia-northeast3` (서울) 또는 기본값). **"사용 설정"**을 클릭합니다.

## 5. Google Calendar API 활성화 (필수)
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속하여 상단 프로젝트 선택창에서 Firebase 프로젝트를 선택합니다.
2. 좌측 메뉴에서 **APIs & Services > Library**를 클릭합니다.
3. 검색창에 **"Google Calendar API"**를 검색하고 선택합니다.
4. **"Enable" (사용 설정)** 버튼을 클릭합니다.
   - *이 과정이 없으면 403 Forbidden 에러가 발생합니다.*

## 6. 환경 변수 파일 (.env) 생성
프로젝트 루트 폴더(`c:\Users\user\.gemini\antigravity\MySpaceDashboard`)로 이동하여 `.env` 파일을 생성(또는 이미 있다면 수정)하고, 아까 복사해둔 설정값을 아래와 같이 입력합니다.

> **주의**: 파일 이름은 반드시 `.env` 또는 `.env.local` 이어야 합니다.

```env
VITE_FIREBASE_API_KEY=복사한_apiKey_값
VITE_FIREBASE_AUTH_DOMAIN=복사한_authDomain_값
VITE_FIREBASE_PROJECT_ID=복사한_projectId_값
VITE_FIREBASE_STORAGE_BUCKET=복사한_storageBucket_값
VITE_FIREBASE_MESSAGING_SENDER_ID=복사한_messagingSenderId_값
VITE_FIREBASE_APP_ID=복사한_appId_값
```

## 6. 실행 및 확인
1. 터미널에서 `npm run dev` 명령어로 개발 서버를 실행합니다.
2. 브라우저(`http://localhost:5173`)에서 우측 상단의 **"Google 로그인"** 버튼을 누릅니다.
3. 팝업창에서 구글 계정으로 로그인하고, 캘린더 접근 권한을 **허용**합니다.
4. 로그인이 완료되면 "할 일" 탭과 "일정" 탭이 정상적으로 작동하는지 확인합니다.

---
**문제 해결 팁:**
- 로그인 팝업이 바로 닫히거나 에러가 난다면, Firebase Console의 Authentication 설정에서 **승인된 도메인**에 `localhost`가 포함되어 있는지 확인하세요 (기본적으로 포함됨).
- Firestore 에러(`Missing or insufficient permissions`)가 발생하면 Firestore 보안 규칙(Rules) 탭을 확인하세요.
- **"The query requires an index" 에러**:
  - Firestore에서 `where`와 `orderBy`를 같이 사용하려면 **색인(Index)**이 필요합니다.
  - 브라우저 개발자 도구(F12) > Console 탭에 표시된 **긴 에러 메시지 링크**를 클릭하세요.
  - Firebase Console로 이동하여 **"Create index"** 버튼만 누르면 자동으로 생성됩니다. (Sites, Todos 각각 한 번씩 필요)
