YUI.add('PackageXML', function(Y) {

    Y.namespace('extension');

    Y.extension.PackageXML = function() {
        // expose an API
	this.prototype._init.apply(this,arguments);
    };
	
	Y.extension.PackageXML.prototype={
		_init:function(options){
		
		}
	}

}, '0.1.1' /* module version */, {
    requires: ['base']
});
