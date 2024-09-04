sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"ZSSU_DASHBOARD/model/formatter"

], function (Controller, Fragment , MessageToast, JSONModel, MessageBox, UIComponent, Device, Filter,FilterOperator,formatter) {
	"use strict";
var remark;
var oID;
var unique=[];
var busy = new sap.m.BusyDialog();
var that,oDataModel ,AttachArrExt=[],FILECONTENTS1=[],approver, oTableId;
return Controller.extend("ZSSU_DASHBOARD.controller.Detail", {

		formatter : formatter,
		onInit: function () {
			that = this;
			//oDataModel = that.getOwnerComponent().getModel("Rent");
			that.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(that._routeMatched, that);
		},
		
		_routeMatched: function (oEvent) {
			debugger
			busy.open();
			that = this;
			 var object = ZSSU_DASHBOARD.SelectData ;
			 /*if(object.name === "Completed" || object.name === "Pending With TL"){
//				 that.getView().byId("idProductsTable").getColumns()[0].setVisible(false)
				 this.getOwnerComponent().getRouter().navTo("subList");
				 busy.close();
			 }else{*/
				 var oData = new JSONModel();
				 var result = object.results.reduce((unique, o) => {
		        	   if(!unique.some(obj => obj.AssociateName === o.AssociateName)) {
		        	      o.count = "0"
		        		   unique.push(o);
		        	    }
		        	    return unique;
		        	},[]);
				 
				 for(var i=0;i< result.length;i++){	
					var vAssociateDraft = 0,oCount=0,vAssociateRequest = 0,vAssociateReject = 0, vAssociateTotal=0,vAssociateComplete = 0;
					var vApproverA1 = 0,vApproverA2 = 0,vApproverA3 = 0,vApproverA4 = 0;
					var vSSUBuyerDraft = 0, vSSUBuyerRequest = 0,vSSUBuyerReject = 0, vSSUBuyerIC = 0;
					result[i].AssociateDraft = ""
					result[i].AssociateRequest  = ""
					result[i].AssociateReject  = ""
					result[i].AssociateComplete = ""					
					result[i].SSUDraft = ""
					result[i].SSURequest  = ""
					result[i].SSUReject  = ""
					result[i].SSUComplete = ""					
					result[i].A1 = ""
					result[i].A2  = ""
					result[i].A3  = ""
					result[i].A4 = ""	
					var tableId = that.getView().byId("idProductsTable");
					if(object.name === 'Pending with Associate'){
						tableId.getColumns()[1].setVisible(true);
						tableId.getColumns()[2].setVisible(true);
						tableId.getColumns()[3].setVisible(true);
						tableId.getColumns()[4].setVisible(true);
						tableId.getColumns()[5].setVisible(false);
						tableId.getColumns()[6].setVisible(false);
						tableId.getColumns()[7].setVisible(false);
						tableId.getColumns()[8].setVisible(false);
						tableId.getColumns()[9].setVisible(false);
						tableId.getColumns()[10].setVisible(false);
						tableId.getColumns()[11].setVisible(false);
//						tableId.getColumns()[12].setVisible(false);
					}else if(object.name === 'Pending with Approver'){
						tableId.getColumns()[1].setVisible(false);
						tableId.getColumns()[2].setVisible(false);
						tableId.getColumns()[3].setVisible(false);
						tableId.getColumns()[4].setVisible(false);
						tableId.getColumns()[5].setVisible(true);
						tableId.getColumns()[6].setVisible(true);
						tableId.getColumns()[7].setVisible(true);
						tableId.getColumns()[8].setVisible(true);
						tableId.getColumns()[9].setVisible(false);
						tableId.getColumns()[10].setVisible(false);
						tableId.getColumns()[11].setVisible(false);
//						tableId.getColumns()[12].setVisible(false);
					}else if(object.name === 'Pending with SSU Buyer'){
						tableId.getColumns()[9].setVisible(true);
						tableId.getColumns()[10].setVisible(true);
						tableId.getColumns()[11].setVisible(true);
//						tableId.getColumns()[12].setVisible(true);
						tableId.getColumns()[1].setVisible(false);
						tableId.getColumns()[2].setVisible(false);
						tableId.getColumns()[3].setVisible(false);
						tableId.getColumns()[4].setVisible(false);
						tableId.getColumns()[5].setVisible(false);
						tableId.getColumns()[6].setVisible(false);
						tableId.getColumns()[7].setVisible(false);
						tableId.getColumns()[8].setVisible(false);
					}
					object.results.filter(function (obj, index) {
				 		if(result[i].AssociateName ===  object.results[index].AssociateName){
				 			result[i].count = Number(result[i].count) + 1;
				    		if(object.results[index].Status === "AS"){
				    			vAssociateDraft++;
				    		}else if(object.results[index].Status === "AR"){
				    			vAssociateRequest++;
				    		}else if(object.results[index].Status === "AJ"){
				    			vAssociateReject++;
				    		}else if(object.results[index].Status === "AC"){
				    			vAssociateComplete++
				    		}	
				    		
				    		else if(object.results[index].Status === "A1"){
				    			vApproverA1++
				    		}	
				    		else if(object.results[index].Status === "A2"){
				    			vApproverA2++
				    		}	
				    		else if(object.results[index].Status === "A3"){
				    			vApproverA3++
				    		}	
				    		else if(object.results[index].Status === "A4"){
				    			vApproverA4++
				    		}	
				    		
				    		else if(object.results[index].Status === "S"){
				    			vSSUBuyerDraft++
				    		}	
				    		else if(object.results[index].Status === "NR"){
				    			vSSUBuyerRequest++
				    		}	
				    		else if(object.results[index].Status === "R"){
				    			vSSUBuyerReject++
				    		}	
				    		/*else if(object.results[index].Status === "IC"){
				    			vSSUBuyerIC++
				    		}	*/				    		
				    	}	
				 		result[i].AssociateDraft = vAssociateDraft
						result[i].AssociateRequest  = vAssociateRequest
						result[i].AssociateReject  = vAssociateReject
						result[i].AssociateComplete = vAssociateComplete
						
						result[i].SSUDraft = vSSUBuyerDraft
						result[i].SSURequest  = vSSUBuyerRequest
						result[i].SSUReject  = vSSUBuyerReject
//						result[i].SSUComplete = vSSUBuyerIC
						
						result[i].A1 = vApproverA1
						result[i].A2  = vApproverA2
						result[i].A3  = vApproverA3
						result[i].A4 = vApproverA4
				 	});					
				 }	
				 var oDataModel = new JSONModel();
				 oDataModel.setData({"results":result});
				 that.getView().setModel(oDataModel);
				 that.setValueLabel("vizFrame");
				that.getView().byId("detailpage").setTitle(object.name)
				busy.close()
//			 }
			 
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
				}
			});
			var oTooltip = new sap.viz.ui5.controls.VizTooltip({});
			oTooltip.connect(abc.getVizUid());
		},
		onPressNavButton : function(){
			this.getOwnerComponent().getRouter().navTo("Routeapp");
		},
		OnSelection : function(evt){
			debugger
			var detailObject = evt.getParameter("listItem").getBindingContext().getObject();
			ZSSU_DASHBOARD.detObject = detailObject
			this.getOwnerComponent().getRouter().navTo("subList");
		}
	});

});