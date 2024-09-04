sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"ZSSU_DASHBOARD/model/models",
	"sap/ui/core/routing/HashChanger"
], function (UIComponent, Device, models,HashChanger) {
	"use strict";

	return UIComponent.extend("ZSSU_DASHBOARD.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			
			HashChanger.getInstance().replaceHash("");
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			var useDetails = new sap.ui.model.json.JSONModel();
			useDetails.loadData("/sap/bc/ui2/start_up", null, false);
			this.getModel("device").setProperty("/userId",useDetails.getProperty("/id"));
		}
	});
});