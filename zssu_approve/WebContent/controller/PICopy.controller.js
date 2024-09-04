sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	"use strict";

	return Controller.extend("com.mahindra.ZSSU_Approve.controller.PICopy", {

		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("PIC").attachPatternMatched(this._onObjectMatched, this);
		},
		//--------- Local Methods Start -------------------------
		_onObjectMatched: function (oEvent) {
			var oController = this;
			var vPaperNo = oEvent.getParameters().arguments.Number;
			var vPaperCode = oEvent.getParameters().arguments.PaperCode;
			var oModel = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_Approve', '/json/PICopyData.json');
			oModel.loadData(sUrl, "", false);
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			oModel.setProperty("/UserId", sap.ui.Device.userId);
			
			oController.getView().setBusy(true);
			var vParmeters = {
				"$expand": "Nav_Items/Nav_Forex,Nav_Items/Nav_RM,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret",
			};
			oDataNewPinfoModel.read("/ES_NPIHeader(NpiNo='"+vPaperNo+"',PaperCode='"+vPaperCode+"')", {
//				oDataNewPinfoModel.read("/ES_NPIHeader('" + vPnifoNumber + "')", {
				urlParameters: vParmeters,
				success: function (oData, oResponse) {
					oController._fnAfterGettingBEData(oData);
					oController.getView().setBusy(false);
					var filters = [new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oData.Initiator),
						new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)];
					oDataNewPinfoModel.read("/ES_Approver", {
						filters: filters,
						success: function (oData, oResponse) {
							oModel.setProperty("/F4Approver", oData.results);
							oModel.refresh();
							oController.formattInitiator(oModel.getProperty("/PaperDataSet/Cycle"));
							// busyDialog.close();
						},
						error: function (oResponse) {
							Message.error("Error loading approver.", {
								title: "Error"
							});
							// busyDialog.close();
						}
					});
				},
				error: function (oResponse) {
					Message.error("Error while getting data.", {
						title: "Error"
					});
					oController.getView().setBusy(false);
				}
			});

			/*oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
			var filters = [new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oModel.getProperty("/UserId")),
				new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)];
			oDataNewPinfoModel.read("/ES_Approver", {
				filters: filters,
				success: function (oData, oResponse) {
					oModel.setProperty("/F4Approver", oData.results);
					oModel.refresh();
					oController.formattInitiator(oModel.getProperty("/PaperDataSet/Cycle"));
					// busyDialog.close();
				},
				error: function (oResponse) {
					Message.error("Error loading approver.", {
						title: "Error"
					});
					// busyDialog.close();
				}
			});*/
			oController.getView().setModel(oModel, "ModelSSUDigitization");
			oController._fnCreatingTables();
		},
		/*_fnGetNPIHeaderData: function (vPnifoNumber, vPaperCode) {
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
		},*/
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
				if (typeof Row.ValidFrom == "string"){
                    Row.ValidFrom = new Date( Row.ValidFrom);
				}
			});
			if (oData.Status === "S" || oData.Status === "R")
				oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
			else if(oData.Status === "IC")
				oModelSSUDigitization.setProperty("/PostToSAP", true);
			else if(oData.Status === "NR")
				oModelSSUDigitization.setProperty("/NonSSURequest", true);
			
			if(oData.Initiator != oData.Createdby)
				oModelSSUDigitization.setProperty("/InitiatedBySSU", false);
			
			oModelSSUDigitization.setProperty("/PaperDataSet", oData);
			oModelSSUDigitization.refresh();
//			oController._validationDataFilled();
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
				
				Row.ValidFrom = oController._uiDateToBE(Row.ValidFrom);
	            
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
		
		_uiDateToBE: function(oUiDate){
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
		},

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
						icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
						tooltip: "Display",
						visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
						press: function (oEvent) {
							var oItemFrag = xmlFragment(oController, "ItemPICopy");
							oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
							oItemFrag.open();
						}
					})
				]
			});
			createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
		},

		_fnGetTaxCodeService: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vFilters = [];
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			oDataNewPinfoModel.read("/ES_TaxCode", {
				// filters: vFilters,
				success: function (oData, oResponse) {
					oModelSSUDigitization.setProperty("/F4TaxCode", oData.results);
					busyDialog.close();
				},
				error: function (oResponse) {
					serviceError(oResponse)
				}
			});
		},

		_setDisplayFragmentModel: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
		},
		//--------- Local Methods End --------------------------

		//---------- Formatter Methods Start --------------------
		attachEditable: function(vEditable,vNotCreateNew){
			return vEditable && vNotCreateNew;
		},
		
		formattPInfoCatText:function(vPinforcat){
			return vPinforcat === '0' ? 'Standard' : 'SubContracting';
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
		
		visiblePartEdit: function (vEditable, vSector, vModel) {
			if (vEditable && vSector.length > 0 && vModel.length > 0) {
				return true;
			} else {
				return false;
			}
		},
		formatterGetDmsURL: function (vKey, vPosnr) {
			return "/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_DMSDisplay(Filekey='" + vKey + "',Posnr='" + vPosnr + "')/$value";
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
		formatterPartEdit: function (vEditable, vPlant, vInitiatedBySSU) {
			return vEditable && vInitiatedBySSU &&  (vPlant != "" && vPlant != undefined  ? true : false);
		},
		/*formatterKeyEdit: function (vEditable, vIsAddNew) {
			return vEditable && vIsAddNew;
		},*/

		formattValidationError: function (vValue) {
			if (typeof vValue == "string") {
				return vValue != "" ? "Error" : "None";
			}
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
		onPrintPreview: function () {
			var oController = this;
			var oPdfViewer = new sap.m.PDFViewer();
			var vNpiNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/NpiNo");
			var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF(NpiNo='" + vNpiNo + "',PaperCode='"+vPaperCode+"')/$value?sap-client=100");
			oPdfViewer.setTitle("P-Info Approval Paper");
			oPdfViewer.open();
		},
		onSettingPartDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			columnsSetting(oController, vColumnListPath);
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
						oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
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
						oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
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
		/*onChangeInitiator: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			if (oEvent.getParameter("selectedItem")) {
				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oEvent.getParameter("selectedItem").getKey());
			} else {
				oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
			}
		},*/

		//--------- Event Methods End -----------------

	});

});