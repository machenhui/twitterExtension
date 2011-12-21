YUI.add('background', function(Y) {

    Y.namespace('extension');

    Y.extension.Background = function() {
        // expose an API
	this._init.apply(this,arguments);
    };
	
	Y.extension.Background.prototype={
		_init:function(options){
			var self=this;
		},
		addMenu:function(options){
			var self=this;
			var opts=Y.extend({
			   title:"请填写Title属性",
			   contexts:["page", "selection", "image", "link"],
			   onclick:function(event){}
			},options);
			chrome.contextMenus.create(opts);						
		},
		addTwitter:function(msg,pics){
		    var self=this;
                    var url="http://t.sohu.com/twAction/insertTwitter";
                    self.ajax({
                         url:url,
                         param:{
                         	msg:msg,
			 	pics:pics
			},
			 success:function(response){
                             
			     alert(response.responseText)
			
			},
			failure:function(response){
			     
                             alert("Error");
			}			
			});
		    
		},
		ajax:function(options){
		   var self=this;
		   self.opts=options;
                   var xhr=new XMLHttpRequest();
		   xhr.onreadystatechange = function(){
                     self.handlerFn(this);
                   }

            xhr.open("POST", options.url);

            var content= self._changeParam(options.param);
            //alert(JSON.stringify(content).length);
            //client.setRequestHeader("Content-Length",JSON.stringify(content).length);
            xhr.setRequestHeader("CONTENT-TYPE","application/x-www-form-urlencoded");

             xhr.send(content);
                   
		   		
		},
 handlerFn:function (response) {
            var self = this;
          /*  console.log(response.readyState);
            console.log(response.status);*/
            if (response.readyState == 4 && response.status == 200) {
                // so far so good

                try{
                    self.successFn(JSON.parse(response.responseText));
                }catch(e){

                    //console.log(response.responseText);
                }

            } else if (response.readyState == 4 && response.status != 200) {
                // fetched the wrong page or network error...


                 if(response.status<100){
                           return false;
                 }

                 //console.error(response.status);

                 //console.log(JSON.stringify(self.opts));
                 self.failureFn(response);
            }
        } ,
        successFn:function(result) {
            var self = this;
            self.opts.success(result);
        },
        failureFn:function(result) {
            var self = this;
            self.opts.failure(result);
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



}, '0.1.1' /* module version */, {
    requires: ['base','oop']
});
