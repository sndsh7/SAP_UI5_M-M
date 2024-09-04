sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.mahindra.ZSSU_Approve.controller.Master", {

		onInit: function () {
			this._initialMethod();
		},
		/*onBeforeRendering: function () {
			this._initialMethod();
		},*/

		_initialMethod: function () {
			var oController = this;
			var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
			var vFromDate = new Date();
			vFromDate.setMonth(vFromDate.getMonth() - 1);
			var vStart = uiDateToBackend(vFromDate);
			var vEnd = uiDateToBackend(new Date());
			busyDialog.open();
			var URL = "Application eq 'A'";
			oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_Master", {
				urlParameters: {
					"$filter": URL
				},
				success: function (oData, oResponse) {
					var oModelData = {
						"MasterListCount": oData.results.length,
						"MasterList": oData.results
					};
					var oModel = new sap.ui.model.json.JSONModel(oModelData);
					oController.getView().setModel(oModel, "ModelMasterData");
					oController.onSelectionChange();
					busyDialog.close();
				},
				error: function (oResponse) {
					busyDialog.close();
				}
			});
		},

		onClickFilter: function (oEvent) {
			var oFilterFrag;
			if (!oFilterFrag)
				oFilterFrag = sap.ui.xmlfragment("com.mahindra.ZSSU_Approve.fragment.Filter", this);
			oFilterFrag.open();
		},

		onSelectionChange: function (oEvent) {
			var oController = this;
			var oModelMasterData = oController.getView().getModel("ModelMasterData");
			var vSelectedPaper = oModelMasterData.getProperty("/MasterList/0/PaperCode");
			var vSelectedPaperNo = oModelMasterData.getProperty("/MasterList/0/NpiNo");
			if (oEvent) {
				vSelectedPaper = oModelMasterData.getProperty(oEvent.getParameter(
					"listItem").getBindingContextPath() + "/PaperCode");
				vSelectedPaperNo = oModelMasterData.getProperty(oEvent.getParameter(
					"listItem").getBindingContextPath() + "/NpiNo");
				navToDetailApr(oController, vSelectedPaper, vSelectedPaperNo);
			} else if (vSelectedPaperNo) {
				navToDetailApr(oController, vSelectedPaper, vSelectedPaperNo);
				oController.getView().byId("list").getItems()[0].setSelected(true);
			/*	var vHashChang = new sap.ui.core.routing.HashChanger();
				var vHash = vHashChang.getHash();
				var vIndex = -1;
				if (vHash != "") {
					$.each(oModelMasterData.getProperty("/MasterList"), function (i, row) {
						if (row.NpiNo == vHash.split("/")[1]) {
							vIndex = i;
						}
					});
				}

				if (vIndex == -1) {
					debugger;
					var vPatternApp = vSelectedPaper == "RM" ? "FRX" : vSelectedPaper;
					// if(vHash.split("&").length>1){
						vPatternApp = vHash.split("&")[0]+"&/"+vPatternApp;
					// }
					vHashChang.setHash(vPatternApp + "/" + vSelectedPaperNo + "," + vSelectedPaper);
					oController.getView().byId("list").getItems()[0].setSelected(true);
				} else {
					oController.getView().byId("list").getItems()[vIndex].setSelected(true);
				}*/

			} else {
				navToDetailApr(oController, "Default");
			}
		},
		onSearchMaster: function (oEvent) {
				var vSelectedValue = oEvent.getParameter("newValue");
				var oFilters = [];
				if (vSelectedValue && vSelectedValue.length > 0) {
					oFilters = new sap.ui.model.Filter({
						filters: [new sap.ui.model.Filter("NpiNo", sap.ui.model.FilterOperator.Contains, vSelectedValue),
							new sap.ui.model.Filter("Model", sap.ui.model.FilterOperator.Contains, vSelectedValue),
							new sap.ui.model.Filter("Sector", sap.ui.model.FilterOperator.Contains, vSelectedValue),
							new sap.ui.model.Filter("PaperText", sap.ui.model.FilterOperator.Contains, vSelectedValue),
							new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.Contains, vSelectedValue)
						],
						and: false
					})
				}
				var binding = this.byId("list").getBinding("items");
				binding.filter(oFilters);
		}
			/*onApprove: function () {
				debugger;
			},
			onReject: function () {
				debugger;
			}*/
	});

});