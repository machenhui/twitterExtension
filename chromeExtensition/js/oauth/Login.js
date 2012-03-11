YUI.add('Login', function(Y) {
	
	

    Y.namespace('extension');

    Y.extension.Login = function() {
        // expose an API
    	
    	this._init.apply(this,arguments);
    };
	
	Y.extension.Login.prototype={
		_init:function(options){
		    this._getXAuthToken();
		},
		_getXAuthToken:function(){
			var xhr=this._getXHR({
				method:"post",
				url:"http://api.t.sohu.com/oauth/access_token"
			});
			/*
			 * OAuth oauth_nonce="6AN2dKRzxyGhmIXUKSmp1JcB4pckM8rD3frKMTmVAo", oauth_signature_method="HMAC-SHA1", oauth_timestamp="1284565601", oauth_consumer_key="dfalkjdfksdfjsijflskfa", oauth_signature="1L1oXQmawZAkQ47FHLwcOV%2Bkjwc%3D", oauth_version="1.0"
			 */
			
			xhr.setRequestHeader("oauth_consumer_key","ZVJQcRAQ4Cu8Y7n4IBtp");
			xhr.setRequestHeader("oauth_nonce","13vV1-^r#k=Q0ZMDhFovgcPY0iKFC*0lSBE*E-F4");
			/*
			xhr.setRequestHeader("oauth_consumer_key","dfalkjdfksdfjsijflskfa");
			xhr.setRequestHeader("oauth_nonce","6AN2dKRzxyGhmIXUKSmp1JcB4pckM8rD3frKMTmVAo");
			xhr.setRequestHeader("oauth_signature_method","HMAC-SHA1");*/
			
			xhr.setRequestHeader("oauth_signature_method","HMAC-SHA1");
			xhr.setRequestHeader("oauth_timestamp",new Date().getTime());
			xhr.setRequestHeader("oauth_version","1.0");
			
			
			xhr.send(this._changeParam({
				x_auth_mode:"client_auth",
				x_auth_password:window.encodeURIComponent("0510104018"),
				x_auth_username:window.encodeURIComponent("machenhui88@gmail.com")
			}));
			
		},
		_getXHR:function(options){
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				console.log(this);
			}

			xhr.open(options.method, options.url);
			xhr.setRequestHeader("CONTENT-TYPE",
					"application/x-www-form-urlencoded");
			return xhr;
			/*var content = "";
			if (self.opts.method == "POST")
				content = self._changeParam(options.param);
			xhr.send(content);*/
		},
		_changeParam:function(param){
            var self=this;
            var returnString="";
            if(param==null){
                return "";
            }
            

            for(var i in param){

                if(param[i]==null||param[i]==undefined){

                    param[i]="";
                }
                returnString+=(i+"="+param[i])+"&";
            }
            if(returnString.length!=0){
                return   returnString.substring(0,returnString.length-1)
            }else{
                return  returnString;
            }


     }
	}
	
	//appkeyºÍappsecret
	var consumerKey = "ZVJQcRAQ4Cu8Y7n4IBtp";
	var consumerSecret = "13vV1-^r#k=Q0ZMDhFovgcPY0iKFC*0lSBE*E-F4"; 

	//ÓÃ»§ÃûÃÜÂë
	var user = "machenhui88@gmail.com";
	var pw = "0510104018";


	window.fixedEncodeURIComponent = function (str) {  
	  return encodeURIComponent(str)
	            .replace(/!/g, '%21').replace(/'/g, '%27')
	            .replace(/\(/g, '%28').replace(/\)/g, '%29')
	            .replace(/\*/g, '%2A');  
	}


	var access_token_url = "http://api.t.sohu.com/oauth/access_token"
	// don't forget trailing &!
	var linkNote = "&";




	var TwitterApiRequest = function() {
	  this.nonce = this.generateNonce();
	  this.timestamp = this.getUTCtimestamp();  
	  this.postBody = null;  
	  this.signature = null;
	  this.signatureBaseString = null;  
	  this.token = null;
	  this.tokenSecret = null;  
	  this.path = null;
	}


	TwitterApiRequest.prototype.generateNonce = function () {
	  var nonce = [];
	  var length = 5; // arbitrary - looks like a good length
	  
	  for (length; length > 0; length--)
	    nonce.push((((1+Math.random())*0x10000)|0).toString(16).substring(1));
	    
	  return nonce.join("");
	}

	// could possibly do without UTC, but here we are
	TwitterApiRequest.prototype.getUTCtimestamp = function () {
	  return (new Date((new Date).toUTCString())).getTime() / 1000;
	}


	TwitterApiRequest.prototype.sigBaseTemplate = "POST&" +
	  "{{ path }}&" +
	  "oauth_consumer_key%3D"+consumerKey+"%26" + 
	  "oauth_nonce%3D" + "{{ nonce }}" + "%26" + 
	  "oauth_signature_method%3DHMAC-SHA1%26oauth_timestamp%3D" + "{{ time }}" + "%26" + 
	  "{{ optional_token }}" +
	  "oauth_version%3D1.0%26" + 
	  "{{ post_body }}";
	  
	TwitterApiRequest.prototype.authTemplate = "OAuth " +
		"oauth_nonce=\"" + "{{ nonce }}" + "\", " +
		"oauth_signature_method=\"HMAC-SHA1\", " + 
		"oauth_timestamp=\"" + "{{ time }}" + "\", " + 
		"oauth_consumer_key=\""+consumerKey+"\", " + 
		"{{ optional_token }}" + 
		"oauth_signature=\"" + "{{ signature }}" + "\", " + 
		"oauth_version=\"1.0\"";

	TwitterApiRequest.prototype.postTarget = function () {
	  return [this.path,this.postBody].join("?");
	}
	
	var sha1=new Y.extension.SHA1();

	TwitterApiRequest.prototype.setSignature = function (secret) {
	  //var hmacGen = new jsSHA(this.signatureBaseString, "ASCII");
	  //this.signature = hmacGen.getHMAC(secret, "ASCII", "SHA-1", "B64");      
	  this.signature = fixedEncodeURIComponent(sha1.b64_hmac_sha1(fixedEncodeURIComponent(secret)+linkNote,this.signatureBaseString)+"=");  
	  //alert(this.signature);
	}

	TwitterApiRequest.prototype.setupBaseString = function (token) {
	  var tokenReplacement = token ? "oauth_token%3D" + token + "%26" : "";
	  
	  this.signatureBaseString = this.sigBaseTemplate
	          .split("{{ path }}").join(encodeURIComponent(this.path))
	          .split("{{ optional_token }}").join(tokenReplacement)
	          .split("{{ nonce }}").join(this.nonce)
	          .split("{{ time }}").join(this.timestamp)
	          .split("{{ post_body }}").join(encodeURIComponent(this.postBody));
	}

	TwitterApiRequest.prototype.setupAuthHeader = function (token) {
	  var tokenReplacement = token ? "oauth_token=\"" + token + "\", " : "";
	  
	  this.authHeader = this.authTemplate
	                      .split("{{ nonce }}").join(this.nonce)
	                      .split("{{ optional_token }}").join(tokenReplacement)
	                      .split("{{ time }}").join(this.timestamp)
	                      .split("{{ signature }}").join(this.signature);
		            
	}

	TwitterApiRequest.prototype.setUpAuthPost = function () {
	  this.path = access_token_url;
	  this.postBody = "x_auth_mode=client_auth&" +
	    		          "x_auth_password=" + fixedEncodeURIComponent(pw) + "&" +
	    		          "x_auth_username=" + fixedEncodeURIComponent(user);

	  this.setupBaseString();
	  this.setSignature(consumerSecret);
	  this.setupAuthHeader();  
	  
	  return true;
	}



	//document.domain = "sohu.com";

	var twitterUrl, updateUrl;
	var authorizeRequest = new TwitterApiRequest();
	if (authorizeRequest.setUpAuthPost()) {
	  twitterUrl = authorizeRequest.postTarget();
	} else {
	  console.log("fail")
	}

	$.ajax({
	  url: twitterUrl,
	  type: "POST",
	  beforeSend: function(xhr) {
	  	//alert(authorizeRequest.authHeader);  	  	  	
	    xhr.setRequestHeader("Authorization", authorizeRequest.authHeader);    
	  },
	  success: function(data, textStatus, jqXHR){
	    alert(data);
	  }
	});

}, '0.1.1' /* module version */, {
    requires: ['base','SHA1']
});















// http://api.t.sohu.com/oauth/request_token?oauth_consumer_key=ZVJQcRAQ4Cu8Y7n4IBtp&oauth_signature_method=HMAC-SHA1&oauth_signature=222&oauth_timestamp=3333&oauth_nonce
/*
http://api.t.sohu.com/oauth/request_token
	oauth_consumer_key   ZVJQcRAQ4Cu8Y7n4IBtp
	oauth_signature_method 签名方法，建议使用HMAC-SHA1
	oauth_signature 签名值
	oauth_timestamp 时间戳
	oauth_nonce 单次值，随机字符串，防止重放攻击
	返回值

	未授权的request_token, request_token_secret
*/