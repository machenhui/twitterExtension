/*kola("sohut.comm.PackageXML", function(PackageXML) {
    var packageXML = new PackageXML();
   
    document.querySelector(".js_autoPackageXML>input[type='button']").addEventListener("click",function(event){
    	 
    
    	var projectName=event.currentTarget.parentNode.querySelector("  input[type='text']").value;
    
    	packageXML.getAddJSFile({
    		projectName:projectName,
    		success:function(data){
    			alert(data);
    		},
    		failure:function(data){
    			alert(data);
    		}
    	});
    },false);
    
});*/

YUI({
    lang: 'ko-KR,en-GB,zh-Hant-TW', // languages in order of preference
    base: '../js/yui3/build/', // the base path to the YUI install.  Usually not needed because the default is the same base path as the yui.js include file
    charset: 'utf-8', // specify a charset for inserted nodes, default is utf-8
//    loadOptional: true, // automatically load optional dependencies, default false
//    combine: true, // use the Yahoo! CDN combo service for YUI resources, default is true unless 'base' has been changed
    filter: 'raw', // apply a filter to load the raw or debug version of YUI files
    timeout: 10000, // specify the amount of time to wait for a node to finish loading before aborting
//    insertBefore: 'customstyles', // The insertion point for new nodes
    // one or more external modules that can be loaded along side of YUI.  This is the only pattern
    // that was supported in 3.0.0 for declaring external modules.  3.1.0 adds 'groups' support,
    // which is an easier way to define a group of modules.  See below.
	debug:true,
    modules:  {
       /* yui2_yde_datasource: {
            fullpath: 'http://yui.yahooapis.com/combo?2.7.0/build/yahoo-dom-event/yahoo-dom-event.js&2.7.0/build/datasource/datasource-min.js'
        },
        yui_flot: {
            fullpath: 'http://bluesmoon.github.com/yui-flot/yui.flot.js',
            requires: ['yui2_yde_datasource']
        },
        popup: {
            fullpath: '../js/popupTest.js',
            requires: ['node']
        },*/
	   background:{
	     fullpath: '../js/background/Background.js',
            requires: ['base','oop','Template']
	   },
	   ajax:{
		fullpath: '../js/background/Ajax.js',
            requires: ['base','oop']
		},
	   Login:{
		   fullpath: '../js/oauth/Login.js',
           requires: ['base','SHA1']  
	   },	
	   Template:{
	     fullpath:'../js/template/v1.js'
	     
	   },	
	  notification:{
	       fullpath: '../js/background/Notification.js',
            requires: ['base','oop','ajax']
	  },
	  SHA1:{
		  fullpath: '../js/oauth/SHA1.js',
          requires: ['base'] 
	  }
    }
}).use("Login",function(Y) {
  var login=new Y.extension.Login();
});


