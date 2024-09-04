sap.ui.define(
		[ "sap/ui/core/UIComponent",
		  "sap/ui/model/json/JSONModel",
		  "sap/ui/Device"],
		  function(UIComponent,JSONModel,Device) {
			"use strict";
//			[ "sap/ui/core/UIComponent"],
//			function(UIComponent) {
//			"use strict";
			return UIComponent.extend("ZSRM_SINVOICE.Component", {
				metadata: {
					manifest: "json"
				},
				
				init : function() {
//					debugger;
					UIComponent.prototype.init.apply(this, arguments);
					this.getRouter().initialize();
					sap.ui.getCore().setModel(this.getModel('ZSRM_SINVOICE'),'SRMINVOICEModel');
				}
			}

			);
		}

);