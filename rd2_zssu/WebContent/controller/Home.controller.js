sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/unified/Calendar",
	"sap/ui/export/Spreadsheet"
], function (Controller, JSONModel,Calendar, Spreadsheet) {
	"use strict";

	return Controller.extend("com.mahindra.ZSSU.controller.Home", {
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
			var appName  = "ZSSU";

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
//			var vPaperCode = oParameter[1];
			var oData_Url = "/sap/opu/odata/sap/ZFIORI_USAGE_SRV/";
			var oModel_fiori = new sap.ui.model.odata.ODataModel(oData_Url, true);
			sap.ui.getCore().setModel(oModel_fiori,"FioriOdata");

			var oDataModel = new sap.ui.getCore().getModel("FioriOdata");
//			oData.PaperCode= vPaperCode;
			oDataModel.read("/FioriUsageSet(Appname='ZSSU',Device='" + device +
			"',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
			"',Resolution='" + resolution + "')",null,null,null,function(e)   {	},
			function(e)
			{ });
			
			
			var oController = this;
			this.vUserId = sap.ui.Device.userId;
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_PaperList", {
				urlParameters: {
					"$filter": "Application eq 'SSU'" //if ssu application "SSU" for non-ssu "NON_SSU"
					// "$filter": "UserID eq '" + this.vUserId + "'"
				},
				success: function (oData, oResponse) {
					var oModelDefault = oController.getView().getModel("ModelDefaultDataSet");
					oModelDefault.setProperty("/ActionList", oData.results);
				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});
           
			var vFromDate = new Date();
			vFromDate.setFullYear(vFromDate.getFullYear() - 1);
			var oData = {
				"OriginalSearchData": [],
				"SearchData": [],
				"CreateNewEnable": false,
				"SearchParameter": {
					"Start": vFromDate,//minDate(), 
					"End": new Date(),
					"FromDate": vFromDate.toDateString().slice(4),//minDate().toDateString().slice(4),
					"ToDate": new Date().toDateString().slice(4),
					"SearchText": "",
					"Status": "Draft",
					"DocumentType": "LND",
					"DocumentText": "Landing page"
				}
			};
//			if(localStorage.getItem('SearchParameter') && performance.navigation.type != performance.navigation.TYPE_RELOAD){
			if(localStorage.getItem('SearchParameter') && localStorage.getItem('NavBack') == "X"){
				oData.SearchParameter = JSON.parse(localStorage.getItem('SearchParameter'));
				oData.SearchParameter.Start = new Date(oData.SearchParameter.Start);
				oData.SearchParameter.End = new Date(oData.SearchParameter.End);
			}
				
			var oModel = new sap.ui.model.json.JSONModel(oData);
			oController.getView().setModel(oModel, "ModelSSUDigitization");
			oController._fnGetMaster();
			oController._fnPendAmend("");

			sap.ui.core.IconPool.addIcon("rupees", "customfont", "icomoon", "e900");
			// oController.getOwnerComponent().getRouter().getRoute("Home").attachPatternMatched(oController._fnGetMaster, oController);
		},
		/*onBeforeRendering: function () {
			this._fnGetMaster();
		},*/
		_fnGetMaster: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vStart = uiDateToBackend(oModelSSUDigitization.getProperty("/SearchParameter/Start"));
			var vEnd = uiDateToBackend(oModelSSUDigitization.getProperty("/SearchParameter/End"));
			busyDialog.open();
			var URL =
				"Initiator eq '" + this.vUserId + "' and Application eq 'C' and  (Crdate ge datetime'" + vStart +
				"' and Crdate le datetime'" + vEnd + "')";
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_Master", {
				urlParameters: {
					"$filter": URL
				},
				success: function (oData, oResponse) {
					oModelSSUDigitization.setProperty("/OriginalSearchData", oData.results);
					oController._fnFilterMasterData();
					busyDialog.close();
				},
				error: function (oResponse) {
					serviceError(oResponse);
				}
			});
		},
		// Added by REDDRA-CONT	
		_fnPendAmend:function(oEvent){
		    
		    this.oBusyDialog = new sap.m.BusyDialog();
		    this.oBusyDialog.open();
		    var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oModelDefaultDataSet = oController.getView().getModel("ModelDefaultDataSet");
//		    var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//          var vFlag = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Flag");
		    
		    var vFlag = oEvent;
            
		    
		   oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_PendAmend",  {
		  	urlParameters : {
				"$filter":"Flag eq '"+vFlag+"'"
			},
		   success : function(oData, oResponse){
		   var oTableMod = new JSONModel();
		   oTableMod.setData(oData.results);
		   oController.getView().setModel(oTableMod,"R");
//		   if(oData.results.length!=0){
//						oController.getView().byId("id_titletab").setText("No. Of Records (" + oData.results.length + ") as on "+oController.vCurntDate);
//					}else{
//						oController.getView().byId("id_titletab").setText("No. Of Records (0) as on "+oController.vCurntDate);
//					}
//					oController.getView().setBusy(false);
//                    oModelSSUDigitization.setProperty("/ModelDefaultDataSet/Count",oData.results);
					oController.oBusyDialog.close();
					oController.getView().byId("penAmdBtn").setText('Pending Amendments(' +oData.results[0].Count+')')
					sap.ui.getCore().byId('id_From').setText(oData.results[0].FromDate);
					sap.ui.getCore().byId('id_ToDate').setText(oData.results[0].ToDate);
					sap.ui.getCore().byId('id_count').setText(oData.results[0].Count);
					sap.ui.getCore().byId('id_datetime').setText(oData.results[0].DateTime);
					
		   },
		   error: function(oError){
					oController.getView().setBusy(false);
					oController.oBusyDialog.close();
					
				},
		   });	
		    
		},
		onCancelDia : function(oEvent){
		},
// Added by REDDRA-CONT	
 fnNavToDetail:function(oEvent){
         var vPaperNo = oEvent.getSource().mBindingInfos.text.binding.oContext.getProperty("Paper_no");
         var vArray = vPaperNo.split('-');
        var PaperCode = vArray[1];
//     console.log(no);
		var vValues = oEvent.getSource().mBindingInfos.text.binding.oContext.getProperty()
		if(PaperCode=="NPI"){
		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
        "CrossApplicationNavigation");
    var href = (xnavservice && xnavservice.hrefForExternal({
        target: {
            semanticObject: "ZSSU_Project",
            action: "create"
        }
    })) || "";
    var url = window.location.href.split('#')[0] + href+"&/"+PaperCode+"/"+vPaperNo+"_X";
    sap.m.URLHelper.redirect(url, true);

	}else{
    	var oController = this;
		
		navToDetail(oController, PaperCode, vPaperNo,"X");
	}
	},
	
// for download
      fnDownloadReport:function(){
 //     var oController = this;
 //     var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel")
 //      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
		var oColoums = [];
		
		oColoums.push({
			label: 'Price_Paper_No',
			property: 'Paper_no',
			type: 'string'
		});
		oColoums.push({
			label: 'Created_on',
			property: 'Created_on',
			type: 'string'
		});
		oColoums.push({
			label: 'Time',
			property: 'Time',
			type: 'string'
		});
		oColoums.push({
			label: 'Item',
			property: 'Item_for_D',
			type: 'string'
		});
		oColoums.push({
			label: 'Sub_Item',
			property: 'Sub_Item',
			type: 'string'
		});
		oColoums.push({
			label: 'Vendor',
			property: 'Vender',
			type: 'string'
		});
		oColoums.push({
			label: 'Material',
			property: 'Material',
			type: 'string'
		});
		oColoums.push({
			label: 'Plant',
			property: 'Plant',
			type: 'string'
		});
		oColoums.push({
			label: 'P-Info record',
			property: 'PIR_Cat',
			type: 'string'
		});
		oColoums.push({
			label: 'Amendmend Type',
			property: 'Amend_Type',
			type: 'string'
		});
		oColoums.push({
			label: 'Document_Type',
			property: 'Rel_Indicator',
			type: 'string'
		});
		oColoums.push({
			label: 'SAP_Staus',
			property: 'Completion_Indicator',
			type: 'string'
		});
		oColoums.push({
			label: 'Error',
			property: 'Error',
			type: 'string'
		});
		
		
		var oModelR = this.getView().getModel("R");
		var vDate = new Date();
		var vDay = String(vDate.getDate()).padStart(2,'0');
		var vMon = String(vDate.getMonth() + 1).padStart(2,'0');
		var vYear = vDate.getFullYear();
		var vToDay = vDay + '/' + vMon + '/' + vYear  ;
		var oItems = oModelR.getProperty("/");
		var oExcelData = [];
//		var vDate = [];
		var vCopyRow={};
		$.each(oItems,function(i,row)
		{
	     vCopyRow = $.extend({},row);	
	     oExcelData.unshift(vCopyRow);
		});
		var oSettings = {
			workbook: {
				columns: oColoums,
				hierarchyLevel: 'Level'
			},
			dataSource: oExcelData,
			fileName: "Pending Amendmends_" + vToDay 

		};

		var oSheet = new Spreadsheet(oSettings);
		oSheet.build().finally(function () {
			oSheet.destroy();
		});
		
		},	
			
		//---------- Formatter Methods Start -----------------
		formatterPaperVisble: function (vVisible) {
			return vVisible == "X" ? true : false;
		},
		formattSearchDate: function (vFrom, vTo) {
			if (vFrom !== "" && vTo !== "")
				return true;
			else
				return false;
		},
		formattCurrntHold: function(vCurrentHold, vAgeing){
			if(vCurrentHold !="" && vAgeing !=""){
				return vCurrentHold+" ("+vAgeing+" Days)";
			} else {
				return "";
			}
		},
		//---------- Formatter Methods End -----------------

		//--------- Event Methods Start -----------------
		onPressAM: function(oEvent){
			/*var oController = this;
			var a= sap.ui.require.toUrl("com/mahindra/ZSSU/js/Approval_Matrix.pdf");
			var oPdfViewer = new sap.m.PDFViewer();
			oPdfViewer.setSource(a);
			oPdfViewer.setTitle("SSU Approval Matrix");
			oPdfViewer.open();*/
			var oController = this;
			var sServiceUrl = oController.getOwnerComponent().getModel("oDataNewPinfoModel").sServiceUrl;
			var oPdfViewer = new sap.m.PDFViewer();
			oPdfViewer.setSource(sServiceUrl+"/ES_Sop_Faq(PDFType='MATRIX')/$value?sap-client=100");
			oPdfViewer.setTitle("SSU Approval Matrix");
			oPdfViewer.open();
		},
		onPressSOP: function(oEvent){
			var oController = this;
			var sServiceUrl = oController.getOwnerComponent().getModel("oDataNewPinfoModel").sServiceUrl;
			var oPdfViewer = new sap.m.PDFViewer();
			oPdfViewer.setSource(sServiceUrl+"/ES_Sop_Faq(PDFType='SOPS')/$value?sap-client=100");
			oPdfViewer.setTitle("SSU Price Paper SOP");
			oPdfViewer.open();
		},
		onPressFAQ: function(oEvent){
			var oController = this;
			var sServiceUrl = oController.getOwnerComponent().getModel("oDataNewPinfoModel").sServiceUrl;
			var oPdfViewer = new sap.m.PDFViewer();
			oPdfViewer.setSource(sServiceUrl+"/ES_Sop_Faq(PDFType='FAQS')/$value?sap-client=100");
			oPdfViewer.setTitle("SSU Price Paper FAQ");
			oPdfViewer.open();
		},
		onCollapseExpandPress: function () {
			var oNavigationList = this.byId('navigationList');
			var bExpanded = oNavigationList.getExpanded();

			oNavigationList.setExpanded(!bExpanded);
		},
		onPressItem: function (oEvent) {
			var oController = this;
			var vText = oEvent.getParameter("item").getText();
			var vKey = oEvent.getParameter("item").getKey();
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oActionList = oController.getView().getModel("ModelDefaultDataSet").getProperty("/ActionList");
			oModelSSUDigitization.setProperty("/SearchParameter/DocumentType", vKey);
			oModelSSUDigitization.setProperty("/SearchParameter/DocumentText", vText);
			
			var oFilter = $.grep(oActionList,function(row){return row.PaperCode === vKey});

			if (vKey === "LND" || (oFilter.length>0 && oFilter[0].NonSSUInitiated === "N"))
				oModelSSUDigitization.setProperty("/CreateNewEnable", false);
			else
				oModelSSUDigitization.setProperty("/CreateNewEnable", true);

			oController._fnFilterMasterData();
		},
		onPressStatus: function (oEvent) {
			var oController = this;
			var vKey = oEvent.getParameter("item").getProperty("key");
			oController.getView().getModel("ModelSSUDigitization").setProperty("/SearchParameter/Status", vKey);
			oController._fnFilterMasterData();
		},
		onSelectMasterList: function (oEvent) {
			var oController = this;
			var vSelectedPath = oEvent.getParameter("listItem").getBindingContextPath();
			var vPaper = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath + "/PaperCode");
			var vPaperNum = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath + "/NpiNo");
			oEvent.getParameter("listItem").setSelected(false);
			localStorage.setItem('SearchParameter',JSON.stringify(oController.getView().getModel("ModelSSUDigitization").getProperty("/SearchParameter")));
			navToDetail(oController, vPaper, vPaperNum);
		},
		onCreateNew: function () {
			var oController = this;
			var vPaper = oController.getView().getModel("ModelSSUDigitization").getProperty("/SearchParameter/DocumentType");
			localStorage.setItem('SearchParameter',JSON.stringify(oController.getView().getModel("ModelSSUDigitization").getProperty("/SearchParameter")));
			navToDetail(oController, vPaper);
		},
		onClickCalendar: function (oEvent) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oPopoverCalendar = new sap.m.Popover({
				title: "Select Date Intervals",
				placement: "Bottom",
				// footer:[new sap.m.Button({"text":"OK"}),new sap.m.Button({"text":"Cancel"})],
				content: [new Calendar({
					select: function (oEvent) {
						var oCalendar = oEvent.getSource().getSelectedDates()[0];
						var vStart = oCalendar.getStartDate();
						var vEnd = oCalendar.getEndDate();

						if (vStart) {
							oModelSSUDigitization.setProperty("/SearchParameter/FromDate", vStart.toDateString().slice(
								4));
							oModelSSUDigitization.setProperty("/SearchParameter/Start", vStart);
						}
						if (vEnd) {
							oModelSSUDigitization.setProperty("/SearchParameter/ToDate", vEnd.toDateString().slice(4));
							oModelSSUDigitization.setProperty("/SearchParameter/End", vEnd);
							oController._fnGetMaster();
							oEvent.getSource().getParent().close();
						}
					},
					intervalSelection: true
				})]
			});
			oPopoverCalendar.openBy(oEvent.getSource());
		},
		onSearchMaster: function (oEvent) {
			var vSelectedValue = oEvent.getParameter("newValue");
			var oFilters = [];
			if (vSelectedValue && vSelectedValue.length > 0) {
				oFilters = new sap.ui.model.Filter({
					filters: [new sap.ui.model.Filter("NpiNo", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("Model", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("Sector", sap.ui.model.FilterOperator.Contains, vSelectedValue),
						new sap.ui.model.Filter("PaperText", sap.ui.model.FilterOperator.Contains, vSelectedValue)
					],
					and: false
				})
			}
			//oEvent.getSource().getParent().getParent().getContent()[0]
			var binding = oEvent.getSource().getParent().getParent().getBinding("items");
			binding.filter(oFilters);
		},
		onClickSearch: function (oEventButton) {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oTableBindItems = oEventButton.getSource().getParent().getParent().getBinding("items");
			var oPopoverSearch = new sap.m.Popover({
				placement: "Left",
				showHeader: false,
				contentWidth: "30%",
				content: [new sap.m.SearchField({
					placeholder: "Search:Document No.,Type,Model,Sector",
					liveChange: function (oEvent) {
						var vSelectedValue = oEvent.getParameter("newValue");
						var oFilters = [];
						if (vSelectedValue && vSelectedValue.length > 0) {
							oFilters = new sap.ui.model.Filter({
								filters: [new sap.ui.model.Filter("NpiNo", sap.ui.model.FilterOperator.Contains, vSelectedValue),
									new sap.ui.model.Filter("Model", sap.ui.model.FilterOperator.Contains, vSelectedValue),
									new sap.ui.model.Filter("Sector", sap.ui.model.FilterOperator.Contains, vSelectedValue),
									new sap.ui.model.Filter("PaperText", sap.ui.model.FilterOperator.Contains, vSelectedValue)
								],
								and: false
							})
						}
						oTableBindItems.filter(oFilters);
					},
					value:"{ModelSSUDigitization>/SearchParameter/SearchText}"
				})]
			});
			oController.getView().addDependent(oPopoverSearch);
			oPopoverSearch.openBy(oEventButton.getSource());
		
		},
		onPressIndexBased: function(){
			window.open("/sap/bc/ui5_ui5/sap/zzmm_iba/index.html");
		},
		onPressPartSettlementTracker: function(){
			var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
				"CrossApplicationNavigation");
			var href = (xnavservice && xnavservice.hrefForExternal({
			target: {
				semanticObject: "Part_Settelement",
				action: "create"
			}
		})) || "";

		var url = window.location.href.split('#')[0] + href;
		sap.m.URLHelper.redirect(url, true);
//			window.open("/sap/bc/ui5_ui5/sap/zpart_settle/index.html");
		},
		//--------- Event Methods End -----------------

		//--------- Local Methods Start -----------------
		_fnFilterMasterData: function () { // Filter Master Data and set in model
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var oModelDefaultDataSet = oController.getView().getModel("ModelDefaultDataSet");
			var vDocumentType = oModelSSUDigitization.getProperty("/SearchParameter/DocumentType");
			var vStatus = oModelSSUDigitization.getProperty("/SearchParameter/Status");
			var vMasterList = oModelSSUDigitization.getProperty("/OriginalSearchData").filter(function (row) {
				return ((row.PaperCode == vDocumentType || vDocumentType == "LND"));
			});
			var vCurrentUser = this.vUserId; // Added by AGAWSA-CONT on 24-01-2023
			var vRequestCount = 0,
				vDraftCount = 0,
				vPendingCount = 0,
				vPostSapCount = 0,
				vCompletedCount = 0,
				vRejectedCount = 0;
//			Remove Start by AGAWSA-CONT on 24-01-2023
/*			$.each(vMasterList, function (i, row) {
				if (row.Status == "NR") {
					row.UiStatus = "Request";
					vRequestCount++;
				} else if (row.Status == "S") {
					row.UiStatus = "Draft";
					vDraftCount++;
				} else if (row.Status == "IC") {
					row.UiStatus = "Post to SAP";
					vPostSapCount++;
				} else if (row.Status == "C") {
					row.UiStatus = "Completed";
					vCompletedCount++;
				} else if (row.Status == "R") {
					row.UiStatus = "Rejected";
					vRejectedCount++;
				} else {
					row.UiStatus = "Pending";
					vPendingCount++;
				}
			});*/
//			Remove END by AGAWSA-CONT on 24-01-2023
//			ADD Start by AGAWSA-CONT on 24-01-2023
			$.each(vMasterList, function (i, row) {
				if(row.Application == "C"){ // Add by AGAWSA-CONT on bug fix for PPP paper
					if(row.Initiator != vCurrentUser){
						if (row.Status == "AR") {
							row.UiStatus = "Request";
							vRequestCount++;
						} else if (row.Status == "AS") {
							row.UiStatus = "Draft";
							vDraftCount++;
						} else if (row.Status == "AC") {
							row.UiStatus = "Post to SAP";
							vPostSapCount++;
						} else if (row.Status == "C") {
							row.UiStatus = "Completed";
							vCompletedCount++;
						} else if (row.Status == "AJ") {
							row.UiStatus = "Rejected";
							vRejectedCount++;
						} else {
							row.UiStatus = "Pending";
							vPendingCount++;
						}
					}else{
						if (row.Status == "NR") {
							row.UiStatus = "Request";
							vRequestCount++;
						} else if (row.Status == "S") {
							row.UiStatus = "Draft";
							vDraftCount++;
						} else if (row.Status == "IC") {
							row.UiStatus = "Post to SAP";
							vPostSapCount++;
						} else if (row.Status == "C") {
							row.UiStatus = "Completed";
							vCompletedCount++;
						} else if (row.Status == "R") {
							row.UiStatus = "Rejected";
							vRejectedCount++;
						} else {
							row.UiStatus = "Pending";
							vPendingCount++;
						}
					}
				}else{
					if (row.Status == "NR") {
						row.UiStatus = "Request";
						vRequestCount++;
					} else if (row.Status == "S") {
						row.UiStatus = "Draft";
						vDraftCount++;
					} else if (row.Status == "IC") {
						row.UiStatus = "Post to SAP";
						vPostSapCount++;
					} else if (row.Status == "C") {
						row.UiStatus = "Completed";
						vCompletedCount++;
					} else if (row.Status == "R") {
						row.UiStatus = "Rejected";
						vRejectedCount++;
					} else {
						row.UiStatus = "Pending";
						vPendingCount++;
					}
				}
				
			});
//			ADD END by AGAWSA-CONT on 24-01-2023
			oModelDefaultDataSet.setProperty("/StatusFilter/0/Count", vRequestCount);
			oModelDefaultDataSet.setProperty("/StatusFilter/1/Count", vDraftCount);
			oModelDefaultDataSet.setProperty("/StatusFilter/2/Count", vPendingCount);
			oModelDefaultDataSet.setProperty("/StatusFilter/3/Count", vPostSapCount);
			oModelDefaultDataSet.setProperty("/StatusFilter/4/Count", vCompletedCount);
			oModelDefaultDataSet.setProperty("/StatusFilter/5/Count", vRejectedCount);
			vMasterList = vMasterList.filter(function (Row) {
				return (Row.UiStatus == vStatus);
			});
			oModelSSUDigitization.setProperty("/SearchData", vMasterList);
			oModelSSUDigitization.refresh();
			// oModelSSUDigitization.getProperty("/SearchData").filter(new sap.ui.model.Filter("UiStatus", sap.ui.model.FilterOperator.Contains, vStatus));
		},
		onPress:function(oEvent){
		
		var oController = this;
		var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//		var vFlag = oEvent.getSource().getProperty("/PaperDataSet/Flag", "X");
//		if(oEvent.getParameter("selected"))
//		oController.getView().getModel(" oModelSSUDigitization").setProperty("/PaperDataSet/Flag","X");
//		 else
//        oController.getView().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/Flag","")
//       var vFlag = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Flag", "X");
		var oAmendmend = xmlFragment(oController, "Amendmend");
		var vFlag = "X";
//		busydialog.open();
		oController._fnPendAmend(vFlag);
//		oController._fnFilterMasterData();
        
		oAmendmend.open();
		
		},
		
		onExit: function(){
			localStorage.setItem('NavBack',"");
		}
		//---------Local Methods End -----------------
	});
});