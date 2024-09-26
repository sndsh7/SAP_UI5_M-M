sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	"use strict";

	return Controller.extend("com.mahindra.ZNONSBU_PICopy.controller.PICopy", {

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
			var appName  = "ZSBU_PriceCrctn";

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
			oDataModel.read("/FioriUsageSet(Appname='ZNONSBU_PICopy',Device='" + device +
			"',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
			"',Resolution='" + resolution + "')",null,null,null,function(e)   {	},
			function(e)
			{ });
			
			
			var oController = this;
			var oModelDefault = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath("NonSBU", "/json/dataSet.json");
			oModelDefault.loadData(sUrl, "", false);
			oController.getView().setModel(oModelDefault, "ModelDefaultDataSet");
			 var vStartupPara = getStartupParameters(this);
			 oController._onObjectMatched(vStartupPara.PaperNumber);
			
//			oController._onObjectMatched(["new","PIC"]);
		},
		//--------- Local Methods Start -------------------------
		_onObjectMatched: function (oParameter) {
			var oController = this;
			var vPinfoNum = oParameter[0];
			//vPinfoNum = vPinfoNum.split(":")[0];
			var vPaperCode = oParameter[1];
			//var vPinfoNum = oEvent.getParameter("arguments").Number;
			var oModel = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath('com.mahindra.ZNONSBU_PICopy', '/json/PICopyData.json');
			oModel.loadData(sUrl, "", false);
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			//oModel.setProperty("/UserId", sap.ui.Device.userId);

			if (vPinfoNum == "new") {
				oModel.setProperty("/NotCreateNew", false);
				oModel.setProperty("/EditableFlag", true);
				oModel.setProperty("/DisplayOnlyFlag", false);
				var oData = getHeaderObjectPIC();
				oData.PaperCode= vPaperCode;
				oModel.setProperty("/PaperDataSet", oData);
			} else {
				oController._fnGetNPIHeaderData(vPinfoNum,vPaperCode);
			}
			var filters = [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode),
				new sap.ui.model.Filter("Application", sap.ui.model.FilterOperator.EQ, "NON_SSU")];
			oDataNewPinfoModel.read("/ES_SSUInitiatorSet", {
				filters: filters,
				success: function (oData, oResponse) {
					oModel.setProperty("/F4Initiator", oData.results);
					// busyDialog.close();
				},
				error: function (oResponse) {
					Message.error("Error loading Initiator.", {
						title: "Error"
					});
					// busyDialog.close();
				}
			});
			oController.getOwnerComponent().getModel("oDataAmendmentModel").read("/ES_Category", {
				success: function (oData, oResponse) {
					var oPinfoCat = [];
					$.each(oData.results,function(i,Row){
						oPinfoCat.push({
							"PinfoCatText" : Row.CatDesc,
							"Pinforcat" : Row.CatCode
						});
					})
					oModel.setProperty("/F4PinfoCategory", oPinfoCat);
					oModel.refresh();
				},
				error: function (oResponse) {
					Message.error("Error loading pinfo Category.", {
						title: "Error"
					});
				}
			});
			oController.getView().setModel(oModel, "ModelSSUDigitization");
			oController._fnCreatingTables();
		},
		_fnGetNPIHeaderData: function (vPnifoNumber, vPaperCode) {
			var oController = this;
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			oController.getView().setBusy(true);
			var vParmeters = {
				"$expand": "Nav_Items/Nav_Forex,Nav_Items/Nav_RM,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret",
			};
			oDataNewPinfoModel.read("/ES_NPIHeader(NpiNo='"+vPnifoNumber+"',PaperCode='"+vPaperCode+"')", {
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
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
			oData.Model = oData.Model ? oData.Model.split(",") : [];
			oData.Nav_Items = oData.Nav_Items.results ? oData.Nav_Items.results : oData.Nav_Items;
			oData.Nav_DMS = oData.Nav_DMS.results  ? oData.Nav_DMS.results : oData.Nav_DMS;
			oData.Nav_Log = oData.Nav_Log.results  ? oData.Nav_Log.results : oData.Nav_Log;
			oData.Nav_Wf = oData.Nav_Wf.results  ? oData.Nav_Wf.results : oData.Nav_Wf;
			
			/*oData.Nav_Items = oData.Nav_Items.results;
			oData.Nav_DMS = oData.Nav_DMS.results;
			oData.Nav_Log = oData.Nav_Log.results;
			oData.Nav_Wf = oData.Nav_Wf.results;*/
			$.each(oData.Nav_Items, function (i, Row) {
				Row.uiFields ={
					    "Error": "Default",
					    "ItemNo": ""
					  };
				/*if (oData.Status === "S" || oData.Status === "R")
					Row.ValidFrom = new Date();*/
				
				if (typeof Row.ValidFrom == "string"){
                    Row.ValidFrom = new Date( Row.ValidFrom);
				}
			});
			if (oData.Status === "RS" || oData.Status === "RJ")
				oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
			
			oModelSSUDigitization.setProperty("/PaperDataSet", oData);
			oModelSSUDigitization.refresh();
			oController._validationDataFilled();
		},
		_fnDataBeforeSave: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			if (oPaperData.DeletedItems) {
				oPaperData.Nav_Items = oPaperData.Nav_Items.concat(oPaperData.DeletedItems);
				delete oPaperData.DeletedItems;
			}
			if (oPaperData.DeletedDMS) {
				oPaperData.Nav_DMS = oPaperData.Nav_DMS.concat(oPaperData.DeletedDMS);
				delete oPaperData.DeletedDMS;
			}
			oPaperData.Sector = oPaperData.Sector.toString();
			oPaperData.Model = oPaperData.Model.toString();
			delete oPaperData.__metadata;
			oPaperData.Nav_Log = [];
			oPaperData.Nav_Wf = [];
			oPaperData.Nav_Ret = [];
			oPaperData.Nav_DMS = [];
			$.each(oPaperData.Nav_Items, function (i, Row) {
				// Row.YearBase = Row.YearBase.toString();
				
				/*delete Row.ItemNo;
				delete Row.Error;
				delete Row.ErrorTC;
				delete Row.ErrorBR;
				delete Row.BEError;
				delete Row.ToolCostPanelState;
				delete Row.CBDPanelState;
				delete Row.BusiRednPanelState;
				delete Row.FX_RM_PanelState;*/
				delete Row.uiFields;
				delete Row.__metadata;
				delete Row.PinfoCatText; //needs to add in npi service
				
				Row.ValidFrom = uiDateToBackend(Row.ValidFrom);
	            
				/*Row.ToolCostRequired = Row.ToolCostRequired == 1 ? "X" : "";
				Row.ForexRequired = Row.ForexRequired == 1 ? "X" : "";
				Row.SparePartSameOE = Row.SparePartSameOE == 1 ? "X" : "";
				Row.YearBase = Row.YearBase == 1 ? "1" : "0";*/

			});
			/*$.each(oPaperData.Nav_DMS, function (i, Row) {
				delete Row.__metadata;
			});*/
			return oPaperData;
		},
		
		/*_uiDateToBE: function(oUiDate){
			if (typeof oUiDate == "object"){
	            var vDate = oUiDate.getDate();
	            if(vDate<10){
	                vDate = "0"+vDate;
	            }
	            var vMonth = oUiDate.getMonth()+1;
	            if(vMonth<10){
	                vMonth = "0"+vMonth;
	            }
	            var vYear = oUiDate.getFullYear();
	            var oBEDateFormat = vYear+"-"+vMonth+"-"+vDate+"T00:00:00";
	            return oBEDateFormat;
			}
		},*/

		_fnCreatingTables: function () {
			var oController = this;
			var oTablePartDetails = oController.byId("idPartPriceTbl");
			// var oTableBRDetails = oController.byId("idBusRedunTbl");
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			var vTableBindingPath = "ModelSSUDigitization>/PaperDataSet/Nav_Items";
			var oActionItem = new sap.m.HBox({
				justifyContent: "Center",
				items: [
					new sap.m.Button({
						tooltip: "view & add attachment",
						icon: "{ModelDefaultDataSet>/Icon/attachmentIcon}",
						press: function (oEvent) {
							oController.onAttachment(oEvent);
						}
					}),
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/editIcon}",
						tooltip: "Edit",
						visible: "{ModelSSUDigitization>/EditableFlag}",
						type: "{ModelSSUDigitization>uiFields/Error}",
						press: function (oEvent) {
							var oItemFrag = xmlFragment(oController, "ItemPICopySBU");
							var oParentModel = oController._setEditFragmentModel(oEvent);
							oItemFrag.setModel(oParentModel);
							oController._getVendor(oParentModel,oParentModel.getProperty("/Vendor"));
							oController._fnGetTaxCodeService(oParentModel);
							oController._getF4RevVendor(oParentModel);
							oItemFrag.open();
						}
					}),
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/copy}",
						tooltip: "Copy",
						visible: "{ModelSSUDigitization>/EditableFlag}",
						press: function (oEvent) {
							var oItemFrag = xmlFragment(oController, "ItemPICopySBU");
							var oParentModel = oController._setEditFragmentModel(oEvent);
							var vuiFields ={
								    "Error": "Default",
								    "ItemNo": ""
								  };
							oParentModel.setProperty("/uiFields",vuiFields);
							var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
							var vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
							oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
							oItemFrag.setModel(oParentModel);
							oController._getVendor(oParentModel,oParentModel.getProperty("/Vendor"));
							oController._fnGetTaxCodeService(oParentModel);
							oController._getF4RevVendor(oParentModel);
							oParentModel.setProperty("/DBExist","");
							oItemFrag.open();
						}
					}),
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
						tooltip: "Display",
						visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
						press: function (oEvent) {
							var oParentModel = oController._setDisplayFragmentModel(oEvent);
							var oItemFrag = xmlFragment(oController, "ItemPICopySBU");
							oItemFrag.setModel(oParentModel);
							oController._fnGetTaxCodeService(oParentModel);
							oController._getF4RevVendor(oParentModel);
							oItemFrag.open();
						}
					}),
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/messagePopupIcon}",
						tooltip: "Information",
						visible: "{ModelSSUDigitization>/PostToSAP}",
						type: {path: 'ModelSSUDigitization>BjStatus',  
						      formatter: function(vValue){  
						          return   vValue == "E" ? "Reject" :"Default";
						       }
							},
						press: function (oEvent) {
							var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
							var oPopoverSearch = new sap.m.Popover({
								placement: "Left",
								showHeader: false,
//								contentWidth: "30%",
								content: [new sap.m.Text({
									text: "{ModelSSUDigitization>"+vSelectedPath+"/Message}",
								})]
							});
							oController.getView().addDependent(oPopoverSearch);
							oPopoverSearch.openBy(oEvent.getSource());		
						}
					}),
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/deleteIcon}",
						tooltip: "Delete",
						type: "Reject",
						visible: "{ModelSSUDigitization>/EditableFlag}",
						press: function (oEvent) {
							var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
							Message.confirm("Are you sure you want to delete this.", {
								title: "Confirm Delete",
								onClose: function (oAction) {
									if (oAction == "OK") {
										var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
										var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
										if (oDeletedData.NpiNo) {
											$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
												if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
													Row.Delete = "X";
											});
											/*$.each(oDeletedData.Nav_Forex, function (i, RowFx) {
													RowFx.Delete = "X";
											});
											$.each(oDeletedData.Nav_RM, function (i, RowRm) {
													RowRm.Delete = "X";
											});*/
											oDeletedData.Delete = "X";
											var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedItems") ? oModelSSUDigitization.getProperty(
												"/PaperDataSet/DeletedItems") : [];
											oDeletedItems.push(oDeletedData);
											oModelSSUDigitization.setProperty("/PaperDataSet/DeletedItems", oDeletedItems);
										}
										var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
										oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
										oModelSSUDigitization.refresh();
									}
								}
							});

						}
					})
				]
			});
			createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
		},

		_fnGetTaxCodeService: function (oParentModel) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vFilters = [];
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			vFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/RvPlant")));
			vFilters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/RvVendor")));
			oDataNewPinfoModel.read("/ES_TaxCode", {
				filters: vFilters,
				success: function (oData, oResponse) {
					oModelSSUDigitization.setProperty("/F4TaxCode", oData.results);
					if(oData.results.length<=0){
						Message.error(JSON.parse(oResponse.headers["sap-message"]).message, {
							title: "Error Tax Code"
						});
					}
					
					busyDialog.close();
				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});
		},

		_setEditFragmentModel: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			var objectData = $.extend({}, oModelSSUDigitization.getProperty(vSelectedPath));
			var vSelectedPathVali = oController._fnDataSettingValidation(vSelectedPath);
			objectData.Validation = oModelSSUDigitization.getProperty(vSelectedPathVali);
			return new JSONModel(objectData);
		},
		_fnDataSettingValidation: function (vSelectedPathVali) {
			if (vSelectedPathVali.search("PaperDataSet") >= 0) {
				vSelectedPathVali = vSelectedPathVali.replace("PaperDataSet", "Validation");
			}
			if (vSelectedPathVali.search("Nav_Items") >= 0) {
				vSelectedPathVali = vSelectedPathVali.replace("Nav_Items", "Nav_ItemsX");
			}
			if (vSelectedPathVali.search("Nav_Forex") >= 0) {
				vSelectedPathVali = vSelectedPathVali.replace("Nav_Forex", "Nav_ForexX");
			}
			if (vSelectedPathVali.search("Nav_RM") >= 0) {
				vSelectedPathVali = vSelectedPathVali.replace("Nav_RM", "Nav_RMX");
			}
			return vSelectedPathVali;
		},
		_setDisplayFragmentModel: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
		},
		_setDataAfterEditItem: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//			var vChangedData = oEvent.getSource().getParent().getModel().getData();
//		    Add start by AGAWSA-CONT on 01.07.2023
		      try{
		    	  var vChangedData = oEvent.getModel().getData();
		      }catch(e){
		    	  var vChangedData = oEvent.getSource().getParent().getModel().getData(); // AGAWSA-CONT;
		      }
//		    Add end by AGAWSA-CONT on 01.07.2023
			var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
			if (!vSelectedPath) {
				vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
			}
			delete vChangedData.Validation;
			oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
			oModelSSUDigitization.setProperty("/SelectedPath", "");
//			oController._validationDataFilled();
		},
		_fnMassDataSet: function (vExcelDataArray) {

			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
			var oFilter;
			$.each(vExcelDataArray, function (MainIndex, row) {
				oFilter = $.grep(oMassData, function (grepRow) {
					return ((row.Plant === grepRow.Plant) && (row.Vendor_Code === grepRow.Vendor) && (row.Part_Number === grepRow.PartNo) && (row.Doc_Type === grepRow.Pinforcat));
				});
				if (oFilter.length <= 0) {
//					var vValidFrom = row.Valid_From_Date || "";
					
					var oItemData = getItemDetailsObjectPIC();
					oItemData.Plant = row.Ex_Plant || "";
					oItemData.Vendor = row.Ex_Vendor_Code || "";
					oItemData.PartNo = row.Part_Number || "";
					oItemData.SettledPrice = row.Settled_Price && row.Settled_Price.replace(/ /g, '') || "0";
					oItemData.Priceunit = row.Price_Unit && row.Price_Unit.replace(/ /g, '') || "1";
					oItemData.RvVendor = row.Rev_Vendor_Code || "";//Rev_Vendor_Code
					oItemData.RvPlant = row.Rev_Plant || "";
					oItemData.Purorg = "INPO";
					oItemData.Pinforcat = row.Doc_Type && row.Doc_Type.replace(/ /g, '') || "0"; // == "0"?"Standard":"Subcontracting";
					oItemData.Purgrp = row.Purchase_Group || "";
					oItemData.Taxcode = row.Tax_Code || "";
//					oItemData.ValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
//					oItemData.Amndcode = row.Price_Change_Code || "";
//					oItemData.Remarks = row.Remarks || "";
					oMassData.push(oItemData);					
					/*var index = oMassData.length - 1;
					oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);*/
				}

			});
			oController._validationMass(oMassData);
			oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);
		},
		_validationMass: function (Nav_Items) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oValidation = {
				"PaperCode": oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode"),	
				"Sector": oModelSSUDigitization.getProperty("/PaperDataSet/Sector").toString(),
				"Nav_ItemsX": []
			};
			$.each(Nav_Items, function (item, Row) {
				Row.uiFields.ItemNo = item.toString();
				var oNavItem = {
					"ItemNo": item.toString(),
					"Plant": Row.Plant,
					"RvPlant": Row.RvPlant,
					"Vendor": Row.Vendor,
					"RvVendor": Row.RvVendor,
					"PartNo": Row.PartNo,
					"Taxcode": Row.Taxcode,
					"Purgrp": Row.Purgrp,
					"Purorg": Row.Purorg,
					"Pinforcat":Row.Pinforcat,
					"ValidFrom": uiDateToBackend(Row.ValidFrom),
					"Priceunit": Row.Priceunit
				};
				oValidation.Nav_ItemsX.push(oNavItem);
			});
			busyDialog.open();
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeaderX", oValidation, {
				success: function (oData, oResponse) {
					var vMsg = "Validation is successfully done with some errors.";
					var vTitle = "Information";
					var vIndexItem;
					oData.Nav_ItemsX = oData.Nav_ItemsX.results;
					$.each(oData.Nav_ItemsX, function (i, Row) {

						$.each(Nav_Items, function (Index, NavRow) {
							if (NavRow.uiFields.ItemNo == Row.ItemNo) {
								vIndexItem = Index;
							}
						});
						
						if (Row.RvVendorFlag == "") {
							Nav_Items[vIndexItem].RvVName = Row.RvVName;
							Nav_Items[vIndexItem].RvVLocation = Row.RvVLocation;
							Nav_Items[vIndexItem].Currency = Row.Currency;
							
							Nav_Items[vIndexItem].CondType = Row.CondType;
							Nav_Items[vIndexItem].CondTypText = Row.CondTypText;
							Nav_Items[vIndexItem].CondPrcnt = Row.CondPrcnt;
							Nav_Items[vIndexItem].CondUnit = Row.CondUnit;
						}

						if (Row.VendorFlag == "") {
//							Nav_Items[vIndexItem].RvVendor = Row.Vendor;
//							Nav_Items[vIndexItem].ExtPrice = Row.ExtPrice;
							
							Nav_Items[vIndexItem].VName = Row.VName;
							Nav_Items[vIndexItem].VLocation = Row.VLocation;
//							Nav_Items[vIndexItem].Currency = Row.Currency;
							Nav_Items[vIndexItem].ExtPrice = Row.ExtPrice;
							Nav_Items[vIndexItem].PirNo = Row.PirNo;
							Nav_Items[vIndexItem].ValidFrom = Row.ValidFrom;
							var vSign =  Number(Nav_Items[vIndexItem].SettledPrice) - Number(Row.ExtPrice);
							Nav_Items[vIndexItem].DeltaPrice = vSign.toFixed(2);
							
							
						}
						
						if (Row.PartNoFlag == "") {
							Nav_Items[vIndexItem].PartDesc = Row.PartDesc;
							Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
							if(Row.Purgrp !="")
								Nav_Items[vIndexItem].Purgrp = Row.Purgrp;
						}
						
						if (Row.TaxcodeFalg == "") {
							Nav_Items[vIndexItem].TcDesc = Row.TcDesc;
						}
//			          Add start by AGAWSA-CONT on 01.07.2023
			            if(Row.PriceunitFlag != ""){
			            	if (Row.VendorFlag != "" || Row.PartNoFlag != ""  || Row.RvVendorFlag != "" || Row.TaxcodeFalg != "" || Row.PlantFlag != "") {
			                    Nav_Items[vIndexItem].uiFields.Error = "Reject";
			                    Nav_Items[vIndexItem].uiFields.MassValidation = Row;
//			                    Nav_Items[vIndexItem].BEError = true;
			                  }else{
			                	  Nav_Items[vIndexItem].uiFields.Error = "Critical";
			                      Nav_Items[vIndexItem].uiFields.MassValidation = Row;
			                  }
			            }
			            else if (Row.VendorFlag != "" || Row.PartNoFlag != ""  || Row.RvVendorFlag != "" || Row.TaxcodeFalg != "" || Row.PlantFlag != "") {
			              Nav_Items[vIndexItem].uiFields.Error = "Reject";
			              Nav_Items[vIndexItem].uiFields.MassValidation = Row;
//			              Nav_Items[vIndexItem].BEError = true;
			            } else {
			              Nav_Items[vIndexItem].uiFields.Error = "Default";
			              Nav_Items[vIndexItem].uiFields.MassValidation = {};
//			              Nav_Items[vIndexItem].BEError = false;
			            }
//			          Add end by AGAWSA-CONT on 01.07.2023
//						if (Row.VendorFlag != "" || Row.PartNoFlag != "" || Row.RvPlantFlag != "" || Row.RvVendorFlag != "" || Row.TaxcodeFalg != "" || Row.PlantFlag != "") {
//							Nav_Items[vIndexItem].uiFields.Error = "Reject";
//							Nav_Items[vIndexItem].uiFields.MassValidation = Row;
////							Nav_Items[vIndexItem].BEError = true;
//						} else {
//							Nav_Items[vIndexItem].uiFields.Error = "Reject";
//							Nav_Items[vIndexItem].uiFields.MassValidation = {};
////							Nav_Items[vIndexItem].BEError = false;
//						}

					});
					oController._validationDataFilled();
//					if (oData.ErrorFlag != "X") {
//						oModelSSUDigitization.setProperty("/BEValidation", true);
//						oModelSSUDigitization.setProperty("/EditableFlag", false);
////						oController._fnLockUnlockService("");
//						vMsg = "Validation is successfully done without errors.";
//						vTitle = "Success";
//					}
//			        Start ADD By AGAWSA-CONT
			          if (oData.ErrorFlag == "") {
			              oModelSSUDigitization.setProperty("/BEValidation", true);
			              oController._fnLockUnlockService("");
			              Message.success("Validation is successfully done without errors.");
			            }
			            else if (oData.ErrorFlag == "X") {
			              Message.error("Validation is successfully done with errors.");
			              oModelSSUDigitization.setProperty("/BEValidation", false);
			            }
			            else if(oData.ErrorFlag == "W"){
			              oModelSSUDigitization.setProperty("/BEValidation", true);
			              oController._fnLockUnlockService("");
			              Message.warning("Validation is successfully done with warning.");
			            }
//			        END ADD By AGAWSA-CONT
					oModelSSUDigitization.setProperty("/Validation", oData);
					oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
					oModelSSUDigitization.refresh();
//					Message.success(vMsg, {
//						title: vTitle
//					});
					busyDialog.close();
				},
				error: function (oResponse) {
					 serviceError(oResponse);
					busyDialog.close();
				}
			});
		},
		_getModelPlant: function (vSelectedSectors) {
			if (vSelectedSectors && vSelectedSectors.length > 0) {
				var vFilters = [];
				var oController = this;
				var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
				var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
				oModelSSUDigitization.setProperty("/PaperDataSet/Sector", vSelectedSectors)

				$.each(vSelectedSectors, function (index, key) {
					vFilters.push(new sap.ui.model.Filter("SectorCode", sap.ui.model.FilterOperator.EQ, key));
				});
				busyDialog.open();

				oDataNewPinfoModel.read("/ES_Model", {
					filters: vFilters,
					success: function (oData, oResponse) {
						oModelSSUDigitization.setProperty("/F4Model", oData.results);
						// oModelSSUDigitization.refresh();
						busyDialog.close();
					},
					error: function (oResponse) {
						serviceError(oResponse)
					}
				});
				oDataNewPinfoModel.read("/ES_Plant", {
					filters: vFilters,
					success: function (oData, oResponse) {
						oModelSSUDigitization.setProperty("/F4Plant", oData.results);
						// oModelSSUDigitization.refresh();
						busyDialog.close();
					},
					error: function (oResponse) {
						serviceError(oResponse)
					}
				});
			}
		},
		_fnRequredFieldCheck: function (oFields) {
			var oMandatoryFlag = true;
			$.each(oFields, function (i, row) {
				if (row.mProperties.hasOwnProperty("required") && row.getProperty("required")) {
					if (row.mProperties.hasOwnProperty("selectedKeys") && row.getProperty("selectedKeys").length <= 0) {
						row.setValueState("Error");
						row.setValueStateText("this field is required");
						oMandatoryFlag = false;
					} else if (row.mProperties.hasOwnProperty("value") && !row.mProperties.hasOwnProperty("selectedKeys") &&
							((row.mProperties.hasOwnProperty("type") && row.getProperty("type")=="Number" && row.getProperty("value") == "0") || row.getProperty("value") == "" || row.getProperty("value") == " ")) {
						row.setValueState("Error");
						row.setValueStateText("this field is required");
						oMandatoryFlag = false;
					} else if (row.mProperties.hasOwnProperty("selectedKey") && (row.getProperty("selectedKey") == "" || row.getProperty(
							"selectedKey") == " ")) {
						row.setValueState("Error");
						row.setValueStateText("this field is required");
						oMandatoryFlag = false;
					} else if (row.mProperties.hasOwnProperty("displayFormat") && row.getProperty("dateValue") == null) {
						row.setValueState("Error");
						row.setValueStateText("this field is required");
						oMandatoryFlag = false;
					} else if (row.mProperties.hasOwnProperty("valueState")) {
						row.setValueState("None");
					}
				}
			});
			return oMandatoryFlag;
		},
		/*_fnLoadFXIndexVal: function (vForexIndex) {
			var oController = this;
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_ForexIndVal", {
				filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vForexIndex)],
				success: function (oData, oResponse) {
					oController.getView().getModel("ModelSSUDigitization").setProperty("/F4ForexIndVal", oData.results);
					oController.getView().getModel("ModelSSUDigitization").refresh();
					busyDialog.close();
				},
				error: function (oResponse) {
					serviceError(oResponse);
					busyDialog.close();
				}
			});
		},
		_fnLoadIndexRMVal: function (vRMIndex) {
			var oController = this;
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_RMIndexVal", {
				filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vRMIndex)],
				success: function (oData, oResponse) {
					oController.getView().getModel("ModelSSUDigitization").setProperty("/F4RMIndexVal", oData.results);
					oController.getView().getModel("ModelSSUDigitization").refresh();
					busyDialog.close();
				},
				error: function (oResponse) {
					serviceError(oResponse);
					busyDialog.close();
				}
			});
		},
		_fnClearToolData: function (vSelectedPath) {
			var oController = this;
			var oItemDetails = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath);
			oItemDetails.TlCostCurrency = "";
			oItemDetails.CurrDenomination = "";
			oItemDetails.Budgeted = "0";
			oItemDetails.FinalAmortized = "0";
			oItemDetails.Finalupfront = "0";
			oItemDetails.Amortisation = "0";
			oItemDetails.ToolAmortisation = "0";
			oItemDetails.RevCurrency = "";
			oItemDetails.RevDenomination = "";
			oItemDetails.RevBudgeted = "0";
			oItemDetails.RevFinalAmortized = "0";
			oItemDetails.RevFinalUpfront = "0";
			oItemDetails.RevAmortization = "0";
			oItemDetails.RevTlAmortization = "0";
			oItemDetails.EdCurrency = "";
			oItemDetails.EdDenomination = "";
			oItemDetails.EdBudgeted = "0";
			oItemDetails.EdFinalAmortized = "0";
			oItemDetails.EdFinalUpfront = "0";
			oItemDetails.EdAmortization = "0";
			oItemDetails.ToolAmortization = "0";
			oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath, oItemDetails);
		},
		_fnCalculationToolAmotization: function (vFinalAmortized, vAmortisation, vDenomination) {
			var vToolAmortisation = 0;
			if (vFinalAmortized != "" && vAmortisation != "") {
				switch (vDenomination) {
				case "Same":
					vToolAmortisation = parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
					break;
				case "Thousands":
					vToolAmortisation = 1000 * parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
					break;
				case "Lakhs":
					vToolAmortisation = 100000 * parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
					break;
				case "Crores":
					vToolAmortisation = 10000000 * parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
					break;
				}
				vToolAmortisation = (!vToolAmortisation || vToolAmortisation == Infinity || vToolAmortisation == -Infinity) ? 0 :
					vToolAmortisation;
				vToolAmortisation = vToolAmortisation.toFixed(3);
			}
			return vToolAmortisation.toString();
		},*/
		_validationDataFilled: function () { 
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			var vFlag = true;
			var oTabIconColor = {
				"VendorPartDetails": "Positive",
				"Attachment": "Positive",
				"Workflow": "Positive"
			};
			if (oPaperData.Nav_DMS.length <= 0) {
				vFlag = false;
				oTabIconColor.VendorPartDetails = "Negative";
			} else {
				var vFlagRSC = false;
				$.each(oPaperData.Nav_DMS, function (i, RowDMS) {
					if (RowDMS.TabId == "RSC")
						vFlagRSC = true;
				});
				if (!vFlagRSC) {
					vFlag = false;
					oTabIconColor.VendorPartDetails = "Negative";
				}
			}
			if (oPaperData.Sector.length <= 0 || oPaperData.Model.length <= 0 || oPaperData.Initiator == "") {
				vFlag = false;
				oTabIconColor.VendorPartDetails = "Negative";
			}
			if (oPaperData.Initiator == "") {
				vFlag = false;
				oTabIconColor.Workflow = "Negative";
			}
			if (oPaperData.Nav_Items.length <= 0) {
				oTabIconColor.VendorPartDetails = "Negative";
			}
			$.each(oPaperData.Nav_Items, function (i, Row) {

				/*if () {
					vFlag = false;
					oTabIconColor.VendorPartDetails = "Negative";
				}*/
//		    	  Add start by AGAWSA-CONT on 01.07.2023
		    	  if(Row.uiFields.Error == "Critical"){
		    		  if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" || Row.RvVendor == "" ||
		    		          Row.SettledPrice == "" || Row.Purgrp == "" || Row.Pinforcat == "" || Row.Purorg == "" || Row.Taxcode == "" ||
		    		          Row.ValidFrom == null || (Row.uiFields.Error == "Reject" && Row.uiFields.MassValidation.hasOwnProperty("ItemNo"))) { //Error checking because of Backend validation 
		    		          vFlag = false;
		    		          oTabIconColor.VendorPartDetails = "Negative";
		    		          Row.uiFields.Error = "Reject"; //Error setting because of mandatory fields 
		    		        } else {
		    		          Row.uiFields.Error = "Critical";
		    		        }
		    	  }else{
		    		  if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" || Row.RvVendor == "" ||
		    		          Row.SettledPrice == "" || Row.Purgrp == "" || Row.Pinforcat == "" || Row.Purorg == "" || Row.Taxcode == "" ||
		    		          Row.ValidFrom == null || (Row.uiFields.Error == "Reject" && Row.uiFields.MassValidation.hasOwnProperty("ItemNo"))) { //Error checking because of Backend validation 
		    		          vFlag = false;
		    		          oTabIconColor.VendorPartDetails = "Negative";
		    		          Row.uiFields.Error = "Reject"; //Error setting because of mandatory fields 
		    		        } else {
		    		          Row.uiFields.Error = "Default";
		    		        }
		    	  }
//		    	  Add end by AGAWSA-CONT on 01.07.2023
//				if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" || Row.RvPlant == "" || Row.RvVendor == "" ||
//					Row.SettledPrice == "" || Row.Purgrp == "" || Row.Pinforcat == "" || Row.Purorg == "" || Row.Taxcode == "" ||
//					Row.ValidFrom == null || (Row.uiFields.Error == "Reject" && Row.uiFields.MassValidation.hasOwnProperty("ItemNo"))) { //Error checking because of Backend validation 
//					vFlag = false;
//					oTabIconColor.VendorPartDetails = "Negative";
//					Row.uiFields.Error = "Reject"; //Error setting because of mandatory fields 
//				} else {
//					Row.uiFields.Error = "Default";
//				}
			});
			oModelSSUDigitization.setProperty("/TabIconColor", oTabIconColor);
			return vFlag;
		},
		/*_fnCalculationMarkUp: function (oItem) {

			var vMarkUp = 0;
			var vRmCost = 0;
			if (oItem.Nav_RM.length > 0) {
				vRmCost = (Number(oItem.Nav_RM[0].RmBasePrice) * Number(oItem.Nav_RM[0].RmGrossWt));
			}
			var vSettledPrice = Number(oItem.SettledPrice);
			var vBtOutParts = Number(oItem.BtOutParts);
			var vConvCost = Number(oItem.ConvCost);
			vMarkUp = (vSettledPrice - (vRmCost + vBtOutParts + vConvCost)) / vSettledPrice
			vMarkUp = vMarkUp * 100;
			vMarkUp = (!vMarkUp || vMarkUp == Infinity || vMarkUp == -Infinity) ? 0 : vMarkUp;
			vMarkUp = vMarkUp.toFixed(3);
			return vMarkUp;
		},*/
		//--------- Local Methods End --------------------------

		//---------- Formatter Methods Start --------------------
		attachEditable: function(vEditable,vNotCreateNew){
			return vEditable && vNotCreateNew;
		},
		
		formatterRadioYesNo: function (vValue){
			return vValue === "X" ? 1 :0; //0 is yes 1 is no
		},
		
		formatterPurgrpEdit: function (vEditable, vPurGrp){
			return vEditable && (vPurGrp == "" ? true : false);
		},
		
		PostToSapFieldEditable: function(vEditable, vPostToSAP){
			return vEditable || vPostToSAP ? true : false;
		},
		
		visiblePartEdit: function (vEditable, vSector, vInitiator) {
			if (vEditable && vSector.length > 0 && vInitiator != "") {
				return true;
			} else {
				return false;
			}
		},
		formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
			var sServiceUrl = this.getOwnerComponent().getModel("oDataNewPinfoModel").sServiceUrl;
			return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
		},
		/*formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
		},*/
		formattWFvisible: function (oWFTable) {
			if (oWFTable) {
				return oWFTable.length > 0 ? true : false;
			} else {
				return false;
			}
		},
		formatterPartEdit: function (vEditable, vPlant, vDBExist) {
			return vEditable && (vPlant != "" ? true : false) && !vDBExist;
		},
		/*formatterKeyEdit: function (vEditable, vIsAddNew) {
			return vEditable && vIsAddNew;
		},*/

		formattValidationError: function (vValue) {
			if (typeof vValue == "string") {
				return vValue != "" ? "Error" : "None";
			}
		},
		formatterAttachLoc: function (vTavId, vFxRm, vPartNo) {
			if (vTavId == "VP") {
				vTavId = "Vendor Part";
			} else if (vTavId == "TC") {
				vTavId = "Tool Cost";
			} else if (vTavId == "FR") {
				vTavId = "Forex-RM Content";
			} else if (vTavId == "BR") {
				vTavId = "Business Reduction";
			} else if (vTavId == "SP") {
				vTavId = "Spare Price";
			}
			if (vFxRm == "FX") {
				vFxRm = " > Forex";
			} else if (vFxRm == "RM") {
				vFxRm = " => Rm"
			}
			if (vPartNo != "") {
				vPartNo = " => " + vPartNo;
			}
			return vTavId + vFxRm + vPartNo;
		},
		formatterYearBase: function (vYearBase) {
			if (vYearBase)
				return parseInt(vYearBase);
		},
		formatterYearBaseSOP: function (vYearBase) {
			if (vYearBase)
				return vYearBase == "0" ? true : false;
		},
		formatterVolumeBaseSOP: function (vVolumeBase) {
			if (vVolumeBase)
				return vVolumeBase == "1" ? true : false;
		},

		formattGetModelPlant: function (vSector) {
			if (vSector) {
				vSector = typeof vSector == "string" ? vSector.split(",") : vSector;
				this._getModelPlant(vSector);
				return vSector;
			}
		},
		formatterDisplayPanel: function (vCode, vDesc) {
			if (vDesc)
				return vCode + "  (" + vDesc + ")";
			else
				return vCode;
		},
		formatterTableVisible: function (vValue) {
			return vValue == 0 ? true : false;
		},
		formatterTableVisibleOE: function (vValue) {
			return vValue == "X" ? true : false;
		},
		formattTaxonmoyReq: function (vTaxomoyYN) {
			return vTaxomoyYN == 0 ? true : false;
		},
		formattInitiator: function (vValue) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oF4Approver = [];
			if (oModelSSUDigitization.getProperty("/F4Approver")) {
				oF4Approver = $.grep(oModelSSUDigitization.getProperty("/F4Approver"), function (grepRow) {
					return (grepRow.Cycle == vValue);
				});
			}
			if (oF4Approver.length > 0) {
				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oF4Approver[0].Cycle);
				oModelSSUDigitization.setProperty("/PaperDataSet/Createdby", oF4Approver[0].Initiator);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver1", oF4Approver[0].Appr1);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver2", oF4Approver[0].Appr2);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver3", oF4Approver[0].Appr3);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver4", oF4Approver[0].Appr4);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver5", oF4Approver[0].Appr5);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver6", oF4Approver[0].Appr6);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver7", oF4Approver[0].Appr7);
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver8", oF4Approver[0].Appr8);
			} else {
				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", vValue);
				// oModelSSUDigitization.setProperty("/PaperDataSet/Createdby", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver1", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver2", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver3", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver4", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver5", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver6", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver7", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Approver8", "");
			}
			return vValue;
		},
		//---------- Formatter Methods End ------------

		//--------- Event Methods Start -------------------------
		/*getAttachHeader: function(oGroup) {
			debugger;
			return new sap.m.GroupHeaderListItem({
				title: (oGroup.text ? oGroup.text : "Version") + ": " + oGroup.key,
				upperCase: false
			});
		},*/

		/*onChangeBtOutPartCovCost: function (oEvent) {

			var oController = this;
			oController.onCheckNumberLeng12(oEvent);
			var oModel = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getParent().getBindingContextPath("ModelSSUDigitization");
			var oItem = oModel.getProperty(vSelectedPath);
			var vMarkUp = oController._fnCalculationMarkUp(oItem);
			oModel.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
		},
		onChangeBaseAmotizn: function (oEvent) {
			var oController = this;
			oController.onCheckNumberLeng12(oEvent);
			var oModel = oEvent.getSource().getModel();
			var oItem = oModel.getProperty("/");
			var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.FinalAmortized, oItem.Amortisation, oItem.CurrDenomination);
			oModel.setProperty("/ToolAmortisation", vToolAmortisation);
		},
		onChangeRevAmotizn: function (oEvent) {
			var oController = this;
			oController.onCheckNumberLeng12(oEvent);
			var oModel = oEvent.getSource().getModel();
			var oItem = oModel.getProperty("/");
			var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.RevFinalAmortized, oItem.RevAmortization, oItem.RevDenomination);
			oModel.setProperty("/RevTlAmortization", vToolAmortisation);
		},
		onChangeEdAmotizn: function (oEvent) {
			var oController = this;
			oController.onCheckNumberLeng12(oEvent);
			var oModel = oEvent.getSource().getModel();
			var oItem = oModel.getProperty("/");
			var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.EdFinalAmortized, oItem.EdAmortization, oItem.EdDenomination);
			oModel.setProperty("/ToolAmortization", vToolAmortisation);
		},
		onChangeBaseDenomi: function (oEvent) {
			var oController = this;
			var oModel = oEvent.getSource().getModel();
			var oItem = oModel.getProperty("/");
			var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.FinalAmortized, oItem.Amortisation, oItem.CurrDenomination);
			oModel.setProperty("/ToolAmortisation", vToolAmortisation);
		},
		onChangeRevDenomi: function (oEvent) {
			var oController = this;
			var oModel = oEvent.getSource().getModel();
			var oItem = oModel.getProperty("/");
			var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.RevFinalAmortized, oItem.RevAmortization, oItem.RevDenomination);
			oModel.setProperty("/RevTlAmortization", vToolAmortisation);
		},
		onChangeEdDenomi: function (oEvent) {
			var oController = this;
			var oModel = oEvent.getSource().getModel();
			var oItem = oModel.getProperty("/");
			var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.EdFinalAmortized, oItem.EdAmortization, oItem.EdDenomination);
			oModel.setProperty("/ToolAmortization", vToolAmortisation);
		},*/
		onChangeTab: function (oEvent) {
			this._validationDataFilled();
			/*if (oEvent.getParameter("selectedKey") == "FR") {
				var vErrorDOM = $(".clsEditButton .sapMBtnReject").parents(".sapMPanel").find(".sapMObjStatusText");
				$.each($(".clsValidationErrorTxt"), function (i, row) {
					row.classList.remove("clsValidationErrorTxt");
				});
				$.each(vErrorDOM, function (i, row) {
					row.classList.add("clsValidationErrorTxt");
				});
			}*/
			// $(".clsEditButton .sapMBtnReject").parents(".sapMPanel").find(".sapMObjStatusText").css("color", "#bb0000");
		},
		onChangeDrop: function (oEvent) {
			if (!oEvent.getParameter("itemPressed")) {
				oEvent.getSource().setValue(oEvent.getSource()._sValue);
				// $(".sapMComboBox").find("input").attr("readonly", true);
			}
		},
		/*onYearBase: function (oEvent) {
			var vYearBase = oEvent.getParameter("selectedIndex").toString();
			oEvent.getSource().getModel().setProperty("/YearBase", vYearBase);
			oEvent.getSource().getModel().setProperty("/Sop1doe", "");
			oEvent.getSource().getModel().setProperty("/Sop2doe", "");
			oEvent.getSource().getModel().setProperty("/Sop3doe", "");
			oEvent.getSource().getModel().setProperty("/Sop4doe", "");
			oEvent.getSource().getModel().setProperty("/Sop5doe", "");
		},
		onIndexValFRXChange: function (oEvent) {
			var oController = this;
			if (oEvent.getParameter("selectedItem")) {
				var vForexIndex = oEvent.getParameter("selectedItem").getText();
				oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_ForexIndVal", {
					filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vForexIndex)],
					success: function (oData, oResponse) {
						oController.getView().getModel("ModelSSUDigitization").setProperty("/F4ForexIndVal", oData.results);
						oController.getView().getModel("ModelSSUDigitization").refresh();
						busyDialog.close();
					},
					error: function (oResponse) {
						serviceError(oResponse);
						busyDialog.close();
					}
				});
			}
		},
		onIndexValRMChange: function (oEvent) {
			var oController = this;
			if (oEvent.getParameter("selectedItem")) {
				var vRMIndex = oEvent.getParameter("selectedItem").getText();
				oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_RMIndexVal", {
					filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vRMIndex)],
					success: function (oData, oResponse) {
						oController.getView().getModel("ModelSSUDigitization").setProperty("/F4RMIndexVal", oData.results);
						oController.getView().getModel("ModelSSUDigitization").refresh();
						busyDialog.close();
					},
					error: function (oResponse) {
						serviceError(oResponse);
						busyDialog.close();
					}
				});
			}
		},
		onSelectOERadio: function (oEvent) {
			var vSparePartSameOE =oEvent.getParameter("selectedIndex");
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			if (vSparePartSameOE == 0) {
				var oController = this;
//				var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
				var oItemDetails = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath);
				oItemDetails.SpareCurrency = "";
				oItemDetails.PartCost = "0";
				oItemDetails.Margin = "0";
				oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath, oItemDetails);
			}
			vSparePartSameOE = vSparePartSameOE == 1 ? "X" : "";
			oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/SparePartSameOE", vSparePartSameOE);
		},
		onSelectForexRadio: function (oEvent) {
			var vForexRequired =oEvent.getParameter("selectedIndex");
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			if (vForexRequired == 1) {
				var oController = this;
//				var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
				oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath + "/Nav_Forex", []);
			}
			vForexRequired = vForexRequired == 1 ? "X" : "";
			oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/ForexRequired", vForexRequired);
		},
		onSelectToolCRadio: function (oEvent) {
			var vToolCostRequired =oEvent.getParameter("selectedIndex") == 1 ? "X" : "";
//			vForexRequired = vForexRequired == 1 ? "X" : "";
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/ToolCostRequired", vToolCostRequired);
		},*/
		onAddPartPrice: function () {

			var oController = this;
//			oController._fnGetTaxCodeService();
			var oItemFrag = xmlFragment(oController, "ItemPICopySBU");
			// oItemFrag.getButtons()[0].setVisible(true);
			var oModel = new JSONModel(getItemDetailsObjectPIC());
			oItemFrag.setModel(oModel);
			oItemFrag.isAddNew = true;
			// oController.getView().getModel("ModelSSUDigitization").setProperty("/isAddNew", true);
			oItemFrag.open();
		},
		onOkItemDetail: function (oEvent) {
			var oController = this;
			var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oFragItem = oEvent.getSource().getParent();
			var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
			var vChangedData = oFragItem.getModel().getData();
			var vPriceUnit = parseInt(vChangedData.Priceunit); // Added by AGAWSA-CONT on 01.07.2023
			if (vAllFilled && oFragItem.isAddNew) { // oModelSSUDigitization.getProperty("/isAddNew")
				
				var oFilter = $.grep(oNav_Items, function (grepRow) {
					return ((vChangedData.Plant === grepRow.Plant) && (vChangedData.Vendor === grepRow.Vendor) && (vChangedData.PartNo === grepRow.PartNo));
				});
				if (oFilter.length <= 0) {
//		        	Add start by AGAWSA-CONT on 01.07.2023
		        	if(vPriceUnit > 1){
		            	  Message.warning("Please double-check the 'Price unit' field, which indicates the number of units for which the price is applicable. Note - It is not the Price of Part" , {
		      				actions: [Message.Action.OK, Message.Action.CANCEL],
		      				emphasizedAction: Message.Action.OK,
		      				onClose: function (sAction) {
		      					if(sAction == "OK"){
		      						oController._setDataAfterEditItem(oFragItem);
		      						oFragItem.close();
		      					}
		      				}
		      			});
		              }else{
		              	oController._setDataAfterEditItem(oEvent);
		                  oEvent.getSource().getParent().close();
		              }
//		        	Add end by AGAWSA-CONT on 01.07.2023
//		        	Commented by AGAWSA-CONT on 01.07.2023
//					oController._setDataAfterEditItem(oEvent);
//					oEvent.getSource().getParent().close();
				}
				/*else if (oFilter.length <= 0) {
					var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
					var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
					var vMarkUp = oController._fnCalculationMarkUp(oItem);

					oController._setDataAfterEditItem(oEvent);
					oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
					oEvent.getSource().getParent().close();
				}*/
				else {
					sap.m.MessageToast.show("This Plant,Vendor,Part Number combination is already exist.");
				}
			} else if (vAllFilled) {
//	      	Add start by AGAWSA-CONT on 01.07.2023
		    	  if(vPriceUnit > 1){
		          	  Message.warning("Please double-check the 'Price unit' field, which indicates the number of units for which the price is applicable. Note - It is not the Price of Part" , {
		    				actions: [Message.Action.OK, Message.Action.CANCEL],
		    				emphasizedAction: Message.Action.OK,
		    				onClose: function (sAction) {
		    					if(sAction == "OK"){
		    						oController._setDataAfterEditItem(oFragItem);
		    						oFragItem.close();
		    					}
		    				}
		    			});
		            }else{
		            	oController._setDataAfterEditItem(oEvent);
		                oEvent.getSource().getParent().close();
		            }
//		      	Add end by AGAWSA-CONT on 01.07.2023
//				var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
//				var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
//				var vMarkUp = oController._fnCalculationMarkUp(oItem);

//				oController._setDataAfterEditItem(oEvent);
////				oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
//				oEvent.getSource().getParent().close();
			}
		},
		onAddNwItemRow: function (oEvent) { //add+ok error
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vChangedData = oEvent.getSource().getParent().getModel().getData();
			var vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
			oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
			oModelSSUDigitization.setProperty("/SelectedPath", "");
		},
		onEdit: function () {
			var oController = this;
//			oController._fnLockUnlockService("X");
			oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", true);
			oController.getView().getModel("ModelSSUDigitization").setProperty("/BEValidation", false);
		},
		onSave: function () {

			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			Message.confirm("This is confirmation for save data.", {
				title: "Save confirmation",
				onClose: function (oAction) {
					if (oAction == "OK") {
						var oPaperData = oController._fnDataBeforeSave();
						if(oPaperData.Nav_Items && oPaperData.Nav_Items.length>500){
							sap.m.MessageToast.show("More than 500 items is not allowed.");
							return;
						}
						oPaperData.Action = "1";
						busyDialog.open();
						oController.getOwnerComponent().getModel(
							"oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
							success: function (oData, oResponse) {
								// oController._fnAfterGettingBEData(oData);//use after getting updated BE data
								/*$.each(oPaperData.Nav_Items, function (i, Row) { //need to remove after getting updated BE data
									Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
									Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
									Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
								});*/
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
											oModelSSUDigitization.setProperty("/NotCreateNew", true);
											oModelSSUDigitization.setProperty("/EditableFlag", false);
											oController._fnAfterGettingBEData(oData); //need to remove after getting updated BE data
										}
									});
								}else{
									oController._fnAfterGettingBEData(oPaperData);
								}
								
							},
							error: function (oResponse) {
								/*$.each(oPaperData.Nav_Items, function (i, Row) {
									Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
									Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
									Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
								});*/
								oController._fnAfterGettingBEData(oPaperData);
								serviceError(oResponse);
							}
						});
					}
				}
			});
			// }
		},
		onBEValidate: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
			if (oModelSSUDigitization.getProperty("/EditableFlag")) {
				oController.onSave();
			}
			oController._validationMass(oNav_Items);
		},
		onSubmit: function () {

			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vValiDataField = oController._validationDataFilled();
			
			if(!oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo")){
				Message.error("Save the Paper before Submit.", {
					title: "Information"
				});
				return;
			}

			if (vValiDataField && oModelSSUDigitization.getProperty("/BEValidation")) {
				var oDialog = new sap.m.Dialog({
					title: 'Comments',
					content: new sap.m.TextArea({
						value: "",
						rows: 3,
						cols: 50,
						maxLength:100,
						showExceededText:true
					}),
					endButton: new sap.m.Button({
						text: 'Cancel',
						press: function (oEvent) {
							oDialog.close();
						}
					}),
					beginButton: new sap.m.Button({
						text: 'OK',
						press: function (oEvent) {
							var oPaperData = oController._fnDataBeforeSave();
							if(oPaperData.Nav_Items && oPaperData.Nav_Items.length>500){
								sap.m.MessageToast.show("More than 500 items is not allowed.");
								return;
							}
							oPaperData.Action = "2";
							oPaperData.UsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
							busyDialog.open();
							oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
								success: function (oData, oResponse) {
									oDialog.close();
									var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
									if (vMsgReturn.Title == "Error") {
										sap.m.MessageBox.error(vMsgReturn.Message, {
											title: vMsgReturn.Title
										});
										oController._fnAfterGettingBEData(oPaperData);
										/*$.each(oPaperData.Nav_Items, function (i, Row) {
											Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
											Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
											Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
										});*/
									} else if (vMsgReturn.Title == "Sucess") {
										sap.m.MessageBox.success(vMsgReturn.Message, {
											title: vMsgReturn.Title,
											onClose: function () {
												navParentBack();
												/*var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
												oRouter.navTo("Home");
												if (oRouter.getView("com.mahindra.ZSSU.view.Home").getController())
													oRouter.getView("com.mahindra.ZSSU.view.Home").getController()._fnGetMaster();*/
											}
										});
									}else {
										oController._fnAfterGettingBEData(oPaperData);
									}
									// oModelSSUDigitization.setProperty("/EditableFlag", false);
								},
								error: function (oResponse) {
									/*$.each(oPaperData.Nav_Items, function (i, Row) {
										Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
										Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
										Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
									});*/
									oController._fnAfterGettingBEData(oPaperData);
									serviceError(oResponse);
								}
							});
						}
					})
				});
				oDialog.open();
			} else {
				oModelSSUDigitization.setProperty("/EditableFlag", true);
//				oController._fnLockUnlockService("X");
				Message.error("fill all the mandatory fields", {
					title: "Fill all fields"
				});
			}
		},
		onPrintPreview: function () {
			var oController = this;
			var oPdfViewer = new sap.m.PDFViewer();
			var vNpiNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/NpiNo");
			var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF(NpiNo='" + vNpiNo + "',PaperCode='"+vPaperCode+"')/$value?sap-client=100");
			oPdfViewer.setTitle("SSU Price Paper");
			oPdfViewer.open();
		},
		onSettingPartDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			columnsSetting(oController, vColumnListPath);
		},
		/*onSettingBRDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/BusinessReduction";
			columnsSetting(oController, vColumnListPath);
		},
		onSettingToolCost: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/ToolCost";
			columnsSetting(oController, vColumnListPath);
		},
		onEditDispForex: function (oEvent) {
			var oController = this;
			var oForexFrag = xmlFragment(oController, "Forex");
			oForexFrag.setModel(oController._setEditFragmentModel(oEvent));
			oController._fnLoadFXIndexVal(oForexFrag.getModel().getProperty("/ForexIndex"));
			oForexFrag.open();
		},
		onPressFXDelete: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			Message.confirm("Are you sure you want to delete this.", {
				title: "Confirm Delete",
				onClose: function (oAction) {
					if (oAction == "OK") {
						var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
						var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
						if (oDeletedData.Posnr) {
							$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
								if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
									Row.Delete = "X";
							});
							oDeletedData.Delete = "X";
							var vSetDeltPath = vSelectedPath.split("/");
							vSetDeltPath.reverse().splice(0, 2);
							vSetDeltPath = vSetDeltPath.reverse().join("/");
							var oDeletedForex = oModelSSUDigitization.getProperty(vSetDeltPath + "/DeletedForex") ? oModelSSUDigitization.getProperty(
								vSetDeltPath + "/DeletedForex") : [];
							oDeletedForex.push(oDeletedData);
							oModelSSUDigitization.setProperty(vSetDeltPath + "/DeletedForex", oDeletedForex);
						}
						var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
						oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
						oModelSSUDigitization.refresh();
					}
				}
			});

		},
		onPressRMDelete: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			Message.confirm("Are you sure you want to delete this.", {
				title: "Confirm Delete",
				onClose: function (oAction) {
					if (oAction == "OK") {
						var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
						var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
						if (oDeletedData.Posnr) {
							$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
								if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
									Row.Delete = "X";
							});
							oDeletedData.Delete = "X";
							var vSetDeltPath = vSelectedPath.split("/");
							vSetDeltPath.reverse().splice(0, 2);
							vSetDeltPath = vSetDeltPath.reverse().join("/");
							var oDeletedRM = oModelSSUDigitization.getProperty(vSetDeltPath + "/DeletedRM") ? oModelSSUDigitization.getProperty(
								vSetDeltPath +
								"/DeletedRM") : [];
							oDeletedRM.push(oDeletedData);
							oModelSSUDigitization.setProperty(vSetDeltPath + "/DeletedRM", oDeletedRM);
						}
						var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
						oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
						oModelSSUDigitization.refresh();
					}
				}
			});

		},
		onAddFRX: function (oEvent) {

			var oController = this;
			var oForexFrag = xmlFragment(oController, "Forex");
			// oForexFrag.getButtons()[0].setVisible(true);
			oForexFrag.setModel(new JSONModel(getForexObject()));
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedParentPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			var vSelectedPath = vSelectedParentPath + "/Nav_Forex/" + oModelSSUDigitization.getProperty(vSelectedParentPath + "/Nav_Forex").length
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			oForexFrag.open();
		},
		onAddFRXContent: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vChangedData = oEvent.getSource().getParent().getModel().getData();
			var vSelectedParentPath = oModelSSUDigitization.getProperty("/SelectedPath");
			oModelSSUDigitization.setProperty(vSelectedParentPath, vChangedData);
			var vSelectedPath = vSelectedParentPath.split("/");
			vSelectedPath.pop();
			vSelectedPath.push((oModelSSUDigitization.getProperty(vSelectedPath.join("/")).length).toString());
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath.join("/"));
		},
		onForexOK: function (oEvent) {
			var oController = this;
			var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
			if (vAllFilled) {
				oController._setDataAfterEditItem(oEvent);
				oEvent.getSource().getParent().close();
			}
		},
		onForExContent: function (oEvent) {
			var oController = this;
			var oModel = oEvent.getSource().getModel();

			if (oEvent.getParameter("selectedItem")) {
				var vForExContent = oEvent.getParameter("selectedItem").getText();
				oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_IndexHelp(Commodity='" + vForExContent + "')", {
					success: function (oData, oResponse) {
						if (oModel.getData().hasOwnProperty("ForexCur")) {
							oController._fnLoadFXIndexVal(oData.IndexCyc);

							oModel.setProperty("/ForexIndex", oData.IndexCyc);
							oModel.setProperty("/ForexLandFact", oData.ConvFact);
						} else if (oModel.getData().hasOwnProperty("RmGrade")) {
							oController._fnLoadIndexRMVal(oData.IndexCyc);

							oModel.setProperty("/RmIndexCycle", oData.IndexCyc);
							oModel.setProperty("/RmLandingFact", oData.ConvFact);
						}
					},
					error: function (oResponse) {
						serviceError(oResponse);
					}
				});
			}

		},
		onEditDispRM: function (oEvent) {
			var oController = this;
			var oRMFrag = xmlFragment(oController, "RMDetails");
			oRMFrag.setModel(oController._setEditFragmentModel(oEvent));
			oController._fnLoadIndexRMVal(oRMFrag.getModel().getProperty("/RmIndexCycle"));
			oRMFrag.open();
		},
		onAddRM: function (oEvent) {
			var oController = this;
			var oRMFrag = xmlFragment(oController, "RMDetails");
			// oRMFrag.getButtons()[0].setVisible(true);
			oRMFrag.setModel(new JSONModel(getRMObject()));
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedParentPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			var vSelectedPath = vSelectedParentPath + "/Nav_RM/" + oModelSSUDigitization.getProperty(vSelectedParentPath + "/Nav_RM").length
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			oRMFrag.open();
		},
		onAddRMContent: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vChangedData = oEvent.getSource().getParent().getModel().getData();
			var vSelectedParentPath = oModelSSUDigitization.getProperty("/SelectedPath");
			oModelSSUDigitization.setProperty(vSelectedParentPath, vChangedData);
			var vSelectedPath = vSelectedParentPath.split("/");
			vSelectedPath.pop();
			vSelectedPath.push((oModelSSUDigitization.getProperty(vSelectedPath.join("/")).length).toString());
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath.join("/"));
		},
		onRmOK: function (oEvent) {
			var oController = this;
			var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
			if (vAllFilled) {

				var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
				var vSelectedParentPath = oModelSSUDigitization.getProperty("/SelectedPath");
				var vSelectedPath = vSelectedParentPath.split("/");
				vSelectedPath.pop();
				vSelectedPath.pop();
				vSelectedPath = vSelectedPath.join("/");
				var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
				var vMarkUp = oController._fnCalculationMarkUp(oItem);

				oController._setDataAfterEditItem(oEvent);
				oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
				oEvent.getSource().getParent().close();
			}
		},
		onFXAttachment: function (oEvent) {
			var oController = this;
			var oAttachFrag = xmlFragment(oController, "Attachment");
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath("ModelSSUDigitization");
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			var vSectedData = oModelSSUDigitization.getProperty(vSelectedPath);
			var vSelectedTab = oModelSSUDigitization.getProperty("/SelectedTab");
			var vFilters = [
				new sap.ui.model.Filter("TabId", sap.ui.model.FilterOperator.EQ, vSelectedTab),
				new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, vSectedData.PartNo),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSectedData.Plant),
				new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor),
				new sap.ui.model.Filter("FrxRmStatus", sap.ui.model.FilterOperator.EQ, "FX"),
				new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
			];
			oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
			oAttachFrag.open();
		},
		onRMAttachment: function (oEvent) {
			var oController = this;
			var oAttachFrag = xmlFragment(oController, "Attachment");
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath("ModelSSUDigitization");
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			var vSectedData = oModelSSUDigitization.getProperty(vSelectedPath);
			var vSelectedTab = oModelSSUDigitization.getProperty("/SelectedTab");
			var vFilters = [
				new sap.ui.model.Filter("TabId", sap.ui.model.FilterOperator.EQ, vSelectedTab),
				new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, vSectedData.PartNo),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSectedData.Plant),
				new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor),
				new sap.ui.model.Filter("FrxRmStatus", sap.ui.model.FilterOperator.EQ, "RM"),
				new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
			];
			oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
			oAttachFrag.open();
		},*/
		
		/*onExpandToolCost: function (oEvent) {
			var oController = this;
			var oTableToolcost = sap.ui.getCore().byId(oEvent.getSource().getContent()[1].getId());

			if (oEvent.getParameter("expand") && !oTableToolcost.getBindingInfo("columns")) {
				var vColumnListPath = "ModelSSUDigitization>/ToolCost";
				var vTableBindingPath = "ModelSSUDigitization";
				var oAction = new sap.m.HBox({
					justifyContent: "Center",
					items: [
						new sap.m.Button({
							tooltip: "view & add attachment",
							icon: "{ModelDefaultDataSet>/Icon/attachmentIcon}",
							press: function (oEvent) {
								oController.onAttachment(oEvent);
							}
						}),
						new sap.m.Button({
							icon: "{ModelDefaultDataSet>/Icon/editIcon}",
							tooltip: "Edit",
							type: "{ModelSSUDigitization>ErrorTC}",
							visible: "{ModelSSUDigitization>/EditableFlag}",
							press: function (oEvent) {
								var oToolCostFrag = xmlFragment(oController, "ToolCost");
								oToolCostFrag.setModel(oController._setEditFragmentModel(oEvent));
								oToolCostFrag.open();
							}
						}),
						new sap.m.Button({
							icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
							tooltip: "Display",
							visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
							press: function (oEvent) {
								var oToolCostFrag = xmlFragment(oController, "ToolCost");
								oToolCostFrag.setModel(oController._setDisplayFragmentModel(oEvent));
								oToolCostFrag.open();
							}

						}),
						new sap.m.Button({
							icon: "{ModelDefaultDataSet>/Icon/clearIcon}",
							tooltip: "Clear",
							type: "Reject",
							visible: {
								parts: [
									'ModelSSUDigitization>/EditableFlag',
									'ModelSSUDigitization>ToolCostRequired'
								],
								formatter: function (vEditable, vToolReq) {
									return vEditable && (vToolReq == "X" ? true : false);
								}
							},
							press: function (oEvent) {
								var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
								oController._fnClearToolData(vSelectedPath);
							}
						})
					]
				});
				createDynamicMTable(oController, oTableToolcost, vColumnListPath, vTableBindingPath, oAction);
			}

		},
		onToolOk: function (oEvent) {
			var oController = this;
			var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
			if (vAllFilled) {
				oController._setDataAfterEditItem(oEvent);
				oEvent.getSource().getParent().close();
			}
		},
		onExpandBR: function (oEvent) {
			var oController = this;
			var oTableBRDetails = sap.ui.getCore().byId(oEvent.getSource().getContent()[0].getId());
			if (oEvent.getParameter("expand") && !oTableBRDetails.getBindingInfo("columns")) {
				var vColumnListPath = "ModelSSUDigitization>/BusinessReduction";
				var vTableBindingPath = "ModelSSUDigitization";

				var oActionBR = new sap.m.HBox({
					justifyContent: "Center",
					items: [
						new sap.m.Button({
							tooltip: "view & add attachment",
							icon: "{ModelDefaultDataSet>/Icon/attachmentIcon}",
							press: function (oEvent) {
								oController.onAttachment(oEvent);
							}
						}),
						new sap.m.Button({
							icon: "{ModelDefaultDataSet>/Icon/editIcon}",
							tooltip: "Edit",
							type: "{ModelSSUDigitization>ErrorBR}",
							visible: "{ModelSSUDigitization>/EditableFlag}",
							press: function (oEvent) {
								var oBRFrag = xmlFragment(oController, "BusinessReduction");
								oBRFrag.setModel(oController._setEditFragmentModel(oEvent));
								oBRFrag.open();
							}
						}),
						new sap.m.Button({
							icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
							tooltip: "Display",
							visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
							press: function (oEvent) {
								var oBRFrag = xmlFragment(oController, "BusinessReduction");
								oBRFrag.setModel(oController._setDisplayFragmentModel(oEvent));
								oBRFrag.open();
							}
						})
					]
				});
				createDynamicMTable(oController, oTableBRDetails, vColumnListPath, vTableBindingPath, oActionBR);
			}
		},
		onBusiReduOk: function (oEvent) {
			var oController = this;
			var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
			if (vAllFilled) {
				oController._setDataAfterEditItem(oEvent);
				oEvent.getSource().getParent().close();
			}
		},
		onTaxonamyValHelp: function (oEvent) {
			var oController = this;
			var oTaxonomyFrag = xmlFragment(oController, "Taxonomy");
			oTaxonomyFrag.oParentController = oEvent.getSource();
			var taxJSON = new JSONModel();
			busyDialog.open();
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_Taxonomy", {
				success: function (oData, oResponse) {
					busyDialog.close();
					var oDataTemp = {
						"SelectedLevel": 1,
						"NextVisible": true,
						"TableData": oData.results
					};
					taxJSON.setData(oDataTemp);
					oTaxonomyFrag.setModel(taxJSON, "TaxonamyModel");
					oTaxonomyFrag.open();
				},
				error: function (oResponse) {
					serviceError(oResponse);
					busyDialog.close();
				}
			});
			oTaxonomyFrag.getAggregation("content")[0].attachBrowserEvent("dblclick", function () {
				// var oController = this;
				var vSelectedPath = this.getSelectedContextPaths()[0];
				if (this.getModel("TaxonamyModel").getProperty(vSelectedPath + "/Level") == 5)
					oController.onChooseTaxonamy(this);
				else
					oController.onNextTaxonamy(this);
			});
		},
		onNextTaxonamy: function (oEvent) {
			var oController = this;
			var oDialog;
			if (oEvent.getId() == "press") {
				oDialog = oEvent.getSource().getParent();
				var vSelectedPath = oDialog.getContent()[0].getSelectedContextPaths()[0];
			} else {
				oDialog = oEvent.getParent();
				var vSelectedPath = oEvent.getSelectedContextPaths()[0];
			}

			var oTaxonamyModel = oDialog.getModel("TaxonamyModel");
			var oHeaderToolBar = oDialog.getContent()[0].getHeaderToolbar();
			var vSelectedLevel = oTaxonamyModel.getProperty("/SelectedLevel");

			if (oTaxonamyModel.getProperty(vSelectedPath + "/Level") && oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy")) {
				var oDetailTaxonomy = {
					"Level": oTaxonamyModel.getProperty(vSelectedPath + "/Level"),
					"Taxonomy": oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy")
				};

				oHeaderToolBar.addContent(new sap.m.Link({
					"text": oTaxonamyModel.getProperty(vSelectedPath + "/TaxDesc"),
					"wrapping": true,
					press: function (e) {
						var oDetailTaxonomy = e.getSource().data();
						for (var i = 6; i > ((Number(oDetailTaxonomy.Level)) * 2) - 1; i--) {
							e.oSource.getParent().removeContent(i);
						}
						oController._nextTaxonomyService(oDetailTaxonomy, oTaxonamyModel);
						oTaxonamyModel.setProperty("/NextVisible", true);
					}
				}).data(oDetailTaxonomy));
				oController._nextTaxonomyService(oDetailTaxonomy, oTaxonamyModel);
				if (oTaxonamyModel.getProperty(vSelectedPath + "/Level") == 4) {
					oTaxonamyModel.setProperty("/NextVisible", false);
				} else {
					oHeaderToolBar.addContent(new sap.m.Label({
						"text": ">",
						"design": "Bold"
					}));
				}
			} else {
				sap.m.MessageToast.show("Select one from list");
			}

			// vSelectedLevel++;
			// oTaxonamyModel.setProperty("/SelectedLevel", vSelectedLevel);

		},
		_nextTaxonomyService: function (oDetailTaxonomy, oTaxonamyModel) {
			var oController = this;
			var filters = [];
			filters.push(new sap.ui.model.Filter("Level", sap.ui.model.FilterOperator.EQ, oDetailTaxonomy.Level));
			filters.push(new sap.ui.model.Filter("Taxonomy", sap.ui.model.FilterOperator.EQ, oDetailTaxonomy.Taxonomy));
			busyDialog.open();
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_TaxLevel", {
				filters: filters,
				success: function (oData, oResponse) {
					oTaxonamyModel.setProperty("/TableData", oData.results);
					busyDialog.close();
				},
				error: function (oResponse) {
					serviceError(oResponse);
					busyDialog.close();
				}
			});
		},
		onChooseTaxonamy: function (oEvent) {
			var oController = this;
			var oDialog;
			if (oEvent.getId() == "press") {
				oDialog = oEvent.getSource().getParent();
				var vSelectedPath = oDialog.getContent()[0].getSelectedContextPaths()[0];
			} else {
				oDialog = oEvent.getParent();
				var vSelectedPath = oEvent.getSelectedContextPaths()[0];
			}
			var oTaxonamyModel = oDialog.getModel("TaxonamyModel");
			if (oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy")) {
				oDialog.oParentController.setValue(oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy"));
				oDialog.close();
			} else {
				sap.m.MessageToast.show("Select one from list");
			}

		},
		onTaxonomySetting: function () {
			var oController = this;
			var oTaxonomySettingFrag = xmlFragment(oController, "TaxonomySetting");

			oTaxonomySettingFrag.open();
		},
		onTaxonomySettingOK: function () {
			// debugger;
		},*/
		onDownldTempPartDet: function () {
//			var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
//			window.open("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF(NpiNo='',PaperCode='"+vPaperCode+"')/$value");
           // Added by REDDRA-CONT on 16-12-2021
            var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			window.open(sServiceUrl+"/ES_Template(PaperCode='"+vPaperCode+"')/$value");
		},
		onMassUpload: function (oEvent) {
			var oController = this;
			try {
				if (oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Nav_Items").length >= 50) {
					sap.m.MessageToast.show("Mass upload not allowed, because more than 50 items already added.");
					oEvent.getSource().clear();
					return;
				}
				var file = oEvent.getParameter("files")[0]; // oEvent.oSource.oFileUpload.files["0"];
				if (file && window.FileReader) {
					var reader = new FileReader();

					reader.onload = function (e) {
						var wb = XLSX.read(e.target.result, {
							type: 'binary'
						});
						var vExcelDataArray = XLSX.utils.sheet_to_row_object_array(wb.Sheets[wb.SheetNames[0]]);
						if (vExcelDataArray.length > 1 && vExcelDataArray.length <= 51) {
							vExcelDataArray.splice(0, 1);
							oController._fnMassDataSet(vExcelDataArray);
						} else if (vExcelDataArray.length > 51) {
							sap.m.MessageToast.show("Uploaded excel sheet data exceed. Maximum 50 rows.");
						} else {
							sap.m.MessageToast.show("Unable to find any data in uploaded excel sheet....");
						}
					};
					reader.readAsBinaryString(file);
				}
			} catch (oException) {
				sap.m.MessageToast.show(oException.message);
			}
			oEvent.getSource().clear();
		},
		 onPinfoCat: function(oEvent){
				var oModel = oEvent.getSource().getModel();
				oModel.setProperty("/ExtPrice", oEvent.getSource().getSelectedItem().getAdditionalText());
				oModel.setProperty("/SettledPrice", "0");
				oModel.setProperty("/DeltaPrice", "0");
				oModel.setProperty("/ValidFrom", null);
				
				var oController = this;
				var oParentModel = oEvent.getSource().getBindingContext().getModel();
				var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
				var vSelectedValue = oEvent.getParameter("selectedItem").getKey();

				busyDialog.open();
				oDataNewPinfoModel.read("/ES_ValidFrom", {
					filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")),
						new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Vendor")),
						new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")),
						new sap.ui.model.Filter("Pinforcat", sap.ui.model.FilterOperator.EQ, vSelectedValue)],
					success: function (oData, oResponse) {
						busyDialog.close();
						if (oData.results.length > 0 ) {
							oParentModel.setProperty("/ValidFrom", oData.results[0].ValidFrom);
						}

					},
					error: function (oResponse) {
						serviceError(oResponse);
					}
				});
		},

		onErrMsgValueHelp: function (e) {
			var oController = this;
			var oValueHelp = parentXmlFragment(oController, "ErrorMsgPopOver");
			oValueHelp.toggle(e.getSource());			
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
			var ErrorData = oModelSSUDigitization.getProperty(selectedPath+"/uiFields/MassValidation");
			var oValidationError = [];
//		    Add start by AGAWSA-CONT on 01.07.2023
		      if (ErrorData.PriceunitFlag != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.PriceunitFlag,
		    		  "BEErrorType": "Warning",
		    		  "Priority": 1
		    	  });
		      };
		      if (ErrorData.PlantFlag != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.PlantFlag,
		    		  "BEErrorType": "Error",
		    		  "Priority": 0
		    	  });
		      }else{
		    	  oValidationError.push({
		    		  "BEError": "Plant " + ErrorData.Plant + " validated successfully",
		    		  "BEErrorType": "Success",
		    		  "Priority": 2
		    	  });
		      };
		      if (ErrorData.PartNoFlag != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.PartNoFlag,
		    		  "BEErrorType": "Error",
		    		  "Priority": 0
		    	  });
		      }else{
		    	  oValidationError.push({
		    		  "BEError": "Part No: " + ErrorData.PartNo + " validated successfully",
		    		  "BEErrorType": "Success",
		    		  "Priority": 2
		    	  });
		      };
		      if (ErrorData.VendorFlag != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.VendorFlag,
		    		  "BEErrorType": "Error",
		    		  "Priority": 0
		    	  });
		      }else{
		    	  oValidationError.push({
		    		  "BEError": "Vendor " + ErrorData.Vendor + " validated successfully",
		    		  "BEErrorType": "Success",
		    		  "Priority": 2
		    	  });
		      };
		      if (ErrorData.TaxcodeFalg != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.TaxcodeFalg,
		    		  "BEErrorType": "Error",
		    		  "Priority": 0
		    	  });
		      }else{
		    	  oValidationError.push({
		    		  "BEError": "Taxcode " + ErrorData.Taxcode + " validated successfully",
		    		  "BEErrorType": "Success",
		    		  "Priority": 2
		    	  });
		      };
		      if (ErrorData.TaxonomyFlag != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.TaxonomyFlag,
		    		  "BEErrorType": "Error",
		    		  "Priority": 0
		    	  });
		      }else{
		    	  oValidationError.push({
		    		  "BEError": "Taxonomy " + ErrorData.Taxonomy + " validated successfully",
		    		  "BEErrorType": "Success",
		    		  "Priority": 2
		    	  });
		      };
		      if (ErrorData.QuotedPriceFlag != "") {
		    	  oValidationError.push({
		    		  "BEError": ErrorData.QuotedPriceFlag,
		    		  "BEErrorType": "Warning",
		    		  "Priority": 1
		    	  });
		      };
		      oValidationError.sort(function(a,b){
		    	  if(a.Priority < b.Priority){
		    		  return -1;
		    	  }
		    	  if(a.Priority > b.Priority){
		    		  return 1;
		    	  }
		    	  return 0;
		      })
//		    Add end by AGAWSA-CONT on 01.07.2023
//			if(ErrorData && ErrorData.hasOwnProperty("ItemNo")){
//				if(ErrorData.PartNoFlag != ""){
//					oValidationError.push({"BEError" :ErrorData.PartNoFlag});
//				}
//				if(ErrorData.VendorFlag != ""){
//					oValidationError.push({"BEError" : ErrorData.VendorFlag});
//				}
//				if(ErrorData.PlantFlag != ""){
//					oValidationError.push({"BEError" : ErrorData.PlantFlag});
//				}
//				if(ErrorData.RvPlantFlag != ""){
//					oValidationError.push({"BEError" :ErrorData.RvPlantFlag});
//				}
//				if(ErrorData.RvVendorFlag != ""){
//					oValidationError.push({"BEError" :ErrorData.RvVendorFlag});
//				}
//				if(ErrorData.TaxcodeFalg != ""){
//					oValidationError.push({"BEError" :ErrorData.TaxcodeFalg});
//				}
//			}			
			oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
		},

		/*onRMErrMsgValueHelp: function (e) {
			var oController = this;
			var oValueHelp = xmlFragment(oController, "ErrorMsgPopOver");
			oValueHelp.toggle(e.getSource());

			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
			var val = selectedPath.split("/")[3];
			var ErrorData1 = oModelSSUDigitization.getProperty("/Validation").Nav_ItemsX[val];
			var val2 = selectedPath.split("/")[5];
			var oNav = selectedPath.split("/")[4] + "X";
			var oValidationError = [];
			if (oNav == "Nav_RMX") {
				var ErrorData = ErrorData1.Nav_RMX[val2];
				if (ErrorData.RmGradeFlag != "") {
					oValidationError.push({
						"BEError": ErrorData.RmGradeFlag
					});
				};
				if (ErrorData.RmIndexCycleFlag != "") {
					oValidationError.push({
						"BEError": ErrorData.RmIndexCycleFlag
					});
				};
				if (ErrorData.RmLandingFactFlag != "") {
					oValidationError.push({
						"BEError": ErrorData.RmLandingFactFlag
					});
				};
			} else if (oNav == "Nav_ForexX") {
				var ErrorData = ErrorData1.Nav_ForexX[val2];
				if (ErrorData.ForexCurFlag != "") {
					oValidationError.push({
						"BEError": ErrorData.ForexCurFlag
					});
				};
				if (ErrorData.ForexIndexFlag != "") {
					oValidationError.push({
						"BEError": ErrorData.ForexIndexFlag
					});
				};
				if (ErrorData.ForexLandFactFlag != "") {
					oValidationError.push({
						"BEError": ErrorData.ForexLandFactFlag
					});
				};
			}

			oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
		},*/

		onSectorFinish: function (oEvent) {
			this._getModelPlant(oEvent.getSource().getSelectedKeys());
		},
		oModelSelection: function (oEvent) {
			var oSelectedKeys = oEvent.getSource().getSelectedKeys();
			if(oSelectedKeys.toString().length > 100 ) {
				oSelectedKeys.splice(oSelectedKeys.indexOf(oEvent.getParameter("changedItem").getKey()),1);
				oEvent.getSource().setSelectedKeys(oSelectedKeys);
				sap.m.MessageToast.show("Reached maximum selection");
			}
			/*if (oEvent.getSource().getSelectedKeys().length > 0) {
				var oController = this;
				var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
				oModelSSUDigitization.setProperty("/PaperDataSet/Model", oEvent.getSource().getSelectedKeys());
			}*/
		},
		oModelSelection: function () {
			var oController = this;
			var oValueHelp = parentXmlFragment(oController, "ModelDialog");
			oValueHelp.open();
		},
		onPartValueHelp: function (oEvent) {
			var oController = this;
			var oValueHelp = parentXmlFragment(oController, "ValueHelp");
			oValueHelp.setTitle("Part Number");
			var template = new sap.m.StandardListItem({
				title: "{PartNo}",
				description: "{PartDesc}"
			});
			oValueHelp.bindAggregation("items", "/", template);
			oValueHelp.setModel(new JSONModel());
			oValueHelp.parentModel = oEvent.getSource().getBindingContext().getModel();
			oValueHelp.open();
		},
		onExVendorValHelp: function (e) {
			var oController = this;
			var oVendor = parentXmlFragment(oController, "ValueHelp");
			oVendor.setTitle("Ex Vendor Search");
			var template = new sap.m.StandardListItem({
				title: "{VendName}",
				description: "{VendCode}",
				info: "{VendLoc}"
			});
			oVendor.bindAggregation("items", "/", template);
			oVendor.setModel(new JSONModel());
			oVendor.parentModel = e.getSource().getBindingContext().getModel();
			oVendor.open();
		},
		onVendorValHelp: function (e) {
			var oController = this;
			var oVendor = parentXmlFragment(oController, "ValueHelp");
			oVendor.setTitle("Vendor Search");
			var template = new sap.m.StandardListItem({
				title: "{VendName}",
				description: "{VendCode}",
				info: "{VendLoc}"
			});
			oVendor.bindAggregation("items", "/", template);
			oVendor.setModel(new JSONModel());
			oVendor.parentModel = e.getSource().getBindingContext().getModel();
			oVendor.open();
		},
		onPurcValueHelp: function (e) {
			var oController = this;
			var oValueHelp = parentXmlFragment(oController, "ValueHelp");
			oValueHelp.setTitle("Purchase Group");
			var template = new sap.m.StandardListItem({
				title: "{PurcGroupDesc}",
				description: "{PurcGroup}"
			});
			oValueHelp.bindAggregation("items", "/", template);
			oValueHelp.parentModel = e.getSource().getBindingContext().getModel();
			oValueHelp.setBusy(true);
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_PurcGroup", {
				success: function (oData, oResponse) {
					oValueHelp.setModel(new JSONModel(oData.results));
					oValueHelp.setBusy(false);
				},
				error: function (oResponse) {
					oValueHelp.setModel(new JSONModel());
					oValueHelp.setBusy(false);
				}
			});
			oValueHelp.open();
		},
		handleClose: function (e) {
			var oSelectedItem = e.getParameter("selectedItem");
			var oController = this;
			if (oSelectedItem) {
				var oSelectedData = e.getSource().getModel().getProperty(oSelectedItem.getBindingContextPath());
				var oParentModel = e.getSource().parentModel;
				if (e.getSource().getTitle() == "Part Number") {
					oParentModel.setProperty("/PartNo", oSelectedData.PartNo);
					oParentModel.setProperty("/PartDesc", oSelectedData.PartDesc);
					oParentModel.setProperty("/Purgrp", oSelectedData.PurchGroup);
					oParentModel.setProperty("/Taxonomy", oSelectedData.Taxonomy);
//					oParentModel.setProperty("/NetWtUnit", oSelectedData.NetWtUnit);
					
					oParentModel.setProperty("/Vendor", "");
					oParentModel.setProperty("/RvVendor", "");
					oParentModel.setProperty("/RvVName", "");
					oParentModel.setProperty("/RvVLocation", "");
					oParentModel.setProperty("/Currency", "");
					oParentModel.setProperty("/ExtPrice", "");
					oParentModel.setProperty("/PirNo", "");
					oParentModel.setProperty("/Pinforcat", "");
					oParentModel.setProperty("/PinfoCatText", "");
					
					oParentModel.setProperty("/CondType", "");
					oParentModel.setProperty("/CondTypText", "");
					oParentModel.setProperty("/CondPrcnt", "");
					oParentModel.setProperty("/CondUnit", "");

				}
				if (e.getSource().getTitle() == "Ex Vendor Search") {
					/*oParentModel.setProperty("/ExtPrice", oSelectedData.ExtPrice);
					oParentModel.setProperty("/Pinforcat", oSelectedData.Pinforcat);
					oParentModel.setProperty("/PinfoCatText", oSelectedData.PinfoCatText);*/
					
					oController.getView().getModel("ModelSSUDigitization").setProperty("/F4PinfoCategory", [oSelectedData]);
					
					oParentModel.setProperty("/Vendor", oSelectedData.VendCode);
					oParentModel.setProperty("/VName", oSelectedData.VendName);
//					oParentModel.setProperty("/RvVendor", oSelectedData.VendCode);
					oParentModel.setProperty("/VLocation", oSelectedData.VendLoc);
//					oParentModel.setProperty("/Currency", oSelectedData.CurrCode);
					oParentModel.setProperty("/PirNo", oSelectedData.PirNo);
				}
				if (e.getSource().getTitle() == "Vendor Search") {
					oParentModel.setProperty("/Vendor", oSelectedData.VendCode);
					oParentModel.setProperty("/RvVName", oSelectedData.VendName);
					oParentModel.setProperty("/RvVendor", oSelectedData.VendCode);
					oParentModel.setProperty("/RvVLocation", oSelectedData.VendLoc);
					oParentModel.setProperty("/Currency", oSelectedData.CurrCode);
					
					oParentModel.setProperty("/CondType", oSelectedData.CondType);
					oParentModel.setProperty("/CondTypText", oSelectedData.CondTypText);
					oParentModel.setProperty("/CondPrcnt", oSelectedData.CondPrcnt);
					oParentModel.setProperty("/CondUnit", oSelectedData.CondUnit);
					oController._fnGetTaxCodeService(e.getSource().parentModel);
				}
				if (e.getSource().getTitle() == "Purchase Group") {
					oParentModel.setProperty("/Purgrp", oSelectedData.PurcGroup);
				}
			}
		},
		handleSearch: function (e) {
			var vSelectedValue = e.getParameter("value").toUpperCase();
			var filters = [];
			var valueHelp = e.getSource();
			var oDataNewPinfoModel = this.getOwnerComponent().getModel("oDataNewPinfoModel");
			var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var plant = e.getSource().parentModel.getProperty("/Plant");
			if(e.getSource().getTitle() == "Ex Vendor Search")
				plant = e.getSource().parentModel.getProperty("/Plant");//RvPlant
			
			var PartNo = e.getSource().parentModel.getProperty("/PartNo");
			if (e.getSource().getTitle() == "Vendor Search" || e.getSource().getTitle() == "Ex Vendor Search") {
				if (vSelectedValue.length > 4) {
					valueHelp.setBusy(true);
//					
					filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));
					filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
					filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
					filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X"));
					filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
					oDataNewPinfoModel.read("/ES_Vendor", {
						filters: filters,
						success: function (oData, oResponse) {
							valueHelp.getModel().setData(oData.results);
							valueHelp.getModel().refresh();
							valueHelp.setBusy(false);
						},
						error: function (oResponse) {
							valueHelp.getModel().setData([]);
							valueHelp.setBusy(false);
						}
					});
				}
			} else if (e.getSource().getTitle() == "Part Number") {
				if (vSelectedValue.length > 4) {
					valueHelp.setBusy(true);
					oDataNewPinfoModel.read("/ES_Part", {
						filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
							.FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X")],
						success: function (oData, oResponse) {
							valueHelp.getModel().setData(oData.results);
							valueHelp.getModel().refresh();
							valueHelp.setBusy(false);
						}.bind(this),
						error: function (oResponse) {
							valueHelp.getModel().setData([]);
							valueHelp.setBusy(false);
						}
					});
				}
			} else {
				var nameFilter = [];
				if (vSelectedValue != "") {
					nameFilter = new sap.ui.model.Filter("PurcGroup", sap.ui.model.FilterOperator.Contains, vSelectedValue);
				}
				var binding = valueHelp.getBinding("items");
				binding.filter(nameFilter);
			}

		},
		onPlantCode: function (oEvent) {
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			oParentModel.setProperty("/PartNo", "");
			oParentModel.setProperty("/PartDesc", "");
			// oParentModel.setProperty("/Purg?rp", oSelectedData.PurchGroup);
			// oParentModel.setProperty("/NetWtUnit", oSelectedData.NetWtUnit);
			oParentModel.setProperty("/Vendor", "");
			oParentModel.setProperty("/RvPlant", "");
			oParentModel.setProperty("/RvVendor", "");
			oParentModel.setProperty("/RvVName", "");
			oParentModel.setProperty("/RvVLocation", "");
			oParentModel.setProperty("/Currency", "");
			oParentModel.setProperty("/PirNo", "");
			oParentModel.setProperty("/Taxonomy", "");
			oParentModel.setProperty("/ExtPrice", "0");
			oParentModel.setProperty("/SettledPrice", "0");
			oParentModel.setProperty("/DeltaPrice", "0");
//			oParentModel.setProperty("/DelTerms", "");
//			oParentModel.setProperty("/PaymntTerms", "");
			
			oParentModel.setProperty("/CondType", "");
			oParentModel.setProperty("/CondTypText", "");
			oParentModel.setProperty("/CondPrcnt", "");
			oParentModel.setProperty("/CondUnit", "");

		},
		onRevPlantCode: function (oEvent) {
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
//			oParentModel.setProperty("/PartNo", "");
//			oParentModel.setProperty("/PartDesc", "");
			// oParentModel.setProperty("/Purg?rp", oSelectedData.PurchGroup);
			// oParentModel.setProperty("/NetWtUnit", oSelectedData.NetWtUnit);
//			oParentModel.setProperty("/Vendor", "");
//			oParentModel.setProperty("/RvPlant", "");
			oParentModel.setProperty("/RvVendor", "");
			oParentModel.setProperty("/RvVName", "");
			oParentModel.setProperty("/RvVLocation", "");
			oParentModel.setProperty("/Currency", "");
			oParentModel.setProperty("/PirNo", "");
//			oParentModel.setProperty("/DelTerms", "");
//			oParentModel.setProperty("/PaymntTerms", "");
			
			oParentModel.setProperty("/CondType", "");
			oParentModel.setProperty("/CondTypText", "");
			oParentModel.setProperty("/CondPrcnt", "");
			oParentModel.setProperty("/CondUnit", "");

		},
		onChangeDelevertTime: function (oEvent) {
			var vNewValue = oEvent.getParameter("newValue");
			var vNewValueArray = vNewValue.split(".");
			if (vNewValue.length > 2) {
				oEvent.getSource().setValue(vNewValueArray[0].slice(0, 2));
			} else {
				oEvent.getSource().setValue(vNewValueArray[0]);
			}
		},
		_getVendor: function (oParentModel,vSelectedValue) {
			var oController = this;
			//var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var filters = [];			
			var vExtPrice = "0";	
			var vPinforcat = "";
			var vPinfoCatText = "";
			
			var vVendName = "";
			var vVendCode = "";
			var vVendLoc = "";
			var vCurrCode = "";
			var vPirNo = "";
			
			//var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			if (vSelectedValue.length > 0) {
//				oController._fnGetTaxCodeService(oParentModel);
				filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")));
				filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")));
				filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
				filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, ""));
				filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
				busyDialog.open();
				oDataNewPinfoModel.read("/ES_Vendor", {
					filters: filters,
					success: function (oData, oResponse) {
						oModelSSUDigitization.setProperty("/F4PinfoCategory", oData.results);
						if (oData.results.length > 0 && oData.results[0].Message == "") {
							vExtPrice = oData.results[0].ExtPrice;
							vPinforcat = oData.results[0].Pinforcat;
							vPinfoCatText = oData.results[0].PinfoCatText;
							
							vVendName = oData.results[0].VendName;
							vVendCode = oData.results[0].VendCode;
							vVendLoc = oData.results[0].VendLoc;
							vCurrCode = oData.results[0].CurrCode;
							vPirNo = oData.results[0].PirNo;
						} else {
							if(oData.results[0] && oData.results[0].Message != "")
								Message.error(oData.results[0].Message, { title: "Error" });
//							sap.m.MessageToast.show(vSelectedValue + " is not extended for " + oParentModel.getProperty("/Plant") + " existing plant.");
						}
						busyDialog.close();
						/*if(oParentModel.getProperty("/Pinforcat") == ""){
						oParentModel.setProperty("/ExtPrice", vExtPrice);
						oParentModel.setProperty("/Pinforcat", vPinforcat);
						oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
					}*/						
					
					oParentModel.setProperty("/VName", vVendName);
//					oParentModel.setProperty("/RvVendor", vVendCode);
					oParentModel.setProperty("/VLocation", vVendLoc);
//					oParentModel.setProperty("/Currency", vCurrCode);
						oParentModel.setProperty("/PirNo", vPirNo);
					},
					error: function (oResponse) {
						serviceError(oResponse);
					}
				});
			} else {
				sap.m.MessageToast.show("Maintain vendor code.");
				oParentModel.setProperty("/ExtPrice", vExtPrice);
				oParentModel.setProperty("/Pinforcat", vPinforcat);
				oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
				
				oParentModel.setProperty("/VName", vVendName);
//				oParentModel.setProperty("/RvVendor", vVendCode);
				oParentModel.setProperty("/VLocation", vVendLoc);
//				oParentModel.setProperty("/Currency", vCurrCode);
				oParentModel.setProperty("/PirNo", vPirNo);
			}

		},
		
		
		
		onSubmitExVendorCode: function (oEvent) {
			var oController = this;
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			oController._getVendor(oParentModel,vSelectedValue);
			
			oParentModel.setProperty("/RvVendor", "");
			oParentModel.setProperty("/RvVName", "");
			oParentModel.setProperty("/RvVLocation", "");
			oParentModel.setProperty("/Currency", "");
			oParentModel.setProperty("/RvPlant", "");
			
			oParentModel.setProperty("/CondType", "");
			oParentModel.setProperty("/CondTypText", "");
			oParentModel.setProperty("/CondPrcnt", "");
			oParentModel.setProperty("/CondUnit", "");
			/*var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var filters = [new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Vendor")),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSelectedValue)];
			oDataNewPinfoModel.read("/ES_RvVendor", {
				filters: filters,
				success: function (oData, oResponse) {
					if(oData.results[0].RvVendorFlag == ""){
						oModelSSUDigitization.setProperty("/F4RevVendor", oData.results);
					}else{
						Message.error(oData.results[0].RvVendorFlag, { title: "Error" });
					}					
				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});*/
			
		},
		onRevisedVendorChange: function (oEvent){
			var oController = this;
			var oF4RevVendor = oController.getView().getModel("ModelSSUDigitization").getProperty("/F4RevVendor");
			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			oController._fnGetTaxCodeService(oParentModel);
			$.each(oF4RevVendor,function(i,Row){
				if(Row.RvVendor === vSelectedValue){
					oParentModel.setProperty("/RvVName", Row.RvVName);
					oParentModel.setProperty("/RvVLocation", Row.RvVendLoc);
					oParentModel.setProperty("/Currency", Row.RvCurrCode);
					
					oParentModel.setProperty("/CondType", Row.CondType);
					oParentModel.setProperty("/CondTypText", Row.CondTypText);
					oParentModel.setProperty("/CondPrcnt", Row.CondPrcnt);
					oParentModel.setProperty("/CondUnit", Row.CondUnit);
				}
			});
		},
		
		RevisedPlantChange: function(oEvent){
			var oController = this;
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
//			oController._fnGetTaxCodeService(oParentModel);

			
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var PartNo = oParentModel.getProperty("/PartNo");
//			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			oParentModel.setProperty("/RvVendor", "");
			oParentModel.setProperty("/RvVName", "");
			oParentModel.setProperty("/RvVLocation", "");
			oParentModel.setProperty("/Currency", "");
			
			oParentModel.setProperty("/CondType", "");
			oParentModel.setProperty("/CondTypText", "");
			oParentModel.setProperty("/CondPrcnt", "");
			oParentModel.setProperty("/CondUnit", "");
			oController._getF4RevVendor(oParentModel);
			/*busyDialog.open();
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var filters = [new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Vendor")),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSelectedValue)];
			oDataNewPinfoModel.read("/ES_RvVendor", {
				filters: filters,
				success: function (oData, oResponse) {
					busyDialog.close();
					if(oData.results[0].RvVendorFlag == ""){
						oModelSSUDigitization.setProperty("/F4RevVendor", oData.results);
					}else{
						Message.error(oData.results[0].RvVendorFlag, { title: "Error" });
					}					
				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});*/
			oDataNewPinfoModel.read("/ES_Part", {
				filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSelectedValue),
							new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo),
							new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
				success: function (oData, oResponse) {
					busyDialog.close();
					if (oData.results.length > 0 && oData.results[0].Message == "") {
						oParentModel.setProperty("/Purgrp", oData.results[0].PurchGroup);
						
					} else {
						if(oData.results[0] && oData.results[0].Message != "")
							Message.error(oData.results[0].Message, { title: "Error" });
						oParentModel.setProperty("/Purgrp", "");
					}

				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});
		},
		_getF4RevVendor: function(oParentModel){
			var oController = this;
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			busyDialog.open();
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var filters = [new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Vendor")),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/RvPlant"))];
			oDataNewPinfoModel.read("/ES_RvVendor", {
				filters: filters,
				success: function (oData, oResponse) {
					busyDialog.close();
					if(oData.results[0].RvVendorFlag == ""){
						oModelSSUDigitization.setProperty("/F4RevVendor", oData.results);
					}else{
						Message.error(oData.results[0].RvVendorFlag, { title: "Error" });
					}					
				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});
		},
		
		onSubmitVendorCode: function (oParentModel,vSelectedValue) {
			var oController = this;
			//var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var filters = [];
			var vVendName = "";
			var vVendCode = "";
			var vVendLoc = "";
			var vCurrCode = "";
			
			var vCondType = "";
			var vCondTypText = "";
			var vCondPrcnt = "";
			var vCondUnit = "";
			//var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			if (vSelectedValue.length > 0) {
//				filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));
				filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/RvPlant")));
				filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
				filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, ""));
				filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
				busyDialog.open();
				oDataNewPinfoModel.read("/ES_Vendor", {
					filters: filters,
					success: function (oData, oResponse) {
						if (oData.results.length > 0 && oData.results[0].Message == "") {
							vVendName = oData.results[0].VendName;
							vVendCode = oData.results[0].VendCode;
							vVendLoc = oData.results[0].VendLoc;
							vCurrCode = oData.results[0].CurrCode;
							
							vCondType = oData.results[0].CondType;
							vCondTypText = oData.results[0].CondTypText;
							vCondPrcnt = oData.results[0].CondPrcnt;
							vCondUnit = oData.results[0].CondUnit;
						} else {
							if(oData.results[0] && oData.results[0].Message != "")
								Message.error(oData.results[0].Message, { title: "Error" });
//							sap.m.MessageToast.show(vSelectedValue + " is not extended for " + oParentModel.getProperty("/RvPlant") + "revised plant.");
						}
						busyDialog.close();
						oParentModel.setProperty("/RvVName", vVendName);
						oParentModel.setProperty("/RvVendor", vVendCode);
						oParentModel.setProperty("/RvVLocation", vVendLoc);
						oParentModel.setProperty("/Currency", vCurrCode);
						
						oParentModel.setProperty("/CondType", vCondType);
						oParentModel.setProperty("/CondTypText", vCondTypText);
						oParentModel.setProperty("/CondPrcnt", vCondPrcnt);
						oParentModel.setProperty("/CondUnit", vCondUnit);
					},
					error: function (oResponse) {
						serviceError(oResponse);
					}
				});
			} else {
				sap.m.MessageToast.show("Maintain vendor code.");
				oParentModel.setProperty("/RvVName", vVendName);
				oParentModel.setProperty("/RvVendor", vVendCode);
				oParentModel.setProperty("/RvVLocation", vVendLoc);
				oParentModel.setProperty("/Currency", vCurrCode);
				
				oParentModel.setProperty("/CondType", vCondType);
				oParentModel.setProperty("/CondTypText", vCondTypText);
				oParentModel.setProperty("/CondPrcnt", vCondPrcnt);
				oParentModel.setProperty("/CondUnit", vCondUnit);
			}

		},
		onSubmitPartNum: function (oEvent) {

			var oController = this;
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var plant = oParentModel.getProperty("/Plant");
			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			if (vSelectedValue.length > 0) {
				busyDialog.open();
				oDataNewPinfoModel.read("/ES_Part", {
					filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
						.FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
					success: function (oData, oResponse) {
						busyDialog.close();
						if (oData.results.length > 0 && oData.results[0].Message == "") {
							oParentModel.setProperty("/PartNo", oData.results[0].PartNo);
							oParentModel.setProperty("/PartDesc", oData.results[0].PartDesc);
							oParentModel.setProperty("/Purgrp", oData.results[0].PurchGroup);
							oParentModel.setProperty("/Taxonomy", oData.results[0].Taxonomy);
//							oParentModel.setProperty("/NetWtUnit", oData.results[0].NetWtUnit);
							
							oParentModel.setProperty("/Vendor", "");
							oParentModel.setProperty("/RvPlant", "");
							oParentModel.setProperty("/RvVendor", "");
							oParentModel.setProperty("/RvVName", "");
							oParentModel.setProperty("/RvVLocation", "");
							oParentModel.setProperty("/Currency", "");
							oParentModel.setProperty("/PirNo", "");
//							oParentModel.setProperty("/Taxonomy", "");
							oParentModel.setProperty("/ExtPrice", "0");
							oParentModel.setProperty("/SettledPrice", "0");
							oParentModel.setProperty("/DeltaPrice", "0");
							
							oParentModel.setProperty("/CondType", "");
							oParentModel.setProperty("/CondTypText", "");
							oParentModel.setProperty("/CondPrcnt", "");
							oParentModel.setProperty("/CondUnit", "");
						} else {
							if(oData.results[0] && oData.results[0].Message != "")
								Message.error(oData.results[0].Message, { title: "Error" });
//							sap.m.MessageToast.show(vSelectedValue + " is not extended for " + plant + " plant.");
							oParentModel.setProperty("/PartNo", "");
							oParentModel.setProperty("/PartDesc", "");
							oParentModel.setProperty("/Purgrp", "");
							oParentModel.setProperty("/Taxonomy", "");
//							oParentModel.setProperty("/NetWtUnit", "");
							
							oParentModel.setProperty("/Vendor", "");
							oParentModel.setProperty("/RvPlant", "");
							oParentModel.setProperty("/RvVendor", "");
							oParentModel.setProperty("/RvVName", "");
							oParentModel.setProperty("/RvVLocation", "");
							oParentModel.setProperty("/Currency", "");
							oParentModel.setProperty("/PirNo", "");
							oParentModel.setProperty("/Taxonomy", "");
							oParentModel.setProperty("/ExtPrice", "0");
							oParentModel.setProperty("/SettledPrice", "0");
							oParentModel.setProperty("/DeltaPrice", "0");
							
							oParentModel.setProperty("/CondType", "");
							oParentModel.setProperty("/CondTypText", "");
							oParentModel.setProperty("/CondPrcnt", "");
							oParentModel.setProperty("/CondUnit", "");
						}

					},
					error: function (oResponse) {
						serviceError(oResponse);
					}
				});
			} else {
				busyDialog.close();
				sap.m.MessageToast.show("Maintain part number.");
				oParentModel.setProperty("/PartNo", "");
				oParentModel.setProperty("/PartDesc", "");
				oParentModel.setProperty("/Purgrp", "");
				oParentModel.setProperty("/NetWtUnit", "");
			}

		},
		OnTaxCodeChange: function (oEvent) {
			var oController = this;
			var oModel = oEvent.getSource().getModel();
			if (oEvent.getParameter("itemPressed")) {
				oModel.setProperty("/TcDesc", oEvent.getSource().getSelectedItem().getAdditionalText());
			} else {
				var vSelectedValue = oEvent.getParameter("value");
				oEvent.getSource().setValue(vSelectedValue.toUpperCase())
				if (vSelectedValue.length == 2) {
					oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_TaxCode(TaxCode='" + vSelectedValue + "')", {
						success: function (oData, oResponse) {
							oModel.setProperty("/TcDesc", oData.TaxCodeDes);
							oModel.setProperty("/Taxcode", vSelectedValue);
						},
						error: function (oResponse) {
							Message.error("Error while getting reading tax description.", {
								title: "Error"
							});
						}
					});
				}
			}
		},
		onAttachment: function (oEvent) {
			var oController = this;
			var oAttachFrag = parentXmlFragment(oController, "AttachmentNew");
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath("ModelSSUDigitization");
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			var vSectedData = oModelSSUDigitization.getProperty(vSelectedPath);
			var vSelectedTab = oModelSSUDigitization.getProperty("/SelectedTab");
			var vFilters = [
				new sap.ui.model.Filter("TabId", sap.ui.model.FilterOperator.EQ, vSelectedTab),
				new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, vSectedData.PartNo),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSectedData.Plant),
				new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor)
			];
			oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
			oAttachFrag.open();
		},
		onAttachDeleted: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oNavDms = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
//			var vSelectedIndex;
			$.each(oNavDms,function(i,row){
				if(row.Posnr+row.TabId == oEvent.getParameter("documentId")){
					var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
					oDataNewPinfoModel.remove("/ES_DMS(Filekey='"+row.Filekey+"',TabId='"+row.TabId+"',Posnr='"+row.Posnr+"')/$value", {
						method: "DELETE",
						success: function (oData, oResponse) {
							oNavDms.splice(i, 1);
							oModelSSUDigitization.setProperty("/PaperDataSet/Nav_DMS", oNavDms);
						},
						error: function (oResponse) {
							Message.error("Error while getting data.", {
								title: "Error"
							});
						}
					});	
				}
			});
		},
		_getXsrfToken: function() {
            var token = this.getOwnerComponent().getModel("oDataNewPinfoModel").getHeaders()['x-csrf-token'];
            if (!token) {
                this.getOwnerComponent().getModel("oDataNewPinfoModel").refreshSecurityToken(function(e, o) {
                    token = o.headers['x-csrf-token'];
                }, function() {
                    sap.m.MessageBox.error(errMsg, {
                            styleClass: "sapUiSizeCompact"
                    });
                    sap.m.MessageBox.error("Error while getting x-csrf-token", {
						title: "Error"
					});
                }, false);
             }
             return token;
        },
		
		onSelectionChange: function(oEvent){
			busyDialog.open();
			var oUploadCollection = oEvent.getSource();
			  // Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: this._getXsrfToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oFile =oEvent.getParameter("files")[0];
			//PaperCode|FileKey|TabId|PartNo|Vendor|Plant|FxRmStatus|FileName|FileDesc|FileSize
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo") || "0";
			var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode") || "0";
			var vTabId = oEvent.getSource().getBindingInfo('items').filters[0].oValue1;
			var slug =vPaperCode+"|"+vPaperNo+"|"+vTabId+"|0|0|0|0|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
			  name: "slug",
			  value: slug
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);			
		},
		onSelectionChangeItemAtta: function(oEvent){
			busyDialog.open();
			var oUploadCollection = oEvent.getSource();
			  // Header Token
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: this._getXsrfToken()
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
			var vFrxRmStatus = "";
			var vParent = vSelectedPath.split("/");
			vParent.splice(4, 2);
			vParent = vParent.join("/");
			var oFile =oEvent.getParameter("files")[0];
			
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo") || "0";
			var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode") || "0";
			var vTabId = oModelSSUDigitization.getProperty("/SelectedTab") || "0";
			var vPartNo = oModelSSUDigitization.getProperty(vParent + "/PartNo") || "0";
			var vPlant =  oModelSSUDigitization.getProperty(vParent + "/Plant") || "0";
			var vVendor = oModelSSUDigitization.getProperty(vParent + "/Vendor") || "0";
			
			//PaperCode|FileKey|TabId|PartNo|Vendor|Plant|FxRmStatus|FileName|FileDesc|FileSize
			var slug =vPaperCode+"|"+vPaperNo+"|"+vTabId+"|"+vPartNo+"|"+vVendor+"|"+vPlant+"|0|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
			  name: "slug",
			  value: slug
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);			
		},
        onUploadComplete: function(oEvent){
        	busyDialog.close();
        	if(oEvent.getParameter("mParameters").status == "201"){
        		var slug = $.grep(oEvent.getParameter("mParameters").requestHeaders,function(row){
        			return row.name == "slug";
        		});
                var oController = this;
				var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
                if(slug.length>0){
                	//PaperCode|FileKey|TabId|PartNo|Vendor|Plant|FxRmStatus|FileName|FileDesc|FileSize
                	var vSlugValue = slug[0].value.split("|");
                	var vXmlText = oEvent.mParameters.files[0].headers.location;//oEvent.mParameters.getParameter("responseRaw");
                	var vPosnr = vXmlText.slice(vXmlText.indexOf("Posnr")+7,vXmlText.indexOf("Posnr")+13);
                	var vNav_DMS = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
    				vNav_DMS = vNav_DMS ? vNav_DMS:[];
    				vNav_DMS.push({
    					"Filekey": vSlugValue[1],
						"TabId": vSlugValue[2],
						"PartNo": vSlugValue[3],
						"Plant": vSlugValue[5],
		                "Vendor": vSlugValue[4],
						"FrxRmStatus": vSlugValue[6],
						"Posnr": vPosnr,
						"Filename": vSlugValue[7],
						"Filedesc": vSlugValue[8],
						"Filesize": vSlugValue[9],
						"CreatedBy": "", //oModelSSUDigitization.UserId,
						"CreatedOn": null, //.join(""),
						"Filecontents": "",
    				 });
    				 oModelSSUDigitization.setProperty("/PaperDataSet/Nav_DMS",vNav_DMS);
                }
            }
        },
		onChangeInitiator: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			if (oEvent.getParameter("selectedItem")) {
				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oEvent.getParameter("selectedItem").getKey());
			} else {
				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
			}
		},
		onSettledSub: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vNewValue = oEvent.getParameter("newValue");
			var vNewValueArray = vNewValue.split(".");
			if (vNewValueArray[0].length > 9 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 13) {
				vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 9) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0,
					9);
				oEvent.getSource().setValue(vNewValue);
			} else {
				oEvent.getSource().setValue(vNewValue);
			}
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var vExtPrice = oParentModel.getProperty("/ExtPrice");
			var vSign =  Number(vNewValue) - Number(vExtPrice);
//			var vChangePercnd = vSign/vExtPrice*100;
			
			/*vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
			oParentModel.setProperty("/ChgPrctng",Math.abs(vChangePercnd).toFixed(2));*/
			oParentModel.setProperty("/DeltaPrice", vSign.toFixed(2));
			/*if(vSign == 0)
				vSign = "";
			else
				vSign = vSign > 0? "+" : "-";
			oParentModel.setProperty("/Sign",vSign);
			
			var oFilterData = $.grep(oModelSSUDigitization.getProperty("/F4Amentment"),function(row){
				if(vSign == "+")
					return (row.Sign == "POS");
				else if(vSign == "-")
					return (row.Sign == "NEG");
			});
			if(oFilterData.length>0){
				oParentModel.setProperty("/Amndcode",oFilterData[0].Zpricecd);
				oParentModel.setProperty("/AmndcodeDesc",oFilterData[0].Zreason);	
			}else{
				oParentModel.setProperty("/Amndcode","");
				oParentModel.setProperty("/AmndcodeDesc","");	
			}*/
			
			
		},
		/*onSubmitPostToSap: function(oEvent){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vButtonType = oEvent.getSource().getProperty("type");
			var oSelectedPath = oController.getView().byId("idPartPriceTbl").getSelectedContextPaths();
			if(oSelectedPath.length > 0){
				Message.confirm("This is confirmation for Post to SAP.", {
					title: "Post to SAP confirmation",
					onClose: function (oAction) {
						if (oAction == "OK") {
							var oPaperData = oController._fnDataBeforeSave();							
							var oSelectedItems=[];							
							$.each(oSelectedPath,function(i,Row){
								if(oModelSSUDigitization.getProperty(Row).BjStatus == "" || oModelSSUDigitization.getProperty(Row).BjStatus == "E")
									oSelectedItems.push(oModelSSUDigitization.getProperty(Row));
							});
							var oPaperDataCopy = $.extend({}, oPaperData);
							oPaperDataCopy.Nav_Items = oSelectedItems;
							if(vButtonType == "Accept"){
								oPaperDataCopy.Action = "P";
							} else {
								oPaperDataCopy.Action = "P";
								oPaperDataCopy.BjStatus = "R";
							}	
							oPaperDataCopy.UsrLevel = oPaperData.Status;
							busyDialog.open();
							oController.getOwnerComponent().getModel(
								"oDataAmendmentModel").create("/ES_Header", oPaperDataCopy, {
								success: function (oData, oResponse) {
									var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
									if (vMsgReturn.Title == "Error") {
										sap.m.MessageBox.error(vMsgReturn.Message, {
											title: vMsgReturn.Title
										});
										oController._fnAfterGettingBEData(oData);
									} else if (vMsgReturn.Title == "Sucess") {
										sap.m.MessageBox.success(vMsgReturn.Message, {
											title: vMsgReturn.Title,
											onClose: function () {
												if(oData.Status == "C")
													navParentBack();
												else
													oController._fnAfterGettingBEData(oData);
											}
										});
									} else {
										if(oData.Status == "C")
											navParentBack();
										else
											oController._fnAfterGettingBEData(oData);
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
			} else {
				sap.m.MessageToast.show("Items is not selected.");
			}
		},
		onApproveRequest: function(oEvent){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//			var vButtonType = oEvent.getSource().getProperty("type");
			Message.confirm("This is confirmation for approve request.", {
				title: "Approve confirmation",
				onClose: function (oAction) {
					if (oAction == "OK") {
						var oPaperData = oController._fnDataBeforeSave();
						oPaperData.Action = "3"; // accept action is 3
						busyDialog.open();
						oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
							success: function (oData, oResponse) {
								$.each(oData.Nav_Items.results, function (i, Row) { //need to remove after getting updated BE data
									Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
									Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
									Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
									Row.YearBase = Row.YearBase == "1" ? 1 : 0;
								});
								// oController._fnAfterGettingBEData(oData);//use after getting updated BE data
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
											oController._fnAfterGettingBEData(oData);
											oModelSSUDigitization.setProperty("/NonSSURequest", false);
										}
									});
								} else {
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
			})
		},
		onRejectRequest: function(oEvent){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//			var vButtonType = oEvent.getSource().getProperty("type");
			var oDialog = new sap.m.Dialog({
				title: 'Comments',
				content: new sap.m.TextArea({
					value: "",
					rows: 3,
					cols: 50
				}),
				endButton: new sap.m.Button({
					text: 'Cancel',
					press: function (oEvent) {
						oDialog.close();
					}
				}),
				beginButton: new sap.m.Button({
					text: 'OK',
					press: function (oEvent) {
						var oPaperData = oController._fnDataBeforeSave();
						oPaperData.Action = "4"; // reject action is 4
						oPaperData.UsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
						busyDialog.open();
						oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
							success: function (oData, oResponse) {
								oDialog.close();
								$.each(oData.Nav_Items.results, function (i, Row) { //need to remove after getting updated BE data
									Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
									Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
									Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
									Row.YearBase = Row.YearBase == "1" ? 1 : 0;
								});
								// oController._fnAfterGettingBEData(oData);//use after getting updated BE data
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
											navParentBack();
											var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
											oRouter.navTo("Home");
											if (oRouter.getView("com.mahindra.ZSSU.view.Home").getController())
												oRouter.getView("com.mahindra.ZSSU.view.Home").getController()._fnGetMaster();
										}
									});
								} else {
									oController._fnAfterGettingBEData(oPaperData);
								}
							},
							error: function (oResponse) {
								oDialog.close();
								oController._fnAfterGettingBEData(oPaperData);
								serviceError(oResponse);
							}
						});
					}
				})
			});
			oDialog.open();
		
		},*/
		_fnLockUnlockService:function(vLock) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo");
			var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
//			if(!vPaperNo || (vLock=="" && !oModelSSUDigitization.getProperty("/EditableFlag")))
			if(!vPaperNo)
				return;
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			var oData_Url = oDataNewPinfoModel.sServiceUrl+"/ES_LockUnlockSSU(PaperCode='"+vPaperCode+"',PaperNo='"+vPaperNo+"',Lock='"+vLock+"')";
			$.ajax(oData_Url, {
				dataType:"json",
			    success: function(oData) {
			      oData = oData.d;
			      busyDialog.close();
					if(oData.Message.substr(0,1)=="S" && vLock != ""){
						oModelSSUDigitization.setProperty("/EditableFlag", true);
						oModelSSUDigitization.setProperty("/BEValidation", false);
					}
					else if(oData.Message.substr(0,1)=="E"){
						Message.error(oData.Message);
						oModelSSUDigitization.setProperty("/EditableFlag", false);
					}else{
						oModelSSUDigitization.setProperty("/EditableFlag", false);
					}
			    },
			    error: function(oResponse) {
			      serviceError(oResponse);
			    }
			 });
		},
		onTableSelectAll: function(oEvent){
			if(oEvent.getParameter("selectAll")){
				this.getView().getModel("ModelSSUDigitization").setProperty("/PostToSapSelectAll",true);
			}else{
				this.getView().getModel("ModelSSUDigitization").setProperty("/PostToSapSelectAll",false);
			}
		},
		onShowCndtype: function(oEvent){
			var oController = this;
			var oItemFrag = xmlFragment(oController, "ConditionType");
			oItemFrag.open();
			
		},
		onCloseCndtype: function(oEvent){
			var oFragItem = oEvent.getSource().getParent();
			oFragItem.close();
		}
		/*onExit: function(){
			var oController = this;
			oController._fnLockUnlockService("");
		}*/
		/*onMessagePopoverPress: function (oEvent) {
			var oMessagePopover = new sap.m.MessagePopover({
				items: {
					path: '/MessageList',
					template: new sap.m.MessageItem({
						type: '{type}',
						title: '{title}',
						activeTitle: "{active}",
						description: '{description}',
						subtitle: '{subtitle}',
						counter: '{counter}'
					})
				}
			});
			oMessagePopover.setModel(this.getView().getModel("ModelSSUDigitization"));
			oMessagePopover.toggle(oEvent.getSource());
		}*/

		//--------- Event Methods End -----------------

	});

});