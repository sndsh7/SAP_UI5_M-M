sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/mahindra/SSU_AltrSource/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.mahindra.SSU_AltrSource.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			var useDetails = new sap.ui.model.json.JSONModel();
			useDetails.loadData("/sap/bc/ui2/start_up", null, false);
			this.getModel("device").setProperty("/userId",useDetails.getProperty("/id"));
			
			var sServiceUrl =  $(location).attr("protocol")+"//"+ $(location).attr("host");
			jQuery.sap.registerModulePath("SSU", sServiceUrl+"/sap/bc/ui5_ui5/sap/zssu");
			jQuery.sap.require("SSU/js/utility");
			jQuery.sap.require("SSU/js/jszip");
			jQuery.sap.require("SSU/js/xlsx");
		}
		
	});
});