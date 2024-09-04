sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	"use strict";

	return Controller.extend("com.mahindra.ZSSU.controller.LoBA", {
		onInit: function () {
			var oController = this;
			var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
			oRouter.getRoute("LoBA").attachPatternMatched(oController._onObjectMatched, oController);
		},
		//--------- Local Methods Start -------------------------
		_onObjectMatched: function (oEvent) {
			var oController = this;
			var vPinfoNum = oEvent.getParameter("arguments").Number;
			debugger;
			var oData={
					"EditableFlag": true,
					"DisplayOnlyFlag": true,
					"NotCreateNew": true,
					"CountToolMaker": 1,
					"CountSparePart": 1,
					"CountSupplier": 1,
					"CountProtoPart": 1,
					"FiscalYear1" : "Year 1",
					"FiscalYear2" : "Year 2",
					"FiscalYear3" : "Year 3",
					"FiscalYear4" : "Year 4",
					"FiscalYear5" : "Year 5",
					"PaperDataSet": {}
			};
			var oModel = new sap.ui.model.json.JSONModel(oData);

			if (vPinfoNum == "new") {
				oModel.setProperty("/NotCreateNew", false);
				oModel.setProperty("/EditableFlag", true);
				oModel.setProperty("/DisplayOnlyFlag", false);
				var oData = getLoBAHeaderObject();
//				oData.PaperCode = "NPI";
				oModel.setProperty("/PaperDataSet", oData);
			} else {
				oController._fnGetNPIHeaderData(vPinfoNum);
			}
			oController.getView().setModel(oModel, "ModelSSULoBA");
		},
		navBackNPI: function (oEvent) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var vNpiNo = this.getView().getModel("ModelSSULoBA").getProperty("/PaperDataSet/NpiNo");
			oRouter.navTo("NPI",{
				Number: vNpiNo
			});
		},
		_fnGetNPIHeaderData: function(vPinfoNum){
			var oController = this;
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			oController.getView().setBusy(true);
			var vParmeters = {
				"$expand": "Nav_LoBANpiItem,Nav_LoBARM,Nav_LoBAForex,Nav_LoBAProp,Nav_LoBASub,Nav_LoBATmaker,Nav_LoBASpare,Nav_Ret",
			};
			oDataNewPinfoModel.read("/ES_LoBAHeader(NpiNo='"+vPinfoNum+"')", {
//			oDataNewPinfoModel.read("/ES_NPIHeader('" + vPnifoNumber + "')", {
				urlParameters: vParmeters,
				success: function (oData, oResponse) {
					oController._fnAfterGettingBEData(oData);
					oController.getView().setBusy(false);
				},
				error: function (oResponse) {
					Message.error("Error while getting data.", {
						title: "Error"
					});
					oController.getView().setBusy(false);
				}
			});
		},
		_fnAfterGettingBEData: function (oData) {
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			oData.Nav_LoBANpiItem = oData.Nav_LoBANpiItem.results || oData.Nav_LoBANpiItem;
			oData.Nav_LoBARM = oData.Nav_LoBARM.results || oData.Nav_LoBARM;
			oData.Nav_LoBAForex = oData.Nav_LoBAForex.results || oData.Nav_LoBAForex;
			oData.Nav_LoBAProp = oData.Nav_LoBAProp.results || oData.Nav_LoBAProp;
			oData.Nav_LoBASub = oData.Nav_LoBASub.results || oData.Nav_LoBASub;
			oData.Nav_LoBATmaker = oData.Nav_LoBATmaker.results || oData.Nav_LoBATmaker;
			oData.Nav_LoBASpare = oData.Nav_LoBASpare.results || oData.Nav_LoBASpare;
			
			/*if (oData.Status === "S" || oData.Status === "R")
				oModelSSULoBA.setProperty("/DisplayOnlyFlag", false);
			
			if(oData.Status === "NR")
				oModelSSULoBA.setProperty("/NonSSURequest", true);
			
			if(oData.Initiator != oData.Createdby)
				oModelSSULoBA.setProperty("/InitiatedBySSU", false);*/
			
			oModelSSULoBA.setProperty("/PaperDataSet", oData);
			oModelSSULoBA.refresh();
//			oController._validationDataFilled();
		},
		_fnDataBeforeSave: function () {
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var oPaperData = oModelSSULoBA.getProperty("/PaperDataSet");
			oPaperData.SopDate = uiDateToBackend(oPaperData.SopDate);
			/*if (oPaperData.DeletedItems) {
				oPaperData.Nav_Items = oPaperData.Nav_Items.concat(oPaperData.DeletedItems);
				delete oPaperData.DeletedItems;
			}*/
			delete oPaperData.__metadata;
			oPaperData.Nav_Ret = [];
			/*$.each(oPaperData.Nav_Items, function (i, Row) {
				delete Row.__metadata;
				Row.ValidFrom = uiDateToBackend(Row.ValidFrom); 
			});*/
			return oPaperData;
		},
		/*onChangeSopDate: function(oEvent){
			debugger;
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var vCurrYear = Number(oEvent.getParameter("newValue").split("/")[1]);
			oModelSSULoBA.setProperty("/FiscalYear1","Year 1 - FY"+(vCurrYear+1));
			oModelSSULoBA.setProperty("/FiscalYear2","Year 2 - FY"+(vCurrYear+2));
			oModelSSULoBA.setProperty("/FiscalYear3","Year 3 - FY"+(vCurrYear+3));
			oModelSSULoBA.setProperty("/FiscalYear4","Year 4 - FY"+(vCurrYear+4));
			oModelSSULoBA.setProperty("/FiscalYear5","Year 5 - FY"+(vCurrYear+5));
			
		},*/
		formatterRadioYesNo: function (vValue){
			return vValue === "X" ? 1 :0; //0 is yes 1 is no
		},
		onAddToolMaker: function () {
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var vItemLength = oModelSSULoBA.getProperty("/PaperDataSet/Nav_LoBATmaker").length;
			for(var i=0;i<oModelSSULoBA.getProperty("/CountToolMaker");i++){
				oModelSSULoBA.setProperty("/PaperDataSet/Nav_LoBATmaker/" + (vItemLength+i), getLoBAToolMakerObject());
			}
		},
		onAddSparePart: function () {
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var vItemLength = oModelSSULoBA.getProperty("/PaperDataSet/Nav_LoBASpare").length;
			for(var i=0;i<oModelSSULoBA.getProperty("/CountSparePart");i++){
				oModelSSULoBA.setProperty("/PaperDataSet/Nav_LoBASpare/" + (vItemLength+i), getLoBASparePartObject());
			}
		},
		onAddSupplier: function () {
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var vItemLength = oModelSSULoBA.getProperty("/PaperDataSet/Nav_LoBASub").length;
			for(var i=0;i<oModelSSULoBA.getProperty("/CountSupplier");i++){
				oModelSSULoBA.setProperty("/PaperDataSet/Nav_LoBASub/" + (vItemLength+i), getLoBASupplierObject());
			}
		},
		onAddProtoPart: function () {
			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var vItemLength = oModelSSULoBA.getProperty("/PaperDataSet/Nav_LoBAProp").length;
			for(var i=0;i<oModelSSULoBA.getProperty("/CountProtoPart");i++){
				oModelSSULoBA.setProperty("/PaperDataSet/Nav_LoBAProp/" + (vItemLength+i), getLoBAProtoPartObject());
			}
			
		},
		fnLenghtLimit: function(oEvent){
			var sValue = oEvent.getSource().getValue();
			var value = oEvent.getSource().getValue();
            if(oEvent.getSource().getValue().length >= 3){
            	oEvent.getSource().setValue(sValue);
            }  
            else {
            	oEvent.getSource().setValue(value);
            }
		},
		onSaveLoBA: function(){

			var oController = this;
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			Message.confirm("This is confirmation for save data.", {
				title: "Save confirmation",
				onClose: function (oAction) {
					if (oAction == "OK") {
						var oPaperData = oController._fnDataBeforeSave();
						oPaperData.Action = "S";
						busyDialog.open();
						oController.getOwnerComponent().getModel(
							"oDataNewPinfoModel").create("/ES_LoBAHeader", oPaperData, {
							success: function (oData, oResponse) {
								var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
								if (vMsgReturn.Title == "Error") {
									sap.m.MessageBox.error(vMsgReturn.Message, {
										title: vMsgReturn.Title
									});
									oController._fnAfterGettingBEData(oPaperData);
								} else if (vMsgReturn.Title == "Sucess") {
									sap.m.MessageBox.success(vMsgReturn.Message, {
										title: vMsgReturn.Title,
										onClose: function () {
//											oModelSSULoBA.setProperty("/NotCreateNew", true);
											oModelSSULoBA.setProperty("/EditableFlag", false);
											oController._fnAfterGettingBEData(oData);
										}
									});
								}else{
									oController._fnAfterGettingBEData(oPaperData);
								}
							},
							error: function (oResponse) {
								oController._fnAfterGettingBEData(oPaperData);
								serviceError(oResponse);
							}
						});
					}
				}
			});
		},
		onEditLoBA: function(){
			this.getView().getModel("ModelSSULoBA").setProperty("/EditableFlag", true);
		},
		onPrintPreviewLoBA: function(){
			var oController = this;
			var oPdfViewer = new sap.m.PDFViewer();
			var vNpiNo = oController.getView().getModel("ModelSSULoBA").getProperty("/PaperDataSet/NpiNo");
			var vVendor = oController.getView().getModel("ModelSSULoBA").getProperty("/PaperDataSet/Vendor");
			oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_LoBAPdf(NpiNo='" + vNpiNo + "',Vendor='"+vVendor+"')/$value?sap-client=100");
			oPdfViewer.setTitle("LoBA");
			oPdfViewer.open();
		},
		onChangeDesignation: function(oEvent){
			var oController = this;

			oController.getView().getModel("oDataNewPinfoModel").setProperty("/PaperDataSet/Designation",oEvent.getSource().getSelectedItem());
		
		},
		onSelectOERadio: function(oEvent){
			var vSparePartSameOE =oEvent.getParameter("selectedIndex");
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSULoBA").getPath();
			vSparePartSameOE = vSparePartSameOE == 1 ? "X" : "";
			oEvent.getSource().getModel("ModelSSULoBA").setProperty("/PaperDataSet/SameAsOe", vSparePartSameOE);
			/*if (vSparePartSameOE == 0) {
				var oController = this;
//				var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
				var oItemDetails = oController.getView().getModel("ModelSSULoBA").getProperty(vSelectedPath);
				oItemDetails.SparePartNo = "";
				oItemDetails.SpareCurr = "";
				oItemDetails.SparePartCost = "0";
				oItemDetails.SparePackCost = "0";
				oItemDetails.Margin = "0";
				oController.getView().getModel("ModelSSULoBA").setProperty(vSelectedPath, oItemDetails);
			}
			vSparePartSameOE = vSparePartSameOE == 1 ? "X" : "";
			oEvent.getSource().getModel("ModelSSULoBA").setProperty(vSelectedPath+"/SameAsOe", vSparePartSameOE);*/
		},
		formatterSameAsOE: function(vValue){
			if(vValue==""){
				this.getView().getModel("ModelSSULoBA").setProperty("/PaperDataSet/Nav_LoBASpare",[]);
				return false;
			}else if(vValue=="X"){
				return true;
			}
		},
		onDelete: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			Message.confirm("Are you sure you want to delete this.", {
				title: "Confirm Delete",
				onClose: function (oAction) {
					if (oAction == "OK") {
						var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
						var oDeletedData = oModelSSULoBA.getProperty(vSelectedPath);
						/*if (oDeletedData.Posnr) {
							$.each(oModelSSULoBA.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
								if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
									Row.Delete = "X";
							});
							oDeletedData.Delete = "X";
							var vSetDeltPath = vSelectedPath.split("/");
							vSetDeltPath.reverse().splice(0, 2);
							vSetDeltPath = vSetDeltPath.reverse().join("/");
							var oDeletedForex = oModelSSULoBA.getProperty(vSetDeltPath + "/DeletedForex") ? oModelSSULoBA.getProperty(
								vSetDeltPath + "/DeletedForex") : [];
							oDeletedForex.push(oDeletedData);
							oModelSSULoBA.setProperty(vSetDeltPath + "/DeletedForex", oDeletedForex);
						}*/
						var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
						oModelSSULoBA.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
						oModelSSULoBA.refresh();
					}
				}
			});

		},
		onCopy: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var vBindPath = vSelectedPath.slice(0,vSelectedPath.lastIndexOf("/"));
			var oModelSSULoBA = oController.getView().getModel("ModelSSULoBA");
			var vCount = 0;
			switch(vBindPath.split("/")[2]) {
			  case "Nav_LoBATmaker":
				  vCount = oModelSSULoBA.getProperty("/CountToolMaker");
			    break;
			  case "Nav_LoBASpare":
				  vCount = oModelSSULoBA.getProperty("/CountSparePart");
			    break;
			  case "Nav_LoBASub":
				  vCount = oModelSSULoBA.getProperty("/CountSupplier");
			    break;
			  case "Nav_LoBAProp":
				  vCount = oModelSSULoBA.getProperty("/CountProtoPart");
			    break;
			  default:
				  vCount = 0;
			}
			var oCopy = {};
			var vLength = oModelSSULoBA.getProperty(vBindPath).length;
			for(var i=0 ; i<vCount ; i++){
				oCopy = $.extend({}, oModelSSULoBA.getProperty(vSelectedPath));
				oModelSSULoBA.setProperty(vBindPath+"/" + (vLength+i), oCopy);
			}
			oModelSSULoBA.refresh();

		},
		fnFiscalYearText1: function(vValue){
			if(vValue){
				if(typeof(vValue) == "string"){
					vValue = new Date(vValue.slice(0,4)+"-"+vValue.slice(4,6)+"-"+vValue.slice(6,8))
				}
				return "Year 1 - FY"+(vValue.getFullYear()+1);
			}
				
		},
		fnFiscalYearText2: function(vValue){
			if(vValue){
				if(typeof(vValue) == "string"){
					vValue = new Date(vValue.slice(0,4)+"-"+vValue.slice(4,6)+"-"+vValue.slice(6,8))
				}
				return "Year 2 - FY"+(vValue.getFullYear()+2);
			}
		},
		fnFiscalYearText3: function(vValue){
			if(vValue){
				if(typeof(vValue) == "string"){
					vValue = new Date(vValue.slice(0,4)+"-"+vValue.slice(4,6)+"-"+vValue.slice(6,8))
				}
				return "Year 3 - FY"+(vValue.getFullYear()+3);
			}
		},
		fnFiscalYearText4: function(vValue){
			if(vValue){
				if(typeof(vValue) == "string"){
					vValue = new Date(vValue.slice(0,4)+"-"+vValue.slice(4,6)+"-"+vValue.slice(6,8))
				}
				return "Year 4 - FY"+(vValue.getFullYear()+4);
			}
		},
		fnFiscalYearText5: function(vValue){
			if(vValue){
				if(typeof(vValue) == "string"){
					vValue = new Date(vValue.slice(0,4)+"-"+vValue.slice(4,6)+"-"+vValue.slice(6,8))
				}
				return "Year 5 - FY"+(vValue.getFullYear()+5);
			}
		},
	});
});