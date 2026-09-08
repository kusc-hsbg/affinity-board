import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="menu_password">
        <h6>
          개인 전용 페이지 주소로 접속해 주세요.
          <br />
          예: /user_090406
        </h6>
        <a className="back" href="https://affinityuniverse.com">
          Back to main page
        </a>
      </div>
      <Footer />
    </div>
  );
}
