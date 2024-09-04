//sap.ui.controller("ZPART_SETTLEMENT.controller.PartSettl", {
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet"/*
	'ZPART_SETTLEMENT/js/jszip',
	'ZPART_SETTLEMENT/js/kendo',
	'ZPART_SETTLEMENT/js/xlsx',*/
], function (Controller, JSONModel, Message, Spreadsheet) {
	var oController,oDataAmendmentModel; 
	"use strict";
	return Controller.extend("ZPART_SETTLEMENT.controller.PartSettl", {

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf view.PartSettl
*/
	onInit: function() {
		var vCurntDate = new Date().toDateString().slice(4);
		var vCurntTime = new Date().toTimeString().split(" ")[0];
		vCurntDate = vCurntDate+" - "+vCurntTime;
		this.getView().byId("id_titletab").setText("No. Of Records (0) as on "+vCurntDate);
		this.vCurntDate = vCurntDate;

	},
	
	
	onPartValueHelp: function (oEvent) {
		var oController = this;
//		var oValueHelp = parentXmlFragment(oController, "ValueHelp");
		if (!oController._PartFragm) {
			oController._PartFragm = sap.ui.xmlfragment("ZPART_SETTLEMENT.fragment.ValueHelp", oController);
			oController.getView().addDependent(oController._PartFragm);
		}
		oController._PartFragm.setTitle("Part Number");
		var template = new sap.m.StandardListItem({
			title: "{PartNo}",
			description: "{PartDesc}"
		});
		oController._PartFragm.bindAggregation("items", "/", template);
		oController._PartFragm.setModel(new JSONModel());
//		oController._PartFragm.parentModel = oEvent.getSource().getBindingContext().getModel();
		oController._PartFragm.open();
	},
	
	handleSearch: function (e) {
		var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
		var vSelectedValue = e.getParameter("value").toUpperCase();
		var filters = [];
		var valueHelp = e.getSource();
		if (vSelectedValue.length > 4) {
			valueHelp.setBusy(true);
			oDataAmendmentModel.read("/ES_Partno", {
				filters: [ new sap.ui.model.Filter("PartNo", sap.ui.model
					.FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
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
		
		
	},
	fnSearch:function(){
		this.oBusyDialog = new sap.m.BusyDialog();
		this.oBusyDialog.open();
		var oCont = this;
		var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
		var vPartNo = "";
		var vPaperNo = "";
		if(this.getView().byId("idRadioButton").getSelectedIndex() == 0)
			vPartNo = this.getView().byId("id_part").getValue();
		else
			vPaperNo = this.getView().byId("id_part").getValue();
			
		oDataAmendmentModel.read("/ES_PartSettleTrack",{
			urlParameters : {
				"$filter":"PartNo eq '"+vPartNo+"' and PaperNo eq '"+vPaperNo+"'"
			},
				success: function(oData, oResponse){
					var oTableModel = new JSONModel();
					oTableModel.setData(oData.results);
					oCont.getView().setModel(oTableModel,"P");
					if(oData.results.length!=0){
						oCont.getView().byId("id_titletab").setText("No. Of Records (" + oData.results.length + ") as on "+oCont.vCurntDate);
					}else{
						oCont.getView().byId("id_titletab").setText("No. Of Records (0) as on "+oCont.vCurntDate);
					}
					oCont.getView().setBusy(false);
					oCont.oBusyDialog.close();
					
				},
				error: function(oError){
					oCont.getView().setBusy(false);
					oCont.oBusyDialog.close();
					
				},
			});	
		
	},
	fnClear:function(){
		this.getView().byId("id_part").setValue("");
		this.getView().byId("id_tab").getModel("P").setData([]);
		this.getView().byId("id_tab").getModel("P").refresh(true);
		this.getView().byId("id_titletab").setText("No. Of Records (0) as on "+this.vCurntDate);
		
	},
	fnDownloadReport:function(){
		var oColoums = [];	
		
		
		oColoums.push({
			label: 'Paper No',
			property: 'PaperNo',
			type: 'string'
		});
		oColoums.push({
			label: 'Paper Code',
			property: 'PaperCode',
			type: 'string'
		});
		oColoums.push({
			label: 'Sector',
			property: 'Sector',
			type: 'string'
		});
		oColoums.push({
			label: 'Model',
			property: 'Model',
			type: 'string'
		});
		oColoums.push({
			label: 'Paper Status',
			property: 'Status',
			type: 'string'
		});
		oColoums.push({
			label: 'Created By',
			property: 'Createdby',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Created by  User Name',
			property: 'UserName',
			type: 'string'
		});
		oColoums.push({
			label: 'Creation Date',
			property: 'QtyPerVeh',
			type: 'string'
		});
		oColoums.push({
			label: 'Non SSU Initiated Flag',
			property: 'NonSSUInitiated',
			type: 'string'
		});
		oColoums.push({
			label: 'Plant Code',
			property: 'Plant',
			type: 'string'
		});
		oColoums.push({
			label: 'Part Number Code',
			property: 'PartNo',
			type: 'string'
		});
		oColoums.push({
			label: 'Vendor Code',
			property: 'Vendor',
			type: 'string'
		});
		oColoums.push({
			label: 'Vendor Name',
			property: 'VName',
			type: 'string'
		});
		oColoums.push({
			label: 'P Info Category',
			property: 'Pinforcat',
			type: 'string'
		});
		oColoums.push({
			label: 'Settled Price',
			property: 'PartPrice',
			type: 'string'
		});
		oColoums.push({
			label: 'Valid From',
			property: 'ValidFrom',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Buyer  Token ID',
			property: 'TokenID',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Buyer  Name',
			property: 'TokenName',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SSU Approver 1  ID',
			property: 'Approver1',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 1 Name',
			property: 'Approver1Name',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 1  Date',
			property: 'ApproverDateofA1',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 2  ID',
			property: 'Approver2',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 2 Name',
			property: 'Approver2Name',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 2 Date',
			property: 'ApproverDateofA2',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 3  ID',
			property: 'Approver3',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 3 Name',
			property: 'Approver3Name',
			type: 'string'
		});
		oColoums.push({
			label: 'SSU Approver 3   Date',
			property: 'ApproverDateofA3',
			type: 'string'
		});
		oColoums.push({
			label: 'Approval 1 Ageing',
			property: 'AgeingA1',
			type: 'string'
		});
		oColoums.push({
			label: 'Approval 2  Ageing',
			property: 'AgeingA2',
			type: 'string'
		});
		oColoums.push({
			label: 'Approval 3 Ageing',
			property: 'AgeingA3',
			type: 'string'
		});
		oColoums.push({
			label: 'Paper Desc.',
			property: 'PaperText',
			type: 'string'
		});
		oColoums.push({
			label: 'Taxonomy',
			property: 'Taxonomy',
			type: 'string'
		});
		
		var oModelP = this.getView().getModel("P");
		var vPaperNumber = this.getView().byId("id_part").getValue();
		var oItems = oModelP.getProperty("/");
		var oExcelData = [];
		var vDate = [];
		var vCopyRow={};
		$.each(oItems,function(i,row){
			vCopyRow = $.extend({},row);
			if(vCopyRow.ValidFrom){
				vDate = uiDateToBackend(vCopyRow.ValidFrom).split("T")[0].split("-").reverse();
				vCopyRow.ValidFrom = vDate.join(".");
			}
			if(vCopyRow.Crdate){
				vDate = uiDateToBackend(vCopyRow.Crdate).split("T")[0].split("-").reverse();
				vCopyRow.Crdate = vDate.join(".");
				oExcelData.unshift(vCopyRow);
			}
		});
		var oSettings = {
			workbook: {
				columns: oColoums,
				hierarchyLevel: 'Level'
			},
			dataSource: oExcelData,
			fileName: "Export Data "+vPaperNumber

		};

		var oSheet = new Spreadsheet(oSettings);
		oSheet.build().finally(function () {
			oSheet.destroy();
		});

	},
	
	fnDownloadReport1:function(){
   	 var oView = this.getView();
	 
	 this.download = true
		// First Define Structure of XML sheet//
		var workbook = new kendo.ooxml.Workbook({
			sheets : [ {
				rows : []
			} ]
		});
		var oTab = this.getView().byId("id_tab");
			var oTabHeader = []; // Declare table Header
			// Pushing Header Items//
			
								
				var temp = {
						value : "Paper No"
					}
					oTabHeader.push(temp);	
				
				var temp = {
						value : "Paper Code"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Paper Text"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Sector"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Model"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Status"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Created By"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Name"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "CRDATE"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "CRTIME"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Non SSU Initiated"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Non SSU Req APP"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Created On"
					}
					oTabHeader.push(temp);
				var temp = {
						value : "Plant"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Part No"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Vendor"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "Vendor Name"
					}
					oTabHeader.push(temp);	
				
				var temp = {
						value : "P Info Category"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "SETTLED_PRICE"
					}
					oTabHeader.push(temp);	
				
				var temp = {
						value : "Valid From"
					}
					oTabHeader.push(temp);
				var temp = {
						value : "Taxonomy"
					}
					oTabHeader.push(temp);
				var temp = {
						value : "APPROVER1"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "A1_NAME"
					}
					oTabHeader.push(temp);
				var temp = {
						value : "A1_DATE"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "APPROVER2"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "A2_NAME"
					}
					oTabHeader.push(temp);
				var temp = {
						value : "A2_DATE"

					}
					oTabHeader.push(temp);	
				var temp = {
						value : "APPROVER3"
					}
					oTabHeader.push(temp);	
				
				var temp = {
						value : "A3_NAME"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "A3_DATE"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "TOKENID"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "TOKEN_NAME"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "A1_AGEING"
					}
					oTabHeader.push(temp);	
				
			
				var temp = {
						value : "A2_AGEING"
					}
					oTabHeader.push(temp);	
				var temp = {
						value : "A3_AGEING"
					}
					oTabHeader.push(temp);	
				
				
								
				
//				oTabHeader[10].value=oTabHeader[10].value.substring(0,11);
			workbook.options.sheets[0].rows.push({
				cells : oTabHeader
			});
			// Row Data pushing in exceel sheet//

			var FinalArray = [];
			
			if(oTab.getModel("P").oData != undefined){
				
					for (var i = 0; i < oTab.getModel("P").oData.length; i++) {
						if(oTab.getModel("P").oData[i].Crtime.ms)
						  var vTime  = this.fntimeConvert(oTab.getModel("P").oData[i].Crtime.ms);
						
						var arrTabValue = [];
//						var vDateFrom = com.exalca.pir.util.Formatter.date(oTab.getModel("B").oData.Budget[i].Datab);
//						var vDateTo = com.exalca.pir.util.Formatter.date(oTab.getModel("B").oData.Budget[i].Datbi);

						var locValues = {
								"value" : oTab.getModel("P").oData[i].PaperNo,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].PaperCode,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
							"value" : oTab.getModel("P").oData[i].PaperText,
						}
						arrTabValue.push(locValues);
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Sector,
							}
							arrTabValue.push(locValues);
						var locValues = {
							"value" : oTab.getModel("P").oData[i].Model,
						}
						arrTabValue.push(locValues);
						
						var locValues = {
								"value" :oTab.getModel("P").oData[i].Status,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" :oTab.getModel("P").oData[i].Createdby,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" :  oTab.getModel("P").oData[i].UserName,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Crdate,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : vTime,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].NonSSUInitiated,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].NonSSUReqAppOn,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Crdate,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Plant,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].PartNo,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Vendor,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].VName,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Pinforcat,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].PartPrice,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].ValidFrom,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Taxonomy,
							}
							arrTabValue.push(locValues);
						
						
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Approver1,
							}
							arrTabValue.push(locValues);
						
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Approver1Name,
							}
							arrTabValue.push(locValues);
						
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].ApproverDateofA1,
							}
							arrTabValue.push(locValues);
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Approver2,
							}
							arrTabValue.push(locValues);
						
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Approver2Name,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].ApproverDateofA2,
							}
							arrTabValue.push(locValues);
						
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Approver3,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].Approver3Name,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].ApproverDateofA3,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].TokenID,
							}
							arrTabValue.push(locValues);
						
						var locValues = {
								"value" : oTab.getModel("P").oData[i].TokenName,
							}
							arrTabValue.push(locValues);
						var locValues = {
								"value" : oTab.getModel("P").oData[i].AgeingA1,
							}
							arrTabValue.push(locValues);
						var locValues = {
								"value" : oTab.getModel("P").oData[i].AgeingA2,
							}
							arrTabValue.push(locValues);
						var locValues = {
								"value" : oTab.getModel("P").oData[i].AgeingA3,
							}
							arrTabValue.push(locValues);
						
						
						
						

						
						workbook.options.sheets[0].rows.push({
							cells : arrTabValue
						});
				}
			
			
			}
			var vPartDate = this.getView().byId("id_part").getValue()+"_"+new Date().toLocaleDateString();
//			var vPartDate = this.getView().byId("id_part").getValue()+"_"+new Date().toLocaleDateString().replaceAll("/","_");
//			var vDate = new Date().toLocaleDateString().replaceAll("/","_");
			kendo.saveAs({
				dataURI : workbook.toDataURL(),
				fileName : "PartSettlement_"+vPartDate+".xlsx"
			});
		
	},
	fntimeConvert:function(value){
		
			  var ms = value % 1000;
			  value = (value - ms) / 1000;
			  var secs = value % 60;
			  value = (value - secs) / 60;
			  var mins = value % 60;
			  var hrs = (value - mins) / 60;

			  return hrs + ':' + mins + ':' + secs + '.' + ms;
			
	},
	
	handleClose: function (e) {
		var oSelectedItem = e.getParameter("selectedItem");
		var oParentModel = e.getSource().parentModel;
		var oController = this;
		if (oSelectedItem) {
			if(e.getSource().getModel() !== undefined){
				var oSelectedData = e.getSource().getModel().getProperty(oSelectedItem.getBindingContextPath());
				if (e.getSource().getTitle() == "Part Number") {
					this.getView().byId("id_part").setValue(oSelectedItem.getTitle());
					
	
				}
			}	
		}	
	},
	fnOpenPaper:function(oEvent){
		var vValues = oEvent.getSource().mBindingInfos.text.binding.oContext.getProperty()
		if(vValues.PaperCode=="NPI"){
		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
        "CrossApplicationNavigation");
    var href = (xnavservice && xnavservice.hrefForExternal({
        target: {
            semanticObject: "ZSSU_Project",
            action: "create"
        }
    })) || "";
    
    var url = window.location.href.split('#')[0] + href+"&/"+vValues.PaperCode+"/"+vValues.PaperNo+"_X";
    sap.m.URLHelper.redirect(url, true);

	}else{

		var oController = this;
		
		navToDetail(oController, vValues.PaperCode, vValues.PaperNo,"X");
	}
		
	},
	formattStatus:function(value,papercode){
		if(value=="S"){
			return "S-Draft";
		}else if(value=="C"){
			return "C-Complete";
		}else if(value=="R"){
			return "R-Rejected";
		}else if(value=="IR"){
			return "IR-Initiator";
		}else if(value=="A1"){
			return "A1-SSU Approver 1";
		}else if(value=="A2"){
			return "A2-SSU Approver 2";
		}else if(value=="A3"){
			return "A3-SSU Approver 3";
		}else if(value=="A4"){
			return "A4-SSU Approver 4";
		}else if(value=="A5"){
			return "A5-SSU Approver 5";
		}else if(value=="A6"){
			return "A6-SSU Approver 6";
		}else if(value=="A7"){
			return "A7-SSU Approver 7";
		}else if(value=="A8"){
			return "A8-SSU Approver 8";
		}else if(value=="RS"){
			return "RS-Request Draft";
		}else if(value=="NR"){
//			Insert start by AGAWSA-CONT on 25.08.2023
			return "SSU Request";
//			return "NR-NON SSU Request";
		}else if(value=="RJ"){
			return "RJ-Request Rejeted";
		}else if(value=="IC"){
			return "IC-Initiator Complete ";
		}else if(value=="P1"){
			return "P1-NON SSU Approver 1";
		}else if(value=="P2"){
			return "P2-NON SSU Approver 2";
		}else if(value=="P3"){
			return "P3-NON SSU Approver 3";
		}else if(value=="P4"){
			return "P4-NON SSU Approver 4";
		}else if(value=="AR"){
			return "Associate Request";
		}else if(value=="AS"){
			return "Associate Draft";
		}else if(value=="AC"){
			return "Associate Post To SAP";
		}else if(value=="AJ"){
			return "Associate Reject";
		}else if(value=="TR"){
			return "Team Lead";
		}
//		Insert end by AGAWSA-CONT on 25.08.2023
		
	},
	formattDate:function(value){
		if(value){
			var vDate, vMonth, vYear;
			vDate = value.getDate();
			vMonth = value.getMonth() + 1;
			vYear = value.getFullYear();
			return vDate+ "." + vMonth + "."+ vYear;
		}
	}

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf view.PartSettl
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf view.PartSettl
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf view.PartSettl
*/
//	onExit: function() {
//
//	}

//});
	});
});	