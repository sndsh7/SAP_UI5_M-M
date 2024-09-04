sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Message) {
	var oController,oDataAmendmentModel; 
	"use strict";
	return Controller.extend("com.mahindra.ZSSU_Approve.controller.CIT", {
		onInit: function () {
			oController = this;
			oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//			var oModelDefault = new sap.ui.model.json.JSONModel();
//			var sUrl = jQuery.sap.getModulePath("com.mahindra.ZSSU_Approve", "/json/dataSet.json");
//			oModelDefault.loadData(sUrl, "", false);
//			oController.getView().setModel(oModelDefault, "ModelDefaultDataSet");
//			var useDetails = new JSONModel();
//			useDetails.loadData("/sap/bc/ui2/start_up", null, false);
//			oModelDefault.setProperty("/UserId", useDetails.getProperty("/id"));
//
////			 var vStartupPara = getStartupParameters(this);
//			 oController._onObjectMatched(vStartupPara.PaperNumber);
//			oController._onObjectMatched();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("CIT").attachPatternMatched(this._onObjectMatched, this);
			
		},//--------- Local Methods Start -------------------------
		_onObjectMatched: function (oEvent) {
			var vPaperNo = oEvent.getParameters().arguments.Number;
			var vPaperCode = oEvent.getParameters().arguments.PaperCode;
			var oModel = new sap.ui.model.json.JSONModel();
			var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_Approve', '/json/CIT.json');
			oModel.loadData(sUrl, "", false);
			oModel.setProperty("/PageTitle",("Payment Term"));
			oController.getView().setModel(oModel, "ModelSSUDigitization");
//			oModel.setProperty("/UserId", oController.getView().getModel("ModelDefaultDataSet").getProperty("/UserId"));
			 oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
//			if (vPaperNo == "new") {
//				oModel.setProperty("/NotCreateNew", false);
//				oModel.setProperty("/EditableFlag", true);
//				oModel.setProperty("/DisplayOnlyFlag", false);
//				var oData = getHeaderObjectCIT();
//				oData.PaperCode= vPaperCode;
//				oModel.setProperty("/PaperDataSet", oData);
//				oController._getAmentmendService();
//			} else {
//				 oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
////				 oController._getAmentmendService();
////				 oController._fnAfterGettingBEData(oModel.getProperty("/PaperDataSet"));
//				 
//				 
//			}
			oController._fnCreatingTables();
		},
		_fnGetNPIHeaderData: function (vPaperNo,vPaperCode) {
			var oController = this;
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
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			// oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
			oData.Model = oData.Model ? oData.Model.split(",") : [];
			oData.Nav_Items = oData.Nav_Items.results || oData.Nav_Items;
			oData.Nav_DMS = oData.Nav_DMS.results  || oData.Nav_DMS;
			oData.Nav_Log = oData.Nav_Log.results  || oData.Nav_Log;
			oData.Nav_Wf = oData.Nav_Wf.results  || oData.Nav_Wf;
			
			
//			oData.TermsType = oData.TermsType == "1" ? 0 : 1; //0 is Payment Term and 1 is Inco Term;
//			oData.PriceChange = oData.PriceChange == "Y" ? 0 : 1;
			
			$.each(oData.Nav_Items, function (i, Row) {
				Row.uiFields ={
					    "Error": "Default",
					    "ItemNo": ""
					  };
			});
			oModelSSUDigitization.setProperty("/PaperDataSet", oData);
			oController._getAmentmendService();
			if (oData.Status === "S" || oData.Status === "R")
				oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);			
			oModelSSUDigitization.refresh();
			
//			oController._getWorkFlow();
			// oController._validationDataFilled();
		},
		//---------- Formatter Methods Start --------------------
		formatterTermsType : function(vTermsType){
			if(vTermsType)
				return vTermsType == "01" ? "Payment Term" : "Inco Term";
		},
		formatterPriceChange : function(vPriceChange){
			if(vPriceChange){
				return vPriceChange == "Y" ? "Yes" : "No";
			}
		},
		formatterHeaderText: function(vPaperNumber, vSign){
			if(vPaperNumber&&vSign)
				return vSign =="POS" ? vPaperNumber +"(Increasing)": vPaperNumber+"(Decreasing)";
			else
				return vPaperNumber;
		},
		formatterPinfoCatText : function(vPinfoCat){
			debugger;
			if(vPinfoCat)
				return vPinfoCat == "0" ? "Standard" : "Subcontracting";
		},
		visiblePartEdit : function(vEditable, vSector, vModel) {
			if (vEditable && vSector && vSector.length > 0 && vModel && vModel.length > 0) {
				return true;
			} else {
				return false;
			}
		},
		formattValidationError: function (vValue) {
			if (typeof vValue == "string") {
				return vValue != "" ? "Error" : "None";
			}
		},
		formatterPartEdit: function (vEditable, vPlant) {
			return vEditable && (vPlant != "" ? true : false);
		},
		formatterVendorEdit: function (vEditable, vPlant, vPartNo) {
			return vEditable && (vPlant != "" ? true : false) && (vPartNo != "" ? true : false);
		},
		//--------- Event Methods Start -------------------------

//		onSectorFinish: function (oEvent) {
//			this._getModelPlant(oEvent.getSource().getSelectedKeys());
//		},
		
//		onEdit: function () {
//			oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", true);
//			oController.getView().getModel("ModelSSUDigitization").setProperty("/BEValidation", false);
//		},
		
		//-------------------- Export Mass Upload File -------------------
		/*onMassUpload : function(oEvent){
			if (oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Nav_Items").length >= 50) {
				sap.m.MessageToast.show("Mass upload not allowed, because more than 50 items already added.");
				oEvent.getSource().clear();
				return;
			}
			var file = oEvent.getParameter("files")[0];          // reading files
			if (file && window.FileReader){
				var reader = new FileReader();
				reader.onload = function (e) {
					var data = e.target.result;
					var result1 = {};
//					var result = oController.ArrayBufferString(data);
					var wb = XLSX.read(data, {
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
		},*/
		
		
//		_fnMassDataSet : function(vExcelDataArray){
//			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//			var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
//			var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
//			var oFilter;
//			$.each(vExcelDataArray, function (MainIndex, row) {
//				oFilter = $.grep(oMassData, function (grepRow) {
//					return ((row.Plant === grepRow.Plant) && (row.Vendor_Code === grepRow.Vendor) && (row.Part_Number === grepRow.PartNo));
//				});
//				if (oFilter.length <= 0) {
//					var vValidFrom = row.Valid_From_Date || "";
//
//					var oItemData = getItemDetailsObjectCIT();
//					oItemData.Plant = row.Plant || "";
//					oItemData.Vendor = row.Vendor_Code || "";
//					oItemData.PartNo = row.Part_Number || "";
//					oItemData.SettledPrice = row.Amount || "0";
//					oItemData.ValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
//					oItemData.Amndcode = row.Amendment_Code || "";
//					oItemData.Pinforcat = row.Doc_type || "";
//					oItemData.NewPayTerm = row.New_Payment_Term || "";
//					oItemData.Remarks = row.Remarks || "";
//					oMassData.push(oItemData);
//					
////					oMassData.push({
////						"Plant": row.Plant || "",
////						"Vendor": row.Vendor_Code || "",
////						"VName": "",
////						"VLocation": "",
////						"PartNo": row.Part_Number || "",
////						"PartDesc": "",
////						"Currency": "",
////						"PirNo": "",
////						"ExtPrice": "",
////						"SettledPrice": row.Settled_Price || "0",
////						"ChgPrctng": "",
////						"ValidFrom": new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null,
////						"Amndcode": row.Price_Change_Code || "",
////						"AmndcodeDesc": "",
////						"Sign": "",
////						"Taxonomy": "",
////						"Pinforcat": "",
////						"Purorg": "",
////						"NetWtUniit": row.Net_Weight || "KG",
////						"Remarks": row.Remarks || ""
////					});
//					
////					var index = oMassData.length - 1;
////					oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);
//
//				}
//
//			});
//			oController._validationMass(oMassData);
//			oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);
//		},
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
							var oItemFrag = xmlFragment(oController, "ItemCIT");
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
		// On Select Attachment in table item 		
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
		
//		on Setting Botton
		onSettingPartDetails: function () {
			var oController = this;
			var vColumnListPath = "ModelSSUDigitization>/PartDet";
			columnsSetting(oController, vColumnListPath);
		},
		

//	Calling Amendement Service 
	_getAmentmendService : function(oEvent){
		debugger;
//		var oParentModel = oEvent.getSource().getBindingContext().getModel();
//		var vNewValue = oEvent.getSource().getValue()
		var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
		var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
		var vTermsType = oModelSSUDigitization.getProperty("/PaperDataSet/TermsType");
		vTermsType = vTermsType == "01" ? "01" : "02";
//		var vExtPrice = oParentModel.getProperty("/ExtPrice");
//		var vSign =  Number(vNewValue) - Number(vExtPrice)>=0?"+":"-";
//		vSign = vSign == "+" ? "POS":"NEG";
		var filters = [
			new sap.ui.model.Filter("TermsType", sap.ui.model.FilterOperator.EQ, vTermsType),
			new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)
		];
		oDataAmendmentModel.read("/ES_F4Amandment", {
			filters: filters,
			success: function (oData, oResponse) {
				oModelSSUDigitization.setProperty("/F4Amentment", oData.results);
//				oModelSSUDigitization.setProperty("/PaperDataSet/Sign",oData.results[0].Sign);
				oModelSSUDigitization.refresh();
			},
			error: function (oResponse) {
				Message.error("Error loading Amendment.", {
					title: "Error"
				});
			}
		});
	},
//-------------------------- Formatter -------------------
	
//	IncoTerm Visiblity Formatter based on Selected RadioButton
	visibleInco: function(vIncoValue){
		return vIncoValue == "01" ? false:true;
	},
//	Payterm Visiblity Formatter based on Selected RadioButton
	visiblePayTerm : function(vPaytermValue){
		return vPaytermValue == "01" ? true:false;
	},
	
//	On Data before save 
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
		oPaperData.PaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
		oPaperData.TermsType = oPaperData.TermsType;
		oPaperData.PriceChange = oPaperData.PriceChange;
		oPaperData.Sign = ""			
		oPaperData.Nav_Log = [];
		oPaperData.Nav_Wf = [];
		oPaperData.Nav_Ret = [];
		oPaperData.Nav_DMS = [];
		$.each(oPaperData.Nav_Items, function (i, Row) {
			// Row.YearBase = Row.YearBase.toString();
			delete Row.uiFields;
			delete Row.__metadata;
//			delete Row.PinfoCatText;
		});
		return oPaperData;
	},
		
//    Formatter for open the link in upload collection
    formatterGetDmsURL : function(vKey, vPosnr, vTabId) {
		var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
		return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
	},
		
//	To show smart form on Print Preview Button
	onPrintPreview: function () {
		var oController = this;
		var oPdfViewer = new sap.m.PDFViewer();
//		var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
		var vPaperNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperNo");
		var vTermsType = "00";
		var sServiceUrl = oController.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
		oPdfViewer.setSource(sServiceUrl+"/ES_AmendPDF(PaperNo='" + vPaperNo + "',TermsType='"+ vTermsType +"')/$value?sap-client=100");
		oPdfViewer.setTitle("SSU Approval Paper");
		oPdfViewer.open();
	},
//	========================== Work Flow Codes ==================
	onChangeInitiator: function (oEvent) {
		var oController = this;
		var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
		if (oEvent.getParameter("selectedItem")) {
			oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oEvent.getParameter("selectedItem").getKey());
		} else {
			oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
		}
	},
	// -------------- formatter for initiator -------
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
			oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
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
//	Visible formatter for table in workflow
	formattWFvisible: function (oWFTable) {
		if (oWFTable) {
			return oWFTable.length > 0 ? true : false;
		} else {
			return false;
		}
	},
	
	//--------- Event Methods Start for Approval -----------------
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
	
		//--------- Event Methods End for Approval -----------------
	});
});