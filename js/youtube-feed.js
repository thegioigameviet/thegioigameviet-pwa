document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("youtube-feed");

    if (!container) return;

    fetch("https://pwa.thegioigameviet.com/youtube.json")
        .then(response => response.json())
        .then(data => {

            if (!data.videos || data.videos.length === 0) return;

            let html = '<div class="video-items">';

            data.videos.forEach(video => {

                html += `
                <article class="video-item">

                    <a class="entry-image-wrap"
                       href="${video.url}"
                       target="_blank"
                       rel="noopener">

                        <img
                            src="${video.thumbnail}"
                            alt="${video.title}"
                            loading="lazy">

                    </a>

                    <div class="entry-header">

                        <h3 class="entry-title">
                            <a href="${video.url}"
                               target="_blank"
                               rel="noopener">
                                ${video.title}
                            </a>
                        </h3>

                    </div>

                </article>`;

            });

            html += "</div>";

            container.innerHTML = html;

        })
        .catch(console.error);

});
