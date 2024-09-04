jQuery.sap.declare("ZMM_Supplier.Component");
jQuery.sap.require("ZMM_Supplier.Model.formatter");
sap.ui.define(
		[ "sap/ui/core/UIComponent","sap/ui/Device" ],
		function(UIComponent,Device) {
			"use strict";
			return UIComponent.extend("ZMM_Supplier.Component", {

				metadata: {
					manifest: "json"
				},
				
				init : function() {					
					UIComponent.prototype.init.apply(this,arguments);
				

				}
			}

			);
		}

);