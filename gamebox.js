document.addEventListener("DOMContentLoaded", function () {

  const postBody = document.querySelector(".post-body");

  if (!postBody) return;

  let content = postBody.innerHTML;

  // Tìm gamebox
  const gameBoxRegex = /\[gamebox\]([\s\S]*?)\[\/gamebox\]/i;

  const match = content.match(gameBoxRegex);

  if (!match) return;
postBody.style.display='none';
  const rawData = match[1].trim();

  const data = {};

  rawData.split("\n").forEach(line => {

    const parts = line.split("=");

    if (parts.length >= 2) {

      const key = parts[0].trim();

      const value = parts.slice(1).join("=").trim();

      data[key] = value;

    }

  });

  // Gallery xử lý
  let galleryHTML = "";

  if (data.gallery) {

    const images = data.gallery.split(",");

    images.forEach(img => {

      galleryHTML += `
        <div class="game-thumb">
          <a href="${img.trim()}"><img loading="lazy" src="${img.trim()}" alt="${data.title}" /></a>
        </div>
      `;

    });

  }

  // Render game box
  const gameBoxHTML = `
    <section class="modern-game-box">
      <div class="game-top">

        <div class="game-cover">
          <img
            src="${data.thumbnail || ''}"
            alt="${data.title || ''}"
            loading="eager"
          />
        </div>

        <div class="game-info">

          <h1 class="game-title">
            ${data.title || ''}
          </h1>

          <div class="game-meta">

            <div class="meta-item">
              <span>🎮 Thể loại:</span>
              <strong>${data.category || ''}</strong>
            </div>

            <div class="meta-item">
              <span>🏢 Nhà phát hành:</span>
              <strong>${data.publisher || ''}</strong>
            </div>

          </div>

          <div class="game-description">
            ${data.description || ''}
          </div>

        <div class="download-group"> <a class="download-btn android-btn" href="${data.android || '#'}" target="_blank" rel="nofollow noopener" > <span class="dl-icon"><img border="0" height="30" src="https://pwa.thegioigameviet.com/images/android.webp" width="30" /></span><span style="color: black;"> Tải Android </a></span> <a class="download-btn ios-btn" href="${data.ios || '#'}" target="_blank" rel="nofollow noopener" > <span class="dl-icon"><img border="0" height="30" src="https://pwa.thegioigameviet.com/images/ios.webp" width="30" /></span><span style="color: white;"> Tải iOS </span></a> </div>

        </div>

      </div>

      <div class="game-gallery">
        ${galleryHTML}
      </div>

    </section>
  `;

  // Thay shortcode bằng gamebox
  content = content.replace(gameBoxRegex, gameBoxHTML);

  // Render phần chi tiết
  content = content.replace(
    /\[chitiet\]([\s\S]*?)\[\/chitiet\]/i,
    `<div class="game-detail">$1</div>`
  );

postBody.innerHTML = content;
postBody.style.display='';
});
