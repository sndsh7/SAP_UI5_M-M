sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	"use strict";
	return Controller.extend("com.mahindra.ZSSU_Approve.controller.CCRP", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//			oRouter.attachRoutePatternMatched(this._onObjectMatched, this);
			oRouter.getRoute("CCR").attachPatternMatched(this._onObjectMatched, this);
		},
		
		/*onExit: function () {
			debugger;
			console.log("aaa");
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			window.open(sServiceUrl+"/ES_AmendPDF(PaperNo='FY21-FRX-000001',TermsType='00')/$value");
		},*/
		
		//--------- Local Methods Start -------------------------
		
		_onObjectMatched: function (oEvent) {
			var oController = this;
			var vPaperNo = oEvent.getParameters().arguments.Number;
			var vPaperCode = oEvent.getParameters().arguments.PaperCode;
			var oModel = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_Approve', '/json/CCR.json');
			oModel.loadData(sUrl, "", false);
			oController.getView().setModel(oModel, "ModelSSUDigitization");
			oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
			/*var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			if (vPaperNo == "new") {
				oModel.setProperty("/NotCreateNew", false);
				oModel.setProperty("/EditableFlag", true);
				oModel.setProperty("/DisplayOnlyFlag", false);
				var oData = getHeaderObjectAMD();
				oData.PaperCode= vPaperCode;
				oModel.setProperty("/PaperDataSet", oData);
				oController._getAmentmendService();
				oController._getWorkFlow();
			} else {
				 oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
			}*/
			/*oDataAmendmentModel.read("/ES_F4PaperPurp", {
				filters: [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)],
				success: function (oData, oResponse) {
					oModel.setProperty("/F4PaperPur", oData.results);
					oModel.refresh();
				},
				error: function (oResponse) {
					Message.error("Error loading Paper Purpose.", {
						title: "Error"
					});
				}
			});
			oDataAmendmentModel.read("/ES_Category", {
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
			});*/

			oController._fnCreatingTables();
		},
		_fnGetNPIHeaderData: function (vPaperNo,vPaperCode) {
			var oController = this;
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			oController.getView().setBusy(true);
			var vParmeters = {
					"$expand": "Nav_Items,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret",
			};
			oDataAmendmentModel.read("/ES_Header(PaperCode='"+vPaperCode+"',PaperNo='"+vPaperNo+"')", {	
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
			// oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
			oData.Model = oData.Model ? oData.Model.split(",") : [];
			oData.Nav_Items = oData.Nav_Items.results ? oData.Nav_Items.results : oData.Nav_Items;
			oData.Nav_DMS = oData.Nav_DMS.results  ? oData.Nav_DMS.results : oData.Nav_DMS;
			oData.Nav_Log = oData.Nav_Log.results  ? oData.Nav_Log.results : oData.Nav_Log;
			oData.Nav_Wf = oData.Nav_Wf.results  ? oData.Nav_Wf.results : oData.Nav_Wf;
			/*oData.Nav_Currency = oData.Nav_Currency.results  || oData.Nav_Currency;
			if(oData.Nav_Currency.length <= 0){
				oData.Nav_Currency.push(getCurrencyStr());
			}*/
//			oData.Sign = oData.Sign == "POS" ? 0 : 1; //0 is Increase 1 is Decrease;
			
			$.each(oData.Nav_Items, function (i, Row) {
				if (typeof Row.ValidFrom == "string"){
                    Row.ValidFrom = new Date( Row.ValidFrom);
				}
				Row.uiFields ={
					    "Error": "Default",
					    "ItemNo": "",
					    "maxDate":  new Date(),
					    "minDate": minDate()
					  };
			});
			oModelSSUDigitization.setProperty("/PaperDataSet", oData);
			if (oData.Status === "S" || oData.Status === "R")
				oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
			else if(oData.Status === "IC")
				oModelSSUDigitization.setProperty("/PostToSAP", true);
			else if(oData.Status === "NR")
				oModelSSUDigitization.setProperty("/NonSSURequest", true);
			
			if(oData.Initiator != oData.Createdby)
				oModelSSUDigitization.setProperty("/InitiatedBySSU", false);
			oModelSSUDigitization.refresh();
//			oController._getAmentmendService();
//			oController._getWorkFlow();
			// oController._validationDataFilled();
		},
		_fnDataBeforeSave: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			if (oPaperData.DeletedItems) {
				oPaperData.Nav_Items = oPaperData.Nav_Items.concat(oPaperData.DeletedItems);
				delete oPaperData.DeletedItems;
			}
			delete oPaperData.__metadata;
			delete oPaperData.uiFields;
			oPaperData.Sector = oPaperData.Sector.toString();
			oPaperData.Model = oPaperData.Model.toString();
			/*if(typeof oPaperData.Sign == "number")
				oPaperData.Sign = oPaperData.Sign == 0 ? "POS" : "NEG";	*/		
			oPaperData.Nav_Log = [];
			oPaperData.Nav_Wf = [];
			oPaperData.Nav_Ret = [];
			oPaperData.Nav_DMS = [];
			$.each(oPaperData.Nav_Items, function (i, Row) {
				Row.ValidFrom = uiDateToBackend(Row.ValidFrom);
				delete Row.uiFields;
				delete Row.__metadata;
			});
			return oPaperData;
		},
//		uiDateToBackend
		/*_uiDateToBE: function(oUiDate){
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
		},*/


		_fnCreatingTables: function () {
			var oController = this;
			var oTablePartDetails = oController.byId("idPartPriceTbl");
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
					/*new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/editIcon}",
						tooltip: "Edit",
						visible: "{ModelSSUDigitization>/EditableFlag}",
						type: "{ModelSSUDigitization>uiFields/Error}",
						press: function (oEvent) {
							var oItemFrag = xmlFragment(oController, "ItemCCR");
							var oParentModel = oController._setEditFragmentModel(oEvent);
							oItemFrag.setModel(oParentModel);
							oController._getVendor(oParentModel,oParentModel.getProperty("/Vendor"));
							oItemFrag.open();
						}
					}),*/
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
						tooltip: "Display",
						visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
						press: function (oEvent) {
							var oItemFrag = xmlFragment(oController, "ItemCCR");
							oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
							oItemFrag.open();
						}
					}),
					/*new sap.m.Button({
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
										oDeletedData.Delete = "X";
										var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedItems") ? oModelSSUDigitization.getProperty(
											"/PaperDataSet/DeletedItems") : [];
										oDeletedItems.push(oDeletedData);
										oModelSSUDigitization.setProperty("/PaperDataSet/DeletedItems", oDeletedItems);
										var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
										oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
										oModelSSUDigitization.refresh();
									}
								}
							});

						}
					})*/
				]
			});
			createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
		},
		/*_setEditFragmentModel: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			var objectData = $.extend({}, oModelSSUDigitization.getProperty(vSelectedPath));
			var vSelectedPathVali = oController._fnDataSettingValidation(vSelectedPath);
			objectData.Validation = oModelSSUDigitization.getProperty(vSelectedPathVali);
			return new JSONModel(objectData);
		},
		_fnDataSettingValidation: function (vSelectedPathVali) {//need to remove
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
		},*/
		_setDisplayFragmentModel: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
		},
	/*	_setDataAfterEditItem: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vChangedData = oEvent.getSource().getParent().getModel().getData();
			var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
			if (!vSelectedPath) {
				vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
			}
			delete vChangedData.Validation;
			oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
			oModelSSUDigitization.setProperty("/SelectedPath", "");
		},
		_fnMassDataSet: function (vExcelDataArray) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
			var oFilter;
			$.each(vExcelDataArray, function (MainIndex, row) {
				oFilter = $.grep(oMassData, function (grepRow) {
					return ((row.Plant === grepRow.Plant) && (row.Vendor_Code === grepRow.Vendor) && (row.Part_Number === grepRow.PartNo));
				});
				if (oFilter.length <= 0) {
					var vValidFrom = row.Valid_From_Date || "";
					
					var oItemData = getItemDetailsObjectAMD();
					oItemData.Plant = row.Plant || "";
					oItemData.Vendor = row.Vendor_Code || "";
					oItemData.PartNo = row.Part_Number || "";
					oItemData.SettledPrice = row.Settled_Price && row.Settled_Price.replace(/ /g, '') || "0";
					//oItemData.SanctiondBudget = row.Sanctioned_Budget && row.Sanctioned_Budget.replace(/ /g, '') || "0";
					//oItemData.QtyPerVeh = row.Qty_per_vehicle && row.Qty_per_vehicle.replace(/ /g, '') || "0";
					//oItemData.QuotedPrice = row.Quoted_Price && row.Quoted_Price.replace(/ /g, '') || "0";
					oItemData.ValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
//					oItemData.Amndcode = row.Price_Change_Code || "";
					oItemData.Remarks = row.Remarks || "";
					oMassData.push(oItemData);					
					var index = oMassData.length - 1;
					oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);
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
				"Sign": oModelSSUDigitization.getProperty("/PaperDataSet/Sign"),
				"Nav_ItemsX": []
			};
			$.each(Nav_Items, function (item, Row) {
				Row.uiFields.ItemNo = item.toString();
				var oNavItem = {
					"ItemNo": item.toString(),
					"Plant": Row.Plant,
					"Vendor": Row.Vendor,
					"PartNo": Row.PartNo,
					"Amndcode": Row.Amndcode,
					"ValidFrom": uiDateToBackend(Row.ValidFrom),
					"Pinforcat": Row.Pinforcat
				};
				oValidation.Nav_ItemsX.push(oNavItem);
			});
			busyDialog.open();
			oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_HeaderX", oValidation, {
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

						if (Row.VendorFlag == "") {
							Nav_Items[vIndexItem].VName = Row.VName;
							Nav_Items[vIndexItem].VLocation = Row.VLocation;
							Nav_Items[vIndexItem].Currency = Row.Currency;
							Nav_Items[vIndexItem].ExtPrice = Row.ExtPrice;
							Nav_Items[vIndexItem].PirNo = Row.PirNo;
							Nav_Items[vIndexItem].Purorg = Row.Purorg;
							Nav_Items[vIndexItem].Pinforcat = Row.Pinforcat;
							Nav_Items[vIndexItem].PinfoCatText = Row.PinfoCatText;
							var vSign =  Number(Nav_Items[vIndexItem].SettledPrice) - Number(Row.ExtPrice);
							var vChangePercnd = vSign/Row.ExtPrice*100;
							
							vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
							Nav_Items[vIndexItem].ChgPrctng = Math.abs(vChangePercnd).toFixed(2);
							Nav_Items[vIndexItem].DeltaPrice = vSign.toFixed(2);
							if(vSign == 0)
								vSign = "";
							else
								vSign = vSign > 0? "+" : "-";
							Nav_Items[vIndexItem].Sign = vSign;
							
							var oFilterData = $.grep(oModelSSUDigitization.getProperty("/F4Amentment"),function(row){
								if(vSign == "+")
									return (row.Sign == "POS");
								else if(vSign == "-")
									return (row.Sign == "NEG");
							});
							if(oFilterData.length>0){
								Nav_Items[vIndexItem].Amndcode = oFilterData[0].Zpricecd;
								Nav_Items[vIndexItem].AmndcodeDesc = oFilterData[0].Zreason;
							}else{
								Nav_Items[vIndexItem].Amndcode = "";
								Nav_Items[vIndexItem].AmndcodeDesc = "";	
							}
							
						}
						if (Row.PartNoFlag == "") {
							Nav_Items[vIndexItem].PartDesc = Row.PartDesc;
							Nav_Items[vIndexItem].NetWtUniit = Row.NetWtUniit;
							Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
						}
						if(Row.AmndcodeFlag == ""){
							Nav_Items[vIndexItem].AmndcodeDesc = Row.AmndcodeDesc;
						}
						if (Row.VendorFlag != "" || Row.PartNoFlag != "" || Row.PlantFlag != "" || Row.ValidFromFlag != "") {
							Nav_Items[vIndexItem].uiFields.Error = "Reject";
							Nav_Items[vIndexItem].uiFields.MassValidation = Row;
						} else {
							Nav_Items[vIndexItem].uiFields.Error = "Default";
							Nav_Items[vIndexItem].uiFields.MassValidation = {};
						}
						
						oController._validationDataFilled();
					});
					if (oData.ErrorFlag != "X") {
						oModelSSUDigitization.setProperty("/BEValidation", true);
						oModelSSUDigitization.setProperty("/EditableFlag", false);
						vMsg = "Validation is successfully done without errors.";
						vTitle = "Success";
					}

					oModelSSUDigitization.setProperty("/Validation", oData);
					oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
					oModelSSUDigitization.refresh();
					Message.success(vMsg, {
						title: vTitle
					});
					busyDialog.close();
				},
				error: function (oResponse) {
					// serviceError(oResponse);
					busyDialog.close();
				}
			});
		},
		_getModelPlant: function (vSelectedSectors) {
			if (vSelectedSectors && vSelectedSectors.length > 0) {
				var vFilters = [];
				var oController = this;
				var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
				var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
				oModelSSUDigitization.setProperty("/PaperDataSet/Sector", vSelectedSectors)

				$.each(vSelectedSectors, function (index, key) {
					vFilters.push(new sap.ui.model.Filter("SectorCode", sap.ui.model.FilterOperator.EQ, key));
				});
				busyDialog.open();

				oDataAmendmentModel.read("/ES_Model", {
					filters: vFilters,
					success: function (oData, oResponse) {
						oModelSSUDigitization.setProperty("/F4Model", oData.results);
						busyDialog.close();
					},
					error: function (oResponse) {
						serviceError(oResponse)
					}
				});
				oDataAmendmentModel.read("/ES_Plant", {
					filters: vFilters,
					success: function (oData, oResponse) {
						oModelSSUDigitization.setProperty("/F4Plant", oData.results);
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
				var vFlagCWB = false;
				$.each(oPaperData.Nav_DMS, function (i, RowDMS) {
					if (RowDMS.TabId == "CWB")
						vFlagCWB = true;
				});
				if (!vFlagCWB) {
					vFlag = false;
					oTabIconColor.VendorPartDetails = "Negative";
				}
			}
			if (oPaperData.Sector.length <= 0 || oPaperData.Model.length <= 0 ) {
				vFlag = false;
				oTabIconColor.VendorPartDetails = "Negative";
			}
			if (oPaperData.Createdby == "") {
				vFlag = false;
				oTabIconColor.Workflow = "Negative";
			}
			if (oPaperData.Nav_Items.length <= 0) {
				oTabIconColor.VendorPartDetails = "Negative";
			}
			$.each(oPaperData.Nav_Items, function (i, Row) {
				if (Row.uiFields.Error == "Reject") {
					vFlag = false;
					oTabIconColor.VendorPartDetails = "Negative";
				}
				if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" || Math.abs(Row.SettledPrice) == "0" 
					|| Row.Amndcode == "" || Row.ValidFrom == null || Row.Pinforcat == "" || Row.Purorg == "" || Row.Sign == "" ||
					(Row.uiFields.Error == "Reject" && Row.uiFields.MassValidation.hasOwnProperty("ItemNo"))) {
					vFlag = false;
					oTabIconColor.VendorPartDetails = "Negative";
					Row.uiFields.Error = "Reject";
				} else {
					Row.uiFields.Error = "Default";
				}
			});
			oModelSSUDigitization.setProperty("/TabIconColor", oTabIconColor);
			return vFlag;
		},
		_getAmentmendService: function(){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			
			var vSign;
			if(typeof oPaperData.Sign == "number")
				vSign = oPaperData.Sign == 0 ? "POS":"NEG";
			var filters = [
//				new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, oPaperData.Sign),
				new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode)
			];
			oDataAmendmentModel.read("/ES_F4Amandment", {
				filters: filters,
				success: function (oData, oResponse) {
					oModelSSUDigitization.setProperty("/F4Amentment", oData.results);
					oModelSSUDigitization.refresh();
				},
				error: function (oResponse) {
					Message.error("Error loading Amendment.", {
						title: "Error"
					});
				}
			});
		},
		_getWorkFlow: function(){
			var oController = this;
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");

			var vFilters = [
				new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode),
//				new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, oPaperData.Sign),
//				new sap.ui.model.Filter("PaperPur", sap.ui.model.FilterOperator.EQ, oPaperData.PaperPur)
			];
			oDataAmendmentModel.read("/ES_Approver", {
				filters: vFilters,
				success: function (oData, oResponse) {
					oModelSSUDigitization.setProperty("/F4Approver", oData.results);
					oModelSSUDigitization.refresh();
					var vCycle = oModelSSUDigitization.getProperty("/PaperDataSet/Cycle") || (oData.results.length>0 && oData.results[0].Cycle);
					oController.formattInitiator(vCycle);
				},
				error: function (oResponse) {
					Message.error("Error loading approver.", {
						title: "Error"
					});
				}
			});
		
		},
		_getVendor: function (oParentModel,vSelectedValue){
			var oController = this;
//			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//			var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var filters = [];
			var vVendName = "";
			var vVendCode = "";
			var vVendLoc = "";
			var vCurrCode = "";
			var vExtPrice = "";
			var vPirNo = "";
			var vPurorg = "";
			var vPinforcat = "";
			var vPinfoCatText = "";
//			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			if (vSelectedValue.length > 0) {
				filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")));
				filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")));
				filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
				filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, ""));
				busyDialog.open();
				oDataAmendmentModel.read("/ES_Vendor", {
					filters: filters,
					success: function (oData, oResponse) {						
						oModelSSUDigitization.setProperty("/F4PinfoCategory", oData.results);
						if (oData.results.length > 0) {
							vVendName = oData.results[0].VendName;
							vVendCode = oData.results[0].VendCode;
							vVendLoc = oData.results[0].VendLoc;
							vCurrCode = oData.results[0].CurrCode;
							vExtPrice = oData.results[0].ExtPrice;
							vPirNo = oData.results[0].PirNo;
							vPurorg = oData.results[0].Purorg;
							vPinforcat = oData.results[0].Pinforcat;
							vPinfoCatText = oData.results[0].PinfoCatText;
							busyDialog.close();
						} else {
							busyDialog.close();
							sap.m.MessageToast.show(vSelectedValue + " either does not exist or not extended for " + oParentModel.getProperty("/Plant") + " plant.");
						}
						oParentModel.setProperty("/VName", vVendName);
						oParentModel.setProperty("/Vendor", vVendCode);
						oParentModel.setProperty("/VLocation", vVendLoc);
						oParentModel.setProperty("/Currency", vCurrCode);
						oParentModel.setProperty("/ExtPrice", vExtPrice);
						oParentModel.setProperty("/PirNo", vPirNo);
						oParentModel.setProperty("/Purorg", vPurorg);
						oParentModel.setProperty("/Pinforcat", vPinforcat);
						oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
					},
					error: function (oResponse) {
						serviceError(oResponse);
					}
				});
			} else {
				sap.m.MessageToast.show("Maintain vendor code.");
				oParentModel.setProperty("/VName", vVendName);
				oParentModel.setProperty("/Vendor", vVendCode);
				oParentModel.setProperty("/VLocation", vVendLoc);
				oParentModel.setProperty("/Currency", vCurrCode);
				oParentModel.setProperty("/ExtPrice", vExtPrice);
				oParentModel.setProperty("/PirNo", vPirNo);
				oParentModel.setProperty("/Purorg", vPurorg);
				oParentModel.setProperty("/Pinforcat", vPinforcat);
				oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
			}
		},
		_getXsrfToken: function() {
            var token = this.getOwnerComponent().getModel("oDataAmendmentModel").getHeaders()['x-csrf-token'];
            if (!token) {
                this.getOwnerComponent().getModel("oDataAmendmentModel").refreshSecurityToken(function(e, o) {
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
        },*/

		//--------- Local Methods End --------------------------

		//---------- Formatter Methods Start --------------------
        /*formatterECNIncUpload: function (vPaperType, vSign){
        	return (vPaperType == "01" && vSign == "POS") ? true : false;
        },*/
        
		/*formatterSignRadio: function (vValue){
			return vValue === "POS" ? 0 :1; //0 is Increase 1 is Decrease
		},
		
		formatterPaperPurRadio: function (vValue){
			return vValue === "01" ? 0 :1; //0 is ECN 1 is Non-ECN
		},*/
		
		attachEditable: function(vEditable,vNotCreateNew){
			return vEditable && vNotCreateNew;
		},
		
		PostToSapFieldEditable: function(vEditable, vPostToSAP){
			return vEditable || vPostToSAP ? true : false;
		},
		
		/*formattChange: function(vExist, vRev){
			if(vExist && vRev){
				return vRev - vExist;
			}
		},*/
		
		/*editableRadioIncDec: function(vEditable, vNav_Items){
			if(vEditable && !vNav_Items)
				return true;
			else
				return false;
		},*/
		visiblePartEdit: function(vEditable, vSector, vModel) {
			if (vEditable && vSector && vSector.length > 0 && vModel && vModel.length > 0) {
				return true;
			} else {
				return false;
			}
		},
		formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
		},
		formattGetModelPlant: function (vSector) {
			if (vSector) {
				vSector = typeof vSector == "string" ? vSector.split(",") : vSector;
				this._getModelPlant(vSector);
				return vSector;
			}
		},
		formattValidationError: function (vValue) {
			if (typeof vValue == "string") {
				return vValue != "" ? "Error" : "None";
			}
		},
		/*formatterPartEdit: function (vEditable, vPlant) {
			return vEditable && (vPlant != "" ? true : false);
		},*/
		formatterPartEdit: function (vEditable, vPlant, vInitiatedBySSU) {
			return vEditable && vInitiatedBySSU && (vPlant != "" ? true : false);
		},
		formatterVendorEdit: function (vEditable, vPlant, vPartNo) {
			return vEditable && (vPlant != "" ? true : false) && (vPartNo != "" ? true : false);
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
		formattWFvisible: function (oWFTable) {
			if (oWFTable) {
				return oWFTable.length > 0 ? true : false;
			} else {
				return false;
			}
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
//				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
				oModelSSUDigitization.setProperty("/PaperDataSet/Createdby", "");
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

		/*onSectorFinish: function (oEvent) {
			this._getModelPlant(oEvent.getSource().getSelectedKeys());
		},*/
		onSettingPartDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			columnsSetting(oController, vColumnListPath);
		},
		/*onAddForexItem: function () {
			var oController = this;
			var oItemFrag = xmlFragment(oController, "ItemCCR");
			var oModel = new JSONModel(getItemDetailsObjectAMD());
			oItemFrag.setModel(oModel);
			oItemFrag.isAddNew = true;
			oItemFrag.open();
		},
		onChangeTab: function () {
			this._validationDataFilled();
		},
		onOkItemDetail: function (oEvent) {
			var oController = this;
			var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oFragItem = oEvent.getSource().getParent();
			
			var vHeaderSign = oModelSSUDigitization.getProperty("/PaperDataSet/Sign");
			
			var vItemSign = oEvent.getSource().getParent().getModel().getProperty("/Sign");
			
			if((vItemSign=="+" || vItemSign == "") && vHeaderSign == "NEG" ) {// inc 0 dec 1
				sap.m.MessageToast.show("Settled Price should be lesser than Existing Price.");
				return;
			}
			if((vItemSign == "-" || vItemSign == "") && vHeaderSign == "POS" ){
				sap.m.MessageToast.show("Settled Price should be greater than Existing Price.");
				return;
			}
			
			if (vAllFilled && oFragItem.isAddNew) { // oModelSSUDigitization.getProperty("/isAddNew")
				var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
				var vChangedData = oFragItem.getModel().getData();
				var oFilter = $.grep(oNav_Items, function (grepRow) {
					return ((vChangedData.Plant === grepRow.Plant) && (vChangedData.Vendor === grepRow.Vendor) && (vChangedData.PartNo === grepRow.PartNo));
				});
				if (oFilter.length <= 0) {
					oController._setDataAfterEditItem(oEvent);
					oEvent.getSource().getParent().close();
				} else {
					sap.m.MessageToast.show("This Plant,Vendor,Part Number combination is already exist.");
				}
			} else if (vAllFilled) {
				oController._setDataAfterEditItem(oEvent);
				oEvent.getSource().getParent().close();
			}
		},
		onEdit: function () {
			var oController = this;
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
						oModelSSUDigitization.setProperty("/EditableFlag", false);
						var oPaperData = oController._fnDataBeforeSave();
						oPaperData.Action = "D";
						busyDialog.open();
						oController.getOwnerComponent().getModel(
							"oDataAmendmentModel").create("/ES_Header", oPaperData, {
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
											oModelSSUDigitization.setProperty("/NotCreateNew", true);
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
			var oArray = [];
			if (sap.ui.core.Element.registry) {
				sap.ui.core.Element.registry.forEach(function (row) {
					oArray.push(row)
				});
			}
			var oMandatoryFlag = oController._fnRequredFieldCheck(oArray);
			var vValiDataField = oController._validationDataFilled();

			if (oMandatoryFlag && vValiDataField && oModelSSUDigitization.getProperty("/BEValidation")) {
				var oDialog = new sap.m.Dialog({
					title: 'Comments',
					content: new sap.m.TextArea({
						value: "",
						rows: 3,
						cols: 50
					}),
					endButton: new sap.m.Button({
						text: 'OK',
						press: function (oEvent) {
							var oPaperData = oController._fnDataBeforeSave();
							oPaperData.Action = "S";
							oPaperData.UsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
							busyDialog.open();
							oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
								success: function (oData, oResponse) {
									oDialog.close();
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
					})
				});
				oDialog.open();
			} else {
				oModelSSUDigitization.setProperty("/EditableFlag", true);
				Message.error("Fill all the mandatory fields", {
					title: "Fill all fields"
				});
			}
		},*/
		onPrintPreview: function () {
			var oController = this;
			var oPdfViewer = new sap.m.PDFViewer();
//			var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var vPaperNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperNo");
			var sServiceUrl = oController.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			oPdfViewer.setSource(sServiceUrl+"/ES_AmendPDF(PaperNo='" + vPaperNo + "',TermsType='00')/$value?sap-client=100");
			oPdfViewer.setTitle("SSU Approval Paper");
			oPdfViewer.open();
		},
		onAttachment: function (oEvent) {
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
				new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor)
			];
			oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
			oAttachFrag.open();
		},
		/*onAttachDeleted: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oNavDms = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
//			var vSelectedIndex;
			$.each(oNavDms,function(i,row){
				if(row.Posnr == oEvent.getParameter("documentId")){
					var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
					oDataAmendmentModel.remove("/ES_DMS(Filekey='"+row.Filekey+"',TabId='"+row.TabId+"',Posnr='"+row.Posnr+"')/$value", {
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
		onDownldTempPartDet: function () {
			//instead of paper number pass paper code, that will get mass template
			var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			window.open(sServiceUrl+"/ES_AmendPDF(PaperNo='"+vPaperCode+"',TermsType='00')/$value");
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
						if (vExcelDataArray.length > 1 && vExcelDataArray.length <= 501) {
							vExcelDataArray.splice(0, 1);
							oController._fnMassDataSet(vExcelDataArray);
						} else if (vExcelDataArray.length > 501) {
							sap.m.MessageToast.show("Uploaded excel sheet data exceed. Maximum 500 rows.");
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
		onPartValueHelp: function (oEvent) {
			var oController = this;
			var oValueHelp = xmlFragment(oController, "ValueHelp");
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
		onVendorValHelp: function (e) {
			var oController = this;
			var oVendor = xmlFragment(oController, "ValueHelp");
			oVendor.setTitle("Vendor Search");
			var template = new sap.m.StandardListItem({
				title: "{VendName}",
				description: "{VendCode}",
				info: "{PinfoCatText}"
			});
			oVendor.bindAggregation("items", "/", template);
			oVendor.setModel(new JSONModel());
			oVendor.parentModel = e.getSource().getBindingContext().getModel();
			oVendor.open();
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
					oParentModel.setProperty("/Taxonomy", oSelectedData.Taxonomy);
					oParentModel.setProperty("/NetWtUniit", oSelectedData.NetWtUnit);
					
					oParentModel.setProperty("/Vendor", "");
					oParentModel.setProperty("/VName", "");
					oParentModel.setProperty("/VLocation", "");
					oParentModel.setProperty("/Currency", "");
					oParentModel.setProperty("/ExtPrice", "");
					oParentModel.setProperty("/PirNo", "");
					oParentModel.setProperty("/Purorg", "");
					oParentModel.setProperty("/Pinforcat", "");
					oParentModel.setProperty("/PinfoCatText", "");

				}
				if (e.getSource().getTitle() == "Vendor Search") {
					oParentModel.setProperty("/VName", oSelectedData.VendName);
					oParentModel.setProperty("/Vendor", oSelectedData.VendCode);
					oParentModel.setProperty("/VLocation", oSelectedData.VendLoc);
					oParentModel.setProperty("/Currency", oSelectedData.CurrCode);
					oParentModel.setProperty("/ExtPrice", oSelectedData.ExtPrice);
					oParentModel.setProperty("/PirNo", oSelectedData.PirNo);
					oParentModel.setProperty("/Purorg", oSelectedData.Purorg);
					oParentModel.setProperty("/Pinforcat", oSelectedData.Pinforcat);
					oParentModel.setProperty("/PinfoCatText", oSelectedData.PinfoCatText);
				}
			}
		},
		handleSearch: function (e) {
			var vSelectedValue = e.getParameter("value").toUpperCase();
			var filters = [];
			var valueHelp = e.getSource();
			var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
			var plant = e.getSource().parentModel.getProperty("/Plant");
			var PartNo = e.getSource().parentModel.getProperty("/PartNo");
			if (e.getSource().getTitle() == "Vendor Search") {
				if (vSelectedValue.length > 4) {
					valueHelp.setBusy(true);
					filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
					filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));
					filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
					filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X"));
					oDataAmendmentModel.read("/ES_Vendor", {
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
					oDataAmendmentModel.read("/ES_Part", {
						filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
							.FilterOperator.EQ, vSelectedValue)],
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
			}

		},
		onPlantCode: function (oEvent) {
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			oParentModel.setProperty("/PartNo", "");
			oParentModel.setProperty("/PartDesc", "");
			oParentModel.setProperty("/Vendor", "");
			oParentModel.setProperty("/VName", "");
			oParentModel.setProperty("/VLocation", "");
			oParentModel.setProperty("/Currency", "");
			oParentModel.setProperty("/ExtPrice", "");
			oParentModel.setProperty("/PirNo", "");
			oParentModel.setProperty("/Purorg", "");
			oParentModel.setProperty("/Pinforcat", "");
			oParentModel.setProperty("/PinfoCatText", "");
		},
		onSubmitVendorCode: function (oEvent) {
			var oController = this;
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			oController._getVendor(oParentModel,vSelectedValue);
		},
		onSubmitPartNum: function (oEvent) {
			var oController = this;
			var oParentModel = oEvent.getSource().getBindingContext().getModel();
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			var plant = oParentModel.getProperty("/Plant");
			var vSelectedValue = oEvent.getParameter("value").toUpperCase();
			if (vSelectedValue.length > 0) {
				busyDialog.open();
				oDataAmendmentModel.read("/ES_Part", {
					filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
						.FilterOperator.EQ, vSelectedValue)],
					success: function (oData, oResponse) {
						busyDialog.close();
						if (oData.results.length > 0) {
							oParentModel.setProperty("/PartNo", oData.results[0].PartNo);
							oParentModel.setProperty("/PartDesc", oData.results[0].PartDesc);
							oParentModel.setProperty("/Taxonomy", oData.results[0].Taxonomy);
							oParentModel.setProperty("/NetWtUniit", oData.results[0].NetWtUnit);
							
							oParentModel.setProperty("/Vendor", "");
							oParentModel.setProperty("/VName", "");
							oParentModel.setProperty("/VLocation", "");
							oParentModel.setProperty("/Currency", "");
							oParentModel.setProperty("/ExtPrice", "");
							oParentModel.setProperty("/PirNo", "");
							oParentModel.setProperty("/Purorg", "");
							oParentModel.setProperty("/Pinforcat", "");
							oParentModel.setProperty("/PinfoCatText", "");
						} else {
							sap.m.MessageToast.show(vSelectedValue + " either does not exist or not extended for " + plant + " plant.");
							oParentModel.setProperty("/PartNo", "");
							oParentModel.setProperty("/PartDesc", "");
							oParentModel.setProperty("/Taxonomy", "");
							oParentModel.setProperty("/NetWtUniit", "");
							
							oParentModel.setProperty("/Vendor", "");
							oParentModel.setProperty("/VName", "");
							oParentModel.setProperty("/VLocation", "");
							oParentModel.setProperty("/Currency", "");
							oParentModel.setProperty("/ExtPrice", "");
							oParentModel.setProperty("/PirNo", "");
							oParentModel.setProperty("/Purorg", "");
							oParentModel.setProperty("/Pinforcat", "");
							oParentModel.setProperty("/PinfoCatText", "");
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
				oParentModel.setProperty("/Taxonomy", "");
				oParentModel.setProperty("/NetWtUniit", "");
				
				oParentModel.setProperty("/Vendor", "");
				oParentModel.setProperty("/VName", "");
				oParentModel.setProperty("/VLocation", "");
				oParentModel.setProperty("/Currency", "");
				oParentModel.setProperty("/ExtPrice", "");
				oParentModel.setProperty("/PirNo", "");
				oParentModel.setProperty("/Purorg", "");
				oParentModel.setProperty("/Pinforcat", "");
				oParentModel.setProperty("/PinfoCatText", "");
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
				debugger;
				var oModel = oEvent.getSource().getModel();
				var oParentModel = oEvent.getSource().getBindingContext().getModel();
				var vExtPrice = oParentModel.getProperty("/ExtPrice");
				var vSign =  Number(vNewValue) - Number(vExtPrice);
				var vChangePercnd = vSign/vExtPrice*100;
				
				vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
				oParentModel.setProperty("/ChgPrctng",Math.abs(vChangePercnd).toFixed(2));
				oParentModel.setProperty("/DeltaPrice", vSign.toFixed(2));
				if(vSign == 0)
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
				}
				
				
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
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo") || "0";
			var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode") || "0";
			var slug =vPaperCode+"|"+vPaperNo+"|QBB|0|0|0|0|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
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
			
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo") || "0";
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
                	var vNav_DMS = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
                	var vLocation = oEvent.getParameter("files")[0].headers.location;// Temp code
                	var vPosnr = vLocation.slice(vLocation.lastIndexOf("Posnr")+7,vLocation.lastIndexOf("Posnr")+13); // Temp code
    				vNav_DMS = vNav_DMS ? vNav_DMS:[];
    				vNav_DMS.push({
    					"Filekey": vSlugValue[1],
						"TabId": vSlugValue[2],
						"PartNo": vSlugValue[3],
						"Plant": vSlugValue[5],
		                "Vendor": vSlugValue[4],
						"FrxRmStatus": vSlugValue[6],
						"Posnr": "",
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
        onPinfoCat: function(oEvent){
			var oModel = oEvent.getSource().getModel();
			oModel.setProperty("/ExtPrice", oEvent.getSource().getSelectedItem().getAdditionalText());
		},
		onAmentmendCode: function(oEvent){
			var oModel = oEvent.getSource().getModel();
			oModel.setProperty("/AmndcodeDesc", oEvent.getSource().getSelectedItem().getAdditionalText());
		},
		onChangeSign: function(oEvent){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSign =oEvent.getParameter("selectedIndex") == 0 ? "POS" : "NEG"; //0 is Increase 1 is Decrease;
			oModelSSUDigitization.setProperty("/PaperDataSet/Sign",vSign);
			oController._setUploadVisible();
			oController._getAmentmendService();
			oController._getWorkFlow();
		},
		onChangePaperPur: function(oEvent){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vPaperPur =oEvent.getParameter("selectedIndex") == 0 ? "01" : "02"; //0 is ECN 1 is Non-ECN
			oModelSSUDigitization.setProperty("/PaperDataSet/PaperPur",vPaperPur);
			oController._setUploadVisible();
//			oController._getWorkFlow();
		},
		_setUploadVisible: function(){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/ECNInc",(oPaperData.PaperPur == "01" && oPaperData.Sign == "POS") ? true : false);
			oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/ECNDec",(oPaperData.PaperPur == "01" && oPaperData.Sign == "NEG") ? true : false);
			oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/NonECNInc",(oPaperData.PaperPur == "02" && oPaperData.Sign == "POS") ? true : false);
			oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/NonECNDec",(oPaperData.PaperPur == "02" && oPaperData.Sign == "NEG") ? true : false);
		},
		onErrMsgValueHelp:function(e){
			var oController = this;
			var oValueHelp = xmlFragment(oController, "ErrorMsgPopOver");
			oValueHelp.toggle(e.getSource());			
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
			var ErrorData = oModelSSUDigitization.getProperty(selectedPath+"/uiFields/MassValidation");
			var oValidationError = [];
			if(ErrorData){
				if(ErrorData.PartNoFlag != ""){
					oValidationError.push({"BEError" :ErrorData.PartNoFlag});
				}
				if(ErrorData.VendorFlag != ""){
					oValidationError.push({"BEError" : ErrorData.VendorFlag});
				}
				if(ErrorData.PlantFlag != ""){
					oValidationError.push({"BEError" : ErrorData.PlantFlag});
				}
				if(ErrorData.AmndcodeFlag != ""){
					oValidationError.push({"BEError" :ErrorData.AmndcodeFlag});
				}
				if(ErrorData.ValidFromFlag != ""){
					oValidationError.push({"BEError" :ErrorData.ValidFromFlag});
				}
			}			
			oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
		},
		onAddCurrItem: function(){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oNav_Currency = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Currency");
			var oCurrData = getCurrencyStr();
			oCurrData.RvToDt = oNav_Currency[0].RvToDt;
			oCurrData.ExFrmDt = oNav_Currency[0].ExFrmDt;
			oCurrData.ExToDt = oNav_Currency[0].ExToDt;
			oCurrData.RvFrmDt = oNav_Currency[0].RvFrmDt;
			
			oNav_Currency.push(oCurrData);
			oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Currency", oNav_Currency);			
		},
		onSubmitPostToSap: function(oEvent){
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
						oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
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
					text: 'OK',
					press: function (oEvent) {
						var oPaperData = oController._fnDataBeforeSave();
						oPaperData.Action = "4"; // reject action is 4
						oPaperData.UsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
						busyDialog.open();
						oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
							success: function (oData, oResponse) {
								oDialog.close();
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
		
		}*/
		/*onDeleteCurrItem: function(oEvent){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getParameter("listItem").getBindingContextPath();
			oModelSSUDigitization.setProperty(vSelectedPath+"/Delete","X");
			oEvent.getSource().getBinding("items").filter([new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")])
		}*/
		
		
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
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo") || "0";
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
			
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo") || "0";
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
                	var vNav_DMS = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
                	var vLocation = oEvent.getParameter("files")[0].headers.location;// Temp code
                	var vPosnr = vLocation.slice(vLocation.lastIndexOf("Posnr")+7,vLocation.lastIndexOf("Posnr")+13); // Temp code
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
		
		_getXsrfToken: function() {
            var token = this.getOwnerComponent().getModel("oDataAmendmentModel").getHeaders()['x-csrf-token'];
            if (!token) {
                this.getOwnerComponent().getModel("oDataAmendmentModel").refreshSecurityToken(function(e, o) {
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
		
		
		onApprove: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");

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
						oPaperData.Action = "A";
						oPaperData.UsrLevel = oPaperData.Status;
						oPaperData.UsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
						busyDialog.open();
						oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
							success: function (oData, oResponse) {
								oDialog.close();
								var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
								if (vMsgReturn.Title == "Error") {
									sap.m.MessageBox.error(vMsgReturn.Message, {
										title: vMsgReturn.Title
									});
								} else if (vMsgReturn.Title == "Sucess") {
									sap.m.MessageBox.success(vMsgReturn.Message, {
										title: vMsgReturn.Title,
										onClose: function () {
											var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
											oRouter.getView("com.mahindra.ZSSU_Approve.view.Master").getController()._initialMethod();
										}
									});
								}
							},
							error: function (oResponse) {
								oDialog.close();
								serviceError(oResponse);
								busyDialog.close();
							}
						});
					}
				})
			});
			oDialog.open();
		},
		onReject: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
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
						var vUsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
						if(vUsrComment.length <= 4){
							sap.m.MessageToast.show("Write any reasons for rejection.");
							return;
						}
						var oPaperData = oController._fnDataBeforeSave();
						oPaperData.Action = "R";
						oPaperData.UsrLevel = oPaperData.Status;
						oPaperData.UsrComment = vUsrComment;
						busyDialog.open();
						oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
							success: function (oData, oResponse) {
								oDialog.close();
								var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
								if (vMsgReturn.Title == "Error") {
									sap.m.MessageBox.error(vMsgReturn.Message, {
										title: vMsgReturn.Title
									});
								} else if (vMsgReturn.Title == "Sucess") {
									sap.m.MessageBox.success(vMsgReturn.Message, {
										title: vMsgReturn.Title,
										onClose: function () {
											var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
											oRouter.getView("com.mahindra.ZSSU_Approve.view.Master").getController()._initialMethod();
										}
									});
								}
							},
							error: function (oResponse) {
								oDialog.close();
								serviceError(oResponse);
								busyDialog.close();
							}
						});
						oDialog.close();
					}
				})
			});
			oDialog.open();
		}
			//--------- Event Methods End -----------------

	});
});