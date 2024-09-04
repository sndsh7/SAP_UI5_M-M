sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/export/Spreadsheet',
	'sap/ui/export/library',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"ZSSU_DASHBOARD/model/formatter"
], function (Controller,JSONModel,Spreadsheet,exportLibrary,Filter,FilterOperator,formatter) {
	"use strict";
var ssuDashboard,oDateObject;
var that,ammdModel,oModelSSU;
var LoginUser;
var unique=[];
var FromDate,ToDate;
var EdmType = exportLibrary.EdmType;
var busy = new sap.m.BusyDialog();

	return Controller.extend("ZSSU_DASHBOARD.controller.app", {
		formatter : formatter,
		onInit: function () {
			that = this;
			if(sap.ui.Device.system.phone){
				that.getView().byId("panelForGridList").setWidth("26rem");
			}else{
				that.getView().byId("panelForGridList").setWidth("80rem");
			}
			ammdModel = that.getOwnerComponent().getModel("oDataAmendmentModel")
            oModelSSU = that.getOwnerComponent().getModel("ssu");
			LoginUser = sap.ui.Device.userId
			this.getView().byId("header").setText("Team Lead Dashboard");
			var vFromDate = new Date();
			vFromDate.setMonth(vFromDate.getMonth() - 3);
			oDateObject = {
					"FromDate": vFromDate,//minDate().toDateString().slice(4),
					"ToDate": new Date()
			};
			var oModelDate = new sap.ui.model.json.JSONModel(oDateObject);
			that.getView().setModel(oModelDate,"MasterDate");	
			that.getOwnerComponent().getRouter().getRoute("Routeapp").attachPatternMatched(that._routeMatched, that);
		},
		_routeMatched : function(){
//			that._getOverAll();
			that._getPaperCode();
			that._PendAmmendment();
			that.loadAssociate(); 
			that._getDashboardData("/ES_DashAVP","AVPC","AVP","AL","Status");
            that._getDashboardData("/ES_DashAVP","PVC","PVC","AL","Status");
            that._getDashboardData("/ES_DashAVP","Associate","ASVP","","Holder_ID");
		},
		_getDashboardData : function(entity,alias,AppType,Status,field){
			debugger
			if(AppType === "ASVP"){
				var URL = "Application eq '"+AppType+"' and "+field+" eq '"+Status+"' and Status eq 'AL'";
			}else{
				var URL ="Application eq '"+AppType+"' and "+field+" eq '"+Status+"' ";
			}
			oModelSSU.read(entity, {
                urlParameters: {
                    "$filter": URL,
                },
                success: function (oData, oResponse) {
					debugger	
					busy.close();
					var oDataM = new JSONModel();
					oDataM.setData(oData);
					that.getView().setModel(oDataM,alias);
                },
                error: function (oResponse) {
					busy.close();
				}
            });
		},
		 uiDateToBackend(oUiDate) {
			if(oUiDate && typeof oUiDate == "object"){
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
			}else{
				return oUiDate;
			}
		},
		_PendAmmendment : function(){
			busy.open();
			var flag = "D"
			oModelSSU.read("/ES_PendAmend",  {
			  	urlParameters : {
					"$filter":"Flag eq '"+flag+"'"
				},
			   success : function(oData, oResponse){
				   busy.close();
				   debugger
				   ZSSU_DASHBOARD.pAmmend = oData;
				   var oTableMod = new JSONModel();
				   oTableMod.setData(oData);
				   that._fnGetMaster(oData);
			   },
			   error: function(oError){
			   		busy.close();					
			   },
			});
		},
		_fnGetMaster: function (pAmmend) {
			busy.open();
			var fDate = that.getView().byId("DRS1").getValue().split(" ");
			var formFromDate = fDate[0].split("-")[1] + "-" + fDate[0].split("-")[0] +"-" + fDate[0].split("-")[2];
			var formToDate = fDate[2].split("-")[1] + "-" + fDate[2].split("-")[0] +"-" + fDate[2].split("-")[2];
			FromDate = that.uiDateToBackend(new Date(formFromDate))
			ToDate = that.uiDateToBackend(new Date(formToDate))
			var URL ="Initiator eq '" + LoginUser + "' and Application eq 'D' and  (Crdate ge datetime'" + FromDate +	"' and Crdate le datetime'" + ToDate + "')";
            oModelSSU.read("/ES_Master", {
                urlParameters: {
                    "$filter": URL
                },
                success: function (oData, oResponse) {
					debugger	
					busy.close();
					var oDataM = new JSONModel();
					oDataM.setData(oData);
					that.getView().setModel(oDataM,"allData");
					that._filterDataBasedOnStatus(oData,pAmmend);
					ZSSU_DASHBOARD.oData = oData;
					that._ageingDays(oData);
                },
                error: function (oResponse) {
					busy.close();
				}
            });
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
		_filterDataBasedOnStatus: function(oData,pAmmend){
			var aPendAss =oData.results.filter(function (obj, index) {
				return obj.Status === "AR" || obj.Status === "AS" || obj.Status === "AJ" || obj.Status === "AC";
			});				
			var aPendBuyer =oData.results.filter(function (obj, index) {
//				||  obj.Status === "IC"
				return obj.Status === "NR" ||  obj.Status === "S"  ||  obj.Status === "R";
			});				
			var aPendApprover = oData.results.filter(function (obj, index) {
				return obj.Status === "A1" || obj.Status === "A2" || obj.Status === "A3"|| obj.Status === "A4" || obj.Status === "A5";
			});				
			var aComplete = oData.results.filter(function (obj, index) {
				return obj.Status === "C";
			});	
			var aPendTL = oData.results.filter(function (obj, index) {
				return obj.Status === "TR";
			});		
			var object = [
				{
					"count" : aPendTL.length,
					"name" : "Pending With TL",
					"results" : aPendTL
				},
				{
					"count" : aPendAss.length,
					"name" : "Pending with Associate",
					"results" : aPendAss
				},
				
				{
					"count" : aPendBuyer.length,
					"name" : "Pending with SSU Buyer",
					"results" : aPendBuyer
				},
				{
					"count" : aPendApprover.length,
					"name" : "Pending with Approver",
					"results" : aPendApprover
				},
				{
					"count" : aComplete.length,
					"name" : "Completed",
					"results" : aComplete
				},{
					"count" : pAmmend.results.length,
					"name" : "Pending Ammendment",
					"results" : pAmmend
				},
				
			]
			 var oDataModel = new JSONModel();
			 oDataModel.setData(object);
			 that.getView().setModel(oDataModel);
			 that.setValueLabel("vizFrame");
			 that.setValueLabel("vizAVPC");
			 that.setValueLabel("vizFramePaper");
			 that.setValueLabel("vizFrame4");
			 if(that.flag === "X"){
				 return object;
			 }
		},
		handleChange: function (oEvent) {
			that._PendAmmendment();
		},
		handleDateChangeReport: function(evt){
			debugger
			var fDate = evt.getParameters().value.split(" – ");
			var formFromDate = fDate[0].split("-")[1] + "-" + fDate[0].split("-")[0] +"-" + fDate[0].split("-")[2];
			var formToDate = fDate[1].split("-")[1] + "-" + fDate[1].split("-")[0] +"-" + fDate[1].split("-")[2];
			var aFilters=[];
			/*var filterFrom = new Filter("Crdate", FilterOperator.GE, formFromDate);
			var filterTo = new Filter("Crdate", FilterOperator.LE, formToDate);
			aFilters.push(filterFrom,filterTo);
			var oList = this.byId("idProjectTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters);*/
			that._PendAmmendment();
		},
		onViewSelection: function (oEvent) {
			that = this;
			var selView = oEvent.getSource().getSelectedKey();
			if (selView === "dashboard") {
				that.byId("dash").setVisible(true);
				that.byId("DRS1").setVisible(true);
				that.byId("reports").setVisible(false);
				that.getView().byId("header").setText("Team Lead Dashboard");
				that._PendAmmendment();
			} else {
				that.byId("DRS1").setVisible(false)
				that.byId("dash").setVisible(false);
				that.byId("reports").setVisible(true);
				that.getView().byId("header").setText("Team Lead Summary Report");
			}
		},
		handleFilterButtonPressed : function(){
			if (!that.filterFrag) {
				that.filterFrag = sap.ui.xmlfragment("ZSSU_DASHBOARD.view.FilterReport", that);
				that.getView().addDependent(that.filterFrag); 
			}
			that.filterFrag.open();
//			that.loadAssociate();
//			that._getPaperCode();
		},
		handleFilterDialogConfirm:function(oEvent){		
			var aFilterItems = oEvent.getParameters().filterItems,
			  aFilters = [];
			  var mParam = oEvent.getParameters();
			  var oList = this.byId("idProjectTable");
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
				   case "Status":
					   	if(fil === "Associate Request"){
					   		fil = "AR"
					   	}else if (fil === "SSU Buyers Request") {	
					   		fil = "NR"	
						} else if (fil === "SSU Buyers Draft") {
							fil = "S"
						} else if (fil === "SSU Buyers Rejected") {
							fil = "R"
						} else if (fil === "Associate Complete") {
							fil = "AC"
						}else if (fil === "Associate Rejected") {
							fil = "AJ"
						}else if (fil === "SSU Buyers Post to SAP") {
							fil = "IC"
						} else if (fil === "Associate Post to SAP") {
							fil = "AC"
						} else if (fil === "Approver 1") {
							fil = "A1"
						} else if (fil === "Approver 2") {
							fil = "A2"
						} else if (fil === "Approver 3") {
							fil = "A3"
						} else if (fil === "Approver 4") {
							fil = "A4"
						} else if (fil === "Approver 5") {
							fil = "A5"
						} else if (fil === "Associate Draft") {
							fil = "AS"
						} else if (fil === "Completed") {
							fil = "C"
						} 					 
					    filter = new Filter("Status", FilterOperator.EQ, fil);
					    aFilters.push(filter);
					    break;
				    default:
				    break;
				   }
				  });
			oBinding.filter(aFilters);
			var List = oBinding.oList;
			var oDataModel = new JSONModel();
			 oDataModel.setData({"results" : List});
			if(oEvent.getParameters().filterString.includes("Status") === true){
			debugger
				for(var i=0;i<oDataModel.oData.results.length;i++){
					if(oDataModel.oData.results[i].Status === "C"){
						var pastDate = new Date(oDataModel.oData.results[i].Crdate);
						var LA_Date = new Date(oDataModel.oData.results[i].LA_Date);
						var diffDays = parseInt((LA_Date - pastDate) / (1000 * 60 * 60 * 24), 10); 
						oDataModel.oData.results[i].AgeingDiffDays = diffDays;				
					}
				}	
			that.getView().getModel("allData").refresh()
			}
		},
		_getPaperCode : function(){
			busy.open();
			oModelSSU.read("/ES_PaperList", {
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
		_getOverAll : function(){
			busy.open();
			var URL = "Application eq 'D'"
			oModelSSU.read("/ES_Dash_All", {
				urlParameters: {
					"$filter": URL
				},
				success: function (oData, oResponse) {
					busy.close();
					debugger
					 var oDataModel = new JSONModel();
					 oDataModel.setData(oData);
					 that.getView().setModel(oDataModel, "paperCode");
				},
				error: function (oResponse) {
					busy.close()
				}
			});
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
					MessageBox.error("Error loading Initiator.", {title: "Error"});
					busy.close();
				}
			});
		},
		onSelectionChange : function(event){
			debugger
			var index = event.getSource().getId().split("-")[4];
			var object = event.getSource().getBindingContext().getModel("/").getData()[index];
			if(object.name === "Completed" || object.name === "Pending With TL"){
				this.getOwnerComponent().getRouter().navTo("subList");
				that.FLAG = "X"
			}else if(object.name === "Pending Ammendment"){
				if (!that.pendAmmend) {
					that.pendAmmend = sap.ui.xmlfragment("ZSSU_DASHBOARD.view.PendingAmm", that);
					that.getView().addDependent(that.pendAmmend); 
				}
				that.pendAmmend.open();
				var oPendModel = new sap.ui.model.json.JSONModel(object.results);
				sap.ui.getCore().byId('id_From').setText(object.results.results[0].FromDate);
				sap.ui.getCore().byId('id_ToDate').setText(object.results.results[0].ToDate);
				sap.ui.getCore().byId('id_count').setText(object.results.results[0].Count);
				sap.ui.getCore().byId('id_datetime').setText(object.results.results[0].DateTime);
				that.getView().setModel(oPendModel, "R");
			}else{
				this.getOwnerComponent().getRouter().navTo("Detail");
				that.FLAG = ""
			}
			ZSSU_DASHBOARD.SelectData = object;
		},
		onCancelDialog : function(){
			that.pendAmmend.close()
		},
		onselectDrop: function (evt) {
			that.flag = "X";
			var dropId = evt.getParameters().id.split("--")[1];
			var status = evt.getSource().getSelectedItem().getKey();
			if(dropId === "AVPC"){
				var field = "Status"
					dropId = "AVP"
				that._getDashboardData("/ES_DashAVP","AVPC",dropId,status,field);
			}else if(dropId === "PVC"){
				var field = "Status"
				that._getDashboardData("/ES_DashAVP","PVC",dropId,status,field);
			}else{
				dropId = "ASVP"
				var field = "Holder_ID"
				that._getDashboardData("/ES_DashAVP","Associate",dropId,status,field);
			}
//			setTimeout(asyncChartUpdate, 0);
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
				},
				 legendGroup:{layout:{position: 'bottom'}} 
			});
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(abc.getVizUid());
		},
		onSearch : function(evt){
			debugger
			var aFilters = [];
			var sQuery = evt.getSource().getValue();
			if(evt.getParameters().id === "pend_search"){
				var filter = new Filter("Amend_Type", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
				var oList = sap.ui.getCore().byId("id_tab");
				var oBinding = oList.getBinding();
				oBinding.filter(aFilters, "Application");
			}else{
				if (sQuery && sQuery.length > 0) {
					aFilters = [
						new Filter([
							new Filter("NpiNo", FilterOperator.Contains, sQuery),
							new Filter("PaperCode", FilterOperator.Contains, sQuery),
							new Filter("CurrentHolderName", FilterOperator.Contains, sQuery),
							new Filter("AssociateName", FilterOperator.Contains, sQuery)
						], false)
					];
				}
				var oList = that.byId("idProjectTable");
				var oBinding = oList.getBinding("items");
				oBinding.filter(aFilters, "Application");
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
		onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;
			if (!this._oTable) {
				this._oTable = this.byId('idProjectTable');
			}
			oTable = this._oTable;
			oRowBinding = oTable.getBinding('items');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: { columns: aCols },
				dataSource: oRowBinding,
				fileName: 'Summary Report.xlsx',
				worker: false // We need to disable worker because we are using a Mockserver as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},	
		createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				label: 'Paper No.',
				property: 'NpiNo',
			});
			aCols.push({
				label: 'Paper Type',
				property: 'PaperCode',
			});
			aCols.push({
				label: 'Paper Creation Date',
				property: 'Crdate',
			});
			aCols.push({
				label: 'Buyer Name',
				property: 'InitiatorName',
			});
			aCols.push({
				label: 'Associate Name',
				property: 'AssociateName',
			});
			aCols.push({
				label: 'Line Item Count',
				property : 'Item_Count',
				type:  EdmType.Number
			});
			aCols.push({
				label: 'Post To SAP Date',
				property : 'PTS_Date',
			});
			aCols.push({
				label: 'Ageing',
				property : 'AgeingDiffDays',
			});
			aCols.push({
				label: 'Status',
				property: 'Status',
				type: EdmType.Enumeration,
				valueMap: {
					'NR': 'SSU Buyers Request',
					'S':  'SSU Buyers Draft',
					'AR': 'Associate Request',
					'R':  'SSU Buyers Rejected',
					'AJ': 'Associate Rejected',
					'IC': 'SSU Buyers Post to SAP',
					'AC': 'Associate Post to SAP',
					'A1': 'Approver 1',
					'A2': 'Approver 2',
					'A3': 'Approver 3',
					'A4': 'Approver 4',
					'A5': 'Approver 5',
					'AS': 'Associate Draft'
				}		
			});
			return aCols;
		},
	});
});