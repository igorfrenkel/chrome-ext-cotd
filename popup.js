var _idMatcher = /[^\/]+/g;
var _gallery;
var _thumbUrl = function(url) {
  var id = url.match(_idMatcher).pop().replace(".jpg",""),
    thumbUrl = "http://imgur.com/" + id + "s.jpg";
  return thumbUrl;
};

var gallery = function() {
  _gallery = _gallery || document.getElementById("gallery");
  return _gallery;
};

var GalleryFolder = function(tabName, folderSubtree) {
  var _galleryFolderContainer;

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
    link.target = "_blank";
    return link;
  };

  var addBookmarkParentToContainer = function(bookmark, container) {
    if (bookmark.parentId) {
      chrome.bookmarks.get(bookmark.parentId, function(results) {
        var title = document.createElement("h6");
        title.innerText = results[0].title;
        container.appendChild(title);
        var moveToPending = _makeLink("\u2717", "#", function(e) {
          e.preventDefault();
          chrome.bookmarks.move(bookmark.id, { parentId: pending().id }, function() {
            title.innerText = "Pending";
          });
        });
        var moveToSubmitted = _makeLink("\u2713", "#", function(e) {
          e.preventDefault();
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
    _galleryFolderContainer.appendChild(container);
    addBookmarkThumbToContainer(bookmark, thumbPart);
    addBookmarkParentToContainer(bookmark, parentPart);
  };

  var drawGalleryFrom = function(bookmarks) {
    bookmarks.forEach(function(bookmark) {
      addBookmarkToPopup(bookmark);
    });
  };

  var renderThumbs = function(folder) {
    chrome.bookmarks.getSubTree(folder.id, function(results) {
      var bookmarks = [];
      results[0].children.forEach(function(result) {
        if (result.url)
          bookmarks.push(result);
      });
      drawGalleryFrom(bookmarks);
    });
  };

  var enable = function(element) {
    element.className = "tab active";
  };

  var disable = function(element) {
    element.className = "tab";
  };

  this.enable = function() {
    enable(_galleryFolderContainer);
  };

  this.disable = function() {
    disable(_galleryFolderContainer);
  };

  var makeTabCalled = function(tabName) {
    var header = document.createElement("h3"),
      a = document.createElement("a"),
      currentTab = _galleryFolderContainer;
    a.innerText = tabName;
    a.href = "#";
    a.onclick = function(e) {
      e.preventDefault();
      var elements = document.getElementsByClassName("tab"),
        element, i;
      for(i =0; i < elements.length; i++) {
        element = elements[i];
        disable(element);
        if (element != currentTab) 
          enable(element);
      }
    };
    header.appendChild(a);
    _galleryFolderContainer.appendChild(header);
  };

  var initWith = function(parent) {
    _galleryFolderContainer = document.createElement("div");
    _galleryFolderContainer.className = "tab";
    parent.appendChild(_galleryFolderContainer);
  };

  this.renderOn = function(parentContainer) {
    initWith(parentContainer);
    makeTabCalled(tabName);
    renderThumbs(folderSubtree);
  };
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
          var folder = new GalleryFolder("Pending", item)
          folder.renderOn(gallery());
          folder.enable();
        }
        else if (item.title == "Submitted") {
          _submitted = item; 
          var folder = new GalleryFolder("Submitted", item)
          folder.renderOn(gallery());
        }
      });
    });
  });  
});
