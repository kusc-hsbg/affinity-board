// 글쓰기 템플릿: 첫 이미지만 포함하고 본문 서식은 인라인으로 고정.
export interface Template {
  label: string;
  thumb: string;
  title?: string;
  category?: string;
  html: string;
}

const BLUE_WELCOME_HTML = `
<div class="margin-top-xxl _comment_body_big_welcome" style="color:#333;letter-spacing:0.2px;">
  <p style="text-align:center;line-height:1;margin:0 0 34px;"><img src="/mirror/a/big-welcome.jpeg" class="fr-fic fr-dii" style="width:1000px;max-width:100%;height:auto;" alt="welcome to affinity universe" /></p>
  <p style="text-align:center;line-height:1.65;margin:0 0 34px;"><span style="font-size:24px;color:rgb(50,71,233);letter-spacing:0.3px;"><strong>어피니티 유니버스에 오신 것을 환영합니다!</strong></span></p>
  <p style="text-align:justify;line-height:2;margin:0 0 18px;"><span style="font-size:18px;color:#333;letter-spacing:0.2px;">안녕하세요! 한 사람의 잠재력에 진심으로 몰입하는 곳, 어피니티 유니버스입니다.</span></p>
  <p style="text-align:justify;line-height:2;margin:0 0 18px;"><span style="font-size:18px;color:#333;letter-spacing:0.2px;">00님과 새로운 배움의 여정을 함께 시작하게 되어 진심으로 기쁘고 감사합니다. 본 게시판은 수강생분의 학습 과정을 투명하고 체계적으로 관리하는 개별 포트폴리오 공간입니다. 앞으로 다음과 같이 운영될 예정입니다.</span></p>
  <p style="text-align:left;line-height:1.8;margin:34px 0 8px;"><span style="font-size:18px;color:rgb(50,71,233);letter-spacing:0.2px;"><strong>진도 업데이트:</strong></span></p>
  <p style="text-align:justify;line-height:2;margin:0 0 18px;"><span style="font-size:18px;color:#333;letter-spacing:0.2px;">각 단계가 끝날 때마다 배움의 과정이 담긴 강의실 스냅샷이 업데이트 됩니다. 차곡차곡 쌓이는 스냅샷을 통해 눈에 보이는 성장의 즐거움을 느껴보세요.</span></p>
  <p style="text-align:left;line-height:1.8;margin:34px 0 8px;"><span style="font-size:18px;color:rgb(50,71,233);letter-spacing:0.2px;"><strong>최종 수료 안내:</strong></span></p>
  <p style="text-align:justify;line-height:2;margin:0 0 18px;"><span style="font-size:18px;color:#333;letter-spacing:0.2px;">코스의 모든 과정을 성공적으로 마치면, 그간의 노력을 증명하는 공식 수료증이 이곳에 최종 업로드됩니다.</span></p>
  <p style="text-align:justify;line-height:2;margin:34px 0 18px;"><span style="font-size:18px;color:#333;letter-spacing:0.2px;">저희 어피니티 유니버스는 수강생분들이 최선의 결과를 낼 수 있도록 세심하고 친절한 가이드로 보답하겠습니다.</span></p>
  <p style="text-align:justify;line-height:2;margin:0 0 34px;"><span style="font-size:18px;color:#333;letter-spacing:0.2px;">00님의 멋진 시작을 진심으로 응원합니다!</span></p>
  <hr style="border:0;border-top:1px solid #d8d8d8;margin:44px 0 30px;" />
  <p style="text-align:center;line-height:1.2;margin:0 0 12px;"><span style="font-size:16px;color:rgb(50,71,233);letter-spacing:0.2px;"><strong>Affinity Universe</strong></span></p>
  <p style="text-align:center;line-height:1.5;margin:0;"><span style="font-size:14px;color:#333;letter-spacing:0.2px;">한 사람의 잠재력에 진심으로 몰입하는 곳, 어피니티 유니버스</span></p>
</div>
<div class="file_area"></div>
`;

const GREEN_PROGRESS_HTML = `
<div class="margin-top-xxl _comment_body_m202405237118507e1609c">
  <p style="text-align:justify;line-height:2;"><img src="/mirror/a/30a9a1108a734b7f.png" style="width:1000px;" class="fr-fic fr-dii" alt="f0d1b082c3990.png" /></p>
  <p style="text-align:justify;line-height:2;"></p>
  <p style="text-align:justify;line-height:2;"></p>
  <p style="text-align:justify;line-height:2;"><br /></p>
  <p style="text-align:center;"><a class="btn btn-primary" href="https://drive.google.com/drive/folders/1QMz5iRLjcU0oPE75QmujFLCOjVHEEejQ?usp=sharing" target="_blank" rel="noreferrer noopener"><span style="font-size:18px;">결과물 링크 확인하기</span></a></p>
  <p style="text-align:justify;line-height:2;"><br /></p>
  <p><span style="font-size:18px;">한 뼘 더 성장한 xx 님은 이제 더 깊은 배움을 위해 다음 단계로 진입합니다. 새로운 변화를 맞이할 다음 여정도 정성을 다해 함께하겠습니다.</span></p>
  <p><span style="font-size:18px;">- 한 사람의 잠재력에 진심으로 몰입하는 곳, 어피니티 유니버스 -</span></p>
  <p style="text-align:right;line-height:1;"><br /></p>
  <p style="text-align:right;line-height:1;"><br /></p>
  <hr />
  <p style="text-align:center;line-height:1;"><br /></p>
  <p style="text-align:center;line-height:1;"><br /></p>
  <p style="text-align:center;line-height:1;"><span style="font-size:16px;"><strong><span style="color:rgb(50,71,233);">Affinity Universe</span></strong></span></p>
  <p style="text-align:center;line-height:1;"><span style="font-size:14px;">UNIVERSAL LEARNING PLATFORM</span></p>
</div>
<div class="file_area"></div>
`;

const ORANGE_CERTIFICATE_HTML = `
<div class="margin-top-xxl _comment_body_m20241007ea481e69430c2">
  <p><img src="/mirror/a/6290f94f8cd978ce.png" class="fr-fic fr-dii" alt="99938a1ae72b0.png" /></p>
  <p style="text-align:left;"></p>
  <p style="text-align:left;"><br /></p>
  <p style="text-align:justify;line-height:2;"><br /></p>
  <p>첫 발을 내디뎠던 날부터 오늘 수료증을 받기까지, xx이가 보여준 열정과 성실함을 곁에서 지켜볼 수 있어 어피니티 유니버스도 참 행복했습니다.</p>
  <p>포기하지 않고 끝까지 완주해낸 xx이의 멋진 도전을 칭찬하며, 정성껏 준비한 수료증을 이곳에 남겨둡니다. 이 수료증이 앞으로 xx이가 나아갈 길에 든든한 자신감이 되길 바랍니다. 💖</p>
  <p style="text-align:right;line-height:1;"><br /></p>
  <p style="text-align:right;line-height:1;"><br /></p>
  <p style="text-align:right;line-height:1;"><br /></p>
  <hr />
  <p style="text-align:center;line-height:1;"><br /></p>
  <p style="text-align:center;line-height:1;"><br /></p>
  <p style="text-align:center;line-height:1;"><span style="font-size:16px;"><strong><span style="color:rgb(50,71,233);">Affinity Universe</span></strong></span></p>
  <p style="text-align:center;line-height:1;">&nbsp;한 사람의 잠재력에 진심으로 몰입하는 곳, 어피니티 유니버스</p>
</div>
<div class="file_area"></div>
`;

export const TEMPLATES: Template[] = [
  {
    label: "템플릿 1",
    thumb: "/mirror/a/big-welcome.jpeg",
    title: "어피니티 유니버스에 오신 것을 환영합니다!",
    category: "WELCOME",
    html: BLUE_WELCOME_HTML,
  },
  {
    label: "템플릿 2",
    thumb: "/mirror/a/30a9a1108a734b7f.png",
    title: "이번 단계 완료! 다음 성장을 향해 나아갑니다.",
    html: GREEN_PROGRESS_HTML,
  },
  {
    label: "템플릿 3",
    thumb: "/mirror/a/6290f94f8cd978ce.png",
    title: "축하합니다! xx이의 소중한 배움이 마침내 빛나는 결실을 맺었습니다.",
    html: ORANGE_CERTIFICATE_HTML,
  },
];
