#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
아임웹 게시판 전체 이관 자동화.
 - slugs.txt 의 학생별로: 원본 아임웹 인증(비번=슬러그 숫자) -> 전체 글 수집
 - 본문/썸네일 이미지를 Cloudflare R2 에 업로드하고 URL 교체
 - Supabase(students/posts)에 직접 반영 (REST API)
재실행 안전(resumable): 완료 학생/업로드 이미지는 건너뜀.

필요 환경변수:
  R2_ENDPOINT           예: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  R2_ACCESS_KEY_ID
  R2_SECRET_ACCESS_KEY
  R2_BUCKET             예: affinity-board
  R2_PUBLIC_BASE        공개 URL 베이스 예: https://pub-xxxx.r2.dev  (또는 커스텀 도메인)
  SUPABASE_URL          예: https://umjgzzxzvjypojqtkbqo.supabase.co
  SUPABASE_SERVICE_ROLE_KEY

선택:
  SLUGS_FILE=slugs.txt  OUTDIR=migrate_out  START=  LIMIT=   (파일럿용: 앞 N명만)

사전 설치:  pip install boto3 requests
실행:       python migrate_all.py
"""
import os, re, sys, json, time, hashlib, subprocess, html as _html
from datetime import datetime, timedelta, timezone

SITE = "https://affinityuniverse.com"
Q = "YToxOntzOjEyOiJrZXl3b3JkX3R5cGUiO3M6MzoiYWxsIjt9"
KST = timezone(timedelta(hours=9))

def env(k, d=None):
    v = os.environ.get(k, d)
    return v

R2_ENDPOINT = env("R2_ENDPOINT"); R2_KEY = env("R2_ACCESS_KEY_ID"); R2_SECRET = env("R2_SECRET_ACCESS_KEY")
R2_BUCKET = env("R2_BUCKET"); R2_PUBLIC = (env("R2_PUBLIC_BASE") or "").rstrip("/")
SB_URL = (env("SUPABASE_URL") or "").rstrip("/"); SB_KEY = env("SUPABASE_SERVICE_ROLE_KEY")
OUTDIR = env("OUTDIR", "migrate_out"); SLUGS_FILE = env("SLUGS_FILE", "slugs.txt")
START = int(env("START", "0")); LIMIT = int(env("LIMIT", "0"))

for need in ["R2_ENDPOINT","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_BUCKET","R2_PUBLIC_BASE","SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY"]:
    if not env(need):
        print(f"[중단] 환경변수 {need} 가 없습니다. 스크립트 상단 설명 참고.", file=sys.stderr); sys.exit(1)

try:
    import boto3, requests
except ImportError:
    print("[중단] pip install boto3 requests  먼저 실행하세요.", file=sys.stderr); sys.exit(1)

os.makedirs(OUTDIR, exist_ok=True)
IMG = os.path.join(OUTDIR, "img"); os.makedirs(IMG, exist_ok=True)
MANIFEST = os.path.join(OUTDIR, "r2_manifest.json"); DONEF = os.path.join(OUTDIR, "done.txt")
LOG = open(os.path.join(OUTDIR, "migrate.log"), "a", encoding="utf-8")

def log(*a):
    m = " ".join(str(x) for x in a); print(m, flush=True); LOG.write(m + "\n"); LOG.flush()

s3 = boto3.client("s3", endpoint_url=R2_ENDPOINT, aws_access_key_id=R2_KEY,
                  aws_secret_access_key=R2_SECRET, region_name="auto")
manifest = json.load(open(MANIFEST, encoding="utf-8")) if os.path.exists(MANIFEST) else {}
done = set(open(DONEF, encoding="utf-8").read().split()) if os.path.exists(DONEF) else set()
sb = requests.Session(); sb.headers.update({"apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY})

def save_manifest():
    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), ensure_ascii=False)

def curl(url, cj, data=None, xhr=False):
    args = ["curl", "-s", "--max-time", "40", "-b", cj, "-c", cj]
    if xhr: args += ["-H", "X-Requested-With: XMLHttpRequest"]
    if data is not None: args += ["-X", "POST", "--data", data]
    return subprocess.run(args + [url], capture_output=True).stdout.decode("utf-8", "replace")

def auth(slug, cj):
    pw = re.match(r'user_(\d+)', slug); pw = pw.group(1) if pw else ""
    page = curl(f"{SITE}/{slug}", cj)
    code = re.search(r'name="menu_code"[^>]*value="([^"]+)"', page)
    if not code: return False, pw
    r = curl(f"{SITE}/ajax/check_menu_pass.cm", cj,
             data=f"menu_code={code.group(1)}&menu_pos=main&password={pw}", xhr=True)
    return ("SUCCESS" in (r or "")), pw

CT = {"png":"image/png","jpg":"image/jpeg","jpeg":"image/jpeg","gif":"image/gif","webp":"image/webp","svg":"image/svg+xml","bmp":"image/bmp"}

def r2_upload(url):
    url = _html.unescape(url)
    if url in manifest: return manifest[url]
    ext = url.split("?")[0].rsplit(".", 1)[-1].lower()
    if len(ext) > 4 or "/" in ext: ext = "png"
    key = "board/" + hashlib.md5(url.encode()).hexdigest() + "." + ext
    local = os.path.join(IMG, hashlib.md5(url.encode()).hexdigest() + "." + ext)
    subprocess.run(["curl", "-sSL", "--max-time", "60", url, "-o", local])
    if not os.path.exists(local) or os.path.getsize(local) < 50:
        return url  # 다운로드 실패 시 원본 유지
    s3.upload_file(local, R2_BUCKET, key, ExtraArgs={"ContentType": CT.get(ext, "image/png")})
    pub = f"{R2_PUBLIC}/{key}"; manifest[url] = pub
    try: os.remove(local)
    except OSError: pass
    return pub

def extract_div(h, s):
    depth = 0; i = s; n = len(h)
    while i < n:
        if h.startswith("<div", i): depth += 1; i += 4
        elif h.startswith("</div", i):
            depth -= 1; i += 5
            if depth == 0:
                j = h.find(">", i); return h[s:j+1]
        else: i += 1
    return h[s:]

def rewrite(body):
    return re.sub(r'(<img\b[^>]*\bsrc=")(https?://[a-z.\-]*imweb\.me[^"]+)(")',
                  lambda m: m.group(1) + r2_upload(m.group(2)) + m.group(3), body, flags=re.I)

def parse_cards(t):
    out = []
    for am in re.finditer(r'<a class="post_link_wrap[^"]*"[^>]*href="([^"]*idx=(\d+)[^"]*)"[^>]*>', t):
        idx = am.group(2); end = t.find("</a>", am.end()); inner = t[am.end():end if end > 0 else am.end()+4000]
        thumb = ""; tm = re.search(r'background-image:\s*url\((?:&quot;|["\']?)(https?://[^"\')&]+)', inner)
        if tm: thumb = tm.group(1)
        cat = ""; cm = re.search(r'<em style="[^"]*color:#000[^"]*"[^>]*>([^<]*)</em>', inner)
        if cm: cat = _html.unescape(cm.group(1)).strip()
        title = ""; tb = re.search(r'<div class="title title-block">(.*?)</div>', inner, re.S)
        if tb:
            raw = re.sub(r'<!--.*?-->', '', tb.group(1), flags=re.S)
            raw = re.sub(r'<em[^>]*>.*?</em>', '', raw, flags=re.S); raw = re.sub(r'<[^>]+>', '', raw)
            title = _html.unescape(raw).strip()
        dm = re.search(r'_p(\d{8})', inner); date = dm.group(1) if dm else ""
        out.append({"idx": idx, "category": cat, "title": title, "thumb": thumb, "date": date})
    return out

def scrape(slug):
    cj = os.path.join(OUTDIR, f"cj_{slug}.txt")
    ok, pw = auth(slug, cj)
    if not ok:
        try: os.remove(cj)
        except OSError: pass
        return None
    cards = {}; order = []; name = ""
    for p in range(1, 16):
        lp = curl(f"{SITE}/{slug}/?q={Q}&page={p}", cj)
        if p == 1:
            nm = re.search(r'<h[1-6][^>]*>\s*([가-힣]{2,10})\s*</h', lp); name = nm.group(1) if nm else ""
        new = 0
        for c in parse_cards(lp):
            if c["idx"] not in cards: cards[c["idx"]] = c; order.append(c["idx"]); new += 1
        if new == 0: break
    posts = []
    for idx in order:
        c = cards[idx]; v = curl(f"{SITE}/{slug}/?q={Q}&bmode=view&idx={idx}&t=board", cj)
        m = re.search(r'<div class="margin-top-xxl _comment_body', v)
        if not m: continue
        body = rewrite(extract_div(v, m.start()))
        thumb = r2_upload(c["thumb"]) if c["thumb"] else ""
        posts.append({**c, "body": body, "thumbR2": thumb})
    try: os.remove(cj)
    except OSError: pass
    return {"slug": slug, "name": name, "pw": pw, "posts": posts}

def push_supabase(st):
    slug = st["slug"]
    # 1) 학생 upsert
    sb.post(f"{SB_URL}/rest/v1/students",
            headers={"Content-Type": "application/json", "Prefer": "resolution=merge-duplicates,return=minimal"},
            data=json.dumps([{"slug": slug, "password": st["pw"], "name": st["name"]}]))
    # 2) 기존 글 삭제
    sb.delete(f"{SB_URL}/rest/v1/posts?student_id=eq.{slug}", headers={"Prefer": "return=minimal"})
    # 3) 글 삽입 (created_at 오름차순 유지: 오래된 글 먼저)
    asc = sorted(st["posts"], key=lambda p: int(p["idx"]))
    rows = []
    for rank, p in enumerate(asc):
        d = p["date"]
        if d and len(d) == 8:
            base = datetime(int(d[:4]), int(d[4:6]), int(d[6:8]), 0, 0, 0, tzinfo=KST)
        else:
            base = datetime(2020, 1, 1, tzinfo=KST)
        ts = (base + timedelta(seconds=rank)).isoformat()
        rows.append({"student_id": slug, "category": p["category"], "title": p["title"],
                     "body": p["body"], "thumb_url": p["thumbR2"], "created_at": ts})
    for i in range(0, len(rows), 50):
        r = sb.post(f"{SB_URL}/rest/v1/posts",
                    headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
                    data=json.dumps(rows[i:i+50]))
        if r.status_code >= 300:
            raise RuntimeError(f"posts insert 실패 {r.status_code}: {r.text[:300]}")

def main():
    slugs = [x.strip() for x in open(SLUGS_FILE, encoding="utf-8") if x.strip()]
    if START: slugs = slugs[START:]
    if LIMIT: slugs = slugs[:LIMIT]
    log(f"=== 시작: {len(slugs)}명 (완료 {len(done)}명 건너뜀) {datetime.now()} ===")
    for n, slug in enumerate(slugs, 1):
        if slug in done:
            continue
        try:
            st = scrape(slug)
            if st is None:
                log(f"[{n}/{len(slugs)}] {slug} 인증실패/스킵"); continue
            push_supabase(st)
            save_manifest()
            with open(DONEF, "a", encoding="utf-8") as f: f.write(slug + "\n")
            done.add(slug)
            log(f"[{n}/{len(slugs)}] {slug} ({st['name']}) 글 {len(st['posts'])}개 완료")
        except Exception as e:
            log(f"[{n}/{len(slugs)}] {slug} 오류: {e}")
            time.sleep(2)
    log(f"=== 종료 {datetime.now()} 완료 {len(done)}명 ===")

if __name__ == "__main__":
    main()
