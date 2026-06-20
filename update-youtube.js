const fs = require("fs");

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCOx1_ve_BdqOURfvE_5SzDQ";
const MAX_RESULTS = 6;

async function fetchYoutube() {

    const url =
        "https://www.googleapis.com/youtube/v3/search" +
        "?part=snippet" +
        "&order=date" +
        "&type=video" +
        "&maxResults=" + MAX_RESULTS +
        "&channelId=" + CHANNEL_ID +
        "&key=" + API_KEY;

    const response = await fetch(url);

    if (!response.ok) {

        throw new Error("YouTube API Error : " + response.status);

    }

    const json = await response.json();

    const videos = json.items.map(function (item) {

        return {

            id: item.id.videoId,

            title: item.snippet.title,

            description: item.snippet.description,

            thumbnail: item.snippet.thumbnails.high.url,

            published: item.snippet.publishedAt,

            url: "https://www.youtube.com/watch?v=" + item.id.videoId

        };

    });

    const output = {

        updated: new Date().toISOString(),

        channel: {

            id: CHANNEL_ID,

            name: "Thế Giới Game Việt",

            url: "https://www.youtube.com/channel/" + CHANNEL_ID

        },

        total: videos.length,

        videos: videos

    };

    fs.writeFileSync(

        "youtube.json",

        JSON.stringify(output, null, 2),

        "utf8"

    );

    console.log("youtube.json updated");

}

fetchYoutube().catch(function (err) {

    console.error(err);

    process.exit(1);

});
