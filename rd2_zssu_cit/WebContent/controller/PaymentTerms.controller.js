sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel", 
  "sap/m/MessageBox",
  "sap/ui/export/Spreadsheet"

], function (Controller, JSONModel, Message, Spreadsheet) {
  var oController,oDataAmendmentModel; 
  "use strict";
  return Controller.extend("com.mahindra.ZSSU_CIT_PayTerms.controller.PaymentTerms", {
    onInit: function () {
      // Fiori Usage//
      var device = "Other";
      var os = jQuery.os.os;
      var os_ver = jQuery.os.fVersion;
      var browser = "Other";
      var browser_ver = jQuery.browser.fVersion;
      var height = $(window).height();
      var width = $(window).width();
      var resolution = width + " * " + height;
      var appName  = "ZSSU_CIT";

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
      oDataModel.read("/FioriUsageSet(Appname='ZSSU_CIT',Device='" + device +
      "',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
      "',Resolution='" + resolution + "')",null,null,null,function(e)   { },
      function(e)
      { });

      oController = this;
      oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelDefault = new sap.ui.model.json.JSONModel();
      var sUrl = jQuery.sap.getModulePath("SSU", "/json/dataSet.json");
      oModelDefault.loadData(sUrl, "", false);
      oController.getView().setModel(oModelDefault, "ModelDefaultDataSet");
      var useDetails = new JSONModel();
      useDetails.loadData("/sap/bc/ui2/start_up", null, false);
      oModelDefault.setProperty("/UserId", useDetails.getProperty("/id"));

       var vStartupPara = getStartupParameters(this);
       oController._onObjectMatched(vStartupPara.PaperNumber);
//      oController._onObjectMatched(["FY20-CIT-00005","CIT"]);

    },//--------- Local Methods Start -------------------------
    _onObjectMatched: function (oParameter) {
      var vPaperNo = oParameter[0];
      var vPaperCode = oParameter[1];
      var oModel = new sap.ui.model.json.JSONModel();
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId(); // added by beena-50002903 for sprint 3

      var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_CIT_PayTerms', '/json/CIT.json');
      oModel.loadData(sUrl, "", false);
      oModel.setProperty("/PageTitle",("Payment Term"));
      oController.getView().setModel(oModel, "ModelSSUDigitization");
      oModel.setProperty("/PartSettlementTracker", oParameter[2] || "");
      oModel.setProperty("/UserId", oController.getView().getModel("ModelDefaultDataSet").getProperty("/UserId"));
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      if (vPaperNo == "new") {
        oModel.setProperty("/NotCreateNew", false);
        oModel.setProperty("/EditableFlag", true);
        oModel.setProperty("/DisplayOnlyFlag", false);
        oModel.setProperty("/SSURequest", false); //added by beena-50002903 for sprint 3
        var oData = getHeaderObjectCIT();
        oData.PaperCode= vPaperCode;
        oData.Createdby = vCurrentUser; // added by beena-50002903 for sprint 3
        oData.Initiator = vCurrentUser; // added by AGAWSA-CONT 
        oModel.setProperty("/PaperDataSet", oData);
        oController._getAmentmendService();
//        oController._getWorkFlow();
      } else {
        oModel.setProperty("/SSURequest", false);// added by beena-50002903 for sprint 3
         oController._fnGetNPIHeaderData(vPaperNo,vPaperCode);
//         oController._getAmentmendService();
//         oController._fnAfterGettingBEData(oModel.getProperty("/PaperDataSet"));
         
         
      }
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
//      var vPaperCode="CIT";
            var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      oController.getView().setBusy(true);
      var vParmeters = {
//          "$filter": "PaperCode eq '"+vPaperCode+"' and PaperNo eq '"+vPnifoNumber+"'",
          "$expand": "Nav_Items,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret",
      };
//      oDataAmendmentModel.read("/ES_Header('" + vPnifoNumber + "')", {
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
      //added by beena-50002903 for sprint 3 
      com.mahindra.ZSSU_CIT_PayTerms.oData = oData;
      var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
      //added by beena-50002903 for sprint 3 
      // oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
      oData.Model = oData.Model ? oData.Model.split(",") : [];
      oData.Nav_Items = oData.Nav_Items.results || oData.Nav_Items;
      oData.Nav_DMS = oData.Nav_DMS.results  || oData.Nav_DMS;
      oData.Nav_Log = oData.Nav_Log.results  || oData.Nav_Log;
      oData.Nav_Wf = oData.Nav_Wf.results  || oData.Nav_Wf;
//      if(oData.Nav_Items.length !== 0){
//        this.getView().byId("itemCount").setText("Item Count: " + oData.Nav_Items.length)
//      }
      
//      oData.Nav_Items = oData.Nav_Items.results;
//      oData.Nav_DMS = oData.Nav_DMS.results;
//      oData.Nav_Log = oData.Nav_Log.results;
//      oData.Nav_Wf = oData.Nav_Wf.results;

//      oData.TermsType = oData.TermsType == "1" ? 0 : 1; //0 is Payment Term and 1 is Inco Term;
//      oData.PriceChange = oData.PriceChange == "Y" ? 0 : 1;
      // For Showing Paper is increase or decrease
//      oData.Message = oData.Sign =="POS" ? "Increasing":"Decreasing";

      $.each(oData.Nav_Items, function (i, Row) {
        Row.uiFields ={
              "Error": "Default",
              "ItemNo": "",
              "maxDate":  new Date(),
              "minDate": minDate()
            };
        if(typeof Row.ValidFrom=="string"){
           Row.ValidFrom = new Date( Row.ValidFrom);
        }
        /*Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
        Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
        Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
        Row.Nav_Forex = Row.Nav_Forex.results;
        Row.Nav_RM = Row.Nav_RM.results;*/
        // Row.YearBase = parseInt(Row.YearBase);
      });
      if(oData.Initiator == vCurrentUser){
        if(oData.AssociateFlag === "X"){
          if (oData.Status === "S" || oData.Status === "R"){
                oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
                oModelSSUDigitization.setProperty("/SSURequest", false);
//                this.getView().byId("redelegation").setVisible(true);
              }
            else if(oData.Status === "AS"){
              oModelSSUDigitization.setProperty("/BEValidation", false);
                oModelSSUDigitization.setProperty("/SSURequest", false);
                oModelSSUDigitization.setProperty("/EditableFlag", false);
//                this.getView().byId("redelegation").setVisible(true);
            }
              else if(oData.Status === "AR"){
                oModelSSUDigitization.setProperty("/SSURequest", false);
//                this.getView().byId("redelegation").setVisible(true);
              }
              else if(oData.Status === "NR"){
//                oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
                oModelSSUDigitization.setProperty("/SSURequest", true);
                this.getView().byId("RejectBtn").setText("Reject");
//                oModelSSUDigitization.setProperty("/EditableFlag", false);
              }else if(oData.Status === "C"){
                this.getView().byId("redelegation").setVisible(false);
              }
          //added by beena on 13-03-2023
          if(oData.Nav_Wf.length === 0 && oData.Status !== "NR"){
                this.getView().byId("redelegation").setVisible(false);
          }else if(oData.Nav_Wf.length !== 0 && oData.Status === "NR"){
            this.getView().byId("redelegation").setVisible(false);
          }else if(oData.Nav_Wf.length !== 0 && (oData.Status === "C" || oData.Status === "R" || oData.Status === "S")){
            this.getView().byId("redelegation").setVisible(false);
          }else{
            this.getView().byId("redelegation").setVisible(true);
          }
                  
          //added by beena on 13-03-2023 
        }else{
          if (oData.Status === "S" || oData.Status === "R"){
                oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
                oModelSSUDigitization.setProperty("/SSURequest", false);
//                Additional changes for genpact user to visible submit button after rejection
//                if(oData.Nav_Wf.length >= 1){
//                  if(oData.Nav_Wf[0].Action == "R"){
//                      oModelSSUDigitization.setProperty("/BEValidation", true);
//                    }
//                }
              }else if(oData.Status === "IC"){
                oModelSSUDigitization.setProperty("/PostToSAP", true);
                oModelSSUDigitization.setProperty("/SSURequest", false);
              }
        }
      }else{
        this.getView().byId("redelegation").setVisible(false);
        this.getView().byId("id_upc1").setEnableDelete(false);
        this.getView().byId("id_upc2").setEnableDelete(false);
        if (oData.Status === "AS" || oData.Status === "AJ"){
            oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
            oModelSSUDigitization.setProperty("/SSURequest", false);
            oModelSSUDigitization.setProperty("/EditableFlag", false);
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
//      oController._getAmentmendService();
//      if (oData.Status === "S" || oData.Status === "R")
//        oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
//      else if(oData.Status === "IC"){
//        oModelSSUDigitization.setProperty("/PostToSAP", true);
//      }
//      else if(oData.Status === "NR")
//        oModelSSUDigitization.setProperty("/NonSSURequest", true);

      if (oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X"  ||
         oModelSSUDigitization.getProperty("/PartSettlementTracker") == "Y") {
        oModelSSUDigitization.setProperty("/DisplayOnlyFlag", true);
        oModelSSUDigitization.setProperty("/NonSSURequest", false);
        oModelSSUDigitization.setProperty("/PostToSAP", false);
        oModelSSUDigitization.setProperty("/SSURequest", false);
      }


      if(oData.Initiator != oData.Createdby)
        oModelSSUDigitization.setProperty("/InitiatedBySSU", false);
      oModelSSUDigitization.refresh();

      oModelSSUDigitization.setProperty("/PaperDataSet", oData);
      oModelSSUDigitization.refresh();
      oController._getAmentmendService();

      oController._getWorkFlow();
      if(oData.Initiator == vCurrentUser && oData.AssociateFlag === "X"){
        if(oData.AssociatePrev == oData.Associate && oData.Nav_Wf.length !== 0){
          if(oController.getView().byId("id_status").getNumber() === "Pending" || 
                 oController.getView().byId("id_status").getNumber() === "Post to SAP"
                 ){
                this.getView().byId("redelegation").setVisible(false);
                this.getView().byId("id_InputAssociate").setEditable(true);// ADD AGAWSA-CONT-SF1K920445
              }
                else if(oController.getView().byId("id_status").getNumber() === "Rejected" ||
                    oController.getView().byId("id_status").getNumber() === "Draft"){
                  this.getView().byId("redelegation").setVisible(true);
                this.getView().byId("id_InputAssociate").setEditable(true);// ADD AGAWSA-CONT-SF1K920445
                }else if(oController.getView().byId("id_status").getNumber() === "Request"){
                  this.getView().byId("redelegation").setVisible(false);
                this.getView().byId("id_InputAssociate").setEditable(false);// ADD AGAWSA-CONT-SF1K920445
                }
          if(oData.Status == "A1" || oData.Status == "A2" || oData.Status == "A3" || 
              oData.Status == "A4" || oData.Status == "A5" || oData.Status == "A6" 
                || oData.Status == "A7" || oData.Status == "A8" || oData.Status == "C"){
            this.getView().byId("id_InputAssociate").setEditable(false);// ADD AGAWSA-CONT-SF1K920445
          }
        }else{
          if(oController.getView().byId("id_status").getNumber() === "Draft" || oController.getView().byId("id_status").getNumber() === "Pending" || 
                 oController.getView().byId("id_status").getNumber() === "Post to SAP" ||
                 oController.getView().byId("id_status").getNumber() === "Rejected"){
                this.getView().byId("redelegation").setVisible(false);
                this.getView().byId("id_InputAssociate").setEditable(true);// ADD AGAWSA-CONT-SF1K920445
              }
        }
        
      }
      else{
        this.getView().byId("id_InputAssociate").setEditable(false); // ADD AGAWSA-CONT-SF1K920445
      }
      // oController._validationDataFilled();
    },
    
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
//      Add start by AGAWSA-CONT WF sprint 3
      onPaperTypeChange: function(oEvt){
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization"); 
        var vPaperType = oEvt.mParameters.newValue;
        if(vPaperType == "Decreasing"){
          oModelSSUDigitization.setProperty("/PaperDataSet/Sign","NEG");
        }else{
          oModelSSUDigitization.setProperty("/PaperDataSet/Sign","POS");
        }
      },
   
      
//    added by beena-50002903 for sprint 3 on 30-06-2023
    //============== Method to call plant and Model ============
    _getModelPlant: function (vSelectedSectors) {
      if (vSelectedSectors && vSelectedSectors.length > 0) {
        var vFilters = [];
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        oModelSSUDigitization.setProperty("/PaperDataSet/Sector", vSelectedSectors)

        $.each(vSelectedSectors, function (index, key) {
          vFilters.push(new sap.ui.model.Filter("SectorCode", sap.ui.model.FilterOperator.EQ, key));
        });
        busyDialog.open();

        oDataAmendmentModel.read("/ES_Model", {
          filters: vFilters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4Model", oData.results);
            // oModelSSUDigitization.refresh();
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
            // oModelSSUDigitization.refresh();
            busyDialog.close();
          },
          error: function (oResponse) {
            serviceError(oResponse)
          }
        });
      }
    },
    _getWorkFlow: function(){
//      new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oModel.getProperty("/UserId")),
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var vTermsType = oPaperData.TermsType;
      var vPriceChange = oPaperData.PriceChange;
      var vPaperType = oPaperData.Sign;
      if(vTermsType == "01" && vPriceChange == "Y" && vPaperType == ""){
        var vSign = "POS";
      }else if(vTermsType == "01" && vPriceChange == "Y" && vPaperType == "POS"){
        var vSign = "POS";
      }else if(vTermsType == "01" && vPriceChange == "Y" && vPaperType == "NEG"){
        var vSign = "NEG";
      }else if(vTermsType == "01" && vPriceChange == "N" && vPaperType == ""){
        var vSign = "NEG";
      }else if(vTermsType == "01" && vPriceChange == "N" && vPaperType == "POS"){
        var vSign = "NEG";
      }else if(vTermsType == "01" && vPriceChange == "N" && vPaperType == "NEG"){
        var vSign = "POS";
      }else if(vTermsType == "02" && vPriceChange == "Y" && vPaperType == ""){
        var vSign = "POS";
      }else if(vTermsType == "02" && vPriceChange == "Y" && vPaperType == "POS"){
        var vSign = "POS";
      }else if(vTermsType == "02" && vPriceChange == "Y" && vPaperType == "NEG"){
        var vSign = "NEG";
      }else if(vTermsType == "02" && vPriceChange == "N" && vPaperType == ""){
        var vSign = "NEG";
      }else if(vTermsType == "02" && vPriceChange == "N" && vPaperType == "POS"){
        var vSign = "NEG";
      }else if(vTermsType == "02" && vPriceChange == "N" && vPaperType == "NEG"){
        var vSign = "POS";
      }
      var vPaperCode = oPaperData.PaperCode;
      var vInitiator = oPaperData.Initiator;
      var vPaperPurps = vTermsType === "01" ? 1 : 2;
    if(vSign && vPaperCode && vInitiator){
        var vFilters = [
          new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode),
          new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, vSign),
          new sap.ui.model.Filter("PaperPur", sap.ui.model.FilterOperator.EQ, vPaperPurps),
          new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oPaperData.Initiator),
          new sap.ui.model.Filter("AssociateFlag", sap.ui.model.FilterOperator.EQ, oPaperData.AssociateFlag)
          
        ];
        oDataAmendmentModel.read("/ES_Approver", {
          filters: vFilters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4Approver", oData.results);
            oModelSSUDigitization.refresh();
//            var vCycle = oModelSSUDigitization.getProperty("/PaperDataSet/Cycle") || (oData.results.length>0 && oData.results[0].Cycle);
            var vCycle = (oData.results.length>0 && oData.results[0].Cycle) || oModelSSUDigitization.getProperty("/PaperDataSet/Cycle"); //added by beena-50002903 for sprint 3
            oController.formattInitiator(vCycle);
          },
          error: function (oResponse) {
            Message.error("Error loading approver.", {
              title: "Error"
            });
          }
        });
      }
    },
    //---------- Formatter Methods Start --------------------
    /*formattSignF4Amnd: function(vSign){
      if(vSign){
        var oAmndCode = sap.ui.getCore().byId("iDAmndCode");
        var vSignText = vSign === "+"? "POS" : "NEG";
        var vFilters = [
          new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, vSignText)
        ];
        oAmndCode.getBinding("items").filter(vFilters);
        return vSign+" VE";
      }

    },*/



    formatterTermsRadio: function (vValue){
      return vValue === "01" ? 0 : 1; //0 is Payterm 1 is Incoterm
    },
    formatterPriceRadio: function (vValue){
//      Add start by AGAWSA-CONT WF sprint 3
      if(vValue == "N"){
        this.getView().byId("id_papertype").setVisible(true);
      }else{
        this.getView().byId("id_papertype").setVisible(false);
      }
//      Add end by AGAWSA-CONT WF sprint 3
      return vValue === "Y" ? 0 : 1; //0 is yes 1 is No
    },
    // added by REDDRA-CONT 
    visibleExport: function(vEditable, vNav_Items, vNotCreateNew, vDisplayOnlyFlag){
      if(vNav_Items)
        return true;
      else
        return false;
    },

   

    formatterHeaderText: function(vPaperNumber, vSign){
      if(vPaperNumber&&vSign){
        return vSign =="POS" ? vPaperNumber +"(Increasing)": vPaperNumber+"(Decreasing)";
      }else{
        return vPaperNumber;
      }
    },

    editableRadioIncDec: function(vEditable, vNav_Items, vNotCreateNew){
      if(vEditable && !vNav_Items && !vNotCreateNew)
        return true;
      else
        return false;
    },

    formattGetModelPlant: function (vSector) {
      if (vSector) {
        vSector = typeof vSector == "string" ? vSector.split(",") : vSector;
        this._getModelPlant(vSector);
        return vSector;
      }
    },
    formattGetPaperType: function(vPaperType){
      var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if(vPaperType == "POS"){ 
        return "Increasing";
      }else{
        return "Decreasing";
      }
    },
//  visible attachments
//  added by REDDRA-CONT on 18-01-2022
    formattAttachments : function(vValue){
//    Start ADD By AGAWSA-CONT on 05-01-2023 user specific visibility
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
//    END ADD By AGAWSA-CONT on 05-01-2023 attachment visibility improvement
    },
    visiblePartEdit : function(vEditable, vSector, vModel,vSelfRouting) {
//      if (vEditable && vSector && vSector.length > 0 && vModel && vModel.length > 0) {
//        return true;
//      } else {
//        return false;
//      }
      var oController = this;
        var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var vAssociate = oModelSSUDigitization.oData.PaperDataSet.Associate;
        if(vCurrentUser == vAssociate){
          return vEditable && vSector && vModel  ? true : false;
        }
        else{
          return vEditable && vSelfRouting && vSector && vModel  ? true : false;
        }
    },

    formattValidationError: function (vValue) {
      if (typeof vValue == "string") {
        return vValue != "" ? "Error" : "None";
      }
    },

    formatterPartEdit: function (vEditable, vPlant, vDBExist) {
      return vEditable && (vPlant != "" ? true : false) && !vDBExist;
    },

    formatterVendorEdit: function (vEditable, vPlant, vPartNo) {
      return vEditable && (vPlant != "" ? true : false) && (vPartNo != "" ? true : false);
    },

    attachEditable: function(vEditable,vNotCreateNew){
      return vEditable && vNotCreateNew;
    },

    PostToSapFieldEditable: function(vEditable, vPostToSAP){
      return vEditable || vPostToSAP ? true : false;
    },


    //--------- Event Methods Start -------------------------

    onSectorFinish: function (oEvent) {
      this._getModelPlant(oEvent.getSource().getSelectedKeys());
    },
    onEdit: function () {
      var oController = this;
      oController._fnLockUnlockService("X");
//      oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", true);
//      oController.getView().getModel("ModelSSUDigitization").setProperty("/BEValidation", false);
    },

    //-------------------- Export Mass Upload File -------------------
    onMassUpload : function(oEvent){
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

    //====== Download excelSheet ========= 
    onDownldTempPartDet: function () {
      //insted of paper number pass paper code, that will get mass template
      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var vTermsType = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/TermsType");
//      var vFlag = vTermsType === 0 ? "01" : "02";
      var sServiceUrl = oController.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
//      window.open(sServiceUrl+"/ES_AmendPDF(PaperNo='"+vPaperCode+"',TermsType='"+vTermsType+"')/$value");
            // Added by REDDRA-CONT on 18-12-2021
      window.open(sServiceUrl+"/ES_Template_TermType(PaperCode='"+vPaperCode+"',TermsType='"+vTermsType+"')/$value");
    },


//    _fnMassDataSet : function(vExcelDataArray){
//      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
//      var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
//      var oFilter;
//      $.each(vExcelDataArray, function (MainIndex, row) {
//        oFilter = $.grep(oMassData, function (grepRow) {
//          return ((row.Plant === grepRow.Plant) && (row.Vendor_Code === grepRow.Vendor) && (row.Part_Number === grepRow.PartNo) && (row.Doc_Type === grepRow.Pinforcat));
//        });
//        if (oFilter.length <= 0) {
//          var vValidFrom = row.Valid_From_Date || "";
//
//          var oItemData = getItemDetailsObjectCIT();
//          oItemData.Plant = row.Plant || "";
//          oItemData.Vendor = row.Vendor_Code || "";
//          oItemData.PartNo = row.Part_Number || "";
//          oItemData.SettledPrice = row.Amount || "0";
//          oItemData.SettledPrice = oPaperData.PriceChange === "Y" ? row.Amount : "0";
//          oItemData.ValidFrom = new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null;
//          oItemData.Amndcode = row.Amendment_Code || "";
//          oItemData.Pinforcat = row.Doc_Type || "";
//          oItemData.NewPayTerm = row.New_Payment_Term || "";
//          oItemData.NewIncoTerm = row.New_Incoterm || "";
//          oItemData.Remarks = row.Remarks || "";
//          oMassData.push(oItemData);
//
//          oMassData.push({
//            "Plant": row.Plant || "",
//            "Vendor": row.Vendor_Code || "",
//            "VName": "",
//            "VLocation": "",
//            "PartNo": row.Part_Number || "",
//            "PartDesc": "",
//            "Currency": "",
//            "PirNo": "",
//            "ExtPrice": "",
//            "SettledPrice": row.Settled_Price || "0",
//            "ChgPrctng": "",
//            "ValidFrom": new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null,
//            "Amndcode": row.Price_Change_Code || "",
//            "AmndcodeDesc": "",
//            "Sign": "",
//            "Taxonomy": "",
//            "Pinforcat": "",
//            "Purorg": "",
//            "NetWtUniit": row.Net_Weight || "KG",
//            "Remarks": row.Remarks || ""
//          });
//
//          var index = oMassData.length - 1;
//          oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);
//
//        }
//
//      });
//      oController._validationMass(oMassData);
//      oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);
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
        var vVendor = row.Vendor_Code || "";
        var vPartNo = row.Part_Number || "";
        var vPinforcat = row.Doc_Type || "";
        var vSettledPrice = row.Amount || "0";
        var vAmndcode = row.Amendment_Code || "";
        var vNewPayTerm = row.New_Payment_Term || "";
        var vNewIncoTerm = row.New_Inco_Term || "";
        var vRemarks = row.Remarks || "";
        if (oFilter.length <= 0) {
          var oItemData = getItemDetailsObjectCIT();
          oItemData.Plant = vPlant;
          oItemData.Vendor = vVendor;
          oItemData.PartNo = vPartNo;
          oItemData.Pinforcat = vPinforcat;
          oItemData.SettledPrice = vSettledPrice;
          oItemData.ValidFrom = vValidFrom
          oItemData.Amndcode = vAmndcode;
          oItemData.NewPayTerm = vNewPayTerm;
          oItemData.NewIncoTerm = vNewIncoTerm;
          oItemData.Remarks = vRemarks;
          oMassData.unshift(oItemData);
        }else{
          var existingIndex = oMassData.indexOf(oFilter[0]);
          oMassData[existingIndex].Plant = vPlant;
          oMassData[existingIndex].Vendor = vVendor;
          oMassData[existingIndex].PartNo = vPartNo;
          oMassData[existingIndex].Pinforcat = vPinforcat;
          oMassData[existingIndex].SettledPrice = vSettledPrice;
          oMassData[existingIndex].ValidFrom = vValidFrom;
          oMassData[existingIndex].Amndcode = vAmndcode;
          oMassData[existingIndex].NewPayTerm = vNewPayTerm;
          oMassData[existingIndex].NewIncoTerm = vNewIncoTerm;
          oMassData[existingIndex].Remarks = vRemarks;
        }


          /*var oItemData = getItemDetailsObjectRM();
          oItemData.Plant = row.Plant || "";
          oItemData.Vendor = row.Vendor_Code || "";
          oItemData.PartNo = row.Part_Number || "";
          oItemData.Pinforcat = row.Doc_Type || "";
          oItemData.SettledPrice = row.Amount || "0";
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
            icon: "{ModelDefaultDataSet>/Icon/editIcon}",
            tooltip: "Edit",
            visible: "{ModelSSUDigitization>/EditableFlag}",
            type: "{ModelSSUDigitization>uiFields/Error}",
            press: function (oEvent) {
              // oController.getView().getModel("ModelSSUDigitization").setProperty("/isAddNew", false);
              /*var oItemFrag = xmlFragment(oController, "ItemCIT");
              oItemFrag.setModel(oController._setEditFragmentModel(oEvent));
              oItemFrag.open();*/
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
//                Add End by AGAWAS-CONT on 01.07.2023
              var oItemFrag = xmlFragment(oController, "ItemCIT");
              var oParentModel = oController._setEditFragmentModel(oEvent);
              oItemFrag.setModel(oParentModel);
              oController._getVendor(oParentModel,oParentModel.getProperty("/Vendor"));
              oController._getTermUpdate();
              oItemFrag.open();


                 //added by beena for stop scrolling in input on 29-02-2024
              var oInputSettled = sap.ui.getCore().byId("id_settled_price");
              oInputSettled.attachBrowserEvent("mousewheel", function(oEvent) {
                    oEvent.preventDefault();
              });


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
//                Add End by AGAWAS-CONT on 01.07.2023
              var oItemFrag = xmlFragment(oController, "ItemCIT");
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
              var oItemFrag = xmlFragment(oController, "ItemCIT");
              sap.ui.getCore().byId("id_settled_price").setEditable(false); // Added by AGAWSA-CONT on 31-01-2023
              oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
              oController._getTermUpdate();
              oItemFrag.open();
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
                    /*debugger;
                    $.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"),function(i,Row){
                      if(Row.PartNo==oDeletedData.PartNo)
                        Row.Delete="X";
                    });*/
                    oDeletedData.Delete = "X";
                    var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedItems") ? oModelSSUDigitization.getProperty(
                      "/PaperDataSet/DeletedItems") : [];
                    oDeletedItems.push(oDeletedData);
                    oModelSSUDigitization.setProperty("/PaperDataSet/DeletedItems", oDeletedItems);
                    var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
                    oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
                    oModelSSUDigitization.refresh();
                  }
                }
              });

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
          })
        ]
      });
      createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
    },
    // Start Add AGAWSA-CONT 10-12-2022 SF1K919228
    _getTermUpdate: function(oEvent){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vTermsType = oModelSSUDigitization.oData.PaperDataSet.TermsType;
      var vStatus = oModelSSUDigitization.oData.PaperDataSet.Status;
      if(vTermsType == 01){
        if(vStatus == "C"){
          sap.ui.getCore().byId("id_payterm").setText("Old Payment Terms");
        }
      }
      else{
        if(vStatus == "C"){
          sap.ui.getCore().byId("id_incoterm").setText("Old Inco Terms");
        }
      }
    },
// End Add AGAWSA-CONT 10-12-2022
//    Edit button in item table
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
    _fnDataSettingValidation: function (vSelectedPathVali) {
      if (vSelectedPathVali.search("PaperDataSet") >= 0) {
        vSelectedPathVali = vSelectedPathVali.replace("PaperDataSet", "Validation");
      }
      if (vSelectedPathVali.search("Nav_Items") >= 0) {
        vSelectedPathVali = vSelectedPathVali.replace("Nav_Items", "Nav_ItemsX");
      }
//      if (vSelectedPathVali.search("Nav_Forex") >= 0) {
//        vSelectedPathVali = vSelectedPathVali.replace("Nav_Forex", "Nav_ForexX");
//      }
//      if (vSelectedPathVali.search("Nav_RM") >= 0) {
//        vSelectedPathVali = vSelectedPathVali.replace("Nav_RM", "Nav_RMX");
//      }
      return vSelectedPathVali;
    },
    _setDisplayFragmentModel: function (oEvent) {
      var oController = this;
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      return new JSONModel(oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath));
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
        new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSectedData.Vendor),
        new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
      ];
      oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
      oAttachFrag.open();

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

//    on Setting Botton
    onSettingPartDetails: function () {
      var oController = this;
      var vColumnListPath = "ModelSSUDigitization>/PartDet";
      columnsSetting(oController, vColumnListPath);
    },

//    error popup on item fragment
    onErrMsgValueHelp:function(e){
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ErrorMsgPopOver");
      oValueHelp.toggle(e.getSource());

      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
//      var val = selectedPath.split("/")[3];
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
//      Added start by AGAWSA-CONT on 05.02.2024 -- unprocess data in zzamend table check
        if(ErrorData.Messg != ""){
          oValidationError.push({"BEError" :ErrorData.Messg});
        }
//      Added end by AGAWSA-CONT on 05.02.2024
      }

      oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
    },

//    Adding Item in M table 
    onAddCITItem: function () {
      var oController = this;
      var oItemFrag = xmlFragment(oController, "ItemCIT");
      // oItemFrag.getButtons()[0].setVisible(true);
      var oModel = new JSONModel(getItemDetailsObjectCIT());
      oItemFrag.setModel(oModel);
      oItemFrag.isAddNew = true;
      // oController.getView().getModel("ModelSSUDigitization").setProperty("/isAddNew", true);
      oItemFrag.open();
    },
//     Material Search help 
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
//    Submitting Material No
    onSubmitPartNum: function (oEvent) {

      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var plant = oParentModel.getProperty("/Plant");
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Part", {
          filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
            .FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
          success: function (oData, oResponse) {
            busyDialog.close();
            if (oData.results.length > 0 && oData.results[0].Message == "") {
              oParentModel.setProperty("/PartNo", oData.results[0].PartNo);
              oParentModel.setProperty("/PartDesc", oData.results[0].PartDesc);
//              oParentModel.setProperty("/Taxonomy", oData.results[0].Taxonomy);
//              oParentModel.setProperty("/NetWtUniit", oData.results[0].NetWtUnit);
            } else {
              if(oData.results[0] && oData.results[0].Message != "")
                Message.error(oData.results[0].Message, { title: "Error" });
//              sap.m.MessageToast.show(vSelectedValue + " is not extended for " + plant + " plant.");
              oParentModel.setProperty("/PartNo", "");
              oParentModel.setProperty("/PartDesc", "");
//              oParentModel.setProperty("/Taxonomy", "");
//              oParentModel.setProperty("/NetWtUniit", "");
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
//        oParentModel.setProperty("/Taxonomy", "");
//        oParentModel.setProperty("/NetWtUniit", "");
      }

    },
//    Open Vendor Search help
    onVendorValHelp: function (e) {
      var oController = this;
      var oVendor = parentXmlFragment(oController, "ValueHelp");
      oVendor.setTitle("Vendor Search");
      var template = new sap.m.StandardListItem({
        title: "{VendName}",
        description: "{VendCode}",
        info: "{VendLoc}"
      });
      oVendor.bindAggregation("items", "/", template);
      oVendor.setModel(new JSONModel());
      oVendor.parentModel = e.getSource().getBindingContext().getModel();
      oVendor.open();
    },
    onSubmitVendorCode: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      oController._getVendor(oParentModel,vSelectedValue);
    },
//      Sunmit Vendor 
    _getVendor: function (oParentModel,vSelectedValue){
      var oController = this;
//      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
    /*onSubmitVendorCode: function (oEvent) {
//      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");*/
      var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
      var filters = [];
      var vVendName = "";
      var vVendCode = "";
      var vVendLoc = "";
      var vCurrCode = "";
      var vExtPrice = "";
      var vPirNo = "";
      var vPurorg = "";
      var vExtValidFrom = null;
      var vImportFlag = oParentModel.getProperty("/ImportFlag");
      var vPinforcat = "";
      var vPinfoCatText = "";
      var vPaymentTerms = "";
      var vPaymentTermsDesc="";
      var vIncoTerm = "";
      var vIncoTermDesc="";
      var vDiscountCond = "";
//      var vTaxonomy = "";
      // var vDelTerms = "";
      // var vPaymntTerms = "";
//      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")));
        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")));
        filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, ""));
        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Vendor", {
          filters: filters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4PinfoCategory", oData.results);
            if (oData.results.length > 0 && oData.results[0].Message == "") {

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
              vPaymentTerms = oData.results[0].PaymentTerms;
              vPaymentTermsDesc = oData.results[0].PaymentTermsDesc;
              vIncoTerm = oData.results[0].DeliveryTerms;
              vIncoTermDesc = oData.results[0].DeliveryTermsDesc
              vDiscountCond = oData.results[0].DiscountCond;




//              oController.fnTermsItem(oParentModel,vVendCode,vPurorg);    // Added by Agnivesh
//              vTaxonomy = oData.results[0].Taxonomy;
              busyDialog.close();
              oDataAmendmentModel.read("/ES_PInfoRecord?$filter=(Vendor='"+vVendCode+"' and Plant='"+oParentModel.getProperty("/Plant")+"' and PartNo='"+oParentModel.getProperty("/PartNo")+"')", {
                success: function (oData, oResponse) {
                  busyDialog.close();
                  oModelSSUDigitization.setProperty("/F4InfoCategory",oData.results);
//                  vDelTerms = oData.DeliveryTerms;
//                  vPaymntTerms = oData.PaymentTerms;
//                  oParentModel.setProperty("/DelTerms", vDelTerms);
//                  oParentModel.setProperty("/PaymntTerms", vPaymntTerms);
                },
                error: function (oResponse) {
                  serviceError(oResponse);
                }
              });
            } else {
              busyDialog.close();
              if(oData.results[0] && oData.results[0].Message != "")
                Message.error(oData.results[0].Message, { title: "Error" });
//              sap.m.MessageToast.show(vSelectedValue + " is not extended for " + oParentModel.getProperty("/Plant") + " plant.");
            }
            oParentModel.setProperty("/VName", vVendName);
            oParentModel.setProperty("/Vendor", vVendCode);
            oParentModel.setProperty("/VLocation", vVendLoc);
            oParentModel.setProperty("/Currency", vCurrCode);
//            oParentModel.setProperty("/ExtPrice", vExtPrice);
            oParentModel.setProperty("/PirNo", vPirNo);
            oParentModel.setProperty("/ExtValidFrom", vExtValidFrom);
            oParentModel.setProperty("/ImportFlag", vImportFlag);
            oParentModel.setProperty("/Purorg", vPurorg);
//            oParentModel.setProperty("/Pinforcat", vPinforcat);
            oParentModel.setProperty("/CurrentTerm",vPaymentTerms);
            oParentModel.setProperty("/CurrentTermDec",vPaymentTermsDesc);
            oParentModel.setProperty("/IncoTerm",vIncoTerm);
            oParentModel.setProperty("/IncoTermDesc",vIncoTermDesc);
            oParentModel.setProperty("/DiscountCond", vDiscountCond);
            if(oParentModel.getProperty("/Pinforcat") == ""){
              oParentModel.setProperty("/Pinforcat", vPinforcat);
              oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
              oParentModel.setProperty("/ExtPrice", vExtPrice);
            }

//            oParentModel.setProperty("/CurrentTerm",oData.results[0].CurrentTerm);

//            oParentModel.setProperty("/IncoTerm",oData.results[0].IncoTerm);
//            oParentModel.setProperty("/Taxonomy", vTaxonomy);
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
        oParentModel.setProperty("/PirNo", vPirNo);
        oParentModel.setProperty("/Purorg", vPurorg);
        oParentModel.setProperty("/Pinforcat", vPinforcat);
        oParentModel.setProperty("/PinfoCatText", vPinfoCatText);
        oParentModel.setProperty("/CurrentTerm",vPaymentTerms);
        oParentModel.setProperty("/CurrentTermDec",vPaymentTermsDesc);
        oParentModel.setProperty("/IncoTerm",vIncoTerm);
        oParentModel.setProperty("/IncoTermDesc",vIncoTermDesc);
        oParentModel.setProperty("/DiscountCond", vDiscountCond);
        oParentModel.setProperty("/ExtValidFrom", vExtValidFrom);
        oParentModel.setProperty("/ImportFlag", vImportFlag);

//        oParentModel.setProperty("/Taxonomy", vTaxonomy);
        // oParentModel.setProperty("/DelTerms", vDelTerms);
        // oParentModel.setProperty("/PaymntTerms", vPaymntTerms);
      }

    },
//    Value Help Function to open New Payment Term Fragment
    onNPayTermValHelp : function(oEvent){
      debugger
      var filters = [];
      var aPayTermArr = [];
      var oParentModel=oEvent.getSource().getBindingContext().getModel().getData();
      var oModelSSUDigitization=this.getView().getModel("ModelSSUDigitization");
      var selFlag = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/TermsType");
//      var vFlag    = selFlag === 0 ? "1" : "2";
      if(oParentModel !== ""){
        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ,oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode")));
        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.Plant));
        filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.Vendor));
        filters.push(new sap.ui.model.Filter("TermsType", sap.ui.model.FilterOperator.EQ, selFlag));
//        filters.push(new sap.ui.model.Filter("Pinforcat", sap.ui.model.FilterOperator.EQ, oParentModel.Pinforcat));
//        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.PartNo));
//        filters.push(new sap.ui.model.Filter("Purorg", sap.ui.model.FilterOperator.EQ, oParentModel.Purorg));

        busyDialog.open();

        var oNewTermVH = parentXmlFragment(oController, "ValueHelp");
        oNewTermVH.setTitle("New Payterm");
        var template = new sap.m.StandardListItem({
          title: "{oModelSSUDigitization>NewPayTerm}",
          description: "{oModelSSUDigitization>NewPayTermDesc}"
        });

        oNewTermVH.setModel(oModelSSUDigitization,"oModelSSUDigitization");
        oNewTermVH.parentModel = oEvent.getSource().getBindingContext().getModel();


        oDataAmendmentModel.read("/ES_Terms", {
          filters: filters,
          success: function (oData, oResponse) {
            debugger;
            if (oData.results.length > 0) {
              oModelSSUDigitization.setProperty("/F4PaymentTerm",oData.results);
              oNewTermVH.bindAggregation("items", "oModelSSUDigitization>/F4PaymentTerm", template);
              oNewTermVH.open();
              busyDialog.close();
            } else {
              sap.m.MessageToast.show("No Payment term exist");
              busyDialog.close();
            }
          },
          error: function (oResponse) {
            debugger;
            busyDialog.close();
            serviceError(oResponse);
          }
        });
      }

    },
//    Value Help Function to open New Inco Term Fragment
    onNIncoTermValHelp : function(oEvent){
      debugger
      var filters = [];
      var aPayTermArr = [];
      var oParentModel=oEvent.getSource().getBindingContext().getModel().getData();
      var oModelSSUDigitization=this.getView().getModel("ModelSSUDigitization");
      var selFlag = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/TermsType");
//      var vFlag    = selFlag === 0 ? "1" : "2";
      if(oParentModel !== ""){
        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ,oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode")));
        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.Plant));
        filters.push(new sap.ui.model.Filter("Pinforcat", sap.ui.model.FilterOperator.EQ, oParentModel.Pinforcat));
        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.PartNo));
        filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.Vendor));
        filters.push(new sap.ui.model.Filter("Purorg", sap.ui.model.FilterOperator.EQ, oParentModel.Purorg));
        filters.push(new sap.ui.model.Filter("TermsType", sap.ui.model.FilterOperator.EQ, selFlag));

        busyDialog.open();

        var oNewTermVH = parentXmlFragment(oController, "ValueHelp");
        oNewTermVH.setTitle("New Incoterm");
        var template = new sap.m.StandardListItem({
          title: "{oModelSSUDigitization>NewIncoTerm}",
          description: "{oModelSSUDigitization>NewIncoTermDesc}"
        });

        oNewTermVH.setModel(oModelSSUDigitization,"oModelSSUDigitization");
        oNewTermVH.parentModel = oEvent.getSource().getBindingContext().getModel();


        oDataAmendmentModel.read("/ES_Terms", {
          filters: filters,
          success: function (oData, oResponse) {
            debugger;
            if (oData.results.length > 0) {
              oModelSSUDigitization.setProperty("/F4PaymentTerm",oData.results);
              oNewTermVH.bindAggregation("items", "oModelSSUDigitization>/F4PaymentTerm", template);
              oNewTermVH.open();
              busyDialog.close();
            } else {
              sap.m.MessageToast.show("No Inco term exist")
              busyDialog.close();
            }
          },
          error: function (oResponse) {
            debugger;
            busyDialog.close();
            serviceError(oResponse);
          }
        });
      }
    },
//    Item to be fetch for Payment and Inco terms
//    fnTermsItem : function(oParentModel,vVendCode,vPurorg){
//      var filters = [];
//      var aPayTermArr = [];
//      var oParentModel= oParentModel;
//      var oModelSSUDigitization=this.getView().getModel("ModelSSUDigitization");
//      var selFlag = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/TermsType");
//      var vFlag    = selFlag === 0 ? "1" : "2";
//      if (vVendCode.length > 0) {
//        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ,oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode")));
//        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")));
//        filters.push(new sap.ui.model.Filter("Pinforcat", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Pinforcat")));
//        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")));
//        filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vVendCode));
//        filters.push(new sap.ui.model.Filter("Purorg", sap.ui.model.FilterOperator.EQ, vPurorg));
//        filters.push(new sap.ui.model.Filter("TermsType", sap.ui.model.FilterOperator.EQ, vFlag));
////        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
//        busyDialog.open();
//
//        oDataAmendmentModel.read("/ES_Terms", {
//          filters: filters,
////          urlParameters : {
////            $filter : "Plant eq '"+oParentModel.getProperty("/Plant")+"' and PartNo eq '"+oParentModel.getProperty("/PartNo")+"' and Vendor eq '"+vVendCode+"' and Purorg eq '"+vPurorg+"' and TermsType eq '"+vFlag+"'"
////          },
//          success: function (oData, oResponse) {
//            debugger;
//            if (oData.results.length > 0) {
////              oParentModel.setProperty("/CurrentTerm",oData.results[0].CurrentTerm);
////              oParentModel.setProperty("/IncoTerm",oData.results[0].IncoTerm);
//              oModelSSUDigitization.setProperty("/F4PaymentTerm",oData.results);
//              busyDialog.close();
//            } else {
//
//              busyDialog.close();
////              sap.m.MessageToast.show(vVendCode + " is not extended for " + oParentModel.getProperty("/Plant") + " plant.");
//            }
//          },
//          error: function (oResponse) {
//            debugger;
//            busyDialog.close();
//            serviceError(oResponse);
//          }
//        });
//      }
//    },

//    Settled price live change
    onSettledSub: function (oEvent) {
      var oController = this;
      var vNewValue = oEvent.getParameter("newValue");
      var vNewValueArray = vNewValue.split(".");
      if (vNewValueArray[0].length > 9 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 13) {
        vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 9) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0,
          9);
        oEvent.getSource().setValue(vNewValue);
      } else {
        oEvent.getSource().setValue(vNewValue);
      }
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
//      var vChangePercnd = (vSign/Number(oParentModel.getProperty("/ExtPrice"))
      var vExtPrice = oParentModel.getProperty("/ExtPrice");
      var vSign =  Number(vNewValue) - Number(vExtPrice);
      var vChangePercnd = vSign/vExtPrice*100;

      vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
//      oParentModel.setProperty("/ChgPrctng",vChangePercnd.toFixed(2));
      oParentModel.setProperty("/ChgPrctng",Math.abs(vChangePercnd).toFixed(2));
//      oParentModel.setProperty("/Sign",vSign>=0?"+":"-");
  },
//  Submit on Settle price
  _getAmentmendService : function(oEvent){
//    debugger;
//    var oParentModel = oEvent.getSource().getBindingContext().getModel();
//    var vNewValue = oEvent.getSource().getValue()
        var oController = this;
        var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
    var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
    var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
    var vTermsType = oModelSSUDigitization.getProperty("/PaperDataSet/TermsType");
//    vTermsType = vTermsType == 0 ? "01" : "02";
//    var vExtPrice = oParentModel.getProperty("/ExtPrice");
//    var vSign =  Number(vNewValue) - Number(vExtPrice)>=0?"+":"-";
//    vSign = vSign == "+" ? "POS":"NEG";
    var filters = [
      new sap.ui.model.Filter("TermsType", sap.ui.model.FilterOperator.EQ, vTermsType),
      new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode)
    ];
    oDataAmendmentModel.read("/ES_F4Amandment", {
      filters: filters,
      success: function (oData, oResponse) {
        oModelSSUDigitization.setProperty("/F4Amentment", oData.results);
//        oModelSSUDigitization.setProperty("/PaperDataSet/Sign",oData.results[0].Sign);
        oModelSSUDigitization.refresh();
      },
      error: function (oResponse) {
        Message.error("Error loading Amendment.", {
          title: "Error"
        });
      }
    });
  },
//  calling this method when Terms Type is changed
  onSelectTermsType : function(oEvent){
    debugger;
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var vTermsType =oEvent.getParameter("selectedIndex") ==  0 ? "01" : "02"; //0 is Increase 1 is Decrease;
    oModelSSUDigitization.setProperty("/PaperDataSet/TermsType",vTermsType);

    var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
//    var vTermsType = oModelSSUDigitization.getProperty("/PaperDataSet/TermsType");
//    vTermsType = vTermsType == 0 ? "01" : "02";

    var filters = [
      new sap.ui.model.Filter("TermsType", sap.ui.model.FilterOperator.EQ, vTermsType),
      new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)
    ];
    oDataAmendmentModel.read("/ES_F4Amandment", {
      filters: filters,
      success: function (oData, oResponse) {
        oModelSSUDigitization.setProperty("/F4Amentment", oData.results);
        oModelSSUDigitization.setProperty("/PaperDataSet/Sign",oData.results[0].Sign);
        oModelSSUDigitization.refresh();
      },
      error: function (oResponse) {
        Message.error("Error loading Amendment.", {
          title: "Error"
        });
      }
    });
  },
//  calling this method when Price is changed
  onSelectPriceChange : function(oEvent){
    debugger;
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var vPriceChange =oEvent.getParameter("selectedIndex") ==  0 ? "Y" : "N"; //0 is Increase 1 is Decrease;
    oModelSSUDigitization.setProperty("/PaperDataSet/PriceChange",vPriceChange);
  },

//    Search inside value help
  handleSearch: function (e) {
    var vSelectedValue = e.getParameter("value").toUpperCase();
    var filters = [];
    var valueHelp = e.getSource();
    var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
    var plant = e.getSource().parentModel.getProperty("/Plant");
    var PartNo = e.getSource().parentModel.getProperty("/PartNo");
//    var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
    if (e.getSource().getTitle() == "Vendor Search") {
      if (vSelectedValue.length > 4) {
        valueHelp.setBusy(true);
        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));
        filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X"));
//        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
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

//  Close Search help
  handleClose: function (e) {
    var oSelectedItem = e.getParameter("selectedItem");
    var oParentModel = e.getSource().parentModel;
    var oController = this;
    if (oSelectedItem) {
      if(e.getSource().getModel() !== undefined){
        var oSelectedData = e.getSource().getModel().getProperty(oSelectedItem.getBindingContextPath());
        if (e.getSource().getTitle() == "Part Number") {
          oParentModel.setProperty("/PartNo", oSelectedData.PartNo);
          oParentModel.setProperty("/PartDesc", oSelectedData.PartDesc);
  //        oParentModel.setProperty("/Taxonomy", oSelectedData.Taxonomy);
  //        oParentModel.setProperty("/NetWtUniit", oSelectedData.NetWtUnit);

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
  //        oParentModel.setProperty("/Taxonomy", oSelectedData.Taxonomy);
          /*  oController.getOwnerComponent().getModel("oDataAmendmentModel").read("/ES_Terms(VendCode='" + oSelectedData.VendCode +
              "',Plant='" +
              oParentModel.getProperty("/Plant") + "')", {
                success: function (oData, oResponse) {
                  oParentModel.setProperty("/DelTerms", oData.DeliveryTerms);
                  oParentModel.setProperty("/PaymntTerms", oData.PaymentTerms);
                },
                error: function (oResponse) {}
              });*/

        }
      }else{
        if (e.getSource().getTitle() == "New Payterm") {
          oParentModel.setProperty("/NewPayTerm",oSelectedItem.getTitle())
          oParentModel.setProperty("/NewPayTermDesc",oSelectedItem.getDescription())
        }
        if (e.getSource().getTitle() == "New Incoterm") {
          oParentModel.setProperty("/NewIncoTerm",oSelectedItem.getTitle())
          oParentModel.setProperty("/NewIncoTermDesc",oSelectedItem.getDescription())
        }
      }
    }
  },
//  Calling Amendement Service 
//  _getAmentmendService: function(){
//    var oController = this;
//    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//    var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
//    oPaperData.PaperCode = "CIT";
//    var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//
//    var vSign = oPaperData.Sign == "+" ? "POS":"NEG";
//    var filters = [
//      new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, vSign),
//      new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode)
//    ];
//    oDataAmendmentModel.read("/ES_F4Amandment", {
//      filters: filters,
//      success: function (oData, oResponse) {
//        oModelSSUDigitization.setProperty("/F4Amentment", oData.results);
//        oModelSSUDigitization.refresh();
//      },
//      error: function (oResponse) {
//        Message.error("Error loading Amendment.", {
//          title: "Error"
//        });
//      }
//    });
//  },
   onPinfoCat: function(oEvent){
      var oModel = oEvent.getSource().getModel();
      var vAdditionalText = oEvent.getSource().getSelectedItem().getAdditionalText();
      var oExtValidFrom = new Date(vAdditionalText.split("-")[1]);
      oModel.setProperty("/ExtPrice", vAdditionalText.split("-")[0]);
      oModel.setProperty("/ExtValidFrom", oExtValidFrom);
      oModel.setProperty("/SettledPrice", "0");
//      oModel.setProperty("/DeltaPrice", "0");
  },
//  Ammendment code drop down
  onAmentmendCode: function(oEvent){
    var oModel = oEvent.getSource().getModel();
    oModel.setProperty("/AmndcodeDesc", oEvent.getSource().getSelectedItem().getAdditionalText());
  },
//  PaymentTerm Select function in Pop up
//  onPaymentTermSelect : function(oEvent){
//    debugger;
//    var oModel = oEvent.getSource().getModel();
//    var PayTermDesc = oEvent.getParameter('selectedItem').getAdditionalText();
//    oModel.setProperty("/NewPayTermDesc",PayTermDesc);
//  },
//  PaymentTerm Select function in Pop up
  onIncoTermSelect:function(oEvent) {
    var oModel = oEvent.getSource().getModel();
    var IncoTermDesc = oEvent.getParameter('selectedItem').getAdditionalText();
    oModel.setProperty("/NewIncoTermDesc",IncoTermDesc);
  },
//-------------------------- Formatter -------------------

//  IncoTerm Visiblity Formatter based on Selected RadioButton
  visibleInco: function(vIncoValue){
    return vIncoValue == "01" ? false:true;
  },
//  Payterm Visiblity Formatter based on Selected RadioButton
  visiblePayTerm : function(vPaytermValue){
    return vPaytermValue == "02" ? false:true;
  },

//  Function for ok button in Add item Fragment
  onOkItemDetail: function (oEvent) {
    var oController = this;
    var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var oFragItem = oEvent.getSource().getParent();

    if (vAllFilled && oFragItem.isAddNew) { // oModelSSUDigitization.getProperty("/isAddNew")
      var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
      var vChangedData = oFragItem.getModel().getData();
      var oFilter = $.grep(oNav_Items, function (grepRow) {
        return ((vChangedData.Plant === grepRow.Plant) && (vChangedData.Vendor === grepRow.Vendor) && (vChangedData.PartNo === grepRow.PartNo));
      });
      if (oFilter.length <= 0) {
        oController._setDataAfterEditItem(oEvent);
        oEvent.getSource().getParent().close();
      }
      /*else if (oFilter.length <= 0) {
        var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
        var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
        var vMarkUp = oController._fnCalculationMarkUp(oItem);

        oController._setDataAfterEditItem(oEvent);
        oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
        oEvent.getSource().getParent().close();
      }*/
      else {
        sap.m.MessageToast.show("This Plant,Vendor,Part Number combination is already exist.");
      }
    } else if (vAllFilled) {

      var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
//      var vMarkUp = oController._fnCalculationMarkUp(oItem);

      oController._setDataAfterEditItem(oEvent);
//      oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
      oEvent.getSource().getParent().close();
    }
  },

//  To check mandatory field is not empty
  _fnRequredFieldCheck: function (oFields) {
    var oMandatoryFlag = true;
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
    return oMandatoryFlag;
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

//  On Save Method
  onSave: function () {
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    
    //added by beena-50002903 for sprint 3
    if (oController.getView().byId('id_model').getValue() == "" && oController.getView().byId('id_sector').getValue() == ""){
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
                oController._fnAfterGettingBEData(oPaperData);
              } else if (vMsgReturn.Title == "Sucess") {
                sap.m.MessageBox.success(vMsgReturn.Message, {
                  title: vMsgReturn.Title,
                  onClose: function () {
                    oModelSSUDigitization.setProperty("/NotCreateNew", true);
                    oModelSSUDigitization.setProperty("/EditableFlag", false);
                    oController._fnAfterGettingBEData(oData);
                    if(oData.SelfRoutingFlag == "" && oData.Nav_Wf.length == 0 ){
                      oModelSSUDigitization.setProperty("/BEValidation", true);
                    }
//                    var vValiDataField = oController._validationDataFilled();
//                    if(vValiDataField == true){
//                      oModelSSUDigitization.setProperty("/BEValidation", true); //added by beena-50002903 for sprint 3
//                    }
                  }
                });
              }else{
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
//    oPaperData.TermsType = oPaperData.TermsType == 0 ? "1":"2";
//    oPaperData.PriceChange = oPaperData.PriceChange == 0 ? "Y":"N";
//    oPaperData.Sign = ""
    oPaperData.Nav_Log = [];
    oPaperData.Nav_Wf = [];
    oPaperData.Nav_Ret = [];
    oPaperData.Nav_DMS = [];
    $.each(oPaperData.Nav_Items, function (i, Row) {
      // Row.YearBase = Row.YearBase.toString();
      /*var selDate = Row.ValidFrom;
      if(selDate){
        var vDate = selDate.getDate();
        if(vDate<10){
          vDate = "0"+vDate;
        }
        var vMonth = selDate.getMonth()+1;
        if(vMonth<10){
          vMonth = "0"+vMonth;
        }
        var vYear = selDate.getFullYear();
        var vChangedDate = vYear+"-"+vMonth+"-"+vDate+"T00:00:00";
        Row.ValidFrom = vChangedDate;
      }*/
      Row.ValidFrom = uiDateToBackend(Row.ValidFrom);
      delete Row.uiFields;
      delete Row.__metadata;
//      delete Row.PinfoCatText;
    });
    return oPaperData;
  },
//  ========= on Validation Button ===============================================================
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
  _validationMass: function (Nav_Items) {
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var vTermsType = oModelSSUDigitization.getProperty("/PaperDataSet/TermsType");
//    vTermsType = vTermsType == 0? "01":"02";
    var vPriceChange = oModelSSUDigitization.getProperty("/PaperDataSet/PriceChange");
//    vPriceChange = vPriceChange == 0? "Y":"N";
    var vSign = oModelSSUDigitization.getProperty("/PaperDataSet/Sign");
    var oValidation = {
      "PaperCode": oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode"),
      "Sector": oModelSSUDigitization.getProperty("/PaperDataSet/Sector").toString(),
      "TermsType" : vTermsType,
      "PriceChange": vPriceChange, 
      "Sign": vSign == 0 ? "POS":"NEG",
      "Nav_ItemsX": []
    };
    $.each(Nav_Items, function (item, Row) {
      Row.uiFields.ItemNo = item.toString();
      termVal = Row.NewPayTerm!==""?Row.NewPayTerm : Row.NewIncoTerm
      var oNavItem = {
        "ItemNo": item.toString(),
        "Plant": Row.Plant,
        "Vendor": Row.Vendor,
        "PartNo": Row.PartNo,
        "Amndcode": Row.Amndcode,
        "Pinforcat":Row.Pinforcat,
        "NewIncoTerm":Row.NewIncoTerm,
        "NewPayTerm":Row.NewPayTerm,
        "SettledPrice" :Row.SettledPrice,
        "ValidFrom" : uiDateToBackend(Row.ValidFrom)
//        "NetWtUnit": Row.NetWtUnit
      };
      oValidation.Nav_ItemsX.push(oNavItem);
    });
    busyDialog.open();
    oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_HeaderX", oValidation, {
      success: function (oData, oResponse) {
        var vMsg = "Validation is successfully done with some errors.";
        var vTitle = "Information";
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
            Nav_Items[vIndexItem].CurrentTerm = Row.CurrentTerm;
            Nav_Items[vIndexItem].CurrentTermDec = Row.CurrentTermDec;
            Nav_Items[vIndexItem].IncoTerm = Row.IncoTerm;
            Nav_Items[vIndexItem].IncoTermDesc = Row.IncoTermDesc;
            Nav_Items[vIndexItem].ExtValidFrom = Row.ExtValidFrom;
            Nav_Items[vIndexItem].ImportFlag = Row.ImportFlag;
            Nav_Items[vIndexItem].NewIncoTerm = Row.NewIncoTerm
            Nav_Items[vIndexItem].NewIncoTermDesc = Row.NewIncoTermDesc
            Nav_Items[vIndexItem].NewPayTerm = Row.NewPayTerm
            Nav_Items[vIndexItem].NewPayTermDesc = Row.NewPayTermDesc
            Nav_Items[vIndexItem].VLocation = Row.VLocation;
            Nav_Items[vIndexItem].Currency = Row.Currency;
            Nav_Items[vIndexItem].ExtPrice = Row.ExtPrice;
            Nav_Items[vIndexItem].PirNo = Row.PirNo;
            Nav_Items[vIndexItem].Purorg = Row.Purorg;
            Nav_Items[vIndexItem].Pinforcat = Row.Pinforcat;
            //for Changed Percentage
            var vSign =  Number(Nav_Items[vIndexItem].SettledPrice) - Number(Row.ExtPrice);
            var vChangePercnd = vSign/Row.ExtPrice*100;

            vChangePercnd = (!vChangePercnd || vChangePercnd == Infinity || vChangePercnd == -Infinity) ? 0 : vChangePercnd;
            Nav_Items[vIndexItem].ChgPrctng = Math.abs(vChangePercnd).toFixed(2);
//            Nav_Items[vIndexItem].ValidFrom = Row.ValidFrom;
//            Nav_Items[vIndexItem].PinforcatText = Row.Pinforcat == "0" ? "Standrard" : "Subcontracting"
//            Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
//            Nav_Items[vIndexItem].PinfoCatText = Row.PinfoCatText;
          }
          if (Row.PartNoFlag == "") {
            Nav_Items[vIndexItem].PartDesc = Row.PartDesc;
//            Nav_Items[vIndexItem].NetWtUniit = Row.NetWtUniit;
//            Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
          }
          if(Row.AmndcodeFlag == ""){
            Nav_Items[vIndexItem].Amndcode = Row.Amndcode;
            Nav_Items[vIndexItem].AmndcodeDesc = Row.AmndcodeDesc;
          }
          if (Row.VendorFlag != "" || Row.SettledPriceFlag != "" || Row.PartNoFlag != "" || Row.AmndcodeFlag != "" || Row.PlantFlag != "" || Row.PinforcatFlag!="" || Row.NewTermFlag!="" || Row.ValidFromFlag!="" 
            || Row.Messg != "") {
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
            oModelSSUDigitization.setProperty("/BEValidation", true);
//            oModelSSUDigitization.setProperty("/EditableFlag", false);
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
//          if(oData.Nav_ItemsX.length !== 0){
//            oController.getView().byId("itemCount").setText("Item Count: " + oData.Nav_ItemsX.length)
//          }
          oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
//          oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items",oData.Nav_ItemsX);
          oModelSSUDigitization.refresh();
        //   Message.success(vMsg, {
        //     title: vTitle
        //   });
          oController._validationDataFilled();
          busyDialog.close();
        
          //end added by beena-50002903 for sprint 3
          
          //below code commented by beena-50002903 for sprint 3
        
       /* if (oData.ErrorFlag != "X") {
          oModelSSUDigitization.setProperty("/BEValidation", true);
//          oModelSSUDigitization.setProperty("/EditableFlag", false);
          oController._fnLockUnlockService("");
          vMsg = "Validation is successfully done without errors.";
          vTitle = "Success";
        }

        oModelSSUDigitization.setProperty("/Validation", oData);
        oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
        oModelSSUDigitization.refresh();
        Message.success(vMsg, {
          title: vTitle
        });

        busyDialog.close();*/
      },
      error: function (oResponse) {
        // serviceError(oResponse);
        busyDialog.close();
      }
    });
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
        if (oPaperData.Nav_DMS.length <= 0) {
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
      }
    if (oPaperData.Sector.length <= 0 || oPaperData.Model.length <= 0 || oPaperData.PaperPur == "") {
      vFlag = false;
      oTabIconColor.VendorPartDetails = "Negative";
    }
    if (oPaperData.Initiator == "" || oPaperData.Approver1 == "") {
      vFlag = false;
      oTabIconColor.Workflow = "Negative";
    }
    if (oPaperData.Nav_Items.length <= 0) {
      oTabIconColor.VendorPartDetails = "Negative";
    }
    $.each(oPaperData.Nav_Items, function (i, Row) {
      if (Row.uiFields.Error == "Reject") {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      }
      if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" || Row.SettledPrice == "" || Row.SettledPrice == "0"
        || Row.Amndcode == "" || Row.ValidFrom == null) {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      }
    });
    oModelSSUDigitization.setProperty("/TabIconColor", oTabIconColor);
    return vFlag;
  },
//  ------------------------------ Validation Part ended -------------------------

//  Submit code

  onSubmit: function () {

    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var vValiDataField = oController._validationDataFilled();
    //added by beena-50002903 for sprint 3
    var vInitiator = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Initiator");
    var vAssociate = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Associate");
    var vCurrentUser = sap.ushell.Container.getService("UserInfo").getId();
    //End by beena-50002903 for sprint 3

    if(!oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo")){
      Message.error("Save the Paper before Submit.", {
        title: "Information"
      });
      return;
    }
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
                  oController._fnAfterGettingBEData(oPaperData);
                } else if (vMsgReturn.Title == "Sucess") {
                  sap.m.MessageBox.success(vMsgReturn.Message, {
                    title: vMsgReturn.Title,
                    onClose: function () {
                      navParentBack();
                      /*var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
                      oRouter.navTo("Home");*/
                    }
                  });
                }else{
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
//      oModelSSUDigitization.setProperty("/EditableFlag", true);
      oController._fnLockUnlockService("X");
      Message.error("fill all the mandatory fields", {
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
  
  onExport: function () {
    var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
    var vPaperNumber = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo");
    var vTermType = oModelSSUDigitization.getProperty("/PaperDataSet/TermsType"); // ADD by AGAWSA-CONT on 09-02-2023
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
//    Remove Start by AGAWSA-CONT on 09-02-2023
//    var oSettings = {
//    workbook: {
//    columns: getExportExcelColumsCIT(),
//
//    hierarchyLevel: 'Level'
//    },
//    dataSource: oExcelData,
//    fileName: "Export Data "+vPaperNumber
//
//    };
//    Remove End by AGAWSA-CONT on 09-02-2023
//    ADD Start by AGAWSA-CONT on 09-02-2023
    if(vTermType === "01"){
      var oSettings = {
          workbook: {
            columns: getExportExcelColumsCIT01(),

            hierarchyLevel: 'Level'
          },
          dataSource: oExcelData,
          fileName: "Export Data "+vPaperNumber

      };
    }else if(vTermType === "02"){
      var oSettings = {
          workbook: {
            columns: getExportExcelColumsCIT02(),

            hierarchyLevel: 'Level'
          },
          dataSource: oExcelData,
          fileName: "Export Data "+vPaperNumber

      };
    }
//    ADD End by AGAWSA-CONT on 09-02-2023
    var oSheet = new Spreadsheet(oSettings);
    oSheet.build().finally(function () {
      oSheet.destroy();
    });
  },
  onTableSelectAll: function(oEvent){
    if(oEvent.getParameter("selectAll")){
      this.getView().getModel("ModelSSUDigitization").setProperty("/PostToSapSelectAll",true);
    }else{
      this.getView().getModel("ModelSSUDigitization").setProperty("/PostToSapSelectAll",false);
    }
  },

//  on POst to sap function 
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
          


//  ----------------------------- UPLOAD COLLECTION (DMS) ------------------------
  onSelectionChange: function(oEvent){
    busyDialog.open();
    var oUploadCollection = oEvent.getSource();
      // Header Token
    var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
      name: "x-csrf-token",
      value: this.getXsrfToken()
    });
    oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var oFile =oEvent.getParameter("files")[0];
    var vTabId = oEvent.getSource().getBindingInfo('items').filters[0].oValue1;
    //PaperCode|FileKey|TabId|PartNo|Vendor|Plant|FxRmStatus|FileName|FileDesc|FileSize
    var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PaperNo");
    var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
    var slug =vPaperCode+"|"+vPaperNo+"|"+vTabId+"|0|0|0|0|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
    var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
      name: "slug",
      value: slug
    });
    oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);
  },
  getXsrfToken: function(oEvent) {
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
        vNav_DMS = vNav_DMS ? vNav_DMS:[];
        vNav_DMS.push({
          "Filekey": vSlugValue[1],
          "TabId": vSlugValue[2],
          "PartNo": vSlugValue[3],
          "Plant": vSlugValue[5],
                  "Vendor": vSlugValue[4],
          "FrxRmStatus": vSlugValue[6],
          "Posnr": "",
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
//    Deleting Attach file
  /*onAttachDeleted: function (oEvent) {
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var vSelectedPath = oEvent.getParameter("item").getBindingContext("ModelSSUDigitization").getPath();
    var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
    if (oDeletedData.Posnr != "") {
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      oDataAmendmentModel.remove("/ES_DMS(Filekey='"+oDeletedData.Filekey+"',TabId='"+oDeletedData.TabId+"',Posnr='"+oDeletedData.Posnr+"')/$value", {
        method: "DELETE",
        success: function (oData, oResponse) {
          var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
          oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
          oModelSSUDigitization.refresh();
        },
        error: function (oResponse) {
          Message.error("Error while getting data.", {
            title: "Error"
          });
        }
      });
    }
  },*/
  onAttachDeleted: function (oEvent) {
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    var oNavDms = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
//    var vSelectedIndex;
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
//    Formatter for open the link in upload collection
    formatterGetDmsURL : function(vKey, vPosnr, vTabId) {
    var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
    return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
  },

//  formatterAttachLoc: function (vTavId, vFxRm, vPartNo) {
//    if (vTavId == "VP") {
//      vTavId = "Vendor Part";
//    } else if (vTavId == "TC") {
//      vTavId = "Tool Cost";
//    } else if (vTavId == "FR") {
//      vTavId = "Forex-RM Content";
//    } else if (vTavId == "BR") {
//      vTavId = "Business Reduction";
//    } else if (vTavId == "SP") {
//      vTavId = "Spare Price";
//    }
//    if (vFxRm == "FX") {
//      vFxRm = " > Forex";
//    } else if (vFxRm == "RM") {
//      vFxRm = " => Rm"
//    }
//    if (vPartNo != "") {
//      vPartNo = " => " + vPartNo;
//    }
//    return vTavId + vFxRm + vPartNo;
//  },

//  To show smart form on Print Preview Button
  onPrintPreview: function () {
    var oController = this;
    var oPdfViewer = new sap.m.PDFViewer();
//    var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
    var vPaperNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperNo");
    var vTermsType = "00";
    var sServiceUrl = oController.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
    oPdfViewer.setSource(sServiceUrl+"/ES_AmendPDF(PaperNo='" + vPaperNo + "',TermsType='"+ vTermsType +"')/$value?sap-client=100");
    oPdfViewer.setTitle("SSU Price Paper");
    oPdfViewer.open();
  },
//  ========================== Work Flow Codes ==================
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
//      oModelSSUDigitization.setProperty("/PaperDataSet/Initiator", "");
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

//  Visible formatter for table in workflow
  formattWFvisible: function (oWFTable) {
    if (oWFTable) {
      return oWFTable.length > 0 ? true : false;
    } else {
      return false;
    }
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
//    if(!vPaperNo || (vLock=="" && !oModelSSUDigitization.getProperty("/EditableFlag")))
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
//  ==================added by deepa on 23.10.2020==================
  onApproveRequest: function(oEvent){
    var oController = this;
    var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
//    var vButtonType = oEvent.getSource().getProperty("type");
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
//    var vButtonType = oEvent.getSource().getProperty("type");
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
//          ADD Start by AGAWSA-CONT on 08-02-2023
          var vUsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
            if(vUsrComment.length <= 4){
              sap.m.MessageToast.show("Write any reasons for rejection.");
              return;
            }
//          ADD End by AGAWSA-CONT on 08-02-2023
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

  }
//  ======================end=================================

  });
});