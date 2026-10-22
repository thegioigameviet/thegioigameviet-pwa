document.addEventListener("DOMContentLoaded", function () {

  function extractGameData(content){
    var match = content.match(/\[gamebox\]([\s\S]*?)\[\/gamebox\]/i);
    if(!match) return null;

    var data = {};
    match[1].split('\n').forEach(function(line){
      line = line.trim();
      if(!line || line.indexOf('=') === -1) return;
      var pos = line.indexOf('=');
      data[line.substring(0,pos).trim()] = line.substring(pos+1).trim();
    });
    return data;
  }

  function buildCards(entries){
    var html = '';

    entries.forEach(function(post){
      var content = post.content ? post.content.$t : '';
      var game = extractGameData(content);
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
          '<img loading="lazy" decoding="async" src="' + (game.thumbnail || '') + '" alt="' + (game.title || '') + '">' +
        '</a>' +
        '<div class="latest-game-info">' +
          '<span class="game-category">' + (game.category || 'Game') + '</span>' +
          '<h3><a href="' + link + '">' + (game.title || '') + '</a></h3>' +
          '<div class="game-rating">★★★★★</div>' +
          '<a href="' + link + '" class="game-detail-btn">Chi tiết</a>' +
        '</div>' +
      '</div>';
    });

    return html;
  }

  function loadGameFeed(feedUrl, containerId, maxResults){

    var container = document.getElementById(containerId);
    if(!container) return;

    var startIndex = 1;   // vị trí bài tiếp theo cần lấy trong feed
    var btn = null;

    function createButton(){
      var wrap = document.createElement('div');
      wrap.className = 'game-load-more-wrap';
      wrap.innerHTML = '<button type="button" class="game-load-more btn">Xem thêm</button>';
      container.parentNode.insertBefore(wrap, container.nextSibling);
      btn = wrap.firstChild;
      btn.addEventListener('click', fetchPage);
    }

    function removeButton(){
      if(btn && btn.parentNode){
        btn.parentNode.parentNode.removeChild(btn.parentNode);
        btn = null;
      }
    }

    function fetchPage(){

      if(btn){
        btn.disabled = true;
        btn.textContent = 'Đang tải...';
      }

      fetch(feedUrl + '?alt=json&max-results=' + maxResults + '&start-index=' + startIndex)

      .then(function(response){
        return response.json();
      })

      .then(function(json){

        var entries = json.feed.entry || [];
        var html = buildCards(entries);

        if(startIndex === 1){
          container.innerHTML = html;
        }else{
          container.insertAdjacentHTML('beforeend', html);
        }

        startIndex += entries.length;

        // Còn bài nữa không: dựa vào tổng số bài của label
        var total = json.feed.openSearch$totalResults
          ? parseInt(json.feed.openSearch$totalResults.$t, 10)
          : 0;
        var hasMore = total ? startIndex <= total : entries.length === maxResults;

        if(!hasMore){
          removeButton();
          return;
        }

        if(!btn) createButton();

        // Lô này toàn bài không có [gamebox] -> tự tải lô tiếp
        if(!html) return fetchPage();

        btn.disabled = false;
        btn.textContent = 'Xem thêm';

      })

      .catch(function(error){
        console.log(error);
        if(btn){
          btn.disabled = false;
          btn.textContent = 'Thử lại';
        }
      });
    }

    fetchPage();
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
