# 배포 안내 (Vercel)

이 프로젝트는 Next.js 서버 앱(API 라우트 `/api/board`, 동적 라우트 `/[slug]`)이라
**GitHub Pages(정적 호스팅)에서는 동작하지 않습니다.** Vercel(무료)에 배포하세요.

## 1. Vercel에 저장소 연결
1. https://vercel.com 에서 GitHub 계정으로 로그인
2. **Add New → Project** → `kusc-hsbg/affinity-board` 선택 → **Import**
3. Framework는 자동으로 **Next.js**로 인식됩니다. 빌드 설정은 기본값 그대로 두세요.

## 2. 환경변수 2개 등록 (중요)
Import 화면(또는 Project → Settings → Environment Variables)에서 아래 2개를 추가:

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://umjgzzxzvjypojqtkbqo.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API 의 **service_role** 키 |

- 이 키들은 **서버에서만** 쓰이므로 브라우저에 노출되지 않습니다(안전).
- service_role 키는 비밀이므로 저장소(코드)에 넣지 마세요. Vercel 환경변수로만 넣습니다.

## 3. Deploy
**Deploy** 버튼을 누르면 몇 분 뒤 `https://<프로젝트명>.vercel.app` 주소가 생깁니다.
- 로그인 테스트: `.../user_090406` 접속 → 비밀번호 `090406`

## 4. (선택) GitHub Pages 정리
기존 GitHub Pages(`kusc-hsbg.github.io/affinity-board`)는 정적 `docs/` 폴더라 이제 사용하지 않습니다.
혼동을 막으려면 GitHub → Settings → Pages 에서 **Source를 None**으로 꺼두는 것을 권장합니다.

## 이후 코드 변경 시
`main` 브랜치에 push하면 Vercel이 **자동으로 재배포**합니다. (`npm run dev`는 로컬 개발용일 뿐,
GitHub이나 Vercel에서 직접 실행할 필요 없습니다.)
