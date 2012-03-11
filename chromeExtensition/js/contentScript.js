var bindPage=document.createElement("iframe");
bindPage.style.width="500px";
bindPage.style.height="500px";
console.log(window.location.href);
/*for(var i in chrome.extension){
  console.log(chrome.extension[i])
}*/

chrome.extension.sendRequest({greeting: "hello"}, function(response) {
  //console.log(response.farewell);
	bindPage.src=response.farewell;
  
});

document.body.addEventListener("click",function(event){
	console.log(event.target.tagName.toLowerCase());
	if(event.target.tagName.toLowerCase()=="img"){
		
		event.target.parentNode.appendChild(bindPage);
	}
},false);
