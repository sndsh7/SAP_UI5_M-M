sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"ZSSU_DASHBOARD/model/formatter"
], function (Controller, Fragment , MessageToast, JSONModel, MessageBox, UIComponent, Device, Filter,FilterOperator,formatter) {
	"use strict";
var remark;
var busy = new sap.m.BusyDialog();
var oID;
var that,oDataModel ,AttachArrExt=[],FILECONTENTS1=[],approver, oTableId;
var ssuModel;
var ammdModel ; 
return Controller.extend("ZSSU_DASHBOARD.controller.subList", {

		formatter : formatter,
		onInit: function () {
			that = this;
			ssuModel = that.getOwnerComponent().getModel("ssu")
			ammdModel = that.getOwnerComponent().getModel("oDataAmendmentModel")
			that.getOwnerComponent().getRouter().getRoute("subList").attachPatternMatched(that._routeMatched, that);
		},
		onSelectPapaer : function(evt){
			debugger
			var aFilters = [];
			var sQuery = evt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				if(evt.getParameters().id.split("_")[3] === "search"){
					var filter = new Filter("NpiNo", FilterOperator.Contains, sQuery);
				}else{
					var filter = new Filter("PaperCode", FilterOperator.Contains, sQuery);
				}				
				aFilters.push(filter);
			}
			// update list binding
			var oList = that.byId("idProductsTable1");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);
		},
		_getPaperCode : function(){
			busy.open();
			ssuModel.read("/ES_PaperList", {
				urlParameters: {
					"$filter": "Application eq 'SSU'"
				},
				success: function (oData, oResponse) {
					busy.close();
					 var oDataModel = new JSONModel();
					 oDataModel.setData(oData);
					 that.getView().setModel(oDataModel, "paperCode");
				},
				error: function (oResponse) {
					busy.close()
				}
			});
		},
		_routeMatched: function (oEvent) {
			debugger
			that = this;
			var selData = [];
			that._getPaperCode();
			that.loadAssociate();
			var object = ZSSU_DASHBOARD.detObject;
			var oData = ZSSU_DASHBOARD.SelectData;
			var tableId = that.getView().byId("idProductsTable1");
			if(oData.name === "Completed"){
				tableId.getColumns()[2].setVisible(false);
				that.FLAG = "X"
				var oDataModel = new JSONModel();
				 oDataModel.setData(oData);
				 that._CompleteageingDays(oData);
				 that.getView().setModel(oDataModel);
			}else if(oData.name === "Pending With TL"){
				that.FLAG = "X"
				tableId.getColumns()[2].setVisible(false);
				var oDataModel = new JSONModel();
				 oDataModel.setData(oData);
				 that._ageingDays(oData);
				 that.getView().setModel(oDataModel);
			}else{
				if(oData.name === "Pending with Approver"){
					tableId.getColumns()[5].setVisible(true);
				}else{
					tableId.getColumns()[5].setVisible(false);
				}
				if(oData.name  === "Pending with SSU Buyer" || oData.name === "Pending with Approver"){
					tableId.getColumns()[2].setVisible(true);
				}else{
					tableId.getColumns()[2].setVisible(false);
				}
				that.FLAG = ""
				oData.results.filter(function (obj, index) {
				 if(object.AssociateName === obj.AssociateName){
						selData.push(obj)
				 }
				 return selData;
				});	
				 var oDataModel = new JSONModel();
				 oDataModel.setData({"results" : selData});
				 that._ageingDays(oData);
				 that.getView().setModel(oDataModel);
			}
		},
		_CompleteageingDays : function(oData){
			debugger
			for(var i=0;i<oData.results.length;i++){
				var pastDate = new Date(oData.results[i].Crdate);
				var LA_Date = new Date(oData.results[i].LA_Date);
				var diffDays = parseInt((LA_Date - pastDate) / (1000 * 60 * 60 * 24), 10); 
				oData.results[i].AgeingDiffDays = diffDays;				
			}
		},
		_ageingDays : function(oData){
			debugger
			var todayDate = new Date();
			for(var i=0;i<oData.results.length;i++){
				var pastDate = new Date(oData.results[i].Crdate);
				var diffDays = parseInt((todayDate - pastDate) / (1000 * 60 * 60 * 24), 10); 
				oData.results[i].AgeingDiffDays = diffDays;				
			}
		},
		loadAssociate: function () {
			busy.open();
			var filters = [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, "")];
			ammdModel.read("/ES_SSUAssociate", {
				filters: filters,
				success: function (oData, oResponse) {
					busy.close();
					var oModel = new sap.ui.model.json.JSONModel(oData);
					that.getView().setModel(oModel, "associate");
				},
				error: function (oResponse) {
					MessageBox.error("Error loading Initiator.", {
						title: "Error"
					});
					busy.close();
				}
			});
		},
		handleFilterDialogConfirm:function(oEvent){		
			var aFilterItems = oEvent.getParameters().filterItems,
			  aFilters = [];
			  var mParam = oEvent.getParameters();
			  var oList = this.byId("idProductsTable1");
			  var oBinding = oList.getBinding("items");
			
			  aFilterItems.forEach(function (oItem) {	
				   var fil = oItem.getText();
				   switch (oItem.getKey()) {
				   case "AssociateName":
				    var filter = new Filter("AssociateName", FilterOperator.EQ, fil);
				    aFilters.push(filter);
				   break;
				   case "PaperCode":
				    filter = new Filter("PaperCode", FilterOperator.EQ, fil);
				    aFilters.push(filter);
				    break;
				    default:
				    break;
				   }
				  });
			oBinding.filter(aFilters);
		},

		handleFilterButtonPressed : function(){
			if (!that.filterFrag) {
				that.filterFrag = sap.ui.xmlfragment("ZSSU_DASHBOARD.view.filter", that);
				that.getView().addDependent(that.filterFrag); 
			}
			that.filterFrag.open();
			that.loadAssociate();
		},
		OnSelectionofSubList : function(evt){
			debugger
			var index = evt.getParameters().listItem.getId().split("-")[4];
			var paperCode = evt.getSource().getModel().getData().results[index].PaperCode;
			var paperNo = evt.getSource().getModel().getData().results[index].NpiNo;
	        var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");
		    var href = (xnavservice && xnavservice.hrefForExternal({
		        target: {
				semanticObject: paperCode,
				action: "create"
				},
				params: {
					"PaperNumber": [paperNo,paperCode,"X"]
				}
			    })) || "";

			    var url = window.location.href.split('#')[0] + href;
			    sap.m.URLHelper.redirect(url, true);
		},
		setValueLabel: function (id) {
			var abc = this.getView().byId(id);
			this.getView().byId(id).setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						type: 'percentage',
						showTotal: true
					}
				}
			});
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(abc.getVizUid());
		},
		
		onPressNavButton : function(){
			debugger
			if(that.FLAG === "X"){
				this.getOwnerComponent().getRouter().navTo("Routeapp");
			}else{
				this.getOwnerComponent().getRouter().navTo("Detail");
			}
		},
		OnSelection : function(evt){
			debugger
		}
	});

});