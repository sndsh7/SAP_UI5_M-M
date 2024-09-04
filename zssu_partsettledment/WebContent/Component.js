sap.ui.define(
		["sap/ui/core/UIComponent"],function(UIComponent){
			"use strict";
			return UIComponent.extend("ZPART_SETTLEMENT.Component",{		
				metadata:{
					manifest:"json"																
				},//MetaData Ends

				init:function(){
					UIComponent.prototype.init.apply(this,arguments);
					
					 this.getRouter().initialize(); // added by Satya for routing
					 
					 var sServiceUrl =  $(location).attr("protocol")+"//"+ $(location).attr("host");
						jQuery.sap.registerModulePath("SSU", sServiceUrl+"/sap/bc/ui5_ui5/sap/zssu");
						jQuery.sap.require("SSU/js/utility");
					
				}				
			});
		});