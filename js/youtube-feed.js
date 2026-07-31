$(document).ready(function(){
  var container = $("#youtube-feed");
  if (container.length === 0) return; // trang không có widget thì bỏ qua

  container.html('<div class="loader"></div>');

  $.ajax({
    url: "https://pwa.thegioigameviet.com/youtube.json",
    type: "GET",
    dataType: "json",
    cache: true,
    success: function(data){
      if (!data.videos || data.videos.length === 0) {
        container.html(msgError());
        return;
      }

      var html = '<div class="content-block video-items">';

      $.each(data.videos, function(r, video){
        html += '<div class="video-item item-' + r + '">' +
                  '<a title="' + video.title + '" class="entry-image-wrap is-video" href="' + video.url + '" target="_blank" rel="noopener">' +
                    '<span class="entry-thumb" data-image="' + video.thumbnail + '"></span>' +
                  '</a>' +
                  '<div class="entry-header">' +
                    '<h2 class="entry-title">' +
                      '<a title="' + video.title + '" href="' + video.url + '" target="_blank" rel="noopener">' + video.title + '</a>' +
                    '</h2>' +
                  '</div>' +
                '</div>';
      });

      html += '</div>';
      container.html(html);
      container.find("span.entry-thumb").lazyify(); // đồng bộ lazy-load ảnh giống theme
    },
    error: function(){
      container.html(msgError());
    }
  });
});
