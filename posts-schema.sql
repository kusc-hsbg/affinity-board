-- Affinity Universe — 블로그 글(posts) 테이블
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요. (한 번만)

create table if not exists public.posts (
  id         bigint generated always as identity primary key,
  student_id text,                       -- 어느 학생 페이지의 글인지 (user_XXXX)
  category   text default '',            -- 분류(예: 마케팅, 공지)
  title      text default '',
  body       text default '',            -- 본문 HTML (에디터 서식 포함)
  thumb_url  text default '',            -- 카드 썸네일 이미지 URL(선택)
  created_at timestamptz default now()   -- 올린 날짜(자동). 목록/표시 날짜 기준
);

create index if not exists posts_student_idx on public.posts (student_id, created_at desc);
