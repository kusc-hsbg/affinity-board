import { google } from "googleapis";

const clientEmail =
  process.env.GOOGLE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL;
const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const spreadsheetId =
  process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID;

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export interface GalleryItem {
  studentId: string;
  imageUrl: string;
  linkUrl: string;
  title: string;
  date: string;
}

export interface BoardData {
  studentName: string;
  settings: Record<string, string>;
  items: GalleryItem[];
}

function sheetConfigured(): boolean {
  return Boolean(
    spreadsheetId && spreadsheetId !== "YOUR_GOOGLE_SHEET_ID_HERE" && clientEmail && privateKey
  );
}

async function readRange(range: string): Promise<string[][]> {
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return (res.data.values as string[][]) || [];
}

// 비밀번호 검증: 시트의 학생목록 우선, 시트 미설정/행 없음 시 URL 규칙(user_XXXX → XXXX) 사용
export async function verifyStudent(
  slug: string,
  password: string
): Promise<{ ok: boolean; name: string }> {
  const fallbackPw = slug.replace(/^user_/, "");

  if (sheetConfigured()) {
    try {
      const rows = await readRange("학생목록!A2:C1000");
      const row = rows.find((r) => (r[0] || "").trim() === slug);
      if (row) {
        return { ok: (row[1] || "").trim() === password, name: (row[2] || "").trim() };
      }
      // 시트에 등록되지 않은 학생 페이지는 접근 불가
      return { ok: false, name: "" };
    } catch (e) {
      console.error("학생목록 시트 읽기 실패, URL 규칙으로 대체:", e);
    }
  }
  return { ok: password === fallbackPw && fallbackPw.length > 0, name: "" };
}

// 갤러리 항목: 학생아이디가 비어있으면 전체 공통, 일치하면 해당 학생 전용
export async function getBoardData(slug: string): Promise<BoardData> {
  const data: BoardData = { studentName: "", settings: {}, items: [] };
  if (!sheetConfigured()) return data;

  try {
    const [students, gallery, settings] = await Promise.all([
      readRange("학생목록!A2:C1000"),
      readRange("갤러리!A2:F1000"),
      readRange("설정!A2:B100"),
    ]);

    const row = students.find((r) => (r[0] || "").trim() === slug);
    data.studentName = row ? (row[2] || "").trim() : "";

    for (const r of settings) {
      if (r[0]) data.settings[r[0].trim()] = r[1] || "";
    }

    data.items = gallery
      .filter((r) => {
        const owner = (r[0] || "").trim();
        const visible = (r[5] || "Y").trim().toUpperCase() !== "N";
        return visible && (owner === "" || owner === slug) && (r[1] || "").trim() !== "";
      })
      .map((r) => ({
        studentId: (r[0] || "").trim(),
        imageUrl: (r[1] || "").trim(),
        linkUrl: (r[2] || "").trim(),
        title: (r[3] || "").trim(),
        date: (r[4] || "").trim(),
      }))
      .reverse();
  } catch (e) {
    console.error("시트 데이터 로드 실패:", e);
  }
  return data;
}
