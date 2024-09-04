sap.ui.define(["sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/export/Spreadsheet"
], function (Controller, JSONModel, Message, Spreadsheet) {
  "use strict";
  return Controller.extend("com.mahindra.ZSSU_HSD.controller.HSD", {
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
      var appName  = "ZSSU_PriceCrctn";

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
      var oData_Url = "/sap/opu/odata/sap/ZFIORI_USAGE_SRV/";
      var oModel_fiori = new sap.ui.model.odata.ODataModel(oData_Url, true);
      sap.ui.getCore().setModel(oModel_fiori,"FioriOdata");

      var oDataModel = new sap.ui.getCore().getModel("FioriOdata");
      oDataModel.read("/FioriUsageSet(Appname='ZSSU_HSD',Device='" + device +
      "',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
      "',Resolution='" + resolution + "')",null,null,null,function(e)   { },
      function(e)
      { });


      var oController = this;
      var oModelDefault = new sap.ui.model.json.JSONModel();
      var sUrl = jQuery.sap.getModulePath("SSU", "/json/dataSet.json");
      oModelDefault.loadData(sUrl, "", false);
      oController.getView().setModel(oModelDefault, "ModelDefaultDataSet");
      var vStartupPara = getStartupParameters(this);
      oController._onObjectMatched(vStartupPara.PaperNumber);
//      oController._onObjectMatched(["new","HSD"]);
    },

    /*onExit: function () {
      debugger;
      console.log("aaa");
      var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
      window.open(sServiceUrl+"/ES_AmendPDF(PaperNo='FY21-FRX-000001',TermsType='00')/$value");
    },*/

    //--------- Local Methods Start -------------------------
    _onObjectMatched: function (oParameter) {
      var oController = this;
      var vPaperNo = oParameter[0];
      var vPaperCode = oParameter[1];
      var oModel = new sap.ui.model.json.JSONModel();
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId(); // added by beena-50002903 for sprint 3
      var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_HSD', '/json/HSD.json');
      oModel.loadData(sUrl, "", false);
      oController.getView().setModel(oModel, "ModelSSUDigitization");
      oModel.setProperty("/PartSettlementTracker", oParameter[2] || "");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      if (vPaperNo == "new") {
        oModel.setProperty("/NotCreateNew", false);
        oModel.setProperty("/EditableFlag", true);
        oModel.setProperty("/DisplayOnlyFlag", false);
        oModel.setProperty("/SSURequest", false); //added by beena-50002903 for sprint 3
        var oData = getHeaderObjectHSD();
        oData.PaperCode= vPaperCode;
        oData.Createdby = vCurrentUser; // added by beena-50002903 for sprint 3
        oModel.setProperty("/PaperDataSet", oData);
        oController._getAmentmendService();
        oController._getWorkFlow();
      } else {
    	  oModel.setProperty("/SSURequest", false);// added by beena-50002903 for sprint 3
         oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
      }
      /*oDataAmendmentModel.read("/ES_F4PaperPurp", {
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
      });*/
      oDataAmendmentModel.read("/ES_Category", {
        success: function (oData, oResponse) {
          var oPinfoCat = [];
          $.each(oData.results,function(i,Row){
            oPinfoCat.push({
              "PinfoCatText" : Row.CatDesc,
              "Pinforcat" : Row.CatCode
            });
          })
          oModel.setProperty("/F4PinfoCategory", oPinfoCat);
          oModel.refresh();
        },
        error: function (oResponse) {
          Message.error("Error loading pinfo Category.", {
            title: "Error"
          });
        }
      });
      
  //added by beena-50002903 for sprint 3 
      
      var filters = [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)];
      oDataAmendmentModel.read("/ES_GetSR", {
          filters: filters,
          success: function (oData, oResponse) {
        	  if(oData.results[0].SRFlag == ''){
        		  oModel.setProperty("/SR_flag", false);
        	  }else{
        		  oModel.setProperty("/SR_flag", true);
        	  }
            // busyDialog.close();
          },
          error: function (oResponse) {
            Message.error("Error loading Initiator.", {
              title: "Error"
            });
            // busyDialog.close();
          }
        });
      var filters = [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)];
      oDataAmendmentModel.read("/ES_SSUAssociate", {
        filters: filters,
        success: function (oData, oResponse) {
          oModel.setProperty("/F4Associate", oData.results);
          // busyDialog.close();
        },
        error: function (oResponse) {
          Message.error("Error loading Initiator.", {
            title: "Error"
          });
          // busyDialog.close();
        }
      });
      
      //End added by beena-50002903 for sprint 3
      
      

      oController._fnCreatingTables();
    },
    _fnGetNPIHeaderData: function (vPaperNo,vPaperCode) {
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
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
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      //added by beena-50002903 for sprint 3 
      com.mahindra.ZSSU_HSD.oData = oData;	
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
      //added by beena-50002903 for sprint 3 
      // oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
      oData.Model = oData.Model ? oData.Model.split(",") : [];
      oData.Nav_Items = oData.Nav_Items.results ? oData.Nav_Items.results : oData.Nav_Items;
      oData.Nav_DMS = oData.Nav_DMS.results  ? oData.Nav_DMS.results : oData.Nav_DMS;
      oData.Nav_Log = oData.Nav_Log.results  ? oData.Nav_Log.results : oData.Nav_Log;
      oData.Nav_Wf = oData.Nav_Wf.results  ? oData.Nav_Wf.results : oData.Nav_Wf;
      /*oData.Nav_Currency = oData.Nav_Currency.results  || oData.Nav_Currency;
      if(oData.Nav_Currency.length <= 0){
        oData.Nav_Currency.push(getCurrencyStr());
      }*/
//      oData.Sign = oData.Sign == "POS" ? 0 : 1; //0 is Increase 1 is Decrease;

      $.each(oData.Nav_Items, function (i, Row) {
        if (typeof Row.ValidFrom == "string"){
                    Row.ValidFrom = new Date( Row.ValidFrom);
        }
//      Add start by AGAWSA-CONT 01.07.2023
        var vminDate = minDate();
        var vCurrentDate = new Date();
        if(Row.ValidFrom >= vminDate && Row.ValidFrom <= vCurrentDate){
        	Row.uiFields ={
                    "Error": "Default",
                    "ItemNo": "",
                    "maxDate":  new Date(),
                    "minDate": minDate()
                  };
        }else{
        	Row.uiFields ={
                    "Error": "Reject",
                    "ItemNo": "",
                    "maxDate":  new Date(),
                    "minDate": minDate()
                  };
        }
//      Add end by AGAWSA-CONT 01.07.2023
//        Row.uiFields ={
//              "Error": "Default",
//              "ItemNo": "",
//              "maxDate":  new Date(),
//              "minDate": minDate()
//            };
      });
      
//    added by beena-50002903 for sprint 3
      if(oData.Initiator == vCurrentUser){
    	  if(oData.AssociateFlag === "X"){
    		  if (oData.Status === "S" || oData.Status === "R"){
            	  oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
            	  oModelSSUDigitization.setProperty("/SSURequest", false);
            	  oModelSSUDigitization.setProperty("/NonSSURequest", false);

//            	  this.getView().byId("redelegation").setVisible(true);
              }
        	  else if(oData.Status === "AS"){
        		  oModelSSUDigitization.setProperty("/BEValidation", false);
            	  oModelSSUDigitization.setProperty("/SSURequest", false);
            	  oModelSSUDigitization.setProperty("/EditableFlag", false);
            	  oModelSSUDigitization.setProperty("/NonSSURequest", false);

//            	  this.getView().byId("redelegation").setVisible(true);
        	  }
              else if(oData.Status === "AR"){
            	  oModelSSUDigitization.setProperty("/SSURequest", false);
            	  oModelSSUDigitization.setProperty("/NonSSURequest", false);

//            	  this.getView().byId("redelegation").setVisible(true);
              }
              else if(oData.Status === "NR"){
//            	  oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
            	  oModelSSUDigitization.setProperty("/SSURequest", true);
            	  this.getView().byId("RejectBtn").setText("Reject");
//            	  oModelSSUDigitization.setProperty("/EditableFlag", false);
              }else if(oData.Status === "C"){
            	  this.getView().byId("redelegation").setVisible(false);
              }
    		  if(oData.Nav_Wf.length === 0 && oData.Status !== "NR"){
            	  this.getView().byId("redelegation").setVisible(false);
    		  }else if(oData.Nav_Wf.length !== 0 && oData.Status === "NR"){
    			  this.getView().byId("redelegation").setVisible(false);
    		  }else if(oData.Nav_Wf.length !== 0 && (oData.Status === "C" || oData.Status === "R" || oData.Status === "S")){
    			  this.getView().byId("redelegation").setVisible(false);
    		  }else{
    			  this.getView().byId("redelegation").setVisible(true);
    		  }
    	  }else{
    		  if (oData.Status === "S" || oData.Status === "R"){
            	  oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
            	  oModelSSUDigitization.setProperty("/SSURequest", false);
            	  oModelSSUDigitization.setProperty("/NonSSURequest", false);
              }else if(oData.Status === "IC"){
            	  oModelSSUDigitization.setProperty("/PostToSAP", true);
            	  oModelSSUDigitization.setProperty("/SSURequest", false);
            	  oModelSSUDigitization.setProperty("/NonSSURequest", false);
              }else if(oData.Status === "NR"){
            	  oModelSSUDigitization.setProperty("/NonSSURequest", true);
              }
    	  }
//    	  if(oData.SelfRoutingFlag == ""){
//    		  oModelSSUDigitization.setProperty("/BEValidation", true);
//    	  }
      }else{
    	  this.getView().byId("redelegation").setVisible(false);
    	  this.getView().byId("id_upc1").setEnableDelete(false);
    	  this.getView().byId("id_upc2").setEnableDelete(false);
    	  this.getView().byId("id_upc3").setEnableDelete(false);
    	  if (oData.Status === "AS" || oData.Status === "AJ"){
        	  oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
        	  oModelSSUDigitization.setProperty("/SSURequest", false);
        	  oModelSSUDigitization.setProperty("/EditableFlag", false);
        	  oModelSSUDigitization.setProperty("/BEValidation", true);
        	  oData.Status = "S";
          }
          else if(oData.Status === "AR"){
        	  oModelSSUDigitization.setProperty("/SSURequest", true);
        	  this.getView().byId("RejectBtn").setText("Seek Clearance");
          }else if(oData.Status === "AC"){
        	  oModelSSUDigitization.setProperty("/PostToSAP", true);
        	  oModelSSUDigitization.setProperty("/SSURequest", false);
          }
      }
      if (oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X" ||
    		  oModelSSUDigitization.getProperty("/PartSettlementTracker") == "Y"){
    	  oModelSSUDigitization.setProperty("/DisplayOnlyFlag", true);
    	  oModelSSUDigitization.setProperty("/PostToSAP", false);
    	  oModelSSUDigitization.setProperty("/SSURequest", false); 
    	  oModelSSUDigitization.setProperty("/NonSSURequest", false);

      }

      oModelSSUDigitization.setProperty("/PaperDataSet", oData);
//      oController.getView().byId("id_export").setVisible(true);
      oModelSSUDigitization.refresh();
      oController._getAmentmendService();
      oController._getWorkFlow();
      // oController._validationDataFilled();
      if(oData.Initiator == vCurrentUser && oData.AssociateFlag === "X"){
    	  if(oData.AssociatePrev == oData.Associate && oData.Nav_Wf.length !== 0){
    		  if(oController.getView().byId("id_status").getNumber() === "Pending" ||
    			    	 oController.getView().byId("id_status").getNumber() === "Post to SAP"
    			    	 ){
    					  this.getView().byId("redelegation").setVisible(false);
    					  this.getView().byId("id_InputAssociate").setEditable(true); 
    				  }
    			      else if(oController.getView().byId("id_status").getNumber() === "Rejected" ||
    			    		  oController.getView().byId("id_status").getNumber() === "Draft"){
    			    	  this.getView().byId("redelegation").setVisible(true);
    					  this.getView().byId("id_InputAssociate").setEditable(true); 
    			      }else if(oController.getView().byId("id_status").getNumber() === "Request"){
    			    	  this.getView().byId("redelegation").setVisible(false);
    					  this.getView().byId("id_InputAssociate").setEditable(false); 
    			      }
    		  if(oData.Status == "A1" || oData.Status == "A2" || oData.Status == "A3" ||
		    		  oData.Status == "A4" || oData.Status == "A5" || oData.Status == "A6"
		    			  || oData.Status == "A7" || oData.Status == "A8" || oData.Status == "C"){
		    	  this.getView().byId("id_InputAssociate").setEditable(false);
		      }
    	  }else{
    		  if(oController.getView().byId("id_status").getNumber() === "Draft" || oController.getView().byId("id_status").getNumber() === "Pending" ||
    			    	 oController.getView().byId("id_status").getNumber() === "Post to SAP" ||
    			    	 oController.getView().byId("id_status").getNumber() === "Rejected"){
    					  this.getView().byId("redelegation").setVisible(false);
    					  this.getView().byId("id_InputAssociate").setEditable(true);
    				  }
    	  }
      }
      else{
    	  this.getView().byId("id_InputAssociate").setEditable(false); 
      }
      //end added by beena-50002903 for sprint 3
      
//      oModelSSUDigitization.setProperty("/PaperDataSet", oData);
//      if (oData.Status === "S" || oData.Status === "R")
//        oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
//      else if(oData.Status === "IC")
//        oModelSSUDigitization.setProperty("/PostToSAP", true);
//      else if(oData.Status === "NR")
//        oModelSSUDigitization.setProperty("/NonSSURequest", true);
//
//      if (oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X" ||
//          oModelSSUDigitization.getProperty("/PartSettlementTracker") == "Y"){
//        oModelSSUDigitization.setProperty("/DisplayOnlyFlag", true);
//        oModelSSUDigitization.setProperty("/NonSSURequest", false);
//        oModelSSUDigitization.setProperty("/PostToSAP", false);
//      }
//
//      if(oData.Initiator != oData.Createdby)
//        oModelSSUDigitization.setProperty("/InitiatedBySSU", false);
//      oModelSSUDigitization.refresh();
//      oController._getAmentmendService();
//      oController._getWorkFlow();
//      // oController._validationDataFilled();
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
      delete oPaperData.uiFields;
      oPaperData.Sector = oPaperData.Sector.toString();
      oPaperData.Model = oPaperData.Model.toString();
      /*if(typeof oPaperData.Sign == "number")
        oPaperData.Sign = oPaperData.Sign == 0 ? "POS" : "NEG"; */
      oPaperData.Nav_Log = [];
      oPaperData.Nav_Wf = [];
      oPaperData.Nav_Ret = [];
      oPaperData.Nav_DMS = [];
      $.each(oPaperData.Nav_Items, function (i, Row) {
        Row.ValidFrom = uiDateToBackend(Row.ValidFrom);
        delete Row.uiFields;
        delete Row.__metadata;
      });
      return oPaperData;
    },
//    uiDateToBackend
    /*_uiDateToBE: function(oUiDate){
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
    },*/

    
    //added by beena-50002903 for sprint 3 on 30-06-2023
    onSelectSR: function(oEvent){
    	var oController = this;
    	var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    	var vSelect =oEvent.getParameter("selectedIndex") == 0 ? "X" : ""; //0 is Yes and 1 is No;
    	oModelSSUDigitization.setProperty("/PaperDataSet/SelfRoutingFlag",vSelect);
    },
    formatterSR: function(vValue){
    	return vValue === "X" ? 0:1;
    },
    formatterAssoVisible: function (vValue){
    	return vValue === "X" ? true:false;
    },
    editablePaperPur: function(vEditable, vNav_Items, vNotCreateNew, vEditableAsso){
        if(vEditable && !vNav_Items && !vEditableAsso)
          return true;
        else
          return false;
        if(vEditable && !vEditableAsso)
      	  return true;
      },
      onSelectAsso: function(oEvent){
      	var oController = this;
      	var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      	var vSelect =oEvent.getParameter("selectedIndex") == 0 ? "X" : ""; //0 is Increase 1 is Decrease;
      	oModelSSUDigitization.setProperty("/PaperDataSet/AssociateFlag",vSelect);
      	if(vSelect == "X"){
      		oModelSSUDigitization.setProperty("/PaperDataSet/Disclaimer","Before uploading attachments, Please save this paper");
      		oModelSSUDigitization.setProperty("/DisplayOnlyFlag",true);
      	}else{
      		oModelSSUDigitization.setProperty("/PaperDataSet/Disclaimer","");
      		oModelSSUDigitization.setProperty("/PaperDataSet/Associate","");
      		oModelSSUDigitization.setProperty("/PaperDataSet/AssociateName","");
      	}
      },
   
      
//   END added by beena-50002903 for sprint 3 on 30-06-2023
    

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
            icon: "{ModelDefaultDataSet>/Icon/editIcon}",
            tooltip: "Edit",
            visible: "{ModelSSUDigitization>/EditableFlag}",
            type: "{ModelSSUDigitization>uiFields/Error}",
            press: function (oEvent) {
//              Add Start by AGAWAS-CONT on 01.07.2023
                var vInitiator = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Initiator");
                var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
                if(oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/AssociateFlag") == "X"){
              	  if(vInitiator == vCurrentUser){
              		  Message.warning("During Associate delegation Sourcing Buyers are not allowed to enter or edit item data; Kindly save the paper, upload supporting documents and submit the paper. �", {
              			  title: "Not Allowed"
              		  });
                        return;
              	  }
                }
//              	Add End by AGAWAS-CONT on 01.07.2023
              var oItemFrag = xmlFragment(oController, "ItemHSD");
              var oParentModel = oController._setEditFragmentModel(oEvent);
              oItemFrag.setModel(oParentModel);
              oController._getVendor(oParentModel,oParentModel.getProperty("/Vendor"));
              oItemFrag.open();
            }
          }),
          new sap.m.Button({
            icon: "{ModelDefaultDataSet>/Icon/copy}",
            tooltip: "Copy",
            visible: "{=${ModelSSUDigitization>/EditableFlag} && ${ModelSSUDigitization>/InitiatedBySSU}}",
            press: function (oEvent) {
//              Add Start by AGAWAS-CONT on 01.07.2023
                var vInitiator = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Initiator");
                var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
                if(oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/AssociateFlag") == "X"){
              	  if(vInitiator == vCurrentUser){
              		  Message.warning("During Associate delegation Sourcing Buyers are not allowed to enter or edit item data; Kindly save the paper, upload supporting documents and submit the paper. �", {
              			  title: "Not Allowed"
              		  });
                        return;
              	  }
                }
//              	Add End by AGAWAS-CONT on 01.07.2023
              var oItemFrag = xmlFragment(oController, "ItemHSD");
              var oParentModel = oController._setEditFragmentModel(oEvent);
              var vuiFields ={
                    "Error": "Default",
                    "ItemNo": "",
                    "maxDate":  new Date(),
                    "minDate": minDate()
                  };
              oParentModel.setProperty("/uiFields",vuiFields);
              var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
              var vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
              oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
              oItemFrag.setModel(oParentModel);
              oController._getVendor(oParentModel,oParentModel.getProperty("/Vendor"));
              oParentModel.setProperty("/DBExist","");
              oItemFrag.open();
            }
          }),
          new sap.m.Button({
            icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
            tooltip: "Display",
            visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
            press: function (oEvent) {
              var oItemFrag = xmlFragment(oController, "ItemHSD");
              oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
              oItemFrag.open();
            }
          }),
          new sap.m.Button({
            icon: "{ModelDefaultDataSet>/Icon/messagePopupIcon}",
            tooltip: "Information",
            visible: "{ModelSSUDigitization>/PostToSAP}",
            type: {path: 'ModelSSUDigitization>BjStatus',  
                  formatter: function(vValue){  
                      return   vValue == "E" ? "Reject" :"Default";
                   }
              },
            press: function (oEvent) {
              var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
              var oPopoverSearch = new sap.m.Popover({
                placement: "Left",
                showHeader: false,
//                contentWidth: "30%",
                content: [new sap.m.Text({
                  text: "{ModelSSUDigitization>"+vSelectedPath+"/Message}",
                })]
              });
              oController.getView().addDependent(oPopoverSearch);
              oPopoverSearch.openBy(oEvent.getSource());
            }
          }),
          new sap.m.Button({
            icon: "{ModelDefaultDataSet>/Icon/deleteIcon}",
            tooltip: "Delete",
            type: "Reject",
            visible: "{=${ModelSSUDigitization>/EditableFlag} && ${ModelSSUDigitization>/InitiatedBySSU}}",
            press: function (oEvent) {
              var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
              Message.confirm("Are you sure you want to delete this.", {
                title: "Confirm Delete",
                onClose: function (oAction) {
                  if (oAction == "OK") {
                    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
                    var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
                    oDeletedData.Delete = "X";
                    var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedItems") ? oModelSSUDigitization.getProperty(
                      "/PaperDataSet/DeletedItems") : [];
                    oDeletedItems.push(oDeletedData);
                    oModelSSUDigitization.setProperty("/PaperDataSet/DeletedItems", oDeletedItems);
                    var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
                    oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
                    oModelSSUDigitization.refresh(true);
                  }
                }
              });

            }
          })
        ]
      });
      createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
    },
    _setEditFragmentModel: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
      var objectData = $.extend({}, oModelSSUDigitization.getProperty(vSelectedPath));
      var vSelectedPathVali = oController._fnDataSettingValidation(vSelectedPath);
      objectData.Validation = oModelSSUDigitization.getProperty(vSelectedPathVali);
      return new JSONModel(objectData);
    },
    _fnDataSettingValidation: function (vSelectedPathVali) {//need to remove
      if (vSelectedPathVali.search("PaperDataSet") >= 0) {
        vSelectedPathVali = vSelectedPathVali.replace("PaperDataSet", "Validation");
      }
      if (vSelectedPathVali.search("Nav_Items") >= 0) {
        vSelectedPathVali = vSelectedPathVali.replace("Nav_Items", "Nav_ItemsX");
      }
      if (vSelectedPathVali.search("Nav_Forex") >= 0) {
        vSelectedPathVali = vSelectedPathVali.replace("Nav_Forex", "Nav_ForexX");
      }
      if (vSelectedPathVali.search("Nav_RM") >= 0) {
        vSelectedPathVali = vSelectedPathVali.replace("Nav_RM", "Nav_RMX");
      }
      return vSelectedPathVali;
    },
    _setDisplayFragmentModel: function (oEvent) {
      var oController = this;
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
    },
    _setDataAfterEditItem: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vChangedData = oEvent.getSource().getParent().getModel().getData();
      var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      if (!vSelectedPath) {
        vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
      }
      delete vChangedData.Validation;
      oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
      oModelSSUDigitization.setProperty("/SelectedPath", "");
    },
//    _fnMassDataSet: function (vExcelDataArray) {
//      var oController = this;
//      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
//      var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
//      var oFilter;
//      $.each(vExcelDataArray, function (MainIndex, row) {
//        oFilter = $.grep(oMassData, function (grepRow) {
//          return ( (row.Vendor_Code === grepRow.Vendor) && (row.Part_Number === grepRow.PartNo) && (row.Doc_Type === grepRow.Pinforcat));
//        });
//        if (oFilter.length <= 0) {
//          var vValidFrom = row.Valid_From_Date || "";
//
//          var oItemData = getItemDetailsObjectHSD();
//          oItemData.Plant = oController.getView().getModel("ModelSSUDigitization").getData().PaperDataSet.Plant || "";
//          oItemData.Vendor = row.Vendor_Code || "";
//          oItemData.PartNo = row.Part_Number || "";
//          oItemData.SettledPrice = row.Settled_Price && row.Settled_Price.replace(/ /g, '') || "0";
//          oItemData.SanctiondBudget = row.Sanctioned_Budget && row.Sanctioned_Budget.replace(/ /g, '') || "0";
//          oItemData.QtyPerVeh = row.Qty_per_vehicle && row.Qty_per_vehicle.replace(/ /g, '') || "0";
//          oItemData.QuotedPrice = row.Quoted_Price && row.Quoted_Price.replace(/ /g, '') || "0";
//          oItemData.ValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
//          oItemData.Amndcode = row.Amendment_Code || "";
//          oItemData.Remarks = row.Remarks || "";
//          oItemData.SubCom = row.Sub_Commodity;
//          oItemData.Pinforcat = row.Doc_Type || "";
//          oMassData.push(oItemData);
//          /*var index = oMassData.length - 1;
//          oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);*/
//        }
//
//      });
//      oController._validationMass(oMassData);
//      oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);
//      oController.getView().getModel("ModelSSUDigitization").refresh(true);
//    },
 	_fnMassDataSet: function (vExcelDataArray) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
      var oFilter;

      $.each(vExcelDataArray, function (MainIndex, row) {
        oFilter = $.grep(oMassData, function (grepRow) {
          return ((row.Plant === grepRow.Plant) && (row.Vendor_Code === grepRow.Vendor) && (row.Part_Number === grepRow.PartNo) && (row.Doc_Type === grepRow.Pinforcat));
        });

        /*if (oFilter.length <= 0 &&  !oModelSSUDigitization.getProperty("/InitiatedBySSU")) {
          return;
        }*/

        var vValidFrom = row.Valid_From_Date || "";
        vValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
        var vPlant = row.Plant || "";
        vPlant = oController.getView().getModel("ModelSSUDigitization").getData().PaperDataSet.Plant || "";
        var vVendor = row.Vendor_Code || "";
        var vPartNo = row.Part_Number || "";
        var vPinforcat = row.Doc_Type || "";
        var vSubCom = row.Sub_Commodity || "";
        var vSettledPrice = row.Settled_Price || "0";
        var vAmndcode = row.Price_Change_Code || "";
        var vRemarks = row.Remarks || "";
        if (oFilter.length <= 0) {
          var oItemData = getItemDetailsObjectHSD();
          oItemData.Plant = vPlant;
          oItemData.Vendor = vVendor;
          oItemData.PartNo = vPartNo;
          oItemData.Pinforcat = vPinforcat;
          oItemData.SubCom = vSubCom;
          oItemData.SettledPrice = vSettledPrice;
          oItemData.ValidFrom = vValidFrom
          oItemData.Amndcode = vAmndcode;
          oItemData.Remarks = vRemarks;
          oMassData.unshift(oItemData);
        }else{
          var existingIndex = oMassData.indexOf(oFilter[0]);
          oMassData[existingIndex].Plant = vPlant;
          oMassData[existingIndex].Vendor = vVendor;
          oMassData[existingIndex].PartNo = vPartNo;
          oMassData[existingIndex].Pinforcat = vPinforcat;
          oMassData[existingIndex].SubCom = vSubCom;
          oMassData[existingIndex].SettledPrice = vSettledPrice;
          oMassData[existingIndex].ValidFrom = vValidFrom;
          oMassData[existingIndex].Amndcode = vAmndcode;
          oMassData[existingIndex].Remarks = vRemarks;
        }


          /*var oItemData = getItemDetailsObjectRM();
          oItemData.Plant = row.Plant || "";
          oItemData.Vendor = row.Vendor_Code || "";
          oItemData.PartNo = row.Part_Number || "";
          oItemData.Pinforcat = row.Doc_Type || "";
//          oItemData.SettledPrice = row.Settled_Price || "0";
          oItemData.ValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
          oItemData.Amndcode = row.Price_Change_Code || "";
          oItemData.Remarks = row.Remarks || "";
          oMassData.push(oItemData);  */
          /*var index = oMassData.length - 1;
          oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);*/
//        }

      });
        oController._validationMass(oMassData);
      oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);
    },
    _validationMass: function (Nav_Items) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oValidation = {
        "PaperCode": oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode"),
        "Sector": oModelSSUDigitization.getProperty("/PaperDataSet/Sector").toString(),
        "Sign": oModelSSUDigitization.getProperty("/PaperDataSet/Sign"),
        "Plant":oModelSSUDigitization.getProperty("/PaperDataSet/Plant").toString(),
        "Nav_ItemsX": []
      };
      $.each(Nav_Items, function (item, Row) {
        Row.uiFields.ItemNo = item.toString();
        var oNavItem = {
          "ItemNo": item.toString(),
          "Plant": Row.Plant,
          "Vendor": Row.Vendor,
          "PartNo": Row.PartNo,
          "Amndcode": Row.Amndcode,
          "ValidFrom": uiDateToBackend(Row.ValidFrom),
          "Pinforcat": Row.Pinforcat,
          "SettledPrice": Row.SettledPrice
        };
        oValidation.Nav_ItemsX.push(oNavItem);
      });
      busyDialog.open();
      oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_HeaderX", oValidation, {
        success: function (oData, oResponse) {
          var vMsg ;
          var vTitle ;
          var vIndexItem;
          oData.Nav_ItemsX = oData.Nav_ItemsX.results;
          $.each(oData.Nav_ItemsX, function (i, Row) {

            $.each(Nav_Items, function (Index, NavRow) {
              if (NavRow.uiFields.ItemNo == Row.ItemNo) {
                vIndexItem = Index;
              }
            });

            if (Row.VendorFlag == "") {
              Nav_Items[vIndexItem].VName = Row.VName;
              Nav_Items[vIndexItem].VLocation = Row.VLocation;
              Nav_Items[vIndexItem].Currency = Row.Currency;
              Nav_Items[vIndexItem].ExtPrice = Row.ExtPrice;
              Nav_Items[vIndexItem].ExtValidFrom = Row.ExtValidFrom;
              Nav_Items[vIndexItem].ImportFlag = Row.ImportFlag;
              Nav_Items[vIndexItem].PirNo = Row.PirNo;
              Nav_Items[vIndexItem].Purorg = Row.Purorg;
              Nav_Items[vIndexItem].Pinforcat = Row.Pinforcat;
              Nav_Items[vIndexItem].PinfoCatText = Row.PinfoCatText;
              var vSign =  Number(Nav_Items[vIndexItem].SettledPrice) - Number(Row.ExtPrice);
              var vChangePercnd = vSign/Row.ExtPrice*100;

              vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
              Nav_Items[vIndexItem].ChgPrctng = Math.abs(vChangePercnd).toFixed(2);
              Nav_Items[vIndexItem].DeltaPrice = vSign.toFixed(2);
              if(vSign == 0)
                vSign = "";
              else
                vSign = vSign > 0? "+" : "-";
              Nav_Items[vIndexItem].Sign = vSign;

              var oFilterData = $.grep(oModelSSUDigitization.getProperty("/F4Amentment"),function(row){
                if(vSign == "+")
                  return (row.Sign == "POS");
                else if(vSign == "-")
                  return (row.Sign == "NEG");
              });
              if(oFilterData.length>0){
                Nav_Items[vIndexItem].Amndcode = oFilterData[0].Zpricecd;
                Nav_Items[vIndexItem].AmndcodeDesc = oFilterData[0].Zreason;
              }else{
                Nav_Items[vIndexItem].Amndcode = "";
                Nav_Items[vIndexItem].AmndcodeDesc = "";
              }

            }
            if (Row.PartNoFlag == "") {
              Nav_Items[vIndexItem].PartDesc = Row.PartDesc;
              Nav_Items[vIndexItem].NetWtUniit = Row.NetWtUniit;
              Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
            }
            /*if(Row.AmndcodeFlag == ""){
              Nav_Items[vIndexItem].AmndcodeDesc = Row.AmndcodeDesc;
            }*/
            if (Row.VendorFlag != "" || Row.PartNoFlag != "" || Row.SettledPriceFlag !="" || Row.PlantFlag != "" || Row.ValidFromFlag != "") {
              Nav_Items[vIndexItem].uiFields.Error = "Reject";
              Nav_Items[vIndexItem].uiFields.MassValidation = Row;
            } else {
              Nav_Items[vIndexItem].uiFields.Error = "Default";
              Nav_Items[vIndexItem].uiFields.MassValidation = {};
            }

            oController._validationDataFilled();
          });
          
          
          //added by beena-50002903 for sprint 3
          if (oData.ErrorFlag == "") {
//              oModelSSUDigitization.setProperty("/BEValidation", true);
//              oModelSSUDigitization.setProperty("/EditableFlag", false);
              oController._fnLockUnlockService("");
              // vMsg = "Validation is successfully done without errors.";
              // vTitle = "Success";
              Message.success("Validation is successfully done without errors.");
            }
            else if (oData.ErrorFlag == "X") {
              Message.error("Validation is successfully done with errors.");
            }
            else if(oData.ErrorFlag == "W"){
              Message.warning("Validation is successfully done with warning.");
            }

            oModelSSUDigitization.setProperty("/Validation", oData);
            Nav_Items.sort(function(a,b){
          	  if(a.uiFields.Error < b.uiFields.Error){
          		  return -1;
          	  }
          	  if(a.uiFields.Error > b.uiFields.Error){
          		  return 1;
          	  }
          	  return 0;
            })
//            if(oData.Nav_ItemsX.length !== 0){
//          	  oController.getView().byId("itemCount").setText("Item Count: " + oData.Nav_ItemsX.length)
//            }
            oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
//            oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items",oData.Nav_ItemsX);
            oModelSSUDigitization.refresh();
          //   Message.success(vMsg, {
          //     title: vTitle
          //   });
            oController._validationDataFilled();
            busyDialog.close();
          
            //end added by beena-50002903 for sprint 3
            
          //below code commented by beena-50002903 for sprint 3
          /*
          if (oData.ErrorFlag != "X") {
            oModelSSUDigitization.setProperty("/BEValidation", true);
//            oModelSSUDigitization.setProperty("/EditableFlag", false);
            oController._fnLockUnlockService("");
            vMsg = "All items have been validated successfully.";
            vTitle = "Success";
          }else{
            vMsg = "There are some issues in this price paper, please check.";
             vTitle = "Information";
             oModelSSUDigitization.setProperty("/BEValidation", false);
          }

          oModelSSUDigitization.setProperty("/Validation", oData);
          oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
          oModelSSUDigitization.refresh();
          Message.success(vMsg, {
            title: vTitle
          });
          busyDialog.close();
*/
          },
        error: function (oResponse) {
          // serviceError(oResponse);
          busyDialog.close();
        }
      });
    },
    _getModelPlant: function (vSelectedSectors) {
      if (vSelectedSectors && vSelectedSectors.length > 0) {
        var vFilters = [];
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
        oModelSSUDigitization.setProperty("/PaperDataSet/Sector", vSelectedSectors)

        $.each(vSelectedSectors, function (index, key) {
          vFilters.push(new sap.ui.model.Filter("SectorCode", sap.ui.model.FilterOperator.EQ, key));
        });
        busyDialog.open();

        oDataAmendmentModel.read("/ES_Model", {
          filters: vFilters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4Model", oData.results);
            busyDialog.close();
          },
          error: function (oResponse) {
            serviceError(oResponse)
          }
        });
        oDataAmendmentModel.read("/ES_Plant", {
          filters: vFilters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4Plant", oData.results);
            busyDialog.close();
          },
          error: function (oResponse) {
            serviceError(oResponse)
          }
        });
      }
    },
    _fnRequredFieldCheck: function (oFields) {
    var oMandatoryFlag = true;
        var existingDate = oFields[42]._lastValue;
        existingDate = new Date(existingDate.split(".").reverse().join("-"));
        var validFromDate = oFields[40]._lastValue;
        validFromDate = new Date(validFromDate.split(".").reverse().join("-"));
         $.each(oFields, function (i, row) {
        if (row.mProperties.hasOwnProperty("required") && row.getProperty("required")) {
         if (row.mProperties.hasOwnProperty("selectedKeys") && row.getProperty("selectedKeys").length <= 0) {
           row.setValueState("Error");
        row.setValueStateText("this field is required");
         oMandatoryFlag = false;
         } else if (row.mProperties.hasOwnProperty("value") && !row.mProperties.hasOwnProperty("selectedKeys") &&
          ((row.mProperties.hasOwnProperty("type") && row.getProperty("type")=="Number" && Number(row.getProperty("value")) == 0) || row.getProperty("value") == "" || row.getProperty("value") == " ")) {
            row.setValueState("Error");
            row.setValueStateText("this field is required");
            oMandatoryFlag = false;
            } else if (row.mProperties.hasOwnProperty("selectedKey") && (row.getProperty("selectedKey") == "" || row.getProperty(
            "selectedKey") == " ")) {
            row.setValueState("Error");
            row.setValueStateText("this field is required");
            oMandatoryFlag = false;
             } else if (row.mProperties.hasOwnProperty("displayFormat") && row.getProperty("dateValue") == null) {
              row.setValueState("Error");
               row.setValueStateText("this field is required");
            oMandatoryFlag = false;
            } else if (row.mProperties.hasOwnProperty("valueState")) {
              row.setValueState("None");
               }
            }
              });
              // added by REDDRA-CONT(suggested by Sandesh)
           if(existingDate.getTime() >= validFromDate.getTime()){
          oFields[40].setValueState("Error");
          oFields[40].setValueStateText("Valid From Date is older than Existing Valid From date");
           oMandatoryFlag = false;
               }
             return oMandatoryFlag;
        },
    _validationDataFilled: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var vFlag = true;
      var oTabIconColor = {
        "VendorPartDetails": "Positive",
        "Attachment": "Positive",
        "Workflow": "Positive"
      };
      /*if (oPaperData.Nav_DMS.length <= 0) {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      } else {
        var vFlagCWB = false;
        $.each(oPaperData.Nav_DMS, function (i, RowDMS) {
          if (RowDMS.TabId == "CWB")
            vFlagCWB = true;
        });
        if (!vFlagCWB) {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
        }
      }*/
//      =================added by deepa==================
      if (oPaperData.Nav_DMS.length <= 0) {
      vFlag = false;
      oTabIconColor.VendorPartDetails = "Negative";
    } else {
      var vFlagCWE = false,vFlagVQM = false;
      $.each(oPaperData.Nav_DMS, function (i, RowDMS) {
        if (RowDMS.TabId == "CWE"){
          vFlagCWE = true;
        }
        if(RowDMS.TabId == "VQM"){
          vFlagVQM = true;
        }
      });
      if (!vFlagCWE || !vFlagVQM) {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      }
    }
      if (oPaperData.Sector.length <= 0 || oPaperData.Model.length <= 0 ) {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      }
      if (oPaperData.Initiator == "") {    
        /*added by deepa for initiator*/
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
      }
      if (oPaperData.Nav_Items.length <= 0) {
        oTabIconColor.VendorPartDetails = "Negative";
      }
      $.each(oPaperData.Nav_Items, function (i, Row) {
        /*if (Row.uiFields.Error == "Reject") {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
        }*/
        if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" || Math.abs(Row.SettledPrice) == "0"   

          || Row.Amndcode == "" || Row.ValidFrom == null || Row.Pinforcat == "" || Row.Purorg == "" || Row.Sign == "" ||
          (Row.uiFields.Error == "Reject" && Row.uiFields.hasOwnProperty("ItemNo"))) {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
          Row.uiFields.Error = "Reject";
        } else {
          Row.uiFields.Error = "Default";
        }
      });
      oModelSSUDigitization.setProperty("/TabIconColor", oTabIconColor);
      return vFlag;
    },
    _getAmentmendService: function(){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");

      /*var vSign;
      if(typeof oPaperData.Sign == "number")
        vSign = oPaperData.Sign == 0 ? "POS":"NEG";*/
      var filters = [
//        new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, oPaperData.Sign),
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
    _getWorkFlow: function(){
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");

      var vFilters = [
        new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode),
//        new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, oPaperData.Sign),
//        new sap.ui.model.Filter("PaperPur", sap.ui.model.FilterOperator.EQ, oPaperData.PaperPur)
        new sap.ui.model.Filter("AssociateFlag", sap.ui.model.FilterOperator.EQ, oPaperData.AssociateFlag), 
        new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oPaperData.Initiator)
      ];
      oDataAmendmentModel.read("/ES_Approver", {
        filters: vFilters,
        success: function (oData, oResponse) {
//      	  ADD Start by AGAWSA-CONT on 14-02-2023 validation error message for inactive users
      	  if(oData.results.length <= 0){
      		  oModelSSUDigitization.setProperty("/PaperDataSet/PaperPur","");
      		  Message.error("User is inactive, kindly connect with SSUSAPSUPPORT@mahindra.com", {
        			  title: "User is Inactive"
        		  });
                  return;
      	  }
//      	  ADD End by AGAWSA-CONT on 14-02-2023 validation error message for inactive users
          oModelSSUDigitization.setProperty("/F4Approver", oData.results);
          oModelSSUDigitization.refresh();
          var vCycle = oModelSSUDigitization.getProperty("/PaperDataSet/Cycle") || (oData.results.length>0 && oData.results[0].Cycle);
          oController.formattInitiator(vCycle);
        },
        error: function (oResponse) {
          Message.error("Error loading approver.", {
            title: "Error"
          });
        }
      });

    },
    _getVendor: function (oParentModel,vSelectedValue){
      var oController = this;
//      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var filters = [];
      var vVendName = "";
      var vVendCode = "";
      var vVendLoc = "";
      var vCurrCode = "";
      var vExtPrice = "";
      var vExtValidFrom = null;
      var vImportFlag = oParentModel.getProperty("/ImportFlag");
      var vPirNo = "";
      var vPurorg = "";
      var vPinforcat = oParentModel.oData.Pinforcat;
      var vPinfoCatText = "";
//      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oModelSSUDigitization.getProperty("/PaperDataSet").Plant));
        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")));
        filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, ""));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Vendor", {
          filters: filters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4PinfoCategory", oData.results);
            if (oData.results.length > 0 && oData.results[0].Message == "") {
              if(vPinforcat == oData.results[0].Pinforcat || vPinforcat == ""){
              vVendName = oData.results[0].VendName;
              vVendCode = oData.results[0].VendCode;
              vVendLoc = oData.results[0].VendLoc;
              vCurrCode = oData.results[0].CurrCode;
              vExtPrice = oData.results[0].ExtPrice;
              vExtValidFrom = oData.results[0].ExtValidFrom;
              vImportFlag = oData.results[0].ImportFlag;
              vPirNo = oData.results[0].PirNo;
              vPurorg = oData.results[0].Purorg;
              vPinforcat = oData.results[0].Pinforcat;
              vPinfoCatText = oData.results[0].PinfoCatText;
              }
              else{
              vVendName = oData.results[1].VendName;
              vVendCode = oData.results[1].VendCode;
              vVendLoc = oData.results[1].VendLoc;
              vCurrCode = oData.results[1].CurrCode;
              vExtPrice = oData.results[1].ExtPrice;
              vExtValidFrom = oData.results[1].ExtValidFrom;
              vImportFlag = oData.results[1].ImportFlag;
              vPirNo = oData.results[1].PirNo;
              vPurorg = oData.results[1].Purorg;
              vPinforcat = oData.results[1].Pinforcat;
              vPinfoCatText = oData.results[1].PinfoCatText;
              }
              busyDialog.close();
            } else {
              busyDialog.close();
              if(oData.results[0] && oData.results[0].Message != "")
                Message.error(oData.results[0].Message, { title: "Error" });
//              sap.m.MessageToast.show(vSelectedValue + " either does not exist or not extended for " + oParentModel.getProperty("/Plant") + " plant.");
            }
            oParentModel.setProperty("/VName", vVendName);
            oParentModel.setProperty("/Vendor", vVendCode);
            oParentModel.setProperty("/VLocation", vVendLoc);
            oParentModel.setProperty("/Currency", vCurrCode);
            oParentModel.setProperty("/ExtValidFrom", vExtValidFrom);
            oParentModel.setProperty("/ImportFlag", vImportFlag);
            oParentModel.setProperty("/PirNo", vPirNo);
            oParentModel.setProperty("/Purorg", vPurorg);
            if(oParentModel.getProperty("/Pinforcat") == ""){
              oParentModel.setProperty("/Pinforcat", vPinforcat);
              oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
              oParentModel.setProperty("/ExtPrice", vExtPrice);
            }

          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });
      } else {
        sap.m.MessageToast.show("Maintain vendor code.");
        oParentModel.setProperty("/VName", vVendName);
        oParentModel.setProperty("/Vendor", vVendCode);
        oParentModel.setProperty("/VLocation", vVendLoc);
        oParentModel.setProperty("/Currency", vCurrCode);
        oParentModel.setProperty("/ExtPrice", vExtPrice);
        oParentModel.setProperty("/ExtValidFrom", vExtValidFrom);
        oParentModel.setProperty("/ImportFlag", vImportFlag);
        oParentModel.setProperty("/PirNo", vPirNo);
        oParentModel.setProperty("/Purorg", vPurorg);
        oParentModel.setProperty("/Pinforcat", vPinforcat);
        oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
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

    //--------- Local Methods End --------------------------

    //---------- Formatter Methods Start --------------------
        /*formatterECNIncUpload: function (vPaperType, vSign){
          return (vPaperType == "01" && vSign == "POS") ? true : false;
        },*/
        
    /*formatterSignRadio: function (vValue){
      return vValue === "POS" ? 0 :1; //0 is Increase 1 is Decrease
    },

    formatterPaperPurRadio: function (vValue){
      return vValue === "01" ? 0 :1; //0 is ECN 1 is Non-ECN
    },*/

    attachEditable: function(vEditable,vNotCreateNew){
      return vEditable && vNotCreateNew;
    },
    visibleExport: function(vEditable, vNav_Items, vNotCreateNew, vDisplayOnlyFlag){
      if(vNav_Items)
        return true;
      else
        return false;
    },

    PostToSapFieldEditable: function(vEditable, vPostToSAP){
      return vEditable || vPostToSAP ? true : false;
    },

    /*formattChange: function(vExist, vRev){
      if(vExist && vRev){
        return vRev - vExist;
      }
    },*/

    /*editableRadioIncDec: function(vEditable, vNav_Items){
      if(vEditable && !vNav_Items)
        return true;
      else
        return false;
    },*/
    visiblePartEdit: function(vEditable, vSector, vModel,vPlant, vInitiatedBySSU,vSelfRouting) {
//      if (vEditable && vSector && vSector.length > 0 && vModel && vModel.length > 0 && vPlant != "" && vInitiatedBySSU) {
//        return true;
//      } else {
//        return false;
//      }
    	var oController = this;
      	var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
      	var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      	var vAssociate = oModelSSUDigitization.oData.PaperDataSet.Associate;
      	if(vCurrentUser == vAssociate){
      		return vEditable && vSector && vModel && vPlant && vInitiatedBySSU? true : false;
      	}
      	else{
      		return vEditable && vSelfRouting && vSector && vModel && vInitiatedBySSU ? true : false;
      	}
    	
    	
    },
//  visible attachments
//  added by REDDRA-CONT on 18-01-2022
    formattAttachments : function(vValue){
//  	Start ADD By AGAWSA-CONT on 05-01-2023 user specific visibility
    	var cUserName = sap.ushell.Container.getService("UserInfo").getId();
    	var oController = this;
    	var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    	var Initiator = oModelSSUDigitization.oData.PaperDataSet.Initiator;
    	if(oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X"){
    		if(cUserName == Initiator){
    			return true;
    		}
    		else{
    			return false;
    		}
    	}
    	else
    	{
    		return true;
    	}
//  	END ADD By AGAWSA-CONT on 05-01-2023 attachment visibility improvement
    },
    formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
      var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
      return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
    },
    formattGetModelPlant: function (vSector) {
      if (vSector) {
        vSector = typeof vSector == "string" ? vSector.split(",") : vSector;
        this._getModelPlant(vSector);
        return vSector;
      }
    },
    formattValidationError: function (vValue) {
      if (typeof vValue == "string") {
        return vValue != "" ? "Error" : "None";
      }
    },
    /*formatterPartEdit: function (vEditable, vPlant) {
      return vEditable && (vPlant != "" ? true : false);
    },*/
    formatterPartEdit: function (vEditable, vPlant, vInitiatedBySSU, vDBExist) {
      return vEditable && vInitiatedBySSU && (vPlant != "" ? true : false) && !vDBExist;
    },
    formatterVendorEdit: function (vEditable, vPlant, vPartNo) {
      return vEditable && (vPlant != "" ? true : false) && (vPartNo != "" ? true : false);
    },
    formatterAttachLoc: function (vTavId, vFxRm, vPartNo) {
      if (vTavId == "VP") {
        vTavId = "Vendor Part";
      } else if (vTavId == "TC") {
        vTavId = "Tool Cost";
      } else if (vTavId == "FR") {
        vTavId = "Forex-RM Content";
      } else if (vTavId == "BR") {
        vTavId = "Business Reduction";
      } else if (vTavId == "SP") {
        vTavId = "Spare Price";
      }
      if (vFxRm == "FX") {
        vFxRm = " > Forex";
      } else if (vFxRm == "RM") {
        vFxRm = " => Rm"
      }
      if (vPartNo != "") {
        vPartNo = " => " + vPartNo;
      }
      return vTavId + vFxRm + vPartNo;
    },
    formattWFvisible: function (oWFTable) {
      if (oWFTable) {
        return oWFTable.length > 0 ? true : false;
      } else {
        return false;
      }
    },
    formattInitiator: function (vValue) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if(oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X")
        return;
      var oF4Approver = [];
      if (oModelSSUDigitization.getProperty("/F4Approver")) {
        oF4Approver = $.grep(oModelSSUDigitization.getProperty("/F4Approver"), function (grepRow) {
          return (grepRow.Cycle == vValue);
        });
      }
      if (oF4Approver.length > 0) {
        oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oF4Approver[0].Cycle);
        oModelSSUDigitization.setProperty("/PaperDataSet/Initiator", oF4Approver[0].Initiator);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver1", oF4Approver[0].Appr1);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver2", oF4Approver[0].Appr2);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver3", oF4Approver[0].Appr3);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver4", oF4Approver[0].Appr4);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver5", oF4Approver[0].Appr5);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver6", oF4Approver[0].Appr6);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver7", oF4Approver[0].Appr7);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver8", oF4Approver[0].Appr8);
      } else {
        oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", vValue);
//        oModelSSUDigitization.setProperty("/PaperDataSet/Createdby", "");
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
    //---------- Formatter Methods End ------------

    //--------- Event Methods Start -------------------------

    onSectorFinish: function (oEvent) {
      this._getModelPlant(oEvent.getSource().getSelectedKeys());
    },

    onExport: function () {
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var vPaperNumber = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo");
      var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
      var oExcelData = [];
      var vDate = [];
      var vCopyRow={};
      $.each(oNav_Items,function(i,row){
        vCopyRow = $.extend({},row)
        vDate = uiDateToBackend(vCopyRow.ValidFrom).split("T")[0].split("-").reverse();
        vCopyRow.ValidFrom = vDate.join(".");
        oExcelData.unshift(vCopyRow);
      });
      var oSettings = {
        workbook: {
          columns: getExportExcelColumsHSD(),
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
    onSettingPartDetails: function () {
      var oController = this;
      var vColumnListPath = "ModelSSUDigitization>/PartDet";
      columnsSetting(oController, vColumnListPath);
    },
    onAddForexItem: function () {
      var oController = this;
      var oItemFrag = xmlFragment(oController, "ItemHSD");
      var oModel = new JSONModel(getItemDetailsObjectHSD());
      var data = oModel.getData();
      data.Plant = this.getView().getModel("ModelSSUDigitization").getData().PaperDataSet.Plant;
      oItemFrag.setModel(oModel);
      oItemFrag.isAddNew = true;
      oItemFrag.open();
      var date = sap.ui.getCore().byId("id_validfrom");
      debugger
      date.addDelegate({
      	  onAfterRendering: function() {
      	    date.$().find('INPUT').attr('disabled', true);
      	  }
      	}, date);
      

    },
    onChangeTab: function () {
      this._validationDataFilled();
    },
    onOkItemDetail: function (oEvent) {
      var oController = this;
      var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oFragItem = oEvent.getSource().getParent();

      /*var vHeaderSign = oModelSSUDigitization.getProperty("/PaperDataSet/Sign");

      var vItemSign = oEvent.getSource().getParent().getModel().getProperty("/Sign");

      if((vItemSign=="+" || vItemSign == "") && vHeaderSign == "NEG" ) {// inc 0 dec 1
        sap.m.MessageToast.show("Settled Price should be lesser than Existing Price.");
        return;
      }
      if((vItemSign == "-" || vItemSign == "") && vHeaderSign == "POS" ){
        sap.m.MessageToast.show("Settled Price should be greater than Existing Price.");
        return;
      }*/
      var vItemSign = oEvent.getSource().getParent().getModel().getProperty("/Sign");
      if(vItemSign == ""){
        sap.m.MessageToast.show("Settled Price should not be equals to Existing Price.");
        return;
      }

      if (vAllFilled && oFragItem.isAddNew) { // oModelSSUDigitization.getProperty("/isAddNew")
        var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
        var vChangedData = oFragItem.getModel().getData();
        var oFilter = $.grep(oNav_Items, function (grepRow) {
          return ((vChangedData.Plant === grepRow.Plant) && (vChangedData.Vendor === grepRow.Vendor) && (vChangedData.PartNo === grepRow.PartNo));
        });
        if (oFilter.length <= 0) {
          oController._setDataAfterEditItem(oEvent);
          oEvent.getSource().getParent().close();
        } else {
          sap.m.MessageToast.show("This Plant,Vendor,Part Number combination is already exist.");
        }
      } else if (vAllFilled) {
        oController._setDataAfterEditItem(oEvent);
        oEvent.getSource().getParent().close();
      }

      oController.getView().getModel("ModelSSUDigitization").refresh(true);
    },
    onEdit: function () {
      var oController = this;
      oController._fnLockUnlockService("X");
//      oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", true);
//      oController.getView().getModel("ModelSSUDigitization").setProperty("/BEValidation", false);
    },
    onSave: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      
      //added by beena-50002903 for sprint 3
      if (oController.getView().byId('id_model').getValue() == "" && oController.getView().byId('id_sector').getValue() == "" &&
    		  oController.getView().byId('id_plant').getValue() === ""){
  			oController.getView().byId('id_InputAssociate').setValueState("Error");
  			Message.error("Please enter mandatory header fields.", {
  	    		  title: "Information"
  	    	  });
  	    	  return;
      }
      if(oModelSSUDigitization.getProperty("/PaperDataSet/SelfRoutingFlag") == "X" &&
    		  oModelSSUDigitization.oData.PaperDataSet.Nav_Items.length <= 0){
    	  Message.error("Fill the line item data before save", {
    		  title: "Information"
    	  });
    	  return;  
      }
  //   End added by beena-50002903 for sprint 3
      
      
      Message.confirm("This is confirmation for save data.", {
        title: "Save confirmation",
        onClose: function (oAction) {
          if (oAction == "OK") {
            var oPaperData = oController._fnDataBeforeSave();
            if(oPaperData.Nav_Items && oPaperData.Nav_Items.length>500){
              sap.m.MessageToast.show("More than 500 items is not allowed.");
              return;
            }
            oPaperData.Action = "D";
            busyDialog.open();
            oController.getOwnerComponent().getModel(
              "oDataAmendmentModel").create("/ES_Header", oPaperData, {
              success: function (oData, oResponse) {
                var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
                if (vMsgReturn.Title == "Error") {
                  sap.m.MessageBox.error(vMsgReturn.Message, {
                    title: vMsgReturn.Title
                  });
                  oController._fnAfterGettingBEData(oData);
                } else if (vMsgReturn.Title == "Sucess") {
                  sap.m.MessageBox.success(vMsgReturn.Message, {
                    title: vMsgReturn.Title,
                    onClose: function () {
                      oModelSSUDigitization.setProperty("/NotCreateNew", true);
                      oModelSSUDigitization.setProperty("/EditableFlag", false);
                      oModelSSUDigitization.setProperty("/BEValidation", true); //added by beena-50002903 for sprint 3
                      oController._fnAfterGettingBEData(oData);
//                      $.each(oModelSSUDigitization.oData.PaperDataSet.Nav_Items, function (i, Row){
//                    	 if(typeof Row.ValidFrom == "string"){
//                    		 Row.ValidFrom = new Date(Row.ValidFrom);
//                    	 } 
//                    	 var vMinDate = minDate();
//                         var vMaxDate = new Date();
//                    	 if(Row.ValidFrom >= vMinDate && Row.ValidFrom <= vMaxDate){
//                    		 oModelSSUDigitization.setProperty("/BEValidation", true); //added by beena-50002903 for sprint 3
//                    	 }
//                      });
                    }
                  });
                } else {
                  oController._fnAfterGettingBEData(oPaperData);
                }
              },
              error: function (oResponse) {
                oController._fnAfterGettingBEData(oPaperData);
                serviceError(oResponse);
              }
            });
          }
        }
      });
      // }
    },
    onBEValidate: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
      //added by beena-50002903 for sprint 3      
      var vInitiator = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Initiator"); 		
      var vAssociate = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Associate"); 		
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();      
      //End by beena-50002903 for sprint 3
      if (oModelSSUDigitization.getProperty("/EditableFlag")) {
        oController.onSave();
      }
      oController._validationMass(oNav_Items);
    },
    onSubmit: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oArray = [];
      if (sap.ui.core.Element.registry) {
        sap.ui.core.Element.registry.forEach(function (row) {
          oArray.push(row)
        });
      }
//      var oMandatoryFlag = oController._fnRequredFieldCheck(oArray);
      var vValiDataField = oController._validationDataFilled();
      //added by beena-50002903 for sprint 3
      var vInitiator = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Initiator"); 		
      var vAssociate = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Associate"); 		
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
      //End by beena-50002903 for sprint 3
      
      
      //added by beena-50002903 for sprint 3
      if(vCurrentUser == vInitiator){
    	  if(oModelSSUDigitization.oData.PaperDataSet.Nav_Items.length <= 0 && oModelSSUDigitization.oData.PaperDataSet.AssociateFlag == "" 
    		  && oModelSSUDigitization.oData.PaperDataSet.SelfRoutingFlag == 'X'){
        	  Message.error("Add line item data before Submit.", {
                  title: "Information"
                });
        	  return;
          }
      }else if(vCurrentUser == vAssociate){
    	  if(oModelSSUDigitization.oData.PaperDataSet.Nav_Items.length <= 0 && oModelSSUDigitization.oData.PaperDataSet.AssociateFlag == "X"){
        	  Message.error("Add line item data before Submit.", {
                  title: "Information"
                });
        	  return;
          }
      }
      //End by beena-50002903 for sprint 3
      
      if ( vValiDataField && oModelSSUDigitization.getProperty("/BEValidation")) {
        var oDialog = new sap.m.Dialog({
          title: 'Comments',
          content: new sap.m.TextArea({
            value: "",
            rows: 3,
            cols: 50
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
              if(oPaperData.Nav_Items && oPaperData.Nav_Items.length>500){
                sap.m.MessageToast.show("More than 500 items is not allowed.");
                return;
              }
              oPaperData.Action = "S";
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
                    oController._fnAfterGettingBEData(oData);
                  } else if (vMsgReturn.Title == "Sucess") {
                    sap.m.MessageBox.success(vMsgReturn.Message, {
                      title: vMsgReturn.Title,
                      onClose: function () {
                        navParentBack();
                        /*var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
                        oRouter.navTo("Home");*/
                      }
                    });
                  } else {
                    oController._fnAfterGettingBEData(oPaperData);
                  }
                },
                error: function (oResponse) {
                  oController._fnAfterGettingBEData(oPaperData);
                  serviceError(oResponse);
                }
              });
            }
          })
        });
        oDialog.open();
      } else {
//        oModelSSUDigitization.setProperty("/EditableFlag", true);
        oController._fnLockUnlockService("X");
        Message.error("Fill all the mandatory fields", {
          title: "Fill all fields"
        });
      }
    },
    
    
  //added by beena-50002903 for sprint 3
    
    onPressofRedelegate : function(oEvent){
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var oPaperData = oController._fnDataBeforeSave();
       
        oPaperData.Action = "G" //  Action Redelegation
        oPaperData.UsrComment = ""
        busyDialog.open();
        sap.m.MessageBox.confirm("This is the confirmation for Redelegation ?", {
  			actions: ["Ok", sap.m.MessageBox.Action.CLOSE],
  			onClose: function (sAction) {
  				if(sAction == "Ok"){
  					oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
  				          success: function (oData, oResponse) {
  				        	  busyDialog.close();
  				            var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
  				            if (vMsgReturn.Title == "Error") {
  				              sap.m.MessageBox.error(vMsgReturn.Message, {
  				                title: vMsgReturn.Title
  				              });
  				              oController._fnAfterGettingBEData(oPaperData);
  				            } else if (vMsgReturn.Title == "Sucess") {
  				              sap.m.MessageBox.success(vMsgReturn.Message, {
  				                //title: vMsgReturn.Title, BY AGAWSA-CONT-SF1K920445
  				                onClose: function () {
  				                  navParentBack();
  				                  /*var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
  				                  oRouter.navTo("Home");*/
  				                }
  				              });
  				            } else {
  				              oController._fnAfterGettingBEData(oPaperData);
  				            }
  				          },
  				          error: function (oResponse) {
  				            oController._fnAfterGettingBEData(oPaperData);
  				            serviceError(oResponse);
  				          }
  				        });
  				}else{
  					busyDialog.close();
  				}
  			}
  		});
        
    },
    
    // end by beena-50002903 for sprint 3
    
    onPrintPreview: function () {
      var oController = this;
      var oPdfViewer = new sap.m.PDFViewer();
//      var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var vPaperNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperNo");
      var sServiceUrl = oController.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
      oPdfViewer.setSource(sServiceUrl+"/ES_AmendPDF(PaperNo='" + vPaperNo + "',TermsType='00')/$value?sap-client=100");
      oPdfViewer.setTitle("SSU Price Paper");
      oPdfViewer.open();
    },
    onAttachment: function (oEvent) {
      var oController = this;
      var oAttachFrag = parentXmlFragment(oController, "Attachment");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath("ModelSSUDigitization");
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
      var vSectedData = oModelSSUDigitization.getProperty(vSelectedPath);
      var vSelectedTab = oModelSSUDigitization.getProperty("/SelectedTab");
      var vFilters = [
        new sap.ui.model.Filter("TabId", sap.ui.model.FilterOperator.EQ, vSelectedTab),
        new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, vSectedData.PartNo),
        new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSectedData.Plant),
        new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor)
      ];
      oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
      oAttachFrag.open();
    },
    onAttachDeleted: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oNavDms = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
//      var vSelectedIndex;
      $.each(oNavDms,function(i,row){
        if(row.Posnr+row.TabId == oEvent.getParameter("documentId")){
          var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
          oDataAmendmentModel.remove("/ES_DMS(Filekey='"+row.Filekey+"',TabId='"+row.TabId+"',Posnr='"+row.Posnr+"')/$value", {
            method: "DELETE",
            success: function (oData, oResponse) {
              oNavDms.splice(i, 1);
              oModelSSUDigitization.setProperty("/PaperDataSet/Nav_DMS", oNavDms);
            },
            error: function (oResponse) {
              Message.error("Error while getting data.", {
                title: "Error"
              });
            }
          });
        }
      });
    },
    onDownldTempPartDet: function () {
      //instead of paper number pass paper code, that will get mass template
      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
      window.open(sServiceUrl+"/ES_Template(PaperCode='"+vPaperCode+"')/$value");
    },
    onMassUpload: function (oEvent) {
      var oController = this;

      try {
        if (oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Nav_Items").length >= 500) {
          sap.m.MessageToast.show("Mass upload not allowed, because more than 500 items already added.");
          oEvent.getSource().clear();
          return;
        }
        var file = oEvent.getParameter("files")[0]; // oEvent.oSource.oFileUpload.files["0"];
        if (file && window.FileReader) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var wb = XLSX.read(e.target.result, {
              type: 'binary'
            });
            var vExcelDataArray = XLSX.utils.sheet_to_row_object_array(wb.Sheets[wb.SheetNames[0]]);
            if (vExcelDataArray.length > 1 && vExcelDataArray.length <= 501) {
              vExcelDataArray.splice(0, 1);
              oController._fnMassDataSet(vExcelDataArray);
            } else if (vExcelDataArray.length > 501) {
              sap.m.MessageToast.show("Uploaded excel sheet data exceed. Maximum 500 rows.");
            } else {
              sap.m.MessageToast.show("Unable to find any data in uploaded excel sheet....");
            }
          };
          reader.readAsBinaryString(file);
        }
      } catch (oException) {
        sap.m.MessageToast.show(oException.message);
      }
      oEvent.getSource().clear();
    },
    oModelSelection: function () {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ModelDialog");
      oValueHelp.open();
    },

    onPartValueHelp: function (oEvent) {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ValueHelp");
      oValueHelp.setTitle("Part Number");
      var template = new sap.m.StandardListItem({
        title: "{PartNo}",
        description: "{PartDesc}"
      });
      oValueHelp.bindAggregation("items", "/", template);
      oValueHelp.setModel(new JSONModel());
      oValueHelp.parentModel = oEvent.getSource().getBindingContext().getModel();
      oValueHelp.open();
    },
    onVendorValHelp: function (e) {
      var oController = this;
      var oVendor = parentXmlFragment(oController, "ValueHelp");
      oVendor.setTitle("Vendor Search");
      var template = new sap.m.StandardListItem({
        title: "{VendName}",
        description: "{VendCode}",
        info: "{PinfoCatText}"
      });
      oVendor.bindAggregation("items", "/", template);
      oVendor.setModel(new JSONModel());
      oVendor.parentModel = e.getSource().getBindingContext().getModel();
      oVendor.open();
    },
    handleClose: function (e) {
      var oSelectedItem = e.getParameter("selectedItem");
      var oController = this;
      if (oSelectedItem) {
        var oSelectedData = e.getSource().getModel().getProperty(oSelectedItem.getBindingContextPath());
        var oParentModel = e.getSource().parentModel;
        if (e.getSource().getTitle() == "Part Number") {
          oParentModel.setProperty("/PartNo", oSelectedData.PartNo);
          oParentModel.setProperty("/PartDesc", oSelectedData.PartDesc);
          oParentModel.setProperty("/Taxonomy", oSelectedData.Taxonomy);
          oParentModel.setProperty("/NetWtUniit", oSelectedData.NetWtUnit);

          oParentModel.setProperty("/Vendor", "");
          oParentModel.setProperty("/VName", "");
          oParentModel.setProperty("/VLocation", "");
          oParentModel.setProperty("/Currency", "");
          oParentModel.setProperty("/ExtPrice", "");
          oParentModel.setProperty("/ExtValidFrom", null);
          oParentModel.setProperty("/PirNo", "");
          oParentModel.setProperty("/Purorg", "");
          oParentModel.setProperty("/Pinforcat", "");
          oParentModel.setProperty("/PinfoCatText", "");

        }
        if (e.getSource().getTitle() == "Vendor Search") {
          oParentModel.setProperty("/VName", oSelectedData.VendName);
          oParentModel.setProperty("/Vendor", oSelectedData.VendCode);
          oParentModel.setProperty("/VLocation", oSelectedData.VendLoc);
          oParentModel.setProperty("/Currency", oSelectedData.CurrCode);
          oParentModel.setProperty("/ExtPrice", oSelectedData.ExtPrice);
          oParentModel.setProperty("/ExtValidFrom", oSelectedData.ExtValidFrom);
          oParentModel.setProperty("/ImportFlag", oSelectedData.ImportFlag);
          oParentModel.setProperty("/PirNo", oSelectedData.PirNo);
          oParentModel.setProperty("/Purorg", oSelectedData.Purorg);
          oParentModel.setProperty("/Pinforcat", oSelectedData.Pinforcat);
          oParentModel.setProperty("/PinfoCatText", oSelectedData.PinfoCatText);
          oController.getView().getModel("ModelSSUDigitization").setProperty("/F4PinfoCategory", [oSelectedData]);
        }
      }
    },
    handleSearch: function (e) {
      var vSelectedValue = e.getParameter("value").toUpperCase();
      var filters = [];
      var valueHelp = e.getSource();
      var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
//      var plant = e.getSource().parentModel.getProperty("/Plant");
      var plant = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet").Plant;
      var PartNo = e.getSource().parentModel.getProperty("/PartNo");
      if (e.getSource().getTitle() == "Vendor Search") {
        if (vSelectedValue.length > 4) {
          valueHelp.setBusy(true);
          filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
          filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));
          filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
          filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X"));
          oDataAmendmentModel.read("/ES_Vendor", {
            filters: filters,
            success: function (oData, oResponse) {
              valueHelp.getModel().setData(oData.results);
              valueHelp.getModel().refresh();
              valueHelp.setBusy(false);
            },
            error: function (oResponse) {
              valueHelp.getModel().setData([]);
              valueHelp.setBusy(false);
            }
          });
        }
      } else if (e.getSource().getTitle() == "Part Number") {
        if (vSelectedValue.length > 4) {
          valueHelp.setBusy(true);
          oDataAmendmentModel.read("/ES_Part", {
            filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
              .FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X")],
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
      }

    },
    onPlantCode: function (oEvent) {
      var vPlant = oEvent.getSource().getValue().split("-")[0];
      var dataP = this.getView().getModel("ModelSSUDigitization").getData();
      this.getView().getModel("ModelSSUDigitization").getData().PaperDataSet.Plant = vPlant;
      this.getView().getModel("ModelSSUDigitization").refresh(true);

    },
    onSubmitVendorCode: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      oController._getVendor(oParentModel,vSelectedValue);
    },
    onSubmitPartNum: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//      var plant = oParentModel.getProperty("/Plant");
      var plant = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet").Plant;
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Part", {
          filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
            .FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
          success: function (oData, oResponse) {
            busyDialog.close();
            if (oData.results.length > 0  && oData.results[0].Message == "") {
              oParentModel.setProperty("/PartNo", oData.results[0].PartNo);
              oParentModel.setProperty("/PartDesc", oData.results[0].PartDesc);
              oParentModel.setProperty("/Taxonomy", oData.results[0].Taxonomy);
              oParentModel.setProperty("/NetWtUniit", oData.results[0].NetWtUnit);

              oParentModel.setProperty("/Vendor", "");
              oParentModel.setProperty("/VName", "");
              oParentModel.setProperty("/VLocation", "");
              oParentModel.setProperty("/Currency", "");
              oParentModel.setProperty("/ExtPrice", "");
              oParentModel.setProperty("/ExtValidFrom", null);
              oParentModel.setProperty("/PirNo", "");
              oParentModel.setProperty("/Purorg", "");
              oParentModel.setProperty("/Pinforcat", "");
              oParentModel.setProperty("/PinfoCatText", "");
            } else {
              if(oData.results[0] && oData.results[0].Message != "")
                Message.error(oData.results[0].Message, { title: "Error" });
//              sap.m.MessageToast.show(vSelectedValue + " either does not exist or not extended for " + plant + " plant.");
              oParentModel.setProperty("/PartNo", "");
              oParentModel.setProperty("/PartDesc", "");
              oParentModel.setProperty("/Taxonomy", "");
              oParentModel.setProperty("/NetWtUniit", "");

              oParentModel.setProperty("/Vendor", "");
              oParentModel.setProperty("/VName", "");
              oParentModel.setProperty("/VLocation", "");
              oParentModel.setProperty("/Currency", "");
              oParentModel.setProperty("/ExtPrice", "");
              oParentModel.setProperty("/ExtValidFrom", null);
              oParentModel.setProperty("/PirNo", "");
              oParentModel.setProperty("/Purorg", "");
              oParentModel.setProperty("/Pinforcat", "");
              oParentModel.setProperty("/PinfoCatText", "");
            }

          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });
      } else {
        busyDialog.close();
        sap.m.MessageToast.show("Maintain part number.");
        oParentModel.setProperty("/PartNo", "");
        oParentModel.setProperty("/PartDesc", "");
        oParentModel.setProperty("/Taxonomy", "");
        oParentModel.setProperty("/NetWtUniit", "");

        oParentModel.setProperty("/Vendor", "");
        oParentModel.setProperty("/VName", "");
        oParentModel.setProperty("/VLocation", "");
        oParentModel.setProperty("/Currency", "");
        oParentModel.setProperty("/ExtPrice", "");
        oParentModel.setProperty("/ExtValidFrom", null);
        oParentModel.setProperty("/PirNo", "");
        oParentModel.setProperty("/Purorg", "");
        oParentModel.setProperty("/Pinforcat", "");
        oParentModel.setProperty("/PinfoCatText", "");
      }
    },
    onChangeInitiator: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if (oEvent.getParameter("selectedItem")) {
        oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oEvent.getParameter("selectedItem").getKey());
      } else {
        oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
      }
    },
    onSettledSub: function (oEvent) {
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var vNewValue = oEvent.getParameter("newValue");
        var vNewValueArray = vNewValue.split(".");
        if (vNewValueArray[0].length > 9 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 13) {
          vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 9) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0,
            9);
          oEvent.getSource().setValue(vNewValue);
        } else {
          oEvent.getSource().setValue(vNewValue);
        }
        var oModel = oEvent.getSource().getModel();
        var oParentModel = oEvent.getSource().getBindingContext().getModel();
        var vExtPrice = oParentModel.getProperty("/ExtPrice");
        var vSign =  Number(vNewValue) - Number(vExtPrice);
        var vChangePercnd = vSign/vExtPrice*100;

        vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
        oParentModel.setProperty("/ChgPrctng",Math.abs(vChangePercnd).toFixed(2));
        oParentModel.setProperty("/DeltaPrice", vSign.toFixed(2));
        if(vSign == 0)
          vSign = "";
        else
          vSign = vSign > 0? "+" : "-";
        oParentModel.setProperty("/Sign",vSign);

        var oFilterData = $.grep(oModelSSUDigitization.getProperty("/F4Amentment"),function(row){
          if(vSign == "+")
            return (row.Sign == "POS");
          else if(vSign == "-")
            return (row.Sign == "NEG");
        });
        if(oFilterData.length>0){
          oParentModel.setProperty("/Amndcode",oFilterData[0].Zpricecd);
          oParentModel.setProperty("/AmndcodeDesc",oFilterData[0].Zreason);
        }else{
          oParentModel.setProperty("/Amndcode","");
          oParentModel.setProperty("/AmndcodeDesc","");
        }


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
        onPinfoCat: function(oEvent){
      var oModel = oEvent.getSource().getModel();
//      oModel.setProperty("/ExtPrice", oEvent.getSource().getSelectedItem().getAdditionalText());
            var vAdditionalText = oEvent.getSource().getSelectedItem().getAdditionalText();
      var oExtValidFrom = new Date(vAdditionalText.split("-")[1]);
      oModel.setProperty("/ExtPrice", vAdditionalText.split("-")[0]);
      oModel.setProperty("/ExtValidFrom", oExtValidFrom);
      oModel.setProperty("/SettledPrice", "0");
      oModel.setProperty("/DeltaPrice", "0");
    },
    onAmentmendCode: function(oEvent){
      var oModel = oEvent.getSource().getModel();
      oModel.setProperty("/AmndcodeDesc", oEvent.getSource().getSelectedItem().getAdditionalText());
    },
    /*onChangeSign: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSign =oEvent.getParameter("selectedIndex") == 0 ? "POS" : "NEG"; //0 is Increase 1 is Decrease;
      oModelSSUDigitization.setProperty("/PaperDataSet/Sign",vSign);
      oController._setUploadVisible();
      oController._getAmentmendService();
      oController._getWorkFlow();
    },
    onChangePaperPur: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vPaperPur =oEvent.getParameter("selectedIndex") == 0 ? "01" : "02"; //0 is ECN 1 is Non-ECN
      oModelSSUDigitization.setProperty("/PaperDataSet/PaperPur",vPaperPur);
      oController._setUploadVisible();
//      oController._getWorkFlow();
    },
    _setUploadVisible: function(){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/ECNInc",(oPaperData.PaperPur == "01" && oPaperData.Sign == "POS") ? true : false);
      oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/ECNDec",(oPaperData.PaperPur == "01" && oPaperData.Sign == "NEG") ? true : false);
      oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/NonECNInc",(oPaperData.PaperPur == "02" && oPaperData.Sign == "POS") ? true : false);
      oModelSSUDigitization.setProperty("/PaperDataSet/uiFields/NonECNDec",(oPaperData.PaperPur == "02" && oPaperData.Sign == "NEG") ? true : false);
    },*/
    onErrMsgValueHelp:function(e){
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ErrorMsgPopOver");
      oValueHelp.toggle(e.getSource());
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var ErrorData = oModelSSUDigitization.getProperty(selectedPath+"/uiFields/MassValidation");
      var oValidationError = [];
      if(ErrorData && ErrorData.hasOwnProperty("ItemNo")){
        if(ErrorData.PartNoFlag != ""){
          oValidationError.push({"BEError" :ErrorData.PartNoFlag});
        }
        if(ErrorData.VendorFlag != ""){
          oValidationError.push({"BEError" : ErrorData.VendorFlag});
        }
        if(ErrorData.PlantFlag != ""){
          oValidationError.push({"BEError" : ErrorData.PlantFlag});
        }
        if(ErrorData.AmndcodeFlag != ""){
          oValidationError.push({"BEError" :ErrorData.AmndcodeFlag});
        }
        if(ErrorData.ValidFromFlag != ""){
          oValidationError.push({"BEError" :ErrorData.ValidFromFlag});
        }
        // Added by REDDRA-CONT ON 24-05-2022
        if(ErrorData.SettledPriceFlag != ""){
          oValidationError.push({"BEError" :ErrorData.SettledPriceFlag});
        }
      }
      oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
    },
    /*onAddCurrItem: function(){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oNav_Currency = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Currency");
      var oCurrData = getCurrencyStr();
      oCurrData.RvToDt = oNav_Currency[0].RvToDt;
      oCurrData.ExFrmDt = oNav_Currency[0].ExFrmDt;
      oCurrData.ExToDt = oNav_Currency[0].ExToDt;
      oCurrData.RvFrmDt = oNav_Currency[0].RvFrmDt;

      oNav_Currency.push(oCurrData);
      oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Currency", oNav_Currency);
    },*/
    onTableSelectAll: function(oEvent){
      if(oEvent.getParameter("selectAll")){
        this.getView().getModel("ModelSSUDigitization").setProperty("/PostToSapSelectAll",true);
      }else{
        this.getView().getModel("ModelSSUDigitization").setProperty("/PostToSapSelectAll",false);
      }
    },
        onSubmitPostToSap: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vButtonType = oEvent.getSource().getProperty("type");
      var oSelectedPath = oController.getView().byId("idPartPriceTbl").getSelectedContextPaths();
        var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      if(oSelectedPath.length > 0){
        var vMsg = "";
        var vTitle = "";
        if(vButtonType == "Accept"){
//          vMsg = "This is confirmation for Post to SAP.";
                    vMsg = oPaperData.DisclaimerText;
          vTitle = "Post to SAP confirmation";
        } else {
          vMsg = "This is confirmation for Mark for Deletion.";
          vTitle = "Mark for Deletion confirmation";
        }

        Message.confirm(vMsg, {
          title: vTitle,
          onClose: function (oAction) {
            if (oAction == "OK") {
            oController.getView().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/ACKWNLDG","X");
              var oPaperData = oController._fnDataBeforeSave();
              var oSelectedItems=[];
              if(oModelSSUDigitization.getProperty("/PostToSapSelectAll")){
                oSelectedPath=[];
                $.each(oPaperData.Nav_Items,function(i,Row){
                  oSelectedPath.push("/PaperDataSet/Nav_Items/"+i);
                });
              }
              $.each(oSelectedPath,function(i,Row){
                if(oModelSSUDigitization.getProperty(Row).BjStatus == "" || oModelSSUDigitization.getProperty(Row).BjStatus == "E")
                  oSelectedItems.push(oModelSSUDigitization.getProperty(Row));
              });
              var oPaperDataCopy = $.extend({}, oPaperData);
              oPaperDataCopy.Nav_Items = oSelectedItems;
              if(vButtonType == "Accept"){
                oPaperDataCopy.Action = "P";
                oPaperDataCopy.BjStatus = "";
              } else {
                oPaperDataCopy.Action = "M";
                oPaperDataCopy.BjStatus = "R";
              }
              busyDialog.open();
              oController.getOwnerComponent().getModel(
                "oDataAmendmentModel").create("/ES_Header", oPaperDataCopy, {
                success: function (oData, oResponse) {
                  var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
                  if (vMsgReturn.Title == "Error") {
                    sap.m.MessageBox.error(vMsgReturn.Message, {
                      title: vMsgReturn.Title
                    });
                    oController._fnAfterGettingBEData(oData);
                  } else if (vMsgReturn.Title == "Sucess") {
                    sap.m.MessageBox.success(vMsgReturn.Message, {
                      title: vMsgReturn.Title,
                      onClose: function () {
                        if(oData.Status == "C")
                          navParentBack();
                        else
                          oController._fnAfterGettingBEData(oData);
                      }
                    });
                  } else {
                    if(oData.Status == "C")
                      navParentBack();
                    else
                      oController._fnAfterGettingBEData(oData);
                  }
                },
                error: function (oResponse) {
                  oController._fnAfterGettingBEData(oPaperData);
                  serviceError(oResponse);
                }
              });
            }
          }
        });
      } else {
        sap.m.MessageToast.show("Items is not selected.");
      }
    },
        onSubmitMark: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var vButtonType = oEvent.getSource().getProperty("type");
      var oSelectedPath = oController.getView().byId("idPartPriceTbl").getSelectedContextPaths();
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");

      if(oSelectedPath.length > 0){
        var vMsg = "";
        var vTitle = "";
        if(vButtonType == "Accept"){

          //vMsg = "This is confirmation for Post to SAP.";

          vMsg = oPaperData.DisclaimerText ;
          vTitle = "Post to SAP confirmation";

        } else {
          vMsg = "This is confirmation for Mark for Deletion.";
          vTitle = "Mark for Deletion confirmation";
        }

        Message.confirm(vMsg, {
          title: vTitle,
          onClose: function (oAction) {
            if (oAction == "OK") {
//          oController.getView().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/ACKWNLDG","X");
              var oPaperData = oController._fnDataBeforeSave();
              var oSelectedItems=[];
              if(oModelSSUDigitization.getProperty("/PostToSapSelectAll")){
                oSelectedPath=[];
                $.each(oPaperData.Nav_Items,function(i,Row){
                  oSelectedPath.push("/PaperDataSet/Nav_Items/"+i);
                });
              }
              $.each(oSelectedPath,function(i,Row){
                if(oModelSSUDigitization.getProperty(Row).BjStatus == "" || oModelSSUDigitization.getProperty(Row).BjStatus == "E")
                  oSelectedItems.push(oModelSSUDigitization.getProperty(Row));
              });
              var oPaperDataCopy = $.extend({}, oPaperData);
              oPaperDataCopy.Nav_Items = oSelectedItems;
              if(vButtonType == "Accept"){
                oPaperDataCopy.Action = "P";
                oPaperDataCopy.BjStatus = "";
              } else {
                oPaperDataCopy.Action = "M";
                oPaperDataCopy.BjStatus = "R";
              }
              busyDialog.open();
              oController.getOwnerComponent().getModel(
                "oDataAmendmentModel").create("/ES_Header", oPaperDataCopy, {
                success: function (oData, oResponse) {
                  var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
                  if (vMsgReturn.Title == "Error") {
                    sap.m.MessageBox.error(vMsgReturn.Message, {
                      title: vMsgReturn.Title
                    });
                    oController._fnAfterGettingBEData(oData);
                  } else if (vMsgReturn.Title == "Sucess") {
                    sap.m.MessageBox.success(vMsgReturn.Message, {
                      title: vMsgReturn.Title,
                      onClose: function () {
                        if(oData.Status == "C")
                          navParentBack();
                        else
                          oController._fnAfterGettingBEData(oData);
                      }
                    });
                  } else {
                    if(oData.Status == "C")
                      navParentBack();
                    else
                      oController._fnAfterGettingBEData(oData);
                  }
                },
                error: function (oResponse) {
                  oController._fnAfterGettingBEData(oPaperData);
                  serviceError(oResponse);
                }
              });
            }
          }
        });
      } else {
        sap.m.MessageToast.show("Items is not selected.");
      }
    },
        onSubmitMark: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var vButtonType = oEvent.getSource().getProperty("type");
      var oSelectedPath = oController.getView().byId("idPartPriceTbl").getSelectedContextPaths();
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");

      if(oSelectedPath.length > 0){
        var vMsg = "";
        var vTitle = "";
        if(vButtonType == "Accept"){

          //vMsg = "This is confirmation for Post to SAP.";

          vMsg = oPaperData.DisclaimerText ;
          vTitle = "Post to SAP confirmation";

        } else {
          vMsg = "This is confirmation for Mark for Deletion.";
          vTitle = "Mark for Deletion confirmation";
        }

        Message.confirm(vMsg, {
          title: vTitle,
          onClose: function (oAction) {
            if (oAction == "OK") {
//          oController.getView().getModel("ModelSSUDigitization").setProperty("/PaperDataSet/ACKWNLDG","X");
              var oPaperData = oController._fnDataBeforeSave();
              var oSelectedItems=[];
              if(oModelSSUDigitization.getProperty("/PostToSapSelectAll")){
                oSelectedPath=[];
                $.each(oPaperData.Nav_Items,function(i,Row){
                  oSelectedPath.push("/PaperDataSet/Nav_Items/"+i);
                });
              }
              $.each(oSelectedPath,function(i,Row){
                if(oModelSSUDigitization.getProperty(Row).BjStatus == "" || oModelSSUDigitization.getProperty(Row).BjStatus == "E")
                  oSelectedItems.push(oModelSSUDigitization.getProperty(Row));
              });
              var oPaperDataCopy = $.extend({}, oPaperData);
              oPaperDataCopy.Nav_Items = oSelectedItems;
              if(vButtonType == "Accept"){
                oPaperDataCopy.Action = "P";
                oPaperDataCopy.BjStatus = "";
              } else {
                oPaperDataCopy.Action = "M";
                oPaperDataCopy.BjStatus = "R";
              }
              busyDialog.open();
              oController.getOwnerComponent().getModel(
                "oDataAmendmentModel").create("/ES_Header", oPaperDataCopy, {
                success: function (oData, oResponse) {
                  var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
                  if (vMsgReturn.Title == "Error") {
                    sap.m.MessageBox.error(vMsgReturn.Message, {
                      title: vMsgReturn.Title
                    });
                    oController._fnAfterGettingBEData(oData);
                  } else if (vMsgReturn.Title == "Sucess") {
                    sap.m.MessageBox.success(vMsgReturn.Message, {
                      title: vMsgReturn.Title,
                      onClose: function () {
                        if(oData.Status == "C")
                          navParentBack();
                        else
                          oController._fnAfterGettingBEData(oData);
                      }
                    });
                  } else {
                    if(oData.Status == "C")
                      navParentBack();
                    else
                      oController._fnAfterGettingBEData(oData);
                  }
                },
                error: function (oResponse) {
                  oController._fnAfterGettingBEData(oPaperData);
                  serviceError(oResponse);
                }
              });
            }
          }
        });
      } else {
        sap.m.MessageToast.show("Items is not selected.");
      }
    },

    onApproveRequest: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//      var vButtonType = oEvent.getSource().getProperty("type");
      Message.confirm("This is confirmation for approve request.", {
        title: "Approve confirmation",
        onClose: function (oAction) {
          if (oAction == "OK") {
            var oPaperData = oController._fnDataBeforeSave();
            oPaperData.Action = "3"; // accept action is 3
            busyDialog.open();
            oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
              success: function (oData, oResponse) {
                var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
                if (vMsgReturn.Title == "Error") {
                  sap.m.MessageBox.error(vMsgReturn.Message, {
                    title: vMsgReturn.Title
                  });
                  oController._fnAfterGettingBEData(oPaperData);
                } else if (vMsgReturn.Title == "Sucess") {
                  sap.m.MessageBox.success(vMsgReturn.Message, {
                    title: vMsgReturn.Title,
                    onClose: function () {
                      oController._fnAfterGettingBEData(oData);
                      oModelSSUDigitization.setProperty("/NonSSURequest", false);
                      oModelSSUDigitization.setProperty("/SSURequest", false);
                    }
                  });
                } else {
                  oController._fnAfterGettingBEData(oPaperData);
                }
              },
              error: function (oResponse) {
                oController._fnAfterGettingBEData(oPaperData);
                serviceError(oResponse);
              }
            });
          }
        }
      })
    },
    onRejectRequest: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//      var vButtonType = oEvent.getSource().getProperty("type");
      var oDialog = new sap.m.Dialog({
        title: 'Comments',
        content: new sap.m.TextArea({
          value: "",
          rows: 3,
          cols: 50
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
//          	ADD Start by AGAWSA-CONT on 08-02-2023
          	var vUsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
              if(vUsrComment.length <= 4){
                sap.m.MessageToast.show("Write any reasons for rejection.");
                return;
              }
//          	ADD End by AGAWSA-CONT on 08-02-2023
            var oPaperData = oController._fnDataBeforeSave();
            oPaperData.Action = "4"; // reject action is 4
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
                  oController._fnAfterGettingBEData(oPaperData);
                } else if (vMsgReturn.Title == "Sucess") {
                  sap.m.MessageBox.success(vMsgReturn.Message, {
                    title: vMsgReturn.Title,
                    onClose: function () {
                      navParentBack();
                    }
                  });
                } else {
                  oController._fnAfterGettingBEData(oPaperData);
                }
              },
              error: function (oResponse) {
                oDialog.close();
                oController._fnAfterGettingBEData(oPaperData);
                serviceError(oResponse);
              }
            });
          }
        })
      });
      oDialog.open();

    },
    _fnLockUnlockService:function(vLock) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo");
      var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
      //added by beena-50002903 for sprint 3
      var vAssociateFlag = oModelSSUDigitization.getProperty("/PaperDataSet/AssociateFlag"); 
      var vAssociate = oModelSSUDigitization.getProperty("/PaperDataSet/Associate");
      var vInitiator = oModelSSUDigitization.getProperty("/PaperDataSet/Initiator");
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId(); 
      //end by beena-50002903 for sprint 3
//      if(!vPaperNo || (vLock=="" && !oModelSSUDigitization.getProperty("/EditableFlag")))
      if(!vPaperNo)
        return;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oData_Url = oDataAmendmentModel.sServiceUrl+"/ES_LockUnlockSSU(PaperCode='"+vPaperCode+"',PaperNo='"+vPaperNo+"',Lock='"+vLock+"')";
      $.ajax(oData_Url, {
        dataType:"json",
          success: function(oData) {
            oData = oData.d;
            busyDialog.close();
            
            //added by beena-50002903 for sprint 3
            if(vCurrentUser == vInitiator){
    			  if (vAssociateFlag == "X"){
    				  if(oData.Message.substr(0,1)=="S" && vLock != ""){
            			  oModelSSUDigitization.setProperty("/EditableFlag", true);
            			  oModelSSUDigitization.setProperty("/BEValidation", false);
            			  oModelSSUDigitization.setProperty("/EditableAsso", false);
            		  }
            		  else if(oData.Message.substr(0,1)=="E"){
            			  Message.error(oData.Message);
            			  oModelSSUDigitization.setProperty("/EditableFlag", false);
            		  }else{
            			  oModelSSUDigitization.setProperty("/EditableFlag", false);
            		  }
    			  }else{
    				  if(oData.Message.substr(0,1)=="S" && vLock != ""){
            			  oModelSSUDigitization.setProperty("/EditableFlag", true);
            			  oModelSSUDigitization.setProperty("/BEValidation", false);
            		  }
            		  else if(oData.Message.substr(0,1)=="E"){
            			  Message.error(oData.Message);
            			  oModelSSUDigitization.setProperty("/EditableFlag", false);
            		  }else{
            			  oModelSSUDigitization.setProperty("/EditableFlag", false);
            		  }
    			  }
    			  
    		  }else if(vCurrentUser == vAssociate){
    			  if (vAssociateFlag == "X"){
    				  if(oData.Message.substr(0,1)=="S" && vLock != ""){
            			  oModelSSUDigitization.setProperty("/EditableFlag", true);
            			  oModelSSUDigitization.setProperty("/BEValidation", false);
            			  oModelSSUDigitization.setProperty("/EditableAsso", true);
            			  oModelSSUDigitization.setProperty("/PaperDataSet/AssociateEdit", "X");
            		  }
            		  else if(oData.Message.substr(0,1)=="E"){
            			  Message.error(oData.Message);
            			  oModelSSUDigitization.setProperty("/EditableFlag", false);
            		  }else{
            			  oModelSSUDigitization.setProperty("/EditableFlag", false);
            		  }
    			  }
    		  }
            //end by beena-50002903 for sprint 3
                
            
//          if(oData.Message.substr(0,1)=="S" && vLock != ""){
//            oModelSSUDigitization.setProperty("/EditableFlag", true);
//            oModelSSUDigitization.setProperty("/BEValidation", false);
//          }
//          else if(oData.Message.substr(0,1)=="E"){
//            Message.error(oData.Message);
//            oModelSSUDigitization.setProperty("/EditableFlag", false);
//          }else{
//            oModelSSUDigitization.setProperty("/EditableFlag", false);
//          }
          },
          error: function(oResponse) {
            serviceError(oResponse);
          }
       });
    },
    onExit: function(){
      var oController = this;
      oController._fnLockUnlockService("");
    },
//    ===================added by deepa==============
    formattPlantEditable:function(value){
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
        if(oPaperData.Nav_Items!=undefined){
      if(value==true && oPaperData.Nav_Items.length<=0){
        return true
        }else{
          return false;
        }
      }else{
        return value;
      }


    }
//    =================end===============
      //--------- Event Methods End -----------------

  });
});