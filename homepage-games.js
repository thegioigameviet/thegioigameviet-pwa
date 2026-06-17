document.addEventListener("DOMContentLoaded", function () {

  function extractGameData(content){

    var match = content.match(/\[gamebox\]([\s\S]*?)\[\/gamebox\]/i);

    if(!match) return null;

    var data = {};

    match[1].split('\n').forEach(function(line){

      line = line.trim();

      if(!line || line.indexOf('=') === -1) return;

      var pos = line.indexOf('=');

      data[
        line.substring(0,pos).trim()
      ] =
        line.substring(pos+1).trim();

    });

    return data;

  }

  function loadGameFeed(feedUrl, containerId, maxResults){

    fetch(
      feedUrl +
      '?alt=json&max-results=' +
      maxResults
    )

    .then(function(response){
      return response.json();
    })

    .then(function(json){

      if(!json.feed.entry) return;

      var html = '';

      json.feed.entry.forEach(function(post){

        var content =
          post.content ?
          post.content.$t : '';

        var game =
          extractGameData(content);

        if(!game) return;

        var link = '#';

        if(post.link){

          for(var i=0;i<post.link.length;i++){

            if(post.link[i].rel === 'alternate'){

              link = post.link[i].href;

              break;

            }

          }

        }

        html +=
        '<div class="latest-game-card">' +

          '<a href="' + link + '" class="latest-game-thumb">' +
            '<img src="' + (game.thumbnail || '') + '" alt="' + (game.title || '') + '">' +
          '</a>' +

          '<div class="latest-game-info">' +

            '<span class="game-category">' +
              (game.category || 'Game') +
            '</span>' +

            '<h3><a href="' + link + '">' +
              (game.title || '') +
            '</a></h3>' +

            '<div class="game-rating">★★★★★</div>' +

            '<a href="' + link + '" class="game-detail-btn">' +
              'Chi tiết' +
            '</a>' +

          '</div>' +

        '</div>';

      });

      var container =
        document.getElementById(containerId);

      if(container){

        container.innerHTML = html;

      }

    })

    .catch(function(error){

      console.log(error);

    });

  }

  /* GAME MỚI NHẤT */

  loadGameFeed(
    '/feeds/posts/default/-/Game',
    'latest-games',
    12
  );

  /* GAME HOT */

  loadGameFeed(
    '/feeds/posts/default/-/Game%20Guides',
    'hot-games',
    6
  );

});
