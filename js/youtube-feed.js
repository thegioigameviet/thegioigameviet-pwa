document.addEventListener("DOMContentLoaded", function () {

    const container = document.getElementById("youtube-feed");

    if (!container) return;

    fetch("https://pwa.thegioigameviet.com/youtube.json?" + Date.now())
        .then(res => res.json())
        .then(data => {

            if (!data.videos || !data.videos.length) return;

            let html = '<div class="video-items">';

            data.videos.forEach(function(video){

                html += `
                <article class="video-item">

                    <a class="entry-image-wrap"
                       href="${video.url}"
                       target="_blank"
                       rel="noopener noreferrer">

                        <img
                            src="${video.thumbnail}"
                            alt="${video.title}"
                            loading="lazy">

                    </a>

                    <div class="entry-header">

                        <h3 class="entry-title">
                            <a href="${video.url}"
                               target="_blank"
                               rel="noopener noreferrer">

                               ${video.title}

                            </a>
                        </h3>

                    </div>

                </article>
                `;

            });

            html += '</div>';

            container.innerHTML = html;

        })
        .catch(function(err){
            console.log("YouTube Feed:", err);
        });

});
