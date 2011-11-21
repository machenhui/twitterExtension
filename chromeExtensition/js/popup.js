kola("sohut.comm.PackageXML", function(PackageXML) {
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
    


});


