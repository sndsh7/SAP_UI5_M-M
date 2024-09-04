sap.ui.define(
		[ "sap/ui/core/UIComponent",
		  "sap/ui/model/json/JSONModel",
		  "sap/ui/Device"],
		  function(UIComponent,JSONModel,Device) {
			"use strict";
			return UIComponent.extend("com.mahindra.ZSSU_CIT_PayTerms.Component", {
				metadata: {
					manifest: "json"
				},
				
				init : function() {
//					debugger;
					UIComponent.prototype.init.apply(this, arguments);
					this.getRouter().initialize();
					
					var sServiceUrl =  $(location).attr("protocol")+"//"+ $(location).attr("host");
					jQuery.sap.registerModulePath("SSU", sServiceUrl+"/sap/bc/ui5_ui5/sap/zssu");
					jQuery.sap.require("SSU/js/utility");
					jQuery.sap.require("SSU/js/jszip");
					jQuery.sap.require("SSU/js/xlsx");
				}
			}

			);
		}

);