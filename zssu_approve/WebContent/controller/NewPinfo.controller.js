sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	"use strict";

	return Controller.extend("com.mahindra.ZSSU_Approve.controller.NewPinfo", {

		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("NPI").attachPatternMatched(this._onObjectMatched, this);
		},
		//--------- Local Methods Start -------------------------
		_onObjectMatched: function (oEvent) {
			var oController = this;
			var oModel = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_Approve', '/json/newPInfoData.json');
			oModel.loadData(sUrl, "", false);
			var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
			oController.getView().setBusy(true);
			var vPnifoNumber = oEvent.getParameters().arguments.Number;
			var vParmeters = {
				"$expand": "Nav_Items/Nav_Forex,Nav_Items/Nav_RM,Nav_DMS,Nav_Log,Nav_Wf",
			};
			oDataNewPinfoModel.read("/ES_NPIHeader(NpiNo='"+vPnifoNumber+"',PaperCode='NPI')", {
//			oDataNewPinfoModel.read("/ES_NPIHeader('" + vPnifoNumber + "')", {
				urlParameters: vParmeters,
				success: function (oData, oResponse) {
					oController._fnAfterGettingBEData(oData);
					oController.getView().setBusy(false);
					var filters = [new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oData.Initiator),
						new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, "NPI")];
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

			oController.getView().setModel(oModel, "ModelSSUDigitization");
			oController._fnCreatingTables();

		},
		_fnAfterGettingBEData: function (oData) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			oData.Nav_Items = oData.Nav_Items.results;
			oData.Nav_DMS = oData.Nav_DMS.results;
			oData.Nav_Log = oData.Nav_Log.results;
			oData.Nav_Wf = oData.Nav_Wf.results;
			$.each(oData.Nav_Items, function (i, Row) {
				Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
				Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
				Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
				Row.Nav_Forex = Row.Nav_Forex.results;
				Row.Nav_RM = Row.Nav_RM.results;
			});
			oModelSSUDigitization.setProperty("/PaperDataSet", oData);
			oModelSSUDigitization.refresh();
		},
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
					new sap.m.Button({
						icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
						tooltip: "Display",
						visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
						press: function (oEvent) {
							var oItemFrag = xmlFragment(oController, "ItemDetails");
							oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
							oItemFrag.open();
						}
					})
				]
			});
			createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
		},
		_setEditFragmentModel: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			var objectData = $.extend({}, oModelSSUDigitization.getProperty(vSelectedPath));
			// var vSelectedPathVali = oController._fnDataSettingValidation(vSelectedPath);
			// objectData.Validation = oModelSSUDigitization.getProperty(vSelectedPathVali);
			return new JSONModel(objectData);
		},
		_setDisplayFragmentModel: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
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
		_fnLoadFXIndexVal: function (vForexIndex) {
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
		//--------- Local Methods End -----------------

		//---------- Formatter Methods Start --------------------
		formatterForexRMRequired: function (vForexRMRequired){
			return vForexRMRequired ==='X' ? false : true;
		},
		formatterRadioYesNo: function (vValue){
			return vValue === "X" ? 1 :0; //0 is yes 1 is no
		},
		
		
		formattRMForexCont: function(oNavItem){
			if(oNavItem){
				var oFilter = $.grep(oNavItem,function(row){return row.ForexRMRequired==""});
				if(oFilter.length>0)
					return false;
				else
					return true;
			}
		},
		
		formattRMForexContNot: function(oNavItem){
			if(oNavItem){
				var oFilter = $.grep(oNavItem,function(row){return row.ForexRMRequired==""});
				if(oFilter.length>0)
					return true;
				else
					return false;
			}
		},
		
		formattWFvisible: function (oWFTable) {
			if (oWFTable) {
				return oWFTable.length > 0 ? true : false;
			}
		},
		formattValidationError: function (vValue) {
			return vValue == "X" ? "Error" : "None";
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
		formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
		},
		/*formatterTableVisible: function (vValue) {
			return vValue == 0 ? true : false;
		},*/
		formatterTableVisible: function (vForexRequired , vForexRMRequired) {
			return (vForexRMRequired == 0 && vForexRequired == 0) ? true : false;
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
		onClickFullScreen: function (oEvent) {
			var oSplitScreen = this.getView().getParent().getParent();
			if (oSplitScreen.getMode() === "ShowHideMode")
				oSplitScreen.setMode('HideMode');
			else
				oSplitScreen.setMode('ShowHideMode');
		},
		_fnDataBeforeSave: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			delete oPaperData.__metadata;
			oPaperData.Nav_Log = [];
			oPaperData.Nav_Wf = [];
			oPaperData.Nav_Ret = [];
			oPaperData.Nav_DMS = [];
			$.each(oPaperData.Nav_Items, function (i, Row) {
				delete Row.__metadata;
				Row.ToolCostRequired = Row.ToolCostRequired == 1 ? "X" : "";
				Row.ForexRequired = Row.ForexRequired == 1 ? "X" : "";
				Row.SparePartSameOE = Row.SparePartSameOE == 1 ? "X" : "";

				$.each(Row.Nav_Forex, function (i, RowFX) {
					delete RowFX.__metadata;
				});
				$.each(Row.Nav_RM, function (i, RowRM) {
					delete RowRM.__metadata;
				});
			});
			/*$.each(oPaperData.Nav_DMS, function (i, Row) {
				delete Row.__metadata;
			});*/
			return oPaperData;
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
								$.each(oPaperData.Nav_Items, function (i, Row) {
									Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
									Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
									Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
								});
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
								$.each(oPaperData.Nav_Items, function (i, Row) {
									Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
									Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
									Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
								});
								serviceError(oResponse);
								busyDialog.close();
							}
						});
						oDialog.close();
					}
				})
			});
			oDialog.open();
		},
		onPrintPreview: function () {
			var oController = this;
			var oPdfViewer = new sap.m.PDFViewer();
			var vNpiNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/NpiNo");
			var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
			oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF(NpiNo='" + vNpiNo + "',PaperCode='"+vPaperCode+"')/$value?sap-client=100");
//			oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF('" + vNpiNo + "')/$value?sap-client=100");
			oPdfViewer.setTitle("P-Info Approval Paper");
			oPdfViewer.open();
		},
		onPrintLOBA: function(){
			var oController = this;
			var oPdfViewer = new sap.m.PDFViewer();
			var vNpiNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/NpiNo");
			var vVendor = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Nav_Items/0/Vendor");
			oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_LoBAPdf(NpiNo='" + vNpiNo + "',Vendor='"+vVendor+"')/$value?sap-client=100");
			oPdfViewer.setTitle("LoBA");
			oPdfViewer.open();
		},
		onSettingPartDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			columnsSetting(oController, vColumnListPath);
		},
		onSettingBRDetails: function () {
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
		onEditDispRM: function (oEvent) {
			var oController = this;
			var oRMFrag = xmlFragment(oController, "RMDetails");
			oRMFrag.setModel(oController._setEditFragmentModel(oEvent));
			oController._fnLoadIndexRMVal(oRMFrag.getModel().getProperty("/RmIndexCycle"));
			oRMFrag.open();
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
		},
		onAttachment: function (oEvent) {
			var oController = this;
			var oAttachFrag = xmlFragment(oController, "Attachment");
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath("ModelSSUDigitization");
			oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
			// var vPartNo = oModelSSUDigitization.getProperty(vSelectedPath + "/PartNo");
			var vSectedData = oModelSSUDigitization.getProperty(vSelectedPath);
			var vSelectedTab = oModelSSUDigitization.getProperty("/SelectedTab");
			var vFilters = [
				new sap.ui.model.Filter("TabId", sap.ui.model.FilterOperator.EQ, vSelectedTab),
				new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, vSectedData.PartNo),
				new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSectedData.Plant),
				new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor),
				new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
			];
			oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
			oAttachFrag.open();

		},
		onExpandToolCost: function (oEvent) {
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
							icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
							tooltip: "Display",
							visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
							press: function (oEvent) {
								var oToolCostFrag = xmlFragment(oController, "ToolCost");
								oToolCostFrag.setModel(oController._setDisplayFragmentModel(oEvent));
								oToolCostFrag.open();
							}

						})
					]
				});
				createDynamicMTable(oController, oTableToolcost, vColumnListPath, vTableBindingPath, oAction);
			}

		},
		onExpandBR: function (oEvent) {
			var oController = this;
			var oTableBRDetails = sap.ui.getCore().byId(oEvent.getSource().getContent()[1].getId());
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
			var vFrxRmStatus = "0";
			var vParent = vSelectedPath.split("/");
			vParent.splice(4, 2);
			vParent = vParent.join("/");
			var vTemp = vSelectedPath.split("/");
			vTemp = vTemp.splice(4, 1);
			if (vTemp[0] == "Nav_Forex") {
				vFrxRmStatus = "FX";
			} else if (vTemp[0] == "Nav_RM") {
				vFrxRmStatus = "RM";
			}
			
			var oFile =oEvent.getParameter("files")[0];
			
			var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo") || "0";
			var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode") || "0";
			var vTabId = oModelSSUDigitization.getProperty("/SelectedTab") || "0";
			var vPartNo = oModelSSUDigitization.getProperty(vParent + "/PartNo") || "0";
			var vPlant =  oModelSSUDigitization.getProperty(vParent + "/Plant") || "0";
			var vVendor = oModelSSUDigitization.getProperty(vParent + "/Vendor") || "0";
			
			//PaperCode|FileKey|TabId|PartNo|Vendor|Plant|FxRmStatus|FileName|FileDesc|FileSize
			var slug =vPaperCode+"|"+vPaperNo+"|"+vTabId+"|"+vPartNo+"|"+vVendor+"|"+vPlant+"|"+vFrxRmStatus+"|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
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
		onChangeExecutive: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oF4Approver = oModelSSUDigitization.getProperty("/F4Approver")[0];
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver1", oF4Approver.Appr1);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver2", oF4Approver.Appr2);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver3", oF4Approver.Appr3);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver4", oF4Approver.Appr4);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver5", oF4Approver.Appr5);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver6", oF4Approver.Appr6);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver7", oF4Approver.Appr7);
			oModelSSUDigitization.setProperty("/PaperDataSet/Approver8", oF4Approver.Appr8);
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
		onCheckNumberLeng12: function (oEvent) {
			var vNewValue = oEvent.getParameter("newValue");
			var vNewValueArray = vNewValue.split(".");
			if (vNewValueArray[0].length > 9 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 13) {
				vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 9) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0, 9);
				oEvent.getSource().setValue(vNewValue);
			}

		},
		onCheckNumberLeng16: function (oEvent) {
			var vNewValue = oEvent.getParameter("newValue");
			var vNewValueArray = vNewValue.split(".");
			if (vNewValueArray[0].length > 13 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 16) {
				vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 13) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0,
					13);
				oEvent.getSource().setValue(vNewValue);
			}
		},
		onCheckNumberLeng4: function (oEvent) {
			var vNewValue = oEvent.getParameter("newValue");
			var vNewValueArray = vNewValue.split(".");
			if (vNewValue.length > 4) {
				oEvent.getSource().setValue(vNewValueArray[0].slice(0, 4));
			} else {
				oEvent.getSource().setValue(vNewValueArray[0]);
			}
		}

		//--------- Event Methods End -----------------

	});

});