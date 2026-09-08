/* 원본 사이트 푸터: #0063ff 배경, 중앙 정렬 링크, SNS 아이콘 열, 카피라이트 */
const ICONS = [
  { href: "https://www.instagram.com/affinity_universe", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/120d230cc2071.png", alt: "Instagram" },
  { href: "https://www.threads.com/@affinity_universe", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/6f212a5897f51.png", alt: "Threads" },
  { href: "https://blog.naver.com/affinityuniverse", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/5f6bf77eeee2f.png", alt: "Naver Blog" },
  { href: "https://cafe.naver.com/veldy", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/13bdbc37c3081.png", alt: "Naver Cafe" },
  { href: "https://www.youtube.com/@affinityuniverse", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/9728633a059a2.png", alt: "YouTube" },
  { href: "https://pf.kakao.com/_xhbxdib", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/0e1f4ab825430.png", alt: "KakaoTalk" },
  { href: "https://wa.me/qr/IU4IKEWU4BKAO1", img: "https://cdn.imweb.me/upload/S20220201005ab0a1d8606/599b77e977e0a.png", alt: "WhatsApp" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <h4>
        <a href="https://affinityuniverse.com/About" style={{ color: "#fff", fontSize: "18px" }}>
          About
        </a>
      </h4>
      <p>
        <a href="https://affinityuniverse.com/Notice">Notice</a>
      </p>
      <p>
        <a href="https://affinityuniverse.com/CONTACTUS">Contact Us</a>
      </p>

      <h4>Customer Care</h4>
      <p>
        <a href="mailto:affinityuniverse@gmail.com">affinityuniverse@gmail.com</a>
      </p>
      <p className="kakao">
        <a href="http://pf.kakao.com/_xhbxdib">
          KAKAO TALK <span className="handle">@어피니티유니버스</span>
        </a>
      </p>

      <h4>Follow Us</h4>
      <p>
        <a href="https://www.instagram.com/affinity_universe">Instagram</a>
      </p>
      <p>
        <a href="https://www.youtube.com/@affinityuniverse">YouTube</a>
      </p>

      <div className="icon-row">
        {ICONS.map((i) => (
          <a key={i.alt} href={i.href} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.img} alt={i.alt} width={27} />
          </a>
        ))}
      </div>

      <div className="copyright">
        <em>© Copyright Affinity Universe 2022 - All Rights Reserved</em>
      </div>
    </footer>
  );
}
