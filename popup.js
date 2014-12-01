var _idMatcher = /[^\/]+/g;
var _gallery;
var _thumbUrl = function(url) {
  var id = url.match(_idMatcher).pop(),
    thumbUrl = "http://imgur.com/" + id + "s.jpg";
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

var _makeLink = function(inner, href, cb) {
  var link = document.createElement("a");
  link.href = href;
  link.innerText = inner;
  link.onclick = cb;
  return link;
};

var addBookmarkParentToContainer = function(bookmark, container) {
  if (bookmark.parentId) {
    chrome.bookmarks.get(bookmark.parentId, function(results) {
      var title = document.createElement("h6");
      title.innerText = results[0].title;
      container.appendChild(title);
      var moveToPending = _makeLink("\u2717", "#", function(e) {
        chrome.bookmarks.move(bookmark.id, { parentId: pending().id }, function() {
          title.innerText = "Pending";
        });
      });
      var moveToSubmitted = _makeLink("\u2713", "#", function(e) {
        chrome.bookmarks.move(bookmark.id, { parentId: submitted().id }, function() {
          title.innerText = "Submitted";
        });
      });
      container.appendChild(moveToPending);
      container.appendChild(moveToSubmitted);
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
    console.log(bookmark);
    addBookmarkToPopup(bookmark);
  });
};

var renderFolder = function(folder) {
  chrome.bookmarks.getSubTree(folder.id, function(results) {
    var bookmarks = [];
    results[0].children.forEach(function(result) {
      if (result.url)
        bookmarks.push(result);
    });
    drawGalleryFrom(bookmarks);
  });
};

var _pending, _submitted;

var pending = function() { return _pending; },
    submitted = function() { return _submitted; };

document.addEventListener('DOMContentLoaded', function () {
  var bookmarks = [];
  chrome.bookmarks.search("COTD", function(results) { 
    var root = results[0];
    chrome.bookmarks.getSubTree(root.id, function(results) {
      results[0].children.forEach(function(item) {
        if (item.title == "Pending") {
          _pending = item; 
          renderFolder(item);
        }
        else if (item.title == "Submitted") {
          _submitted = item; 
          renderFolder(item);
        }
      });
    });
  });  
});
