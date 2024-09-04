sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.mahindra.ZSSU_Approve.controller.SplitScreen", {
		onInit: function () {
			// Fiori Usage
			var device = "Other";
			var os = jQuery.os.os;
			var os_ver = jQuery.os.fVersion;
			var browser = "Other";
			var browser_ver = jQuery.browser.fVersion;
			var height = $(window).height();
			var width = $(window).width();
			var resolution = width + " * " + height;
			var appName  = "ZSSU_Approve";

			if(os == "" || os == null || os == "undefined")
			{ os = "Other"; }

			if(os_ver == "" || os_ver == null || os_ver == "undefined")
			{ os_ver = "Other"; }

			//Browser
			if(jQuery.browser.chrome)
			{ browser = "Chrome"; }
			else if(jQuery.browser.mobile)
			{ browser = "Mobile"; }
			else if(jQuery.browser.safari)
			{ browser = "Safari"; }
			else
			{ browser = "Other"; }

			//Device
			if(jQuery.device.is.ipad)
			{ device = "iPad"; }
			else if(jQuery.device.is.iphone)
			{ device = "iPhone"; }
			else if(jQuery.device.is.tablet)
			{ device = "Tablet"; }
			else if(jQuery.device.is.desktop)
			{ device = "Desktop"; }
			else if(jQuery.device.is.phone)
			{ device = "Phone"; }
			else
			{  device = "Other"; }
			var oData_Url = "/sap/opu/odata/sap/ZFIORI_USAGE_SRV/";
			var oModel_fiori = new sap.ui.model.odata.ODataModel(oData_Url, true);
			sap.ui.getCore().setModel(oModel_fiori,"FioriOdata");

			var oDataModel = new sap.ui.getCore().getModel("FioriOdata");
			oDataModel.read("/FioriUsageSet(Appname='ZSSU_Approve',Device='" + device +
			"',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
			"',Resolution='" + resolution + "')",null,null,null,function(e)   {	},
			function(e)
			{ });
		/*	var oData = {
				"MasterListCount":0,
				"MasterList": [{
					"Name": "FY20-PKG-00001",
					"Model": "ABS - SCORPIO LCCR",
					"Comp": "M&M AD,M&M FD",
					"Document": "P-info",
					"Creator": "Varun Mohan"
				}, {
					"Name": "FY20-FOR-00001",
					"Model": "ABS - BOLERO",
					"Comp": "M&M AD,M&M FD",
					"Document": "Forex",
					"Creator": "Varun Mohan"
				}]
			};
			oData.MasterListCount=oData.MasterList.length;
			var oModel1 = new sap.ui.model.json.JSONModel(oData);
			sap.ui.getCore().setModel(oModel1, "sampleModelMasterData");*/
		}
	});
});