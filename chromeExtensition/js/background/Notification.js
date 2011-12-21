YUI.add('notification', function(Y) {

    Y.namespace('extension');

    Y.extension.Notification = function() {
        // expose an API
	this._init.apply(this,arguments);
    };
    Y.extension.Notification.prototype={
	   _init:function(options){
               var self=this;     
	       self.opts={
		   url:null,
                   method:"GET",
 		   success:function(response){
			
			},
		   failure:function(message){
			alert("Error");			
			}		
		};
               self.startTimeLine();
	       self.startNotification();
	       self.startHeartBreak();
	   },
           startNotification:function(options){
	         var self=this;
		 var ajax=new Y.extension.Ajax({
			url:"http://t.sohu.com/twAction/getNew.do",
			method:"GET",
			success:function(json){
			  window.setTimeout(function(){
			     self.startNotification(options);
			   },30000);
			  if(!json)  return;
                	  if(json.status !=0) return;
                	  if(json.data){
                    		//options.success(json.data);
				
                                for(var i in json.data){
                                   if(json.data[i]!=0){
			               self.show(json.data);
					return false;
				   }				
				}
			       
                	  }
			  
			},
			failure:function(){
			  window.setTimeout(function(){
			     self.startNotification(options);
			   },5000);
			}		
			});
		
		},
           startHeartBreak:function(options){
		var self=this;
		 var ajax=new Y.extension.Ajax({
			url:"http://t.sohu.com/comet/sub?uid=62239271",
			method:"GET",
			success:function(json){
			  window.setTimeout(function(){
			     self.startHeartBreak(options);
			   },5000);
			 
                	  
			  
			},
			failure:function(){
			  window.setTimeout(function(){
			     self.startHeartBreak(options);
			   },5000);
			}		
			});
	   },
	   startTimeLine:function(options){
                var channel = 62239271;
		var self=this;
                var opts={url:"http://c9.t.sohu.com//broadcast/sub?channel="+channel+'&i=0'}		
		
                var ajax=new Y.extension.Ajax({
		    url:opts.url,
                    method:"GET",
                    success:function(response){
			  
                          
                          self.start(options);
			  self.show(response);
			},
		    failure:function(message){
                          alert("Error");			
			}
		});
		


		
		},
           show:function(message){
	         var self=this;
		if (window.webkitNotifications.checkPermission() == 0) {
        		// you can pass any url as a parameter
			
       			var webkitnotification= window.webkitNotifications.createNotification("", 
			"您有新消息了",JSON.stringify(message));
			/*
			var webkitnotification= window.webkitNotifications.createHTMLNotification("http://t.sohu.com/inbox");*/
			webkitnotification.show();
                        window.setTimeout(function(){
                            webkitnotification.cancel();		
			},5000);
    		} else {
        		window.webkitNotifications.requestPermission();
    		}
		}
	   

	}
}, '0.1.1' /* module version */, {
    requires: ['base','oop','Ajax']
});
