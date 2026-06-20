const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCOx1_ve_BdqOURfvE_5SzDQ";

const SEARCH_RESULTS = 15;
const OUTPUT_RESULTS = 6;

function parseDuration(duration) {

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const h = parseInt(match?.[1] || 0);
    const m = parseInt(match?.[2] || 0);
    const s = parseInt(match?.[3] || 0);

    return h * 3600 + m * 90 + s;

}

async function getVideos() {

    const searchUrl =
        "https://www.googleapis.com/youtube/v3/search" +
        "?part=snippet" +
        "&order=date" +
        "&type=video" +
        "&maxResults=" + SEARCH_RESULTS +
        "&channelId=" + CHANNEL_ID +
        "&key=" + API_KEY;

    const searchRes = await fetch(searchUrl);

    if (!searchRes.ok)
        throw new Error("Search API Error");

    const searchJson = await searchRes.json();

    const ids = searchJson.items
        .map(v => v.id.videoId)
        .join(",");

    const detailUrl =
        "https://www.googleapis.com/youtube/v3/videos" +
        "?part=contentDetails" +
        "&id=" + ids +
        "&key=" + API_KEY;

    const detailRes = await fetch(detailUrl);

    if (!detailRes.ok)
        throw new Error("Videos API Error");

    const detailJson = await detailRes.json();

    const durationMap = {};

    detailJson.items.forEach(item => {

        durationMap[item.id] = parseDuration(item.contentDetails.duration);

    });

    const videos = [];

    searchJson.items.forEach(item => {

        const seconds = durationMap[item.id.videoId] || 0;

        // Bỏ Shorts (<60 giây)
        if (seconds < 60) return;

        videos.push({

            id: item.id.videoId,

            title: item.snippet.title,

            description: item.snippet.description,

            thumbnail: item.snippet.thumbnails.high.url,

            published: item.snippet.publishedAt,

            duration: seconds,

            url: "https://www.youtube.com/watch?v=" + item.id.videoId

        });

    });

    const output = {

        updated: new Date().toISOString(),

        channel: {

            id: CHANNEL_ID,

            name: "Thế Giới Game Việt",

            url: "https://www.youtube.com/channel/" + CHANNEL_ID

        },

        total: Math.min(videos.length, OUTPUT_RESULTS),

        videos: videos.slice(0, OUTPUT_RESULTS)

    };

    fs.writeFileSync(
        "youtube.json",
        JSON.stringify(output, null, 2),
        "utf8"
    );

    console.log("youtube.json updated");

}

getVideos().catch(err => {

    console.error(err);

    process.exit(1);

});
