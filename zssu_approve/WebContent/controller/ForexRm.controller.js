sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	"use strict";
	return Controller.extend("com.mahindra.ZSSU_Approve.controller.ForexRm", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("FRX").attachPatternMatched(this._onObjectMatched, this);
		},
		
		//--------- Local Methods Start -------------------------
		_onObjectMatched: function (oEvent) {
			var oController = this;
			var vPaperNo = oEvent.getParameters().arguments.Number;
			var vPaperCode = oEvent.getParameters().arguments.PaperCode;
			var oModel = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_Approve', '/json/forex.json');
			oModel.loadData(sUrl, "", false);
			oModel.setProperty("/PageTitle",( vPaperCode == "FRX" ? "Foreign Exchange" : "Raw Material"));
			oController.getView().setModel(oModel, "ModelSSUDigitization");
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			if (vPaperNo == "new") {
				oModel.setProperty("/NotCreateNew", false);
				oModel.setProperty("/EditableFlag", true);
				oModel.setProperty("/DisplayOnlyFlag", false);
				var oData = getHeaderObject();
				oData.PaperCode= vPaperCode;
				oModel.setProperty("/PaperDataSet", oData);
			} else {
				
				 oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
			}
			
			oDataAmendmentModel.read("/ES_F4PaperPurp", {
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

			oController._fnCreatingTables();
		},
		_fnGetNPIHeaderData: function (vPaperNo,vPaperCode) {
			var oController = this;
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			oController.getView().setBusy(true);
			var vParmeters = {
					"$expand": "Nav_Items,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret,Nav_Currency",
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
			oData.Nav_Items = oData.Nav_Items.results || oData.Nav_Items;
			oData.Nav_DMS = oData.Nav_DMS.results  || oData.Nav_DMS;
			oData.Nav_Log = oData.Nav_Log.results  || oData.Nav_Log;
			oData.Nav_Wf = oData.Nav_Wf.results  || oData.Nav_Wf;
			oData.Nav_Currency = oData.Nav_Currency.results  || oData.Nav_Currency;
			
			$.each(oData.Nav_Items, function (i, Row) {
				Row.uiFields ={
					    "Error": "Default",
					    "ItemNo": ""
					  };
			});
			oModelSSUDigitization.setProperty("/PaperDataSet", oData);
			if (oData.Status === "S" || oData.Status === "R")
				oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);			
			oModelSSUDigitization.refresh();
			oController._getAmentmendService();
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
			oPaperData.Sector = oPaperData.Sector.toString();
			oPaperData.Model = oPaperData.Model.toString();
			oPaperData.Nav_Log = [];
			oPaperData.Nav_Wf = [];
			oPaperData.Nav_Ret = [];
			oPaperData.Nav_DMS = [];
			$.each(oPaperData.Nav_Items, function (i, Row) {
				delete Row.uiFields;
				delete Row.__metadata;
			});
			return oPaperData;
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
							var oItemFrag = xmlFragment(oController, "ItemForex");
							oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
							oItemFrag.open();
						}
					})
				]
			});
			createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
		},
		_setDisplayFragmentModel: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
			return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
		},
		_getAmentmendService: function(){
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
			var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
			var filters = [
				new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, oPaperData.Sign),
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
		//--------- Local Methods End --------------------------

		//---------- Formatter Methods Start --------------------
		
		formattChange: function(vExist, vRev){
			if(vExist && vRev){
				return vRev - vExist;
			}
		},
		
		formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
			var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
			return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
		},
		formattWFvisible: function (oWFTable) {
			if (oWFTable) {
				return oWFTable.length > 0 ? true : false;
			} else {
				return false;
			}
		},
		//---------- Formatter Methods End ------------

		//--------- Event Methods Start -------------------------
		onSettingPartDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			columnsSetting(oController, vColumnListPath);
		},
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
				new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor),
				new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
			];
			oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
			oAttachFrag.open();

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
			var vPlant =  this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet").Plant || "0";
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
		},
		
		
			//--------- Event Methods End -----------------

	});
});