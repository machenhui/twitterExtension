/**
 *处理鼠标右键的弹出菜单
 */
YUI.add('ContextMenu', function(Y) {

    Y.namespace('extension');

    Y.extension.ContextMenu = function() {
        // expose an API
	this._init.apply(this,arguments);
    };
	
	Y.extension.ContextMenu.prototype={
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
		}
	}

}, '0.1.1' /* module version */, {
    requires: ['base','oop']
});
