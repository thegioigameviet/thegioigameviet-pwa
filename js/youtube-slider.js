/*!
 * YouTube Slider v1.0
 * Thế Giới Game Việt
 * https://pwa.thegioigameviet.com/youtube.json
 */

document.addEventListener("DOMContentLoaded", function () {

    const slider = document.getElementById("youtube-slider");

    if (!slider) return;

    // Lazy Load
    const observer = new IntersectionObserver(function (entries) {

        if (!entries[0].isIntersecting) return;

        observer.disconnect();

        loadSlider();

    }, {
        rootMargin: "200px"
    });

    observer.observe(slider);

    function loadSlider() {

        fetch("https://pwa.thegioigameviet.com/youtube.json")

            .then(res => res.json())

            .then(data => {

                if (!data.videos || !data.videos.length) return;

                buildSlider(data.videos);

            })

            .catch(console.error);

    }

    function buildSlider(videos) {

        let html = '';

        videos.forEach(video => {

            html += `

<div class="yt-slide">

<a href="${video.url}" target="_blank" rel="noopener">

<div class="yt-thumb">

<img loading="lazy"

src="${video.thumbnail}"

alt="${video.title}">

<span class="yt-play">▶</span>

</div>

<h3 class="entry-title">
    <a href="${video.url}"
       target="_blank"
       rel="noopener">
       ${video.title}
    </a>
</h3>

</a>

</div>

`;

        });

        slider.innerHTML = `

<div class="yt-slider-wrap">

<button class="yt-prev">&#10094;</button>

<div class="yt-track">

${html}

</div>

<button class="yt-next">&#10095;</button>

</div>

`;

        initSlider();

    }

    function initSlider() {

        const track = slider.querySelector(".yt-track");

        const slides = slider.querySelectorAll(".yt-slide");

        const prev = slider.querySelector(".yt-prev");

        const next = slider.querySelector(".yt-next");

        let index = 0;

        let visible = getVisible();

        function getVisible() {

            if (window.innerWidth <= 768) return 1;

            if (window.innerWidth <= 1024) return 2;

            return 3;

        }

        function update() {

            visible = getVisible();

            const width = 100 / visible;

            slides.forEach(item => {

                item.style.minWidth = width + "%";

            });

            track.style.transform =

                "translateX(-" +

                (index * width) +

                "%)";

        }

        next.addEventListener("click", function () {

            if (index < slides.length - visible) {

                index++;

            } else {

                index = 0;

            }

            update();

        });

        prev.addEventListener("click", function () {

            if (index > 0) {

                index--;

            } else {

                index = slides.length - visible;

            }

            update();

        });

        let auto = setInterval(function () {

            next.click();

        }, 5000);

        slider.addEventListener("mouseenter", function () {

            clearInterval(auto);

        });

        slider.addEventListener("mouseleave", function () {

            auto = setInterval(function () {

                next.click();

            }, 5000);

        });

        // Swipe Mobile

        let startX = 0;

        slider.addEventListener("touchstart", function (e) {

            startX = e.touches[0].clientX;

        });

        slider.addEventListener("touchend", function (e) {

            let endX = e.changedTouches[0].clientX;

            let diff = startX - endX;

            if (diff > 50) next.click();

            if (diff < -50) prev.click();

        });

        window.addEventListener("resize", update);

        update();

    }

});
