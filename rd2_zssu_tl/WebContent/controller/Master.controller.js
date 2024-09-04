sap.ui.define([ 
	"sap/ui/core/mvc/Controller", 
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/UIComponent",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/m/MessageToast",
	"ZSSU_TL/model/formatter"
	], function(Controller, History, JSONModel, Filter , UIComponent, FilterOperator, Device ,MessageToast,formatter ) {
	"use strict";
	var oController;
	var busy = new sap.m.BusyDialog();
	return Controller.extend("ZSSU_TL.controller.Master",
			{
		formatter : formatter,
		onInit : function() {
			//debugger;
			oController = this;
			oController.oList=oController.byId("masterReqPending");
			var oModelNew = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZFIORI_USAGE_SRV/");
			/*Start of usage call*/
			var device = "Other"; 
			var os = jQuery.os.os;
			var os_ver = jQuery.os.fVersion;
			var browser = "Other";
			var browser_ver = jQuery.browser.fVersion;
			var height = $(window).height();
			var width = $(window).width();
			var resolution = width + " * " + height;
			var applName = "ZSSU_TL";
			oModelNew.read("/FioriUsageSet(Appname='" + applName + "',Device='" + device + "',Os='" + os +
					"',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver + "',Resolution='" + resolution + "')", {
				success: function (oData, oResponse) {},
				error: function (oResponse) {}
			});					
			oController.getOwnerComponent().getRouter().getRoute("Routeapp").attachPatternMatched(oController.routeMatched, oController);
			oController.oList.attachEvent("updateFinished", function(){
				if(!Device.system.phone){
					oController.selectedFirstItem();					
				}
			})		
		},
		_initialMethod: function (entity, alias) {
			var oController = this;
			var oModelSSUDigitization = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var vSelectedKey = oController.getView().byId('id_segmentbtn').getSelectedKey();
			busy.open();
			var URL = "Application eq 'T'";
			oModelSSUDigitization.read(entity, {
				urlParameters: {
					"$filter": URL
				},
				success: function (oData, oResponse) {

					busy.close();
					if(vSelectedKey == 'request'){
						let new_oData = oData.results.filter(function (el){
							return el.Status == 'TR';
						});
						var count = new_oData.length;
						var oModel = new sap.ui.model.json.JSONModel({"count":count,"results":new_oData});
					}else{
						let new_oData = oData.results.filter(function (el){
							return el.Status != 'TR' &&
							el.Status != 'C';
						});
						var count = new_oData.length;
						var oModel = new sap.ui.model.json.JSONModel({"count":count,"results":new_oData});
					}
					if(oModel.oData.results.length <= 0){
						oController.getOwnerComponent().getRouter().navTo("noPageFound");
					}
					oController.getView().setModel(oModel, alias);
				},
				error: function (oResponse) {
					busy.close();
				}
			});
		},
		routeMatched : function(oEvent) {
			oController = this;	
			var oArgs = oEvent.getParameter("arguments");
			oController._initialMethod("/ES_Master","ModelMasterData");
		},	
		selectedFirstItem: function(){
			/*if(!Device.system.phone){*/ 
			var oList = this.getView().byId("masterReqPending"); 
			var oFirst = oList.getItems(); 
			if(oFirst.length){ 
				oList.setSelectedItem(oFirst[0], true , true);
				//oList.fireSelectionChange(); } /*}*/ },
			}
		},
		onSelectionChange : function(evt){
			debugger
			oController = this;
			oController.id = evt.getParameters().id.split("--")[1];
			var object = evt.getParameter("listItem").getBindingContext('ModelMasterData').getObject();
			oController.getOwnerComponent().getRouter().navTo("Detail", {
				id: object.NpiNo
			});
			var oModel = new sap.ui.model.json.JSONModel(object);
			oController.getView().setModel(oModel, "selectedObject");				
		},	
		onSegbtnChange: function(evt){
			debugger
			oController = this;
			var okey = evt.getParameters().item.getKey();
			oController.counter = 0;
			oController._initialMethod("/ES_Master","ModelMasterData");
//			if(okey === 'request'){

////			oController.getOwnerComponent().getRouter().navTo("Detail");
//			}else{
//			oController._initialMethod("/ES_Master","ModelMasterData");
////			oController.getOwnerComponent().getRouter().navTo("Detail");					
//			}
			oController.selectedFirstItem();
		},
		onSearchMaster: function (oEvent) {
			var vSelectedValue = oEvent.getParameter("newValue");
			var oFilters = [];
			if (vSelectedValue && vSelectedValue.length > 0) {
				oFilters = new sap.ui.model.Filter({
					filters: [new sap.ui.model.Filter("NpiNo", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("Model", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("Sector", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("PaperText", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vSelectedValue),
						new sap.ui.model.Filter("InitiatorName", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.Contains, vSelectedValue)
					],
					and: false
				})
			}
			var binding = this.byId("masterReqPending").getBinding("items");
			binding.filter(oFilters);
		},
		fnNavToDashboard: function(oEvent){
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			 var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			 target: {
					semanticObject: "ZSSU_DASHBOARD",
					action: "display"
					 }
						})) || "";
						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);
		}
			});
});