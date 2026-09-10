-- Affinity Universe — Supabase 스키마
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.

-- 1) 학생(로그인) 테이블
create table if not exists public.students (
  slug       text primary key,          -- 접속 주소. 예: user_090406
  password   text not null,             -- 페이지 비밀번호
  name       text default '',           -- 학생 이름(표시용)
  created_at timestamptz default now()
);

-- 2) 갤러리(작품) 테이블
create table if not exists public.gallery (
  id         bigint generated always as identity primary key,
  student_id text,                       -- 비우면 전체 공통, user_XXXX면 해당 학생 전용
  image_url  text not null,              -- Storage 공개 URL 또는 외부 이미지 URL
  link_url   text default '',            -- 클릭 시 이동할 링크(선택)
  title      text default '',
  date       text default '',            -- 표시용 날짜 문자열
  visible    boolean default true,       -- false면 숨김
  created_at timestamptz default now()   -- 최신순 정렬 기준
);

-- 3) 설정(키-값) 테이블
create table if not exists public.settings (
  key   text primary key,
  value text default ''
);

-- 예시 데이터 -----------------------------------------------------------
insert into public.students (slug, password, name) values
  ('user_090406', '090406', '홍길동')
on conflict (slug) do nothing;

insert into public.gallery (student_id, image_url, title, date) values
  (null,           'https://picsum.photos/600?1', '공통 작품 예시', '2026-09'),
  ('user_090406',  'https://picsum.photos/600?2', '홍길동 작품 예시', '2026-09')
on conflict do nothing;

-- 보안(RLS): 서버(service_role 키)는 RLS를 우회하므로 굳이 켤 필요 없음.
-- 만약 브라우저에서 anon 키로 직접 읽게 할 계획이면 아래를 활성화하고 정책을 추가하세요.
-- alter table public.students enable row level security;
-- alter table public.gallery  enable row level security;
-- alter table public.settings enable row level security;
