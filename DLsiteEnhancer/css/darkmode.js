// bodyのスタイルを設定
document.body.style.color = "#fff";
document.body.style.backgroundColor = "#111";

// aタグのスタイルを設定
var aTags = document.getElementsByTagName("a");
for(var i = 0; i < aTags.length; i++) {
    aTags[i].style.color = "#fff";
}

// input#search_textのスタイルを設定
var searchText = document.getElementById("search_text");
searchText.style.backgroundColor = "#222";
searchText.style.color = "#fff";

// .floorTubeのスタイルを設定
var floorTubeElements = document.getElementsByClassName("floorTube");
for(var i = 0; i < floorTubeElements.length; i++) {
    floorTubeElements[i].style.backgroundColor = "#222";
}

// .floorSubNavのスタイルを設定
var floorSubNavElements = document.getElementsByClassName("floorSubNav");
for(var i = 0; i < floorSubNavElements.length; i++) {
    floorSubNavElements[i].style.backgroundColor = "#222";
}

// element.styleのスタイルを設定
var elements = document.getElementsByClassName("element");
for(var i = 0; i < elements.length; i++) {
    elements[i].style.color = "#111";
}