console.log("执行一段脚本");
/*for(var i in chrome.extension){
  console.log(chrome.extension[i])
}*/
chrome.extension.sendRequest({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});
