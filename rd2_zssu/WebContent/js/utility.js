var busyDialog = new sap.m.BusyDialog();
var paperCode;
//-------  Common Events Start Here------------------------
function minDate(){
	var minDate = new Date();
	if(minDate.getMonth()<3)
		minDate =  new Date(minDate.getFullYear()-1,3,2);
	else
		minDate =  new Date(minDate.getFullYear(),3,2);
	return minDate;
}
function navBack() {
//	this._fnLockUnlockService("");
	localStorage.setItem('NavBack',"X")

	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	oRouter.navTo("Home");
//	this.getView().byId("id_create").setVisible(true);
//	this.getView().byId("id_create").oModelSSUDigitization.setProperty("/CreateNewEnable", true);
}
function PageData(PaperCode){
	switch (PaperCode){
	case "CCR":
		return com.mahindra.ZSSU_CCR.oData;
	case "RM":
		return com.mahindra.ZSSU_RM.oData;
	case "FRX":
		return com.mahindra.ZSSU_Forex.oData;
	case "PA":
		return com.mahindra.ZSSU_PriceActulistn.oData;
	case "NEG":
		return com.mahindra.ZSSU_Nego.oData;
	case "PYA":
		return com.mahindra.ZSSU_PrvYrAmndt.oData;
	case "PC":
		return com.mahindra.ZSSU_PriceCrctn.oData;
	case "CIT":
		return com.mahindra.ZSSU_CIT_PayTerms.oData;
	case "ECN":
		return com.mahindra.ZSSU_ECN.oData;
	case "RCM":
		return com.mahindra.ZSSU_Rocm.oData;
	case "HSD":
		return com.mahindra.ZSSU_HSD.oData;
	case "PKG":
		return com.mahindra.SSU_Packaging.oData;
	case "TRS":
		return com.mahindra.SSU_Transportn.oData;
	case "MSP":
		return com.mahindra.ZSSU_MVP.oData;
	}
	com.mahindra.ZSSU_MVP.oData
}
function navParentBack(){
	localStorage.setItem('NavBack',"X")
	var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
	"CrossApplicationNavigation");
	var href = (xnavservice && xnavservice.hrefForExternal({
		target: {
			semanticObject: "ZSSU_Project",
			action: "create"
		}
	})) || "";

	var url = window.location.href.split('#')[0] + href;
	sap.m.URLHelper.redirect(url, false);
//	back button functionality for prevent unsaved data at initial level
//	var oController = this
//	var paperCode = this.getOwnerComponent().getComponentData().startupParameters.PaperNumber[1]
//	var oData = PageData(paperCode) ? PageData(paperCode) : "";//com.mahindra.ZSSU_MVP.oData
//	debugger;
//	if(oData != ""){
//		localStorage.setItem('NavBack',"X")
//		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
//		"CrossApplicationNavigation");
//		var href = (xnavservice && xnavservice.hrefForExternal({
//			target: {
//				semanticObject: "ZSSU_Project",
//				action: "create"
//			}
//		})) || "";
//
//		var url = window.location.href.split('#')[0] + href;
//		sap.m.URLHelper.redirect(url, false);
//	}else{
//		sap.m.MessageBox.error("If you go back now, your unsaved data will be discarded.", {
//	        title: "Discard changes.",
//			actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
//	        onClose: function (sAction) {
//	            if (sAction === "YES") {
//	            	localStorage.setItem('NavBack',"X")
//	        		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
//	        		"CrossApplicationNavigation");
//	        		var href = (xnavservice && xnavservice.hrefForExternal({
//	        			target: {
//	        				semanticObject: "ZSSU_Project",
//	        				action: "create"
//	        			}
//	        		})) || "";
//
//	        		var url = window.location.href.split('#')[0] + href;
//	        		sap.m.URLHelper.redirect(url, false);
//	            }
//	        }
//	    });
//	}
//	sap.m.MessageBox.error("If you go back now, your unsaved data will be discarded.", {
//        title: "Discard changes.",
//		actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
//        onClose: function (sAction) {
//            if (sAction === "YES") {
//            	localStorage.setItem('NavBack',"X")
//        		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
//        		"CrossApplicationNavigation");
//        		var href = (xnavservice && xnavservice.hrefForExternal({
//        			target: {
//        				semanticObject: "ZSSU_Project",
//        				action: "create"
//        			}
//        		})) || "";
//
//        		var url = window.location.href.split('#')[0] + href;
//        		sap.m.URLHelper.redirect(url, false);
//            }
//        }
//    });
	
}

function onAfterCloseFragment(oEvent) {
	oEvent.getSource().destroy();
}

function onSettingOk(oEvent) {
	var vSelectedColumns = oEvent.getSource().getParent().getContent()[0].getSelectedItems().length;
	if (vSelectedColumns > 8)
		sap.m.MessageToast.show("Maximum 8 Columns can Select");
	else
		oEvent.getSource().getParent().close();
}

function onCancelDialog(oEvent) {
	oEvent.getSource().getParent().close();
}

function onTypeMissmatch(oEvent) {
	sap.m.MessageToast.show("'" + oEvent.getParameter("files")[0].fileType + "' file format not permit for upload.");
}

function onFileSizeExceed(oEvent) {
	var vFileSize = this.getView().getModel("ModelDefaultDataSet").getProperty("/maxUploadSize");
	sap.m.MessageToast.show("File size exceed more than " + vFileSize + "MB.");
}

function onFilenameLengthExceed(oEvent) {
	var vFilenameLength = this.getView().getModel("ModelDefaultDataSet").getProperty("/filenameLength");
	sap.m.MessageToast.show("Filename length exceed more than " + vFilenameLength + ".");
}
//ADD Start By AGAWSA-CONT on 19-01-2023
function onAssociateValHelp(evt) {
	debugger
	var oController = this;
	var oAssociateF4;
	this.prevAssociate = evt.getSource().getModel("ModelSSUDigitization").getData().PaperDataSet.AssociatePrev
	if(oController.getView().getViewName() == "com.mahindra.ZSSU.view.NewPinfo")
		var oAssociateF4 = xmlFragment(oController, "AssociateF4");
	else
		var oAssociateF4 = parentXmlFragment(oController, "AssociateF4");
	oAssociateF4.open();

}

function onSearchAssociate(oEvent) {
	var sValue = oEvent.getParameter("value");
	var oFilters = new sap.ui.model.Filter({
		filters: [
			new sap.ui.model.Filter("Associate", sap.ui.model.FilterOperator.Contains, sValue),
			new sap.ui.model.Filter("AssociateName", sap.ui.model.FilterOperator.Contains, sValue)
			],
			and: false
	})
	var oBinding = oEvent.getParameter("itemsBinding");
	oBinding.filter([oFilters]);
}

function onOKAssociate(oEvent) {
	var vAssociate = oEvent.getParameter("selectedItem").getTitle();
	var vAssociateName = oEvent.getParameter("selectedItem").getDescription();
	oEvent.getSource().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/Associate",vAssociate);
	oEvent.getSource().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/AssociateName",vAssociateName);
	paperCode = this.getOwnerComponent().getComponentData().startupParameters.PaperNumber[1]
	//added by beena on 13-03-2023
	if(paperCode === "CCR"){
		var oData = com.mahindra.ZSSU_CCR.oData
	}
	if(paperCode === "RM"){
		var oData = com.mahindra.ZSSU_RM.oData
	}
	if(paperCode === "FRX"){
		var oData = com.mahindra.ZSSU_Forex.oData

	}if(paperCode === "PA"){
		var oData = com.mahindra.ZSSU_PriceActulistn.oData
	}if(paperCode === "NEG"){
		var oData = com.mahindra.ZSSU_Nego.oData
	}if(paperCode === "PYA"){
		var oData = com.mahindra.ZSSU_PrvYrAmndt.oData
	}if(paperCode === "PC"){
		var oData = com.mahindra.ZSSU_PriceCrctn.oData
	}if(paperCode === "CIT"){
		var oData = com.mahindra.ZSSU_CIT_PayTerms.oData
	}if(paperCode === "ECN"){
		var oData = com.mahindra.ZSSU_ECN.oData
	}if(paperCode === "RCM"){
		var oData = com.mahindra.ZSSU_Rocm.oData
	}if(paperCode === "HSD"){
		var oData = com.mahindra.ZSSU_HSD.oData
	}if(paperCode === "PKG"){
		var oData = com.mahindra.SSU_Packaging.oData
	}if(paperCode === "TRS"){
		var oData = com.mahindra.SSU_Transportn.oData
	}if(paperCode === "MSP"){
		var oData = com.mahindra.ZSSU_MVP.oData
	}
//	if(this.prevAssociate  === vAssociate){
//		if(oData !== undefined){
//			if(oData.Nav_Wf.length === 0 && oData.Status !== "NR"){
//				this.getView().byId("redelegation").setVisible(false);
//			}else if(oData.Nav_Wf.length !== 0 && (oData.Status === "NR" || 
//					oData.Status === "AS" || oData.Status === "AR" || oData.Status === "AC")){
//				this.getView().byId("redelegation").setVisible(false);
//			}else{
//				this.getView().byId("redelegation").setVisible(true);
//			}
//		}
//	}else{
//		if(oData !== undefined){
//			if(oData.Nav_Wf.length === 0 && oData.Status !== "NR"){
//				this.getView().byId("redelegation").setVisible(false);
//			}else if(oData.Nav_Wf.length !== 0 && oData.Status === "NR"){
//				this.getView().byId("redelegation").setVisible(false);
//			}else{
//				this.getView().byId("redelegation").setVisible(true);
//			}
//		}
//		
//	}
	if(this.prevAssociate  === vAssociate){
		if(oData.Nav_Wf.length !== 0 && (oData.Status === "S" || oData.Status === "R" || oData.Status === "" || oData.Status === undefined)){
			this.getView().byId("redelegation").setVisible(true);
		}else{
			this.getView().byId("redelegation").setVisible(false);
		}
	}else{
		if(oData.Nav_Wf.length !== 0 && (oData.Status === "AS" || oData.Status === "AR" || oData.Status === "AC" || oData.Status === "S" || oData.Status === "R" || oData.Status === "AJ")){
			this.getView().byId("redelegation").setVisible(true);
		}else{
			this.getView().byId("redelegation").setVisible(false);
		}
	}

}
//ADD End By AGAWSA-CONT on 19-01-2023
//-------  Common Events End Here------------

//-------  Common Formatters Start Here--------------------
function formatterSetSign(vValue) {
	if (vValue) {
		return vValue+" VE";
	} else {
		return "";
	}
}


function dateObjToLocal(oDate) {
	if (oDate) {
		return oDate.toDateString().slice(4);
	}
}

function formatterEnableNot(vValue) {
	return !vValue;
}

function formatterEditVisible(vDisplayFlag, vEditableFlag) {
	return !vDisplayFlag && !vEditableFlag;
}

function formatterDisplayVisible(vDisplayFlag, vEditableFlag) {
	return vDisplayFlag || !vEditableFlag;
}

function formatterValidationVisible(vDisplayOnlyFlag, vBEValidation, vItem) { //true // Added by AGAWSA-CONT on 21-01-2023
	if(vItem == undefined){
		return false;				// Added by AGAWSA-CONT-SF1K920444
	}else{
		return !vDisplayOnlyFlag && !vBEValidation ? true:false;
	}
}

function oDataMSToTime(s) {
	if (s) {
		s = s.ms;
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;

		return hrs + ':' + mins + ':' + secs;
	}

}

function visibleApprover(vValue) {
	return vValue != "" ? true : false;
}

function setUserLevel(vUserLevel) {
	if (vUserLevel == "NR") {
		return "Requester";
	} else if (vUserLevel == "IR" || vUserLevel == "IC") {
		return "Initiator";
	} else if (vUserLevel == "A1") {
		return "Approver1";
	} else if (vUserLevel == "A2") {
		return "Approver2";
	} else if (vUserLevel == "A3") {
		return "Approver3";
	} else if (vUserLevel == "A4") {
		return "Approver4";
	} else if (vUserLevel == "A5") {
		return "Approver5";
	} else if (vUserLevel == "A6") {
		return "Approver6";
	} else if (vUserLevel == "A7") {
		return "Approver7";
	} else if (vUserLevel == "A8") {
		return "Approver8";
	}else if (vUserLevel == "SS") {
		return "SSU Executive";
	}else if (vUserLevel == "P1") {
		return "CDMM Approver 1";
	}else if (vUserLevel == "P2") {
		return "CDMM Approver 2";
	}else if (vUserLevel == "P3") {
		return "CDMM Approver 3";
	}else if (vUserLevel == "AS" || vUserLevel == "AC") {	// Added by AGAWSA-CONT on 25-01-2023
		return "SSU Associate";	
	}else if (vUserLevel == "TL") {	// Added by AGAWSA-CONT-SF1K920444
		return "Team Lead";	
	}
}

function setStatus(vStatus) {
	if (vStatus == "NR" || vStatus == "AR") { // Added by AGAWASA-CONT on 25-01-2023
		return "Request";
	} else if (vStatus == "S") {
		return "Draft";
	} else if (vStatus == "C") {
		return "Completed";
	} else if (vStatus == "R" || vStatus == "AJ") {
		return "Rejected";
	} else if (vStatus == "IC" || vStatus == "AC") { // Added by AGAWSA-CONT on 27-01-2023
		return "Post to SAP";
	} else {
		return "Pending";
	}
}

function setAction(vAction) {
	if (vAction == "S" || vAction == "NR") {
		return "Submitted";
	} else if (vAction == "A") {
		return "Approved";
	} else if (vAction == "R") {
		return "Rejected";
	} else if (vAction == "P") {
		return "Post to SAP";
		//added by REDDRA-CONT on 15-03-2022
	} else if (vAction == "M") {
		return "Marked For Deletion";
//		ADD Start by AGAWSA-CONT on 25-03-2023
	} else if (vAction == "AR") {
		return "Seek Clearance";
	} else if (vAction == "AA") {
		return "Associate Accepted";
	}else if (vAction == "DL") {
			return "Delegated";
	}else{
		return "Redelegated";
	}
//	ADD End by AGAWSA-CONT on 25-03-2023
}

function setStatusColor(vStatus) {
	if (vStatus == "S" || vStatus == "NR") {
		return sap.ui.core.ValueState.Information;
	} else if (vStatus == "C") {
		return sap.ui.core.ValueState.Success;
	} else if (vStatus == "R") {
		return sap.ui.core.ValueState.Error;
	} else {
		return sap.ui.core.ValueState.Warning;
	}
}

function formattSetModel(vModel){
	if(this.getBindingContext("ModelSSUDigitization")){
		var oModels = this.getBindingContext("ModelSSUDigitization").getProperty("/PaperDataSet/Model");
		if(oModels.indexOf(vModel)>=0)
			return true;
		else
			return false;
	}

}
//-------  Common Formatters End Here--------

//-------  Common Methods Start Here----------------------

function onSearch(oEvent) {
	var sValue = oEvent.getParameter("value");
	var oFilter = new sap.ui.model.Filter("ModelCode", sap.ui.model.FilterOperator.Contains, sValue);
	var oBinding = oEvent.getParameter("itemsBinding");
	oBinding.filter([oFilter]);
}
/*function onDialogClose (oEvent) {
  var vSelectedItems = [];

  $.each(oEvent.getParameter("selectedItems"), function(i,Row){
    vSelectedItems.push(Row.getTitle())
  });
  if (vSelectedItems && vSelectedItems.length && vSelectedItems.toString().length<100) {
    this.getView().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/Model",vSelectedItems);
  } else if(vSelectedItems.toString().length>100) {
    var oController = this;
    var oValueHelp
    if(oController.getView().getViewName() == "com.mahindra.ZSSU.view.NewPinfo")
      oValueHelp = xmlFragment(oController, "ModelDialog");
    else
      oValueHelp = parentXmlFragment(oController, "ModelDialog");
    oValueHelp.open();
    sap.m.MessageToast.show("Max length exceeded 100.");
  } else {
    oEvent.getSource().getBinding("items").filter([]);
  }
}*/

function onModelOK(oEvent){

	var vSelectedItems = [];

	$.each(oEvent.getSource().getParent().getContent()[1].getSelectedItems(), function(i,Row){
		vSelectedItems.push(Row.getTitle())
	});
	if(vSelectedItems.toString().length>100) {
		sap.m.MessageToast.show("Max length exceeded 100.");
		return;
	}
	if (vSelectedItems && vSelectedItems.length) {
		this.getView().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/Model",vSelectedItems);
		oEvent.getSource().getParent().close();
	} 

}

function onSearchModel(oEvent) {
	debugger;
	var oBindItems = oEvent.getSource().getParent().getContent()[1].getBinding("items");
	var vSelectedValue = oEvent.getParameter("newValue");

	var oFilters = [];
	if (vSelectedValue && vSelectedValue.length > 0) {
		oFilters = new sap.ui.model.Filter({
			filters: [new sap.ui.model.Filter("ModelCode", sap.ui.model.FilterOperator.Contains, vSelectedValue)],
			and: false
		})
	}
	oBindItems.filter(oFilters);
}

function onModelCancel(oEvent){
	oEvent.getSource().getParent().close();
}

function getStartupParameters(oController) {
	var sComponentId = sap.ui.core.Component.getOwnerIdFor(oController.getView());
	return sap.ui.component(sComponentId).getComponentData().startupParameters;
}

function navToDetailApr(oController, vPaperCode, vPaperNum) {
	var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
	vPaperNum = vPaperNum ? vPaperNum : "new";
	var vPaper = vPaperCode == "RM" ? "FRX" : vPaperCode;
	oRouter.navTo(vPaper, {
		Number: vPaperNum,
		PaperCode: vPaperCode
	});
}

function navToDetail(oController, vPaper, vPaperNum,vPartSetlFlag) {
	vPaperNum = vPaperNum ? vPaperNum : "new";

	if (vPaper == "NPI") {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
		oRouter.navTo(vPaper, {
			Number: vPaperNum
		});
	} else if(vPartSetlFlag == "X"){
//		var vSemanticObject = vPaper == "RM" ? "FRX" : vPaper;
		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
		"CrossApplicationNavigation");
		var href = (xnavservice && xnavservice.hrefForExternal({
			target: {
				semanticObject: vPaper,
				action: "create"
			},
			params: {
				"PaperNumber": [vPaperNum,vPaper,vPartSetlFlag]
			}
		})) || "";
		var url = window.location.href.split('#')[0] + href;
		sap.m.URLHelper.redirect(url, true);
	}
	else if(vPartSetlFlag == "Y") {
		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
		"CrossApplicationNavigation");
		var href = (xnavservice && xnavservice.hrefForExternal({
			target: {
				semanticObject: vPaper,
				action: "create"
			},
			params: {
				"PaperNumber": [vPaperNum,vPaper,vPartSetlFlag]
			}
		})) || "";



		var url = window.location.href.split('#')[0] + href;
		sap.m.URLHelper.redirect(url, true);
	}
	else
	{


//		var vSemanticObject = vPaper == "RM" ? "FRX" : vPaper;
		var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
		"CrossApplicationNavigation");
		var href = (xnavservice && xnavservice.hrefForExternal({
			target: {
				semanticObject: vPaper,
				action: "create"
			},
			params: {
				"PaperNumber": [vPaperNum,vPaper]
			}
		})) || "";

		var url = window.location.href.split('#')[0] + href;
		sap.m.URLHelper.redirect(url, false);
	}
}
function getApplicationPath(oController) {
	if (oController.getOwnerComponent() && oController.getOwnerComponent().getMetadata().getRootView().viewName) {
		var vViewName = oController.getOwnerComponent().getMetadata().getRootView().viewName;
		var vAppPath = vViewName.split(".").slice(0, 3).join("/");
		return vAppPath;
	}
}

function xmlFragment(oController, vFragmentName) {
	var oFragment;
	var vAppPath = getApplicationPath(oController);
	if (!oFragment)
		oFragment = sap.ui.xmlfragment(vAppPath + "/fragment/" + vFragmentName, oController);
	oController.getView().addDependent(oFragment);
	oFragment.addEventDelegate({ //todo  m.select
		onAfterRendering: function () {
			$(".sapMComboBox").find("input").attr("readonly", true);
		}
	});
	return oFragment;
}

function parentXmlFragment(oController, vFragmentName) {
	var oFragment;
	var vAppPath = "SSU";
	if (!oFragment)
		oFragment = sap.ui.xmlfragment(vAppPath + "/fragment/" + vFragmentName, oController);
	oController.getView().addDependent(oFragment);
	oFragment.addEventDelegate({ //todo  m.select
		onAfterRendering: function () {
			$(".sapMComboBox").find("input").attr("readonly", true);
		}
	});
	return oFragment;
}
/*function xmlParentFragment(oController, vFragmentName) {
  var oFragment;
  if (!oFragment)
    oFragment = sap.ui.xmlfragment("com/mahindra/ZSSU/fragment/" + vFragmentName, oController);
  oController.getView().addDependent(oFragment);
  oFragment.addEventDelegate({ //todo  m.select
    onAfterRendering: function () {
      $(".sapMComboBox").find("input").attr("readonly", true);
    }
  });
  return oFragment;
}*/

function createDynamicMTable(oController, oTable, vColumnListPath, vTableBindingPath, oActions) {
	var vBindingPathModel = vTableBindingPath.split(">")[0];
	var vColumnPathModel = vColumnListPath.split(">")[0];
	var vColumnPath = vColumnListPath.split(">")[1];
	var oColumnModelData = oController.getView().getModel(vColumnPathModel).getProperty(vColumnPath);

	oTable.bindAggregation("columns", vColumnListPath, function (index, context) {
		return new sap.m.Column({
			"visible": "{" + vColumnPathModel + ">selected}",
			"header": new sap.m.Label({
				text: "{" + vColumnPathModel + ">headerText}",
				"design": "Bold"
			}),
			"hAlign": "Center",
			"width": "{" + vColumnPathModel + ">width}"
		});
	});
	if (vTableBindingPath.search(">") >= 0) {
		oTable.bindItems(vTableBindingPath, new sap.m.ColumnListItem({
			highlight:{
				path : vBindingPathModel+">BjStatus",
				formatter: function(vBjStatus){
					if (vBjStatus == "C")
						return "Success";
					else if(vBjStatus == "R")
						return "Error";
					else
						return "None";
				}},// for post to sap
				cells: oColumnModelData.map(function (columnName) {
					if (columnName.bkKey == "Actions") {
						return oActions;
					} else {
						return new sap.m.ObjectIdentifier({
//							title: "{" + vBindingPathModel + ">" + columnName.bkText + "}",
//							text: "{" + vBindingPathModel + ">" + columnName.bkKey + "}"
							title: {parts:[{path: vBindingPathModel + ">" + columnName.bkText},
								{path: vBindingPathModel + ">" + columnName.importVendor}],
								filters: [{path: 'Delete', operator: 'NE', value1: 'X'}],
								formatter: function(vValue,vImportVendor){
									if(typeof vValue == "object")
										return dateObjToLocal(vValue);
									else if(vImportVendor == "X")
										return vValue+" (Import)";
									else
										return vValue;
								}
							},
							text: {
								path : vBindingPathModel + ">" + columnName.bkKey,
								filters: [{path: 'Delete', operator: 'NE', value1: 'X'}],
								formatter: function(vValue){
									if(typeof vValue == "object")
										return dateObjToLocal(vValue);
									else
										return vValue;;
								}
							}
						})
					}
				}),
		}));
	} else {
		oTable.addItem(new sap.m.ColumnListItem({
			cells: oColumnModelData.map(function (columnName) {
				if (columnName.bkKey == "Actions") {
					return oActions;
				} else {
					return new sap.m.ObjectIdentifier({
//						title: "{" + vBindingPathModel + ">" + columnName.bkText + "}",
//						"text": "{" + vBindingPathModel + ">" + columnName.bkKey + "}"
						title: {parts:[{path: vBindingPathModel + ">" + columnName.bkText},
							{path: vBindingPathModel + ">" + columnName.importVendor}],
							filters: [{path: 'Delete', operator: 'NE', value1: 'X'}],
							formatter: function(vValue,vImportVendor){
								if(typeof vValue == "object")
									return dateObjToLocal(vValue);
								else if(vImportVendor == "X")
									return vValue+" (Import)";
								else
									return vValue;
							}
						},
						text: {
							path : vBindingPathModel + ">" + columnName.bkKey,
							filters: [{path: 'Delete', operator: 'NE', value1: 'X'}],
							formatter: function(vValue){
								if(typeof vValue == "object")
									return dateObjToLocal(vValue);
								else
									return vValue;;
							}
						}
					})
				}
			}),
		}));
	}
	if(oTable.getBinding("items")){
		oTable.getBinding("items").sort([new sap.ui.model.Sorter("BjStatus",true,false,function(a,b){
			if(a=="E") 
				a="B"
					if(b=="E")
						b="B"
							if(a>b)
								return -1;
							else
								return 1
		})])
	}

	// oTable.getBinding("items").filter([new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")]);
}

function columnsSetting(oController, vColumnListPath) { //for columns Setting fragment
	if(oController.getView().getViewName() == "com.mahindra.ZSSU.view.NewPinfo")
		var oColumnsSettingFrag = xmlFragment(oController, "ColumnsSetting");
	else
		var oColumnsSettingFrag = parentXmlFragment(oController, "ColumnsSetting");
	// var vHeaderText=oColumnsSettingFrag.getCustomHeader().getContentMiddle()[0].getText();
	//oColumnsSettingFrag.getCustomHeader().getContentMiddle()[0].setText(vHeaderText+"{"+vColumnListPath+"/0/headerText}");
	oColumnsSettingFrag.onsapescape = function (e) {
		e.preventDefault();
		e.stopPropagation()
	};
	var vColumnPathModel = vColumnListPath.split(">")[0];
	oColumnsSettingFrag.getContent()[0].bindItems({
		path: vColumnListPath,
		template: new sap.m.StandardListItem({
			blocked: "{" + vColumnPathModel + ">fixed}",
			title: "{" + vColumnPathModel + ">headerText}",
			selected: "{" + vColumnPathModel + ">selected}",
		})
	});
	oColumnsSettingFrag.open();
}

function uiDateToBackend(oUiDate) {
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
}

/*function messageBox(vStatus, vMessage, vTitle) {
  if (vStatus == "Error") {
    return sap.m.MessageBox.error(vMessage, {
      title: vTitle == "" ? vStatus : vTitle
    });
  } else if (vStatus == "Information") {
    sap.m.MessageBox.information(vMessage, {
      title: vTitle == "" ? vStatus : vTitle
    });
  } else if (vStatus == "Success") {
    sap.m.MessageBox.success(vMessage, {
      title: vTitle == "" ? vStatus : vTitle
    });
  } else {
    sap.m.MessageBox.show(vMessage, {
      icon: sap.m.MessageBox.Icon.NONE
    });
  }
}*/

function serviceError(oResponse) {
	busyDialog.close();
	var vMsg = "Error in service.";
	var vTitle = "Error";
	if (oResponse.responseText && oResponse.responseText.indexOf("message") > 0) {
		var oError = JSON.parse(oResponse.responseText);
		vMsg = oError.error.message.value;
		vTitle = oResponse.message;

	} else if (oResponse.message) {
		vMsg = oResponse.message;
	}

	return sap.m.MessageBox.error(vMsg, {
		title: vTitle
	});
}

function serviceSucess(oReturnMsg) {
	busyDialog.close();
	var vMsg = "";
	var vTitle = "";
	$.each(oReturnMsg, function (i, Row) {
		if (Row.Type == "E") {
			vMsg = vTitle == "Sucess" ? "" : vMsg;
			vMsg = vMsg == "" ? Row.Message : vMsg + ",\n" + Row.Message;
			vTitle = "Error";
		}
		if (vTitle != "Error" && Row.Type == "S") {
			vMsg = vMsg == "" ? Row.Message : vMsg + ",\n" + Row.Message;
			vTitle = "Sucess";
		}
	});
	return {
		Title: vTitle,
		Message: vMsg
	};
}

function onCheckNumberLeng5(oEvent) {
	var vNewValue = oEvent.getParameter("newValue");
	var vNewValueArray = vNewValue.split(".");
	if (vNewValue.length > 5) {
		oEvent.getSource().setValue(vNewValueArray[0].slice(0, 5));
	} else {
		oEvent.getSource().setValue(vNewValueArray[0]);
	}
}


function onMultDeltItem(oEvent){
	var oController = this;

	sap.m.MessageBox.confirm("Are you sure you want to delete this.", {
		title: "Confirm Delete",
		onClose: function (oAction) {
			if (oAction == "OK") {
				var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
				var oItemData = [];
				var vPaperCode = oModelSSUDigitization.getData().PaperDataSet.PaperCode;
				var oSelectedPath = oController.getView().byId("idPartPriceTbl").getSelectedContextPaths();
				if(oModelSSUDigitization.getProperty("/PostToSapSelectAll")){
					oSelectedPath=[];
					if(vPaperCode == "MSP"){
						$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_ItemsMSP"),function(i,Row){
							oSelectedPath.push("/PaperDataSet/Nav_ItemsMSP/"+i);
						});
					}else{
						$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items"),function(i,Row){
							oSelectedPath.push("/PaperDataSet/Nav_Items/"+i);
						});
					}
				} 

				var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedItems") || [];
				$.each(oSelectedPath,function(i,Row){
					oModelSSUDigitization.setProperty(Row+"/Delete","X");
					oDeletedItems.push(oModelSSUDigitization.getProperty(Row));

//					oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").splice(i, 1);

				});

				if(!oModelSSUDigitization.getProperty("/PostToSapSelectAll")){
					if(vPaperCode == "MSP"){
						$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_ItemsMSP"),function(i,Row){
							if(Row.Delete != "X")
								oItemData.push(Row);
						});
					}else{
						$.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items"),function(i,Row){
							if(Row.Delete != "X")
								oItemData.push(Row);
						});
					}
				}
				//added by beena on 20-03-2023 refer AGAWSA-CONT
//				if(oItemData.length !== 0){
//					oController.getView().byId("itemCount").setText("Item Count: " + oItemData.length);
//				}else{
//					oController.getView().byId("itemCount").setText("");
//				}
				if(vPaperCode == "MSP"){
					oModelSSUDigitization.setProperty("/PaperDataSet/Nav_ItemsMSP", oItemData);
				}else{
					oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oItemData);
				}
				
				
				if(oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo")||oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo")){
					oModelSSUDigitization.setProperty("/PaperDataSet/DeletedItems", oDeletedItems);
				}
				// Added by REDDRA-CONT on 16-12-2021
//				oController.getView().byId("id_export").setVisible(false);
				oModelSSUDigitization.refresh();
			}
		}
	});

}
//-------  Common Methods End Here-----------