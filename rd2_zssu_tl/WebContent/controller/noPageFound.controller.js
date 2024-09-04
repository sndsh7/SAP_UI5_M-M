sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device"
], function (Controller , Device) {
	"use strict";

	return Controller.extend("ZSSU_TL.controller.noPageFound", {
		onInit: function () {
			/*var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter1.navTo("noPageFound");*/
			if(Device.system.phone){
				this.getView().byId("nopage").setShowNavButton(true);
			}
			else{
				this.getView().byId("nopage").setShowNavButton(false);	
			}
		},
		
		onNavPress : function(){
			var oRouter1 = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter1.navTo("Master");
		}
	
	});
});