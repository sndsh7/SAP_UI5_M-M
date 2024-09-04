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
  "ZSSU_TL/model/formatter"

  ], function (Controller, Fragment , MessageToast, JSONModel, MessageBox, UIComponent, Device, Filter,FilterOperator,formatter) {
  "use strict";
  var remark;
  var oID;
  var that,oDataModel ,AttachArrExt=[],FILECONTENTS1=[],approver, oTableId;
  var busy = new sap.m.BusyDialog();
  return Controller.extend("ZSSU_TL.controller.Detail", {

    formatter : formatter,
    onInit: function () {
      that = this;
      //oDataModel = that.getOwnerComponent().getModel("Rent");
      that.getOwnerComponent().getRouter().getRoute("Detail").attachPatternMatched(that._routeMatched, that);
    },
    loadAssociate: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oPaperData = oController.getView().getModel("PaperDataSet");
      var vPaperCode = oPaperData.oData.PaperCode;
      busy.open();
      var filters = [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)];
      oModelSSUDigitization.read("/ES_SSUAssociate", {
        filters: filters,
        success: function (oData, oResponse) {
//          oModel.setProperty("/F4Associate", oData.results);
          // busyDialog.close();
          busy.close();
          var oModel = new sap.ui.model.json.JSONModel(oData);
          oController.getView().setModel(oModel, "associate");
        },
        error: function (oResponse) {
          MessageBox.error("Error loading Initiator.", {
            title: "Error"
          });
          // busyDialog.close();
          busy.close();
        }
      });
    },
    _fnGetNPIHeaderData: function (vPaperNo,vPaperCode) {
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      busy.open();
      var vParmeters = {
          "$expand": "Nav_Items,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret",
      };
      oDataAmendmentModel.read("/ES_Header(PaperCode='"+vPaperCode+"',PaperNo='"+vPaperNo+"')", {
        urlParameters: vParmeters,
        success: function (oData, oResponse) {
          var oModel = new sap.ui.model.json.JSONModel(oData);
          oData.Nav_Wf = oData.Nav_Wf.results  || oData.Nav_Wf;
          oController.getView().setModel(oModel, "PaperDataSet");
          oController.getView().byId('id_InputAssociate').setValueState("None");
          busy.close();
        },
        error: function (oResponse) {
          Message.error("Error while getting data.", {
            title: "Error"
          });
          oController.getView().byId('id_InputAssociate').setValueState("None");
          busy.close();
        }
      });
    },
    onTitlePress: function(oEvent){
      var oController = this;
      var vPaperNo = oController.oView.oModels.MasterData.oData.NpiNo;
      var vPaperCode = oController.oView.oModels.MasterData.oData.PaperCode;
      var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");
      var href = (xnavservice && xnavservice.hrefForExternal({
        target: {
          semanticObject: vPaperCode,
          action: "create"
            },
           params: {
             "PaperNumber": [vPaperNo,vPaperCode,"X"]
             }
            })) || "";



      var url = window.location.href.split('#')[0] + href;
      sap.m.URLHelper.redirect(url, true);
    },
    onOKAssociate: function(oEvent) {
      var oController = this;
      var vAssociate = oEvent.getParameter("selectedItem").getTitle();
      var vAssociateName = oEvent.getParameter("selectedItem").getDescription();
//      oEvent.getSource().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/Associate",vAssociate);
//      oEvent.getSource().getModel("associate").setProperty("/AssociateName",vAssociateName);
      oEvent.getSource().getModel("PaperDataSet").setProperty("/Associate",vAssociate);
      oEvent.getSource().getModel("PaperDataSet").setProperty("/AssociateName",vAssociateName);
      oEvent.getSource().getModel("PaperDataSet").setProperty("/AssociateFlag","X");
      oController._fnRequredFieldCheck();
    },
    _routeMatched: function (oEvent) {
      debugger
      that = this;
      var selectedData = oEvent.getParameters().view.getModel("selectedObject").getData();
      var oModel = new sap.ui.model.json.JSONModel(selectedData);
      that.getView().setModel(oModel, "MasterData");
      var vPaperNo = that.getView().getModel("MasterData").oData.NpiNo;
      var vPaperCode = that.getView().getModel("MasterData").oData.PaperCode;
      that._fnGetNPIHeaderData(vPaperNo,vPaperCode);
      that.getView().byId('detail').setVisible(true);
    },
    onAssociateF4 : function(){
      debugger
      if (!this.matFrag) {
        this.matFrag = sap.ui.xmlfragment("ZSSU_TL.view.AssociateF4", this);
        this.getView().addDependent(this.matFrag); 
      }
      this.matFrag.open();
      this.loadAssociate();
    },
    onPressDelegate : function(oEvent){
      var oController = this;
      var oPaperData = oController.getView().getModel("PaperDataSet").oData;
      oPaperData.Action = "G";
      var vAllFilled = oController._fnRequredFieldCheck();
      if(!vAllFilled){
        MessageBox.error('Please Select Associate first.');
        return;
      }
      MessageBox.success("This is confirmation for delegation to associate.", {
        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.OK,
        onClose: function (sAction) {
          if(sAction == "OK"){
            busy.open();
            oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
              success: function (oData, oResponse) {
                busy.close();
                var vMsgReturn = oData.Nav_Ret.results[0];
                if (vMsgReturn.Type == "S") {
                  MessageBox.success(vMsgReturn.Message, {
                  actions: [MessageBox.Action.OK],
                  emphasizedAction: MessageBox.Action.OK,
                  onClose: function (sAction) {
                    if(sAction === "OK"){
                      window.location.reload();
//                      var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
//                      oRouter.getView("ZSSU_TL").getController()._initialMethod("/ES_Master","ModelMasterData");
                    }
                  }
                });
                } else {
                  MessageBox.error(vMsgReturn.Message);
                }
              },
              error: function (oResponse) {
//                oController._fnAfterGettingBEData(oPaperData);
                serviceError(oResponse);
                busy.close();
              }
            });
          }
        }
      });
    },
//    Required Check
    _fnRequredFieldCheck: function(){
      var oController = this;
      if (oController.getView().byId('id_InputAssociate').getValue() == ""){
        oController.getView().byId('id_InputAssociate').setValueState("Error");
        return false; 
      }else{
        oController.getView().byId('id_InputAssociate').setValueState("None");
        return true;
      }
    },
//    Formatter
    formattWFvisible: function (oWFTable) {
      if (oWFTable) {
        return oWFTable.length > 0 ? true : false;
      } else {
        return false;
      }
    },
    dateObjToLocal: function(oDate){
      if (oDate) {
        return oDate.toDateString().slice(4);
      }
    },
    formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
      debugger
      var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
      return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
    },
    setDateformatter:function(oDate){
      var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
        pattern: "dd.MM.yyyy"
      });
      var dateFormatted = dateFormat.format(oDate);
      return dateFormatted
    },
    setUserLevel: function (vUserLevel) {
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
      }else if (vUserLevel == "P4") {
        return "CDMM Approver 4";
      }else if (vUserLevel == "AS" || vUserLevel == "AC") {
        return "SSU Associate";
      }
      else if (vUserLevel == "TL") {
        return "Team Lead";
      }
    },

    setStatus: function(vStatus) {
      if (vStatus == "NR" || vStatus == "AR") {
        return "Request";
      } else if (vStatus == "S") {
        return "Draft";
      } else if (vStatus == "C") {
        return "Completed";
      } else if (vStatus == "R" || vStatus == "AJ") {
        return "Rejected";
      } else if (vStatus == "IC" || vStatus == "AC") {
        return "Post to SAP";
      } else {
        return "Pending";
      }
    },
    setStatusHDR: function(vStatus) {
      if (vStatus == "NR") {
        return "SSU Buyers Request";
      } else if (vStatus == "S") {
        return "SSU Buyers Draft";
      } else if (vStatus == "AR") {
        return "Associate Request";
      } else if (vStatus == "R") {
        return "SSU Buyers Rejected";
      } else if (vStatus == "AJ") {
        return "Associate Rejected";
      } else if (vStatus == "IC") {
        return "SSU Buyers Post to SAP";
      } else if (vStatus == "AC") {
        return "Associate Post to SAP";
      } else if (vStatus == "TR") {
        return "";
      } else if (vStatus == "A1") {
        return "Approver 1";
      } else if (vStatus == "A2") {
        return "Approver 2";
      } else if (vStatus == "A3") {
        return "Approver 3";
      } else if (vStatus == "A4") {
        return "Approver 4";
      } else if (vStatus == "A5") {
        return "Approver 5";
      } else if (vStatus == "AS") {
        return "Associate Draft";
      }
    },
    setAction: function (vAction) {
      if (vAction == "S" || vAction == "NR") {
        return "Submitted";
      } else if (vAction == "A") {
        return "Approved";
      } else if (vAction == "R") {
        return "Rejected";
      } else if (vAction == "P") {
        return "Post to SAP";
      } else if (vAction == "AR") {
        return "Seek Clearance";
      } else if (vAction == "AA") {
        return "Associate Accepted";
      } else if (vAction == "DL") {
        return "Delegated";
      }
      else{
        return "Redelegated";
      }

    },
    onClktoBackInitiator : function(){
    	var oController = this;
        var oPaperData = oController.getView().getModel("PaperDataSet").oData;
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
//					var oPaperData = oController._fnDataBeforeSave();
					oPaperData.Action = "4";
					oPaperData.UsrLevel = oPaperData.Status;
					oPaperData.UsrComment = vUsrComment;
					busy.open();
					
					oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
		                success: function (oData, oResponse) {
		                  busy.close();
		                  oDialog.close();
		                  var vMsgReturn = oData.Nav_Ret.results[0];
		                  if (vMsgReturn.Type == "S") {
		                    MessageBox.success(vMsgReturn.Message, {
		                    actions: [MessageBox.Action.OK],
		                    emphasizedAction: MessageBox.Action.OK,
		                    onClose: function (sAction) {
		                      if(sAction === "OK"){
		                        window.location.reload();
		                      }
		                    }
		                  });
		                  } else {
		                    MessageBox.error(vMsgReturn.Message);
		                  }
		                },
		                error: function (oResponse) {
		                	oDialog.close();
		                  serviceError(oResponse);
		                  busy.close();
		                }
		              });
					oDialog.close();
				}
				})
        	});
        oDialog.open();
        }

  });

});