YUI.add('popup', function(Y) {

    Y.namespace('extension');

    Y.extension.Popup = function() {
        // expose an API
	this._init.apply(this,arguments);
    };
	
	Y.extension.Popup.prototype={
		_init:function(options){
		
		}
	}

}, '0.1.1' /* module version */, {
    requires: ['base']
});
