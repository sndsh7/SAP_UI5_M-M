var busyDialog = new sap.m.BusyDialog();
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
	var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	oRouter.navTo("Home");
}

function navParentBack(){
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
//-------  Common Events End Here------------

//-------  Common Formatters Start Here--------------------

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

function formatterValidationVisible(vDisplayOnlyFlag, vBEValidation) { //true 
	return !vDisplayOnlyFlag && !vBEValidation
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
	}
}

function setStatus(vStatus) {
	if (vStatus == "NR") {	
		return "Request";	
	} else if (vStatus == "S") {
		return "Draft";
	} else if (vStatus == "C") {
		return "Completed";
	} else if (vStatus == "R") {
		return "Rejected";
	} else if (vStatus == "IC") {
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
	}
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
//-------  Common Formatters End Here--------

//-------  Common Methods Start Here----------------------

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

function navToDetail(oController, vPaper, vPaperNum) {

	vPaperNum = vPaperNum ? vPaperNum : "new";

	if (vPaper == "NPI") {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
		oRouter.navTo(vPaper, {
			Number: vPaperNum
		});
	} else {
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
						title: "{" + vBindingPathModel + ">" + columnName.bkText + "}",
//						text: "{" + vBindingPathModel + ">" + columnName.bkKey + "}"
						text: {
							path : vBindingPathModel + ">" + columnName.bkKey,
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
						title: "{" + vBindingPathModel + ">" + columnName.bkText + "}",
//						"text": "{" + vBindingPathModel + ">" + columnName.bkKey + "}"
						text: {
							path : vBindingPathModel + ">" + columnName.bkKey,
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
	// oTable.getBinding("items").filter([new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")]);
}

function columnsSetting(oController, vColumnListPath) { //for columns Setting fragment
	var oColumnsSettingFrag = xmlFragment(oController, "ColumnsSetting");
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

//	oDate = oDate.toISOString();
//	return oDate.slice(0, oDate.lastIndexOf("."));
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
//-------  Common Methods End Here-----------