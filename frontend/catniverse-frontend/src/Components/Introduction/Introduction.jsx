import React from "react";
import "./Introduction.css";
import catImage from "../../Image/cat(1).png";

function Introduction() {
  return (
    <div>
      <img 
        src={catImage} 
        alt="可愛的貓咪" 
        className="header-image" 
        style={{width:"45%", height:"auto"}}
      />
      <div className="content_">
        <div className="container">
          <div className="feature card welcome-card">
            <p className="black_welcome">
              <b>歡迎來到台灣浪貓地圖！我們是一個致力於關注台灣流浪貓議題的社群平台。</b>
              <br />
              我們的目標是透過群眾力量，共同繪製出台灣各地流浪貓的分布圖，提供一個讓愛貓人士分享資訊、互助合作的空間。
            </p>
          </div>

          <div className="feature card goals-card">
            <h2>透過這個平台，我們希望能夠：</h2>
            <ul className="goals">
              <li>提高公眾對流浪貓議題的關注</li>
              <li>協助救援組織更有效地進行 TNR（誘捕、絕育、放回）計畫</li>
              <li>幫助走失的貓咪與主人團聚</li>
              <li>促進社區對流浪動物的關懷</li>
            </ul>
            <p className="black">
              無論您是貓咪愛好者、動物保護工作者，還是關心社區的一般民眾，我們都歡迎您加入我們的行列，一起為台灣的流浪貓咪盡一份心力！
            </p>
          </div>

          <div className="feature-card">
            <h2>我們的主要功能：</h2>
            <ul>
              <li>上傳流浪貓照片：用戶可以上傳在各地遇到的流浪貓照片。</li>
              <li>標記地點：為每張照片標記精確的位置，幫助建立完整的分布圖。</li>
              <li>互動式地圖：網站首頁有一個台灣地圖，上面的紅點代表有流浪貓出沒的地點。</li>
              <li>分享資訊：用戶可以在貼文中描述貓咪的狀況、特徵等資訊。</li>
            </ul>
          </div>

          <div className="feature-card">
            <h2>如何參與：</h2>
            <ol>
              <li>註冊帳號</li>
              <li>上傳您遇到的流浪貓照片</li>
              <li>標記位置和提供描述</li>
              <li>瀏覽地圖，查看其他用戶的分享</li>
              <li>參與討論，提供幫助或建議</li>
            </ol>
          </div>

          <p className="black call-to-action">
            <em>讓我們一起為台灣的浪貓發聲，建立一個更友善的環境！</em>
          </p>
        </div>
      </div>
      <br/>
    </div>
  );
}

export default Introduction;
