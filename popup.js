var _idMatcher = /[^\/]+/g;
var _gallery;
var _thumbUrl = function(url) {
  var id = url.match(_idMatcher).pop(),
    thumbUrl = "http://imgur.com/" + id + ".jpg";
  return thumbUrl;
};

var gallery = function() {
  _gallery = _gallery || document.getElementById("gallery");
  return _gallery;
};

var addBookmarkThumbToContainer = function(bookmark, container) {
  var imgUrl = bookmark.url,
      thumbUrl = _thumbUrl(imgUrl),
      link = document.createElement("a"),
      thumb = document.createElement("img");
  link.href = imgUrl;
  link.target = "_blank";
  thumb.src = thumbUrl;
  link.appendChild(thumb);
  container.appendChild(link);
};

var addBookmarkParentToContainer = function(bookmark, container) {
  if (bookmark.parentId) {
    chrome.bookmarks.get(bookmark.parentId, function(results) {
      var title = document.createElement("h6");
      title.innerText = results[0].title;
      container.appendChild(title);
    });
  }
};

var addBookmarkToPopup = function(bookmark) {
  var container = document.createElement("div"),
      thumbPart = document.createElement("div"),
      parentPart = document.createElement("div");

  container.className = "thumb-container";
  container.appendChild(thumbPart);
  container.appendChild(parentPart);
  gallery().appendChild(container);
  addBookmarkThumbToContainer(bookmark, thumbPart);
  addBookmarkParentToContainer(bookmark, parentPart);
};

var drawGalleryFrom = function(bookmarks) {
  bookmarks.forEach(function(bookmark) {
    addBookmarkToPopup(bookmark);
  });
};

document.addEventListener('DOMContentLoaded', function () {
  var bookmarks = [];
  chrome.bookmarks.search("http://imgur.com/", function(results) { 
    results.forEach(function(result) { 
      if (result.url)
        bookmarks.push(result);
    });
    drawGalleryFrom(bookmarks);
  });  
});
