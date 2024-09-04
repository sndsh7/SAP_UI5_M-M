sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/export/Spreadsheet"
], function (Controller, JSONModel, Message, Spreadsheet) {
  "use strict";

  return Controller.extend("com.mahindra.ZSSU_SPD.controller.SPD", {

    onInit: function () {
//      var oController = this;
//      var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
//      oRouter.getRoute("SPD").attachPatternMatched(oController._onObjectMatched, oController);
//      /*  this.getOwnerComponent().getModel("oDataNewPinfoModel").setSizeLimit(1000);
//        this.getView().setModel("oDataNewPinfoModel");*/
//      var opinfomode = this.getOwnerComponent().getModel("oDataNewPinfoModel");
//      opinfomode.setSizeLimit(10000); 
//      /*sap.ui.getCore().byId("backBtn").mEventRegistry.press[0].fFunction = function() {
//        oController._fnLockUnlockService("");
//        var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
//        oRouter.navTo("Home");
//      }*/

      // Fiori Usage
      var device = "Other";
      var os = jQuery.os.os;
      var os_ver = jQuery.os.fVersion;
      var browser = "Other";
      var browser_ver = jQuery.browser.fVersion;
      var height = $(window).height();
      var width = $(window).width();
      var resolution = width + " * " + height;
      var appName  = "ZSSU_SPD";

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
      oDataModel.read("/FioriUsageSet(Appname='ZSSU_SPD',Device='" + device +
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

//      oController._onObjectMatched(["FY21-PIC-000021","PIC"]);



    },
    //--------- Local Methods Start -------------------------
    _onObjectMatched: function (oParameter) {
//      var oController = this;
//      var vSpdNum = oEvent.getParameter("arguments").Number;
//      var oModel = new sap.ui.model.json.JSONModel();
//      var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_SPD', '/json/spdData.json');
//      oModel.loadData(sUrl, "", false);

//      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      var oController = this;
      var vSpdNum = oParameter[0];
      //vSpdNum = vSpdNum.split(":")[0];
      var vPaperCode = oParameter[1];

      var oModel = new sap.ui.model.json.JSONModel();
      var sUrl = jQuery.sap.getModulePath('com.mahindra.ZSSU_SPD', '/json/spdData.json');
      oModel.loadData(sUrl, "", false);
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");


      oModel.setProperty("/PartSettlementTracker", oParameter[2] || "");
      oModel.setProperty("/UserId", sap.ui.Device.userId);

      if (vSpdNum == "new") {
        oModel.setProperty("/NotCreateNew", false);
        oModel.setProperty("/EditableFlag", true);
        oModel.setProperty("/DisplayOnlyFlag", false);
        var oData = getHeaderObject();
        oData.PaperCode = "SPD";
        oModel.setProperty("/PaperDataSet", oData);
      } else {
        oController._fnGetNPIHeaderData(vSpdNum);
      }
      oDataNewPinfoModel.read("/ES_ToolCurr", {
        // filters: filters,
        success: function (oData, oResponse) {
          oModel.setProperty("/F4ToolCurr", oData.results);
          oModel.refresh();
          // busyDialog.close();
        },
        error: function (oResponse) {
          Message.error("Error loading toolcost.", {
            title: "Error"
          });
          // busyDialog.close();
        }
      });
      var filters = [new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oModel.getProperty("/UserId")),
        new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, "SPD")];
      oDataNewPinfoModel.read("/ES_Approver", {
        filters: filters,
        success: function (oData, oResponse) {
          oModel.setProperty("/F4Approver", oData.results);
          oModel.refresh();
          oController.formattInitiator(oModel.getProperty("/PaperDataSet/Cycle"));
          // busyDialog.close();
        },
        error: function (oResponse) {
          Message.error("Error loading approver.", {
            title: "Error"
          });
          // busyDialog.close();
        }
      });
      oController.getView().setModel(oModel, "ModelSSUDigitization");
      oController._fnCreatingTables();
    },
    _fnGetNPIHeaderData: function (vPnifoNumber) {
      var oController = this;
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      oController.getView().setBusy(true);
      var vParmeters = {
        "$expand": "Nav_Items/Nav_Forex,Nav_Items/Nav_RM,Nav_DMS,Nav_Log,Nav_Wf,Nav_Ret",
      };
      oDataNewPinfoModel.read("/ES_NPIHeader(NpiNo='"+vPnifoNumber+"',PaperCode='SPD')", {
//      oDataNewPinfoModel.read("/ES_NPIHeader('" + vPnifoNumber + "')", {
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
      oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
      oData.Model = oData.Model ? oData.Model.split(",") : [];
      oData.Nav_Items = oData.Nav_Items.results ? oData.Nav_Items.results : oData.Nav_Items;
      oData.Nav_DMS = oData.Nav_DMS.results  ? oData.Nav_DMS.results : oData.Nav_DMS;
      oData.Nav_Log = oData.Nav_Log.results  ? oData.Nav_Log.results : oData.Nav_Log;
      oData.Nav_Wf = oData.Nav_Wf.results  ? oData.Nav_Wf.results : oData.Nav_Wf;
      $.each(oData.Nav_Items, function (i, Row) {
        /*Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
        Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
        Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
        Row.YearBase = Row.YearBase == "1" ? 1 : 0;*/
//        Row.ForexRMRequired ="";
        if (oData.Status === "S" || oData.Status === "R")
          Row.ValidFrom = new Date();

        if (typeof Row.ValidFrom == "string"){
                    Row.ValidFrom = new Date( Row.ValidFrom);
        }
        Row.Nav_Forex = Row.Nav_Forex.results || Row.Nav_Forex;
        Row.Nav_RM = Row.Nav_RM.results || Row.Nav_RM;
        // Row.YearBase = parseInt(Row.YearBase);
      });
      if (oData.Status === "S" || oData.Status === "R")
        oModelSSUDigitization.setProperty("/DisplayOnlyFlag", false);
      else if(oData.Status === "IC")
        oModelSSUDigitization.setProperty("/PostToSAP", true);
      else if(oData.Status === "NR")
        oModelSSUDigitization.setProperty("/NonSSURequest", true);

      if (oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X" ||
      oModelSSUDigitization.getProperty("/PartSettlementTracker") == "Y"){
        oModelSSUDigitization.setProperty("/DisplayOnlyFlag", true);
        oModelSSUDigitization.setProperty("/NonSSURequest", false);
        oModelSSUDigitization.setProperty("/PostToSAP", false);
      }

      if(oData.Initiator != oData.Createdby)
        oModelSSUDigitization.setProperty("/InitiatedBySSU", false);

      oModelSSUDigitization.setProperty("/PaperDataSet", oData);
      oModelSSUDigitization.refresh();
      oController._validationDataFilled();
    },
    _fnDataBeforeSave: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      if (oPaperData.DeletedItems) {
        oPaperData.Nav_Items = oPaperData.Nav_Items.concat(oPaperData.DeletedItems);
        delete oPaperData.DeletedItems;
      }
      if (oPaperData.DeletedDMS) {
        oPaperData.Nav_DMS = oPaperData.Nav_DMS.concat(oPaperData.DeletedDMS);
        delete oPaperData.DeletedDMS;
      }
      oPaperData.Sector = oPaperData.Sector.toString();
      oPaperData.Model = oPaperData.Model.toString();
      delete oPaperData.__metadata;
      oPaperData.Nav_Log = [];
      oPaperData.Nav_Wf = [];
      oPaperData.Nav_Ret = [];
      oPaperData.Nav_DMS = [];
      $.each(oPaperData.Nav_Items, function (i, Row) {
        // Row.YearBase = Row.YearBase.toString();

        delete Row.ItemNo;
        delete Row.Error;
        delete Row.ErrorTC;
        delete Row.ErrorBR;
        delete Row.BEError;
        delete Row.ToolCostPanelState;
        delete Row.CBDPanelState;
        delete Row.BusiRednPanelState;
        delete Row.FX_RM_PanelState;
        delete Row.__metadata;

        /*var selDate = Row.ValidFrom;
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
              Row.ValidFrom = vChangedDate;*/
        Row.ValidFrom = uiDateToBackend(Row.ValidFrom); 
              
        /*Row.ToolCostRequired = Row.ToolCostRequired == 1 ? "X" : "";
        Row.ForexRequired = Row.ForexRequired == 1 ? "X" : "";
        Row.SparePartSameOE = Row.SparePartSameOE == 1 ? "X" : "";
        Row.YearBase = Row.YearBase == 1 ? "1" : "0";*/

        if (Row.DeletedForex) {
          Row.Nav_Forex = Row.Nav_Forex.concat(Row.DeletedForex);
          delete Row.DeletedForex;
        }
        if (Row.DeletedRM) {
          Row.Nav_RM = Row.Nav_RM.concat(Row.DeletedRM);
          delete Row.DeletedRM;
        }
        $.each(Row.Nav_Forex, function (i, RowFX) {
          delete RowFX.__metadata;
          delete RowFX.Error;
          delete RowFX.FrxNo;
          delete RowFX.BEError;
        });
        $.each(Row.Nav_RM, function (i, RowRM) {
          delete RowRM.__metadata;
          delete RowRM.Error;
          delete RowRM.RmNo;
          delete RowRM.BEError;
        });
      });
      $.each(oPaperData.Nav_DMS, function (i, Row) {
        delete Row.__metadata;
      });
      return oPaperData;
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
            type: "{ModelSSUDigitization>Error}",
            press: function (oEvent) {
//              oController._fnGetTaxCodeService();
              // oController.getView().getModel("ModelSSUDigitization").setProperty("/isAddNew", false);
              var oParentModel = oController._setEditFragmentModel(oEvent);
              var oItemFrag = xmlFragment(oController, "ItemDetails");
              oItemFrag.setModel(oParentModel);
              oController._fnGetTaxCodeService(oParentModel);
              oItemFrag.open();
//            ADD Start by AGAWSA-CONT on 02-02-2023
              var vSettledPrice = sap.ui.getCore().byId("SettledPrice").getValue();
              var vQuotedPrice = sap.ui.getCore().byId("QuotedPrice").getValue();
              if(parseFloat(vSettledPrice) > parseFloat(vQuotedPrice)){
                sap.ui.getCore().byId("SettledPrice").setValueState("Warning");
              }
//            ADD Start by AGAWSA-CONT on 02-02-2023


                 //added by beena for stop scrolling in input on 29-02-2024
              var oInputSettled = sap.ui.getCore().byId("SettledPrice");
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
              var oItemFrag = xmlFragment(oController, "ItemDetails");
              var oParentModel = oController._setEditFragmentModel(oEvent);
              var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
              var vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
              oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
              oItemFrag.setModel(oParentModel);
              oController._fnGetTaxCodeService(oParentModel);
              oParentModel.setProperty("/DBExist","");
              oItemFrag.open();
            }
          }),
          new sap.m.Button({
            icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
            tooltip: "Display",
            visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
            press: function (oEvent) {
              var oParentModel = oController._setDisplayFragmentModel(oEvent);
              var oItemFrag = xmlFragment(oController, "ItemDetails");
              oItemFrag.setModel(oParentModel);
              oController._fnGetTaxCodeService(oParentModel);
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
                    if (oDeletedData.NpiNo) {
                      $.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
                        if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
                          Row.Delete = "X";
                      });
                      /*$.each(oDeletedData.Nav_Forex, function (i, RowFx) {
                          RowFx.Delete = "X";
                      });
                      $.each(oDeletedData.Nav_RM, function (i, RowRm) {
                          RowRm.Delete = "X";
                      });*/
                      oDeletedData.Delete = "X";
                      var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedItems") ? oModelSSUDigitization.getProperty(
                        "/PaperDataSet/DeletedItems") : [];
                      oDeletedItems.push(oDeletedData);
                      oModelSSUDigitization.setProperty("/PaperDataSet/DeletedItems", oDeletedItems);
                    }
                    var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
                    oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
                    oModelSSUDigitization.refresh();
                  }
                }
              });

            }
          })
        ]
      });
      createDynamicMTable(oController, oTablePartDetails, vColumnListPath, vTableBindingPath, oActionItem);
    },

    /*_fnGetTaxCodeService: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vFilters = [];
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      oDataNewPinfoModel.read("/ES_TaxCode", {
        // filters: vFilters,
        success: function (oData, oResponse) {
          oModelSSUDigitization.setProperty("/F4TaxCode", oData.results);
          busyDialog.close();
        },
        error: function (oResponse) {
          serviceError(oResponse)
        }
      });
    },*/
    _fnGetTaxCodeService: function (oParentModel) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vFilters = [];
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      vFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")));
      vFilters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Vendor")));
      oDataNewPinfoModel.read("/ES_TaxCode", {
        filters: vFilters,
        success: function (oData, oResponse) {
          oModelSSUDigitization.setProperty("/F4TaxCode", oData.results);
          if(oData.results.length<=0){
            Message.error(JSON.parse(oResponse.headers["sap-message"]).message, {
              title: "Error Tax Code"
            });
          }

          busyDialog.close();
        },
        error: function (oResponse) {
          serviceError(oResponse);
        }
      });
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
    _fnDataSettingValidation: function (vSelectedPathVali) {
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
//      var vChangedData = oEvent.getSource().getParent().getModel().getData();
      try{
        var vChangedData = oEvent.getModel().getData();
      }catch(e){
        var vChangedData = oEvent.getSource().getParent().getModel().getData(); // AGAWSA-CONT;
      }
      var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      if (!vSelectedPath) {
        vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
      }
      delete vChangedData.Validation;
      oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
      oModelSSUDigitization.setProperty("/SelectedPath", "");
      oController._validationDataFilled();
    },
    _fnMassDataSet: function (vExcelDataArray) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
      var oFilter;
      var oForex;
      var oRM;
      $.each(vExcelDataArray, function (MainIndex, row) {
        oFilter = $.grep(oMassData, function (grepRow) {
          return ((row.Plant === grepRow.Plant) && (row.Vendor_Code === grepRow.Vendor) && (row.Child_Part_Number === grepRow.PartNo));
        });

        if (oFilter.length <= 0 &&  !oModelSSUDigitization.getProperty("/InitiatedBySSU")) {
          return;
        }


        oForex = {
          "NpiNo": "",
          "PartNo": "",
          "Posnr": "",
          "ForexCur": row.FX_Currency || "",
          "ForexContent": row.FX_Content || "",
          "ForexIndex": "",
          "ForexIndexVal": row.FX_Index_Cycle_val || "",
          "ForexLandFact": "",
          "ForexLandFactVal": row.FX_Landing_Factor_val || "",
          "ForexBaseperiod": row.FX_Base_Period_Month || "",
          "FxBasePeriodYr": row.FX_Base_Period_Year || "",
          "FxBaseExchRate": row.FX_Base_exchange_rate || "",
          "ForexRemarks": row.FX_Remarks || ""
        };
        oRM = {
          "NpiNo": "",
          "PartNo": "",
          "Posnr": "",
          "RmGrade": row.Grade_of_RM || "",
          "RmGrossWt": row.RM_Gross_Weight || "",
          "RmIndexCycle": "",
          "RmIndexCycleVal": row.RM_Index_Cycle_Val || "",
          "RmLandingFact": "",
          "RmLandingFactVal": row.RM_Landing_Factor_Val || "",
          "RmBasePeriod": row.RM_Base_Period_Month || "",
          "RmBasePeriodYr": row.RM_Base_Period_Year || "",
          "RmBasePrice": row.RM_Base_Price || "",
          "RmRemarks": row.RM_Remarks || ""
        };
//        if (oFilter.length <= 0) {
          var vSop1doe = row.SOP1_Date_or_Volume || "";
          var vSop2doe = row.SOP2_Date_or_Volume || "";
          var vSop3doe = row.SOP3_Date_or_Volume || "";
          var vSop4doe = row.SOP4_Date_or_Volume || "";
          var vSop5doe = row.SOP5_Date_or_Volume || "";
          if (row.Volume_Year == "Year Base") {
            vSop1doe = new Date(vSop1doe.split(".").reverse()) != "Invalid Date" ? dateObjToLocal(new Date(vSop1doe.split(".").reverse())) :
              null;
            vSop2doe = new Date(vSop2doe.split(".").reverse()) != "Invalid Date" ? dateObjToLocal(new Date(vSop2doe.split(".").reverse())) :
              null;
            vSop3doe = new Date(vSop3doe.split(".").reverse()) != "Invalid Date" ? dateObjToLocal(new Date(vSop3doe.split(".").reverse())) :
              null;
            vSop4doe = new Date(vSop4doe.split(".").reverse()) != "Invalid Date" ? dateObjToLocal(new Date(vSop4doe.split(".").reverse())) :
              null;
            vSop5doe = new Date(vSop5doe.split(".").reverse()) != "Invalid Date" ? dateObjToLocal(new Date(vSop5doe.split(".").reverse())) :
              null;
          }
          var vValidFrom = row.Valid_From_Date || "";
//          oMassData.push({
          var oNewEntry = {
            "ToolCostRequired": row.Tool_Cost_Required == "Yes" ? "" : "X",
            "ForexRequired": row.FX_Details == "Yes" ? "" : "X",
            "ForexRMRequired": row.RM_Forex_Required == "Yes" ? "" : "X",
            "SparePartSameOE": row.Spareprice_Same_OE == "Yes" ? "" : "X",
            "BusinessRedRequired": row.Business_Red_Required == "Yes" ? "" : "X",
            "Plant": row.Plant || "",
            "Vendor": row.Vendor_Code || "",
            "VName": "",
            "VLocation": "",
            "PartNo": row.Child_Part_Number || "",
            "PRPartNo": row.Parent_Part_Number || "",
            "PartDesc": "",
            "Currency": "",
            "QuotePrice": row.Quote_Price && row.Quote_Price.replace(/ /g, '') || "0",
            "Sbcprice": row.SBC && row.SBC.replace(/ /g, '') || "0",
            "SettledPrice": row.Settled_Price && row.Settled_Price.replace(/ /g, '') || "0",
            "PkgCost": row.Packaging_Cost && row.Packaging_Cost.replace(/ /g, '') || "0",
            "TranspCost": row.Transport_Cost && row.Transport_Cost.replace(/ /g, '') || "0",
            "ValidFrom": new Date(),//new Date(vValidFrom.split(".").reverse()) != "Invalid Date" ? new Date(vValidFrom.split(".").reverse()) : null,
            "Purgrp": "",
            "Pdeltime": row.Delivery_Time && row.Delivery_Time.replace(/ /g, '') || "03",
            "NetWeight": row.Net_Weight_of_part || "",
            "Taxonomy": row.Taxonomy || "",
            "AnnualCap": row.Annual_Capacity_of_Part && row.Annual_Capacity_of_Part.replace(/ /g, '') || "0",
            "StrategyInd": "",
            "DelTerms": "",
            "PaymntTerms": "",
            "Pinforcat": row.P_Info_category || "STANDARD",
            "Purorg": row.Purchase_Organisation || "INPO",
            "Taxcode": row.Tax_Code || "",
            "TcDesc": "",
            "ModelVar": row.Model_Variant || "",
            "NetWtUnit": row.Net_Weight_Unit || "",
            "TlCostCurrency": row.BASIC_Tol_Currency || "",
            "CurrDenomination": row.Denomination || "",
            "Budgeted": row.Budgeted && row.Budgeted.replace(/ /g, '') || "0",
            "FinalAmortized": row.Finalized_Amortised && row.Finalized_Amortised.replace(/ /g, '') || "0",
            "Finalupfront": row.Finalised_UpFront && row.Finalised_UpFront.replace(/ /g, '') || "0",
            "Amortisation": row.Amortization_Nos && row.Amortization_Nos.replace(/ /g, '') || "0",
            "ToolAmortisation": "0",
            "Dvp": "0",
            "RevCurrency": row.Rev_CURRENCY || "",
            "RevDenomination": row.Rev_Denomination || "",
            "RevBudgeted": row.Rev_Budgeted && row.Rev_Budgeted.replace(/ /g, '') || "0",
            "RevFinalAmortized": row.Rev_Finalized_Amortised && row.Rev_Finalized_Amortised.replace(/ /g, '') || "0",
            "RevFinalUpfront": row.Rev_Finalised_UpFront && row.Rev_Finalised_UpFront.replace(/ /g, '') || "0",
            "RevAmortization": row.Rev_Amortization_Nos && row.Rev_Amortization_Nos.replace(/ /g, '') || "0",
            "EdCurrency": row.ED_CURRENCY || "",
            "EdDenomination": row.ED_Denomination || "",
            "EdBudgeted": row.ED_Budgeted && row.ED_Budgeted.replace(/ /g, '') || "0",
            "EdFinalAmortized": row.ED_Finalized_Amortised && row.ED_Finalized_Amortised.replace(/ /g, '') || "0",
            "EdFinalUpfront": row.ED_Finalized_Upfront && row.ED_Finalized_Upfront.replace(/ /g, '') || "0",
            "EdAmortization": row.ED_Amortization_Nos && row.ED_Amortization_Nos.replace(/ /g, '') || "0",
            "ToolAmortization": "0",
            "BtOutParts": row.Bought_Out_Part_INR && row.Bought_Out_Part_INR.replace(/ /g, '') || "0",
            "ConvCost": row.Conversion_Cost_INR && row.Conversion_Cost_INR.replace(/ /g, '') || "0",
            "MarkUp": "0",
            "YearBase": row.Volume_Year == "Year Base" ? "0" : "1",
            "Sop1yr": row.SOP1_Year_Base_or_Volume_base && row.SOP1_Year_Base_or_Volume_base.replace(/ /g, '') || "0",
            "Sop2yr": row.SOP2_Year_Base_or_Volume_base && row.SOP2_Year_Base_or_Volume_base.replace(/ /g, '') || "0",
            "Sop3yr": row.SOP3_Year_Base_or_Volume_base && row.SOP3_Year_Base_or_Volume_base.replace(/ /g, '') || "0",
            "Sop4yr": row.SOP4_Year_Base_or_Volume_base && row.SOP4_Year_Base_or_Volume_base.replace(/ /g, '') || "0",
            "Sop5yr": row.SOP5_Year_Base_or_Volume_base && row.SOP5_Year_Base_or_Volume_base.replace(/ /g, '') || "0",
            "YoyRed": row.YOY_Reduction || "",
            "DiscountYear": row.SOP_Date_Effective_Date_Year_of_Discount || "",
            "Sop1doe": vSop1doe,
            "Sop2doe": vSop2doe,
            "Sop3doe": vSop3doe,
            "Sop4doe": vSop4doe,
            "Sop5doe": vSop5doe,
            "YoyRedRem": row.YOY_Reduction_Remarks || "",
            "VolDiscRemarks": row.Volume_Discount_Remarks || "",
            "DiscountValue": row.Value_Of_Discount && row.Value_Of_Discount.replace(/ /g, '') || "0",
            "SpareCurrency": "",
            "PartCost": row.Part_Cost && row.Part_Cost.replace(/ /g, '') || "0",
            "Margin": row.Margin && row.Margin.replace(/ /g, '') || "0",
            "Nav_Forex": row.FX_Details == "Yes" ? [oForex] : [],
            "Nav_RM": row.RM_Details == "Yes" ? [oRM] : [],
            "CondType": "",
            "CondTypText": "",
            "CondPrcnt": "",
            "CondUnit": ""
          }
//          var index = oMassData.length - 1;
          oNewEntry.ToolAmortisation = oController._fnCalculationToolAmotization(oNewEntry.FinalAmortized, oNewEntry.Amortisation, oNewEntry.CurrDenomination);
          oNewEntry.RevTlAmortization = oController._fnCalculationToolAmotization(oNewEntry.RevFinalAmortized, oNewEntry.RevAmortization, oNewEntry.RevDenomination);
          oNewEntry.ToolAmortization = oController._fnCalculationToolAmotization(oNewEntry.EdFinalAmortized, oNewEntry.EdAmortization, oNewEntry.EdDenomination);
          oNewEntry.MarkUp = oController._fnCalculationMarkUp(oNewEntry);
//          });
          /*var index = oMassData.length - 1;
          oMassData[index].ToolAmortisation = oController._fnCalculationToolAmotization(oMassData[index].FinalAmortized, oMassData[index]
            .Amortisation, oMassData[index].CurrDenomination);
          oMassData[index].RevTlAmortization = oController._fnCalculationToolAmotization(oMassData[index].RevFinalAmortized, oMassData[
            index].RevAmortization, oMassData[index].RevDenomination);
          oMassData[index].ToolAmortization = oController._fnCalculationToolAmotization(oMassData[index].EdFinalAmortized, oMassData[
            index].EdAmortization, oMassData[index].EdDenomination);
          oMassData[index].MarkUp = oController._fnCalculationMarkUp(oMassData[index]);*/

        if (oFilter.length <= 0) {
          oMassData.push(oNewEntry);
        } else {
//        if (oFilter.length > 0) {
          var existingIndex = oMassData.indexOf(oFilter[0]);
          var vForexFlag = true;
          var vRMFlag = true;
          oMassData[existingIndex] = oNewEntry;

          $.each(oMassData[existingIndex].Nav_Forex, function (fIndex, forexGrepRow) {
            /*if (JSON.stringify(forexGrepRow) === JSON.stringify(oForex))
              vForexFlag = false;*/
            if (forexGrepRow.ForexBaseperiod == oForex.ForexBaseperiod && forexGrepRow.ForexContent == oForex.ForexContent &&
              forexGrepRow.ForexCur == oForex.ForexCur && forexGrepRow.ForexIndexVal == oForex.ForexIndexVal && forexGrepRow.ForexLandFactVal ==
              oForex.ForexLandFactVal && forexGrepRow.ForexRemarks == oForex.ForexRemarks && forexGrepRow.FxBaseExchRate == oForex.FxBaseExchRate &&
              forexGrepRow.FxBasePeriodYr == oForex.FxBasePeriodYr)
              vForexFlag = false;
          });
          $.each(oMassData[existingIndex].Nav_RM, function (rmIndex, rmGrepRow) {
            /*  if (JSON.stringify(rmGrepRow) === JSON.stringify(oRM))
                vRMFlag = false;*/
            if (rmGrepRow.RmBasePeriod == oRM.RmBasePeriod && rmGrepRow.RmBasePeriodYr == oRM.RmBasePeriodYr && rmGrepRow.RmBasePrice ==
              oRM.RmBasePrice && rmGrepRow.RmGrade == oRM.RmGrade && rmGrepRow.RmGrossWt == oRM.RmGrossWt && rmGrepRow.RmIndexCycleVal ==
              oRM.RmIndexCycleVal && rmGrepRow.RmLandingFactVal == oRM.RmLandingFactVal && rmGrepRow.RmRemarks == oRM.RmRemarks)
              vRMFlag = false;
          });
          if (vForexFlag && row.FX_Details == "Yes")
            oMassData[existingIndex].Nav_Forex.push(oForex); //todo radio button "no" in mass, if already have data "yes" in ui 
          if (vRMFlag && row.RM_Details == "Yes")
            oMassData[existingIndex].Nav_RM.push(oRM);
        }

      });
      oController._validationMass(oMassData);
      oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);
    },
    _validationMass: function (Nav_Items) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oValidation = {
        "Sector": oModelSSUDigitization.getProperty("/PaperDataSet/Sector").toString(),
        "Nav_ItemsX": [],
        "PaperCode":"SPD"
      };
      $.each(Nav_Items, function (item, Row) {
        Row.ItemNo = item.toString();
        var oNavItem = {
          "ItemNo": item.toString(),
          "Plant": Row.Plant,
          "Vendor": Row.Vendor,
          "PartNo": Row.PartNo,
          "PRPartNo": Row.PRPartNo,
          "Taxonomy": Row.Taxonomy,
          "Taxcode": Row.Taxcode,
          "SettledPrice": Row.SettledPrice, //Added By AGAWSA-CONT
          "QuotedPrice": Row.QuotePrice,  //Added By AGAWSA-CONT
//          "NetWtUnit": Row.NetWtUnit,
          "Purgrp": Row.Purgrp,
          "Purorg": Row.Purorg,
          "Nav_ForexX": [],
          "Nav_RMX": []
        };
        $.each(Row.Nav_Forex, function (itemFX, RowFX) {
          RowFX.FrxNo = itemFX.toString();
          oNavItem.Nav_ForexX.push({
            "FrxNo": itemFX.toString(),
            "ForexCur": RowFX.ForexCur,
            "ForexIndex": RowFX.ForexIndex,
            "ForexLandFact": RowFX.ForexLandFact
          });
        });
        $.each(Row.Nav_RM, function (itemRM, RowRM) {
          RowRM.RmNo = itemRM.toString();
          oNavItem.Nav_RMX.push({
            "RmNo": itemRM.toString(),
            "RmGrade": RowRM.RmGrade,
            "RmIndexCycle": RowRM.RmIndexCycle,
            "RmLandingFact": RowRM.RmLandingFact
          });
        });
        oValidation.Nav_ItemsX.push(oNavItem);
      });
      busyDialog.open();
      oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeaderX", oValidation, {
        success: function (oData, oResponse) {
          var vMsg = "Validation is successfully done with some errors.";
          var vTitle = "Information";
          var vIndexItem;
          var vIndexFX;
          var vIndexRM;
          oData.Nav_ItemsX = oData.Nav_ItemsX.results;
          $.each(oData.Nav_ItemsX, function (i, Row) {
            Row.Nav_ForexX = Row.Nav_ForexX.results;
            Row.Nav_RMX = Row.Nav_RMX.results;

            $.each(Nav_Items, function (Index, NavRow) {
              if (NavRow.ItemNo == Row.ItemNo) {
                vIndexItem = Index;
              }
            });

            if (Row.VendorFlag == "") {
              Nav_Items[vIndexItem].VName = Row.VName;
              Nav_Items[vIndexItem].VLocation = Row.VLocation;
              Nav_Items[vIndexItem].Currency = Row.Currency;
              Nav_Items[vIndexItem].SpareCurrency = Row.Currency;
              Nav_Items[vIndexItem].PaymntTerms = Row.PaymntTerms;
              Nav_Items[vIndexItem].DelTerms = Row.DelTerms;

              Nav_Items[vIndexItem].CondType = Row.CondType;
              Nav_Items[vIndexItem].CondTypText = Row.CondTypText;
              Nav_Items[vIndexItem].CondPrcnt = Row.CondPrcnt;
              Nav_Items[vIndexItem].CondUnit = Row.CondUnit;
            }
            if (Row.PartNoFlag == "") {
              Nav_Items[vIndexItem].PartDesc = Row.PartDesc;
//              Nav_Items[vIndexItem].NetWtUnit = Row.NetWtUnit != ""? Row.NetWtUnit : Nav_Items[vIndexItem].NetWtUnit;
              Nav_Items[vIndexItem].Purgrp = Row.Purgrp;
            }
            if (Row.PRPartNoFlag == "") {
              Nav_Items[vIndexItem].PRPartDesc = Row.PRPartDesc;
//              Nav_Items[vIndexItem].NetWtUnit = Row.NetWtUnit != ""? Row.NetWtUnit : Nav_Items[vIndexItem].NetWtUnit;
              Nav_Items[vIndexItem].Purgrp = Row.Purgrp;
            }
            if (Row.TaxcodeFalg == "") {
              Nav_Items[vIndexItem].TcDesc = Row.TcDesc;
            }
//            Start ADD By AGAWSA-CONT
            if(Row.QuotedPriceFlag != ""){
              Nav_Items[vIndexItem].Error = "Critical";
                Nav_Items[vIndexItem].BEError = false;
                if(Row.VendorFlag != "" || Row.PartNoFlag != "" || Row.TaxonomyFlag != "" || Row.TaxcodeFalg != "" || Row.PlantFlag != ""){
                  Nav_Items[vIndexItem].Error = "Reject";
                    Nav_Items[vIndexItem].BEError = true;
                }
            }
            else if (Row.VendorFlag != "" || Row.PartNoFlag != "" || Row.TaxonomyFlag != "" || Row.TaxcodeFalg != "" || Row.PlantFlag != "") {
              Nav_Items[vIndexItem].Error = "Reject";
              Nav_Items[vIndexItem].BEError = true;
            } else {
              Nav_Items[vIndexItem].Error = "Default";
              Nav_Items[vIndexItem].BEError = false;
            }
//          END ADD By AGAWSA-CONT
            var vItemPanelError = false;
            $.each(Row.Nav_ForexX, function (iFX, RowFX) {
              $.each(Nav_Items[vIndexItem].Nav_Forex, function (Index, NavRow) {
                if (NavRow.FrxNo == RowFX.FrxNo) {
                  vIndexFX = Index;
                }
              });
              if (RowFX.ForexCurFlag == "") {
                Nav_Items[vIndexItem].Nav_Forex[vIndexFX].ForexIndex = RowFX.ForexIndex;
                Nav_Items[vIndexItem].Nav_Forex[vIndexFX].ForexLandFact = RowFX.ForexLandFact;
              }
              if (RowFX.ForexCurFlag != "" || RowFX.ForexIndexFlag != "" || RowFX.ForexLandFactFlag != "") {
                Nav_Items[vIndexItem].Nav_Forex[vIndexFX].Error = "Reject";
                Nav_Items[vIndexItem].Nav_Forex[vIndexFX].BEError = true;
                vItemPanelError = true;
              } else {
                Nav_Items[vIndexItem].Nav_Forex[vIndexFX].Error = "Default";
                Nav_Items[vIndexItem].Nav_Forex[vIndexFX].BEError = false;
              }
            });
            $.each(Row.Nav_RMX, function (iRM, RowRM) {
              $.each(Nav_Items[vIndexItem].Nav_RM, function (Index, NavRow) {
                if (NavRow.RmNo == RowRM.RmNo) {
                  vIndexRM = Index;
                }
              });
              if (RowRM.RmGradeFlag == "") {
                Nav_Items[vIndexItem].Nav_RM[vIndexRM].RmIndexCycle = RowRM.RmIndexCycle;
                Nav_Items[vIndexItem].Nav_RM[vIndexRM].RmLandingFact = RowRM.RmLandingFact;
              }
              if (RowRM.RmGradeFlag != "" || RowRM.RmIndexCycleFlag != "" || RowRM.RmLandingFactFlag != "") {
                Nav_Items[vIndexItem].Nav_RM[vIndexRM].Error = "Reject";
                Nav_Items[vIndexItem].Nav_RM[vIndexRM].BEError = true;
                vItemPanelError = true;
              } else {
                Nav_Items[vIndexItem].Nav_RM[vIndexRM].BEError = false;
                Nav_Items[vIndexItem].Nav_RM[vIndexRM].Error = "Default";
              }
            });

            if (vItemPanelError) {
              Nav_Items[vIndexItem].FX_RM_PanelState = "Error";
            } else {
              Nav_Items[vIndexItem].FX_RM_PanelState = "Success";
            }
          });
          oController._validationDataFilled();
//        Start Remove By AGAWSA-CONT
          /*
          if (oData.ErrorFlag != "X") {
            oModelSSUDigitization.setProperty("/BEValidation", true);

            oModelSSUDigitization.setProperty("/EditableFlag", false);
//            oController._fnLockUnlockService("");
            vMsg = "Validation is successfully done without errors.";
            vTitle = "Success";
          }else{
            oModelSSUDigitization.setProperty("/BEValidation", false);
          }
      */
//        END Remove By AGAWSA-CONT
//        Start ADD By AGAWSA-CONT
          if (oData.ErrorFlag == "") {
              oModelSSUDigitization.setProperty("/BEValidation", true);
              oController._fnLockUnlockService("");
              Message.success("Validation is successfully done without errors.");
            }
            else if (oData.ErrorFlag == "X") {
              Message.error("Validation is successfully done with errors.");
              oModelSSUDigitization.setProperty("/BEValidation", false);
            }
            else if(oData.ErrorFlag == "W"){
              oModelSSUDigitization.setProperty("/BEValidation", true);
              oController._fnLockUnlockService("");
              Message.warning("Validation is successfully done with warning.");
            }
//        END ADD By AGAWSA-CONT
          oModelSSUDigitization.setProperty("/Validation", oData);
          oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
          oModelSSUDigitization.refresh();
//          Message.success(vMsg, {
//            title: vTitle
//          });
          busyDialog.close();
        },
        error: function (oResponse) {
           serviceError(oResponse);
          busyDialog.close();
        }
      });
    },
    _getModelPlant: function (vSelectedSectors) {
      if (vSelectedSectors && vSelectedSectors.length > 0) {
        var vFilters = [];
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
        oModelSSUDigitization.setProperty("/PaperDataSet/Sector", vSelectedSectors)

        $.each(vSelectedSectors, function (index, key) {
          vFilters.push(new sap.ui.model.Filter("SectorCode", sap.ui.model.FilterOperator.EQ, key));
        });
        busyDialog.open();

        oDataNewPinfoModel.read("/ES_Model", {
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
        oDataNewPinfoModel.read("/ES_Plant", {
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
    _fnRequredFieldCheck: function (oFields,oFrg) {
      var oMandatoryFlag = true;
      if(oFrg == "Frg1"){
        var quoted_price = sap.ui.getCore().byId("QuotedPrice").mProperties.value;
          var settled_price = sap.ui.getCore().byId("SettledPrice").mProperties.value;
      }
      $.each(oFields, function (i, row) {
        if (row.mProperties.hasOwnProperty("required") && row.getProperty("required")) {
          if (row.mProperties.hasOwnProperty("selectedKeys") && row.getProperty("selectedKeys").length <= 0) {
            row.setValueState("Error");
            row.setValueStateText("this field is required");
            oMandatoryFlag = false;
          } else if (row.mProperties.hasOwnProperty("value") && !row.mProperties.hasOwnProperty("selectedKeys") &&
              ((row.mProperties.hasOwnProperty("type") && row.getProperty("type")=="Number" && row.getProperty("value") == "0") || row.getProperty("value") == "" || row.getProperty("value") == " ")) {
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
      if(oFrg == "Frg1"){
        if(parseFloat(quoted_price) < parseFloat(settled_price)){
            sap.ui.getCore().byId("SettledPrice").setValueState("Warning");
            sap.m.MessageToast.show("Settled price is more then Quoted price");
         }
        else if(parseFloat(settled_price)<= 0){
          sap.ui.getCore().byId("SettledPrice").setValueState("Error");
            sap.m.MessageToast.show("Settled price is can not be zero");
          oMandatoryFlag = false;
        }
      }
      return oMandatoryFlag;
    },
    _fnLoadFXIndexVal: function (vForexIndex) {
      var oController = this;
      oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_ForexIndVal", {
        filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vForexIndex)],
        success: function (oData, oResponse) {
          oController.getView().getModel("ModelSSUDigitization").setProperty("/F4ForexIndVal", oData.results);
          oController.getView().getModel("ModelSSUDigitization").refresh();
          busyDialog.close();
        },
        error: function (oResponse) {
          serviceError(oResponse);
          busyDialog.close();
        }
      });
    },
    _fnLoadIndexRMVal: function (vRMIndex) {
      var oController = this;
      oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_RMIndexVal", {
        filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vRMIndex)],
        success: function (oData, oResponse) {
          oController.getView().getModel("ModelSSUDigitization").setProperty("/F4RMIndexVal", oData.results);
          oController.getView().getModel("ModelSSUDigitization").refresh();
          busyDialog.close();
        },
        error: function (oResponse) {
          serviceError(oResponse);
          busyDialog.close();
        }
      });
    },
    _fnClearToolData: function (vSelectedPath) {
      var oController = this;
      var oItemDetails = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath);
      oItemDetails.TlCostCurrency = "";
      oItemDetails.CurrDenomination = "";
      oItemDetails.Budgeted = "0";
      oItemDetails.FinalAmortized = "0";
      oItemDetails.Finalupfront = "0";
      oItemDetails.Amortisation = "0";
      oItemDetails.ToolAmortisation = "0";
      oItemDetails.RevCurrency = "";
      oItemDetails.RevDenomination = "";
      oItemDetails.RevBudgeted = "0";
      oItemDetails.RevFinalAmortized = "0";
      oItemDetails.RevFinalUpfront = "0";
      oItemDetails.RevAmortization = "0";
      oItemDetails.RevTlAmortization = "0";
      oItemDetails.EdCurrency = "";
      oItemDetails.EdDenomination = "";
      oItemDetails.EdBudgeted = "0";
      oItemDetails.EdFinalAmortized = "0";
      oItemDetails.EdFinalUpfront = "0";
      oItemDetails.EdAmortization = "0";
      oItemDetails.ToolAmortization = "0";
      oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath, oItemDetails);
    },
    _fnCalculationToolAmotization: function (vFinalAmortized, vAmortisation, vDenomination) {
      var vToolAmortisation = 0;
      vDenomination.toUpperCase();
      if (vFinalAmortized != "" && vAmortisation != "") {
        switch (vDenomination) {
        case "SAME":
          vToolAmortisation = parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
          break;
        case "THOUSANDS":
          vToolAmortisation = 1000 * parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
          break;
        case "LAKHS":
          vToolAmortisation = 100000 * parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
          break;
        case "CRORES":
          vToolAmortisation = 10000000 * parseFloat(vFinalAmortized) / parseFloat(vAmortisation);
          break;
        }
        vToolAmortisation = (!vToolAmortisation || vToolAmortisation == Infinity || vToolAmortisation == -Infinity) ? 0 :
          vToolAmortisation;
        vToolAmortisation = vToolAmortisation.toFixed(3);
      }
      return vToolAmortisation.toString();
    },
    _validationDataFilled: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var vFlag = true;
      var oTabIconColor = {
        "VendorPartDetails": "Positive",
        "ToolCost": "Positive",
        "ForexRM": "Positive",
        "CBD": "Positive",
        "BusinessReduction": "Positive",
        "SparePrice": "Positive",
        "Attachment": "Positive",
        "Workflow": "Positive"
      };
      if (oPaperData.Nav_DMS.length <= 0) {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      } else {
        var vFlagLB = false;
        var vFlagVMM = false;
        $.each(oPaperData.Nav_DMS, function (i, RowDMS) {
          if (RowDMS.TabId == "SCB")
            vFlagLB = true;

        });
        if (!vFlagLB) {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
        }
      }
      if (oPaperData.Sector.length <= 0 || oPaperData.Model.length <= 0) {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      }
      if (oPaperData.Initiator == "" || oPaperData.Approver1 == "") {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
      }
      if (oPaperData.Nav_Items.length <= 0) {
        oTabIconColor.VendorPartDetails = "Negative";
        oTabIconColor.ToolCost = "Negative";
        oTabIconColor.CBD = "Negative";
        oTabIconColor.BusinessReduction = "Negative";
        oTabIconColor.ForexRM = "Negative";
      }
      $.each(oPaperData.Nav_Items, function (i, Row) {

        /*if () {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
        }*/
//        Start Remove By AGAWSA-CONT
        /*if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" ||  Row.SettledPrice == "" || Row.PkgCost == "" ||
          Row.TranspCost == "" || Row.Purgrp == "" || Row.Pdeltime == "" || Row.Taxonomy == "" || Row.Pinforcat ==
          "" || Row.Purorg == "" || Row.Taxcode == ""  || Row.ValidFrom == null || (Row.Error == "Reject" && Row.BEError)
        ) { //Error checking because of Backend validation 
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
          Row.Error = "Reject"; //Error setting because of mandatory fields 
        } else {
          Row.Error = "Default";
        }*/
//      END Remove By AGAWSA-CONT
//      Start ADD By AGAWSA-CONT
        if (Row.Plant == "" || Row.Vendor == "" || Row.PartNo == "" ||  Row.SettledPrice == "" || Row.PkgCost == "" ||
                Row.TranspCost == "" || Row.Purgrp == "" || Row.Pdeltime == "" || Row.Taxonomy == "" || Row.Pinforcat ==
                "" || Row.Purorg == "" || Row.Taxcode == ""  || Row.ValidFrom == null || (Row.Error == "Reject" && Row.BEError)
              ) { //Error checking because of Backend validation 
                vFlag = false;
                oTabIconColor.VendorPartDetails = "Negative";
                Row.Error = "Reject"; //Error setting because of mandatory fields 
              }
        else if(parseFloat(Row.QuotePrice) < parseFloat(Row.SettledPrice)){  
            Row.Error = "Critical"
          }
        else {
                Row.Error = "Default";
              }
//      END ADD By AGAWSA-CONT
        if (Row.ToolCostRequired == "" && (Row.TlCostCurrency == "" || Row.CurrDenomination == "" || Row.Budgeted == "" || Row.FinalAmortized ==
            "" || Row.Finalupfront == "" || Row.Amortisation == "")) {
          vFlag = false;
          oTabIconColor.ToolCost = "Negative";
          Row.ToolCostPanelState = "Error";
          Row.ErrorTC = "Reject";
        } else {
          Row.ErrorTC = "Default";
          Row.ToolCostPanelState = "Success";
        }
        if (Row.BtOutParts == "" || Row.ConvCost == "") {
          vFlag = false;
          oTabIconColor.CBD = "Negative";
          Row.CBDPanelState = "Error";
        } else {
          Row.CBDPanelState = "Success";
        }
        if (Row.BusinessRedRequired == "" && (Number(Row.Sop1yr) == 0 || Number(Row.Sop2yr) == 0
            || Number(Row.Sop3yr) == 0 ||  Number(Row.DiscountYear) == 0 || Row.YoyRed == "")) {
          vFlag = false;
          oTabIconColor.BusinessReduction = "Negative";
          Row.BusiRednPanelState = "Error";
          Row.ErrorBR = "Reject";
        } else {
          Row.BusiRednPanelState = "Success";
          Row.ErrorBR = "Default";
        }

        Row.FX_RM_PanelState = "Success";
        if (Row.ForexRMRequired == "" && ((Row.ForexRequired == "" && Row.Nav_Forex.length <= 0) || (Row.ForexRequired == "X" && Row.Nav_RM.length <= 0))) {
          vFlag = false;
          oTabIconColor.ForexRM = "Negative";
          Row.FX_RM_PanelState = "Error";
        }
        $.each(Row.Nav_Forex, function (i, RowFX) {
          /*if (RowFX.Error == "Reject") {
            vFlag = false;
            oTabIconColor.ForexRM = "Negative";
          }*/
          if (RowFX.ForexCur == "" || RowFX.ForexContent == "" || RowFX.ForexIndex == "" || RowFX.ForexIndexVal == "" || RowFX.ForexLandFact ==
            "" || RowFX.ForexLandFactVal == "" || RowFX.ForexBaseperiod == "" || RowFX.FxBasePeriodYr == "" || RowFX.FxBaseExchRate ==
            "" || (RowFX.Error == "Reject" && RowFX.BEError)) {
            vFlag = false;
            oTabIconColor.ForexRM = "Negative";
            Row.FX_RM_PanelState = "Error";
            RowFX.Error = "Reject";
          } else {
            RowFX.Error = "Default";
          }
        });
        $.each(Row.Nav_RM, function (i, RowRM) {
          /*if (RowRM.Error == "Reject") {
            vFlag = false;
            oTabIconColor.ForexRM = "Negative";
          }*/
          if (RowRM.RmGrade == "" || RowRM.RmGrossWt == "" || RowRM.RmIndexCycle == "" || RowRM.RmIndexCycleVal == "" || RowRM.RmLandingFact ==
            "" || RowRM.RmLandingFactVal == "" || RowRM.RmBasePeriod == "" || RowRM.RmBasePeriodYr == "" || RowRM.RmBasePrice == "" ||
            (RowRM.Error == "Reject" && RowRM.BEError)) {
            vFlag = false;
            oTabIconColor.ForexRM = "Negative";
            Row.FX_RM_PanelState = "Error";
            RowRM.Error = "Reject";
          } else {
            RowRM.Error = "Default";
          }
        });
      });
      oModelSSUDigitization.setProperty("/TabIconColor", oTabIconColor);
      return vFlag;
    },
    _fnCalculationMarkUp: function (oItem) {

      var vMarkUp = 0;
      var vRmCost = 0;
      if (oItem.Nav_RM.length > 0) {
        vRmCost = (Number(oItem.Nav_RM[0].RmBasePrice) * Number(oItem.Nav_RM[0].RmGrossWt));
      }
      var vSettledPrice = Number(oItem.SettledPrice);
      var vBtOutParts = Number(oItem.BtOutParts);
      var vConvCost = Number(oItem.ConvCost);
      vMarkUp = (vSettledPrice - (vRmCost + vBtOutParts + vConvCost)) / vSettledPrice
      vMarkUp = vMarkUp * 100;
      vMarkUp = (!vMarkUp || vMarkUp == Infinity || vMarkUp == -Infinity) ? 0 : vMarkUp;
      vMarkUp = vMarkUp.toFixed(3);
      return vMarkUp;
    },
    //--------- Local Methods End --------------------------

    //---------- Formatter Methods Start --------------------
    formatterRadioYesNo: function (vValue){
      return vValue === "X" ? 1 :0; //0 is yes 1 is no
    },
    formatterForexRMRequired: function (vForexRMRequired){
      return vForexRMRequired ==='X' ? false : true;
    },

    formatterPurgrpEdit: function (vEditable, vPurGrp){
      return vEditable && (vPurGrp == "" ? true : false);
    },

    visiblePartEdit: function (vEditable, vSector, vModel, vInitiatedBySSU) {
      if (vEditable && vSector.length > 0 && vModel.length > 0 && vInitiatedBySSU) {
        return true;
      } else {
        return false;
      }
    },

//         visible attachments
//         added by REDDRA-CONT on 18-05-2022
        formattAttachments : function(vValue){
//        Start ADD By AGAWSA-CONT on 05-01-2023 user specific visibility
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
//          END ADD By AGAWSA-CONT on 05-01-2023 attachment visibility improvement
           },

    visiblePartEditAttach: function (vEditable, vSector, vModel) {
      if (vEditable && vSector.length > 0 && vModel.length > 0) {
        return true;
      } else {
        return false;
      }
    },

    formatterGetDmsURL: function (vKey, vPosnr,vTabId) {
      return "/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='"+vTabId+"')/$value";
    },
    formattWFvisible: function (oWFTable) {
      if (oWFTable) {
        return oWFTable.length > 0 ? true : false;
      } else {
        return false;
      }
    },
    formatterPartEdit: function (vEditable, vPlant, vInitiatedBySSU, vDBExist) {
      return vEditable && vInitiatedBySSU && (vPlant != "" ? true : false) && !vDBExist;
    },
    /*formatterKeyEdit: function (vEditable, vIsAddNew) {
      return vEditable && vIsAddNew;
    },*/

    formattValidationError: function (vValue) {
      if (typeof vValue == "string") {
        return vValue != "" ? "Error" : "None";
      }
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
    formatterYearBase: function (vYearBase) {
      if (vYearBase)
        return parseInt(vYearBase);
    },
    formatterYearBaseSOP: function (vYearBase) {
      if (vYearBase)
        return vYearBase == "0" ? true : false;
    },
    formatterVolumeBaseSOP: function (vVolumeBase) {
      if (vVolumeBase)
        return vVolumeBase == "1" ? true : false;
    },

    formattGetModelPlant: function (vSector) {
      if (vSector) {
        vSector = typeof vSector == "string" ? vSector.split(",") : vSector;
        this._getModelPlant(vSector);
        return vSector;
      }
    },
    formatterDisplayPanel: function (vCode, vDesc) {
      if (vDesc)
        return vCode + "  (" + vDesc + ")";
      else
        return vCode;
    },
    formatterTableVisible: function (vForexRequired , vForexRMRequired) {
      return (vForexRMRequired == 0 && vForexRequired == 0) ? true : false;
    },
    formatterTableVisibleOE: function (vValue) {
      return vValue == "X" ? true : false;
    },
    formattTaxonmoyReq: function (vTaxomoyYN) {
      return vTaxomoyYN == 0 ? true : false;
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
//         oModelSSUDigitization.setProperty("/PaperDataSet/Initiator", "");
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
    /*getAttachHeader: function(oGroup) {
      debugger;
      return new sap.m.GroupHeaderListItem({
        title: (oGroup.text ? oGroup.text : "Version") + ": " + oGroup.key,
        upperCase: false
      });
    },*/

    onChangeBtOutPartCovCost: function (oEvent) {

      var oController = this;
      oController.onCheckNumberLeng12(oEvent);
      var oModel = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedPath = oEvent.getSource().getParent().getBindingContextPath("ModelSSUDigitization");
      var oItem = oModel.getProperty(vSelectedPath);
      var vMarkUp = oController._fnCalculationMarkUp(oItem);
      oModel.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
    },
    onChangeBaseAmotizn: function (oEvent) {
      var oController = this;
      oController.onCheckNumberLeng12(oEvent);
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty("/");
      var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.FinalAmortized, oItem.Amortisation, oItem.CurrDenomination);
      oModel.setProperty("/ToolAmortisation", vToolAmortisation);
    },
    onChangeRevAmotizn: function (oEvent) {
      var oController = this;
      oController.onCheckNumberLeng12(oEvent);
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty("/");
      var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.RevFinalAmortized, oItem.RevAmortization, oItem.RevDenomination);
      oModel.setProperty("/RevTlAmortization", vToolAmortisation);
    },
    onChangeEdAmotizn: function (oEvent) {
      var oController = this;
      oController.onCheckNumberLeng12(oEvent);
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty("/");
      var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.EdFinalAmortized, oItem.EdAmortization, oItem.EdDenomination);
      oModel.setProperty("/ToolAmortization", vToolAmortisation);
    },
    onChangeBaseDenomi: function (oEvent) {
      var oController = this;
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty("/");
      var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.FinalAmortized, oItem.Amortisation, oItem.CurrDenomination);
      oModel.setProperty("/ToolAmortisation", vToolAmortisation);
    },
    onChangeRevDenomi: function (oEvent) {
      var oController = this;
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty("/");
      var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.RevFinalAmortized, oItem.RevAmortization, oItem.RevDenomination);
      oModel.setProperty("/RevTlAmortization", vToolAmortisation);
    },
    onChangeEdDenomi: function (oEvent) {
      var oController = this;
      var oModel = oEvent.getSource().getModel();
      var oItem = oModel.getProperty("/");
      var vToolAmortisation = oController._fnCalculationToolAmotization(oItem.EdFinalAmortized, oItem.EdAmortization, oItem.EdDenomination);
      oModel.setProperty("/ToolAmortization", vToolAmortisation);
    },
    onChangeTab: function (oEvent) {
      this._validationDataFilled();
      /*if (oEvent.getParameter("selectedKey") == "FR") {
        var vErrorDOM = $(".clsEditButton .sapMBtnReject").parents(".sapMPanel").find(".sapMObjStatusText");
        $.each($(".clsValidationErrorTxt"), function (i, row) {
          row.classList.remove("clsValidationErrorTxt");
        });
        $.each(vErrorDOM, function (i, row) {
          row.classList.add("clsValidationErrorTxt");
        });
      }*/
      // $(".clsEditButton .sapMBtnReject").parents(".sapMPanel").find(".sapMObjStatusText").css("color", "#bb0000");
    },
    onChangeDrop: function (oEvent) {
      if (!oEvent.getParameter("itemPressed")) {
        oEvent.getSource().setValue(oEvent.getSource()._sValue);
        // $(".sapMComboBox").find("input").attr("readonly", true);
      }
    },
    onYearBase: function (oEvent) {
      var vYearBase = oEvent.getParameter("selectedIndex").toString();
      oEvent.getSource().getModel().setProperty("/YearBase", vYearBase);
      oEvent.getSource().getModel().setProperty("/Sop1doe", "");
      oEvent.getSource().getModel().setProperty("/Sop2doe", "");
      oEvent.getSource().getModel().setProperty("/Sop3doe", "");
      oEvent.getSource().getModel().setProperty("/Sop4doe", "");
      oEvent.getSource().getModel().setProperty("/Sop5doe", "");
    },
    onIndexValFRXChange: function (oEvent) {
      var oController = this;
      if (oEvent.getParameter("selectedItem")) {
        var vForexIndex = oEvent.getParameter("selectedItem").getText();
        oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_ForexIndVal", {
          filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vForexIndex)],
          success: function (oData, oResponse) {
            oController.getView().getModel("ModelSSUDigitization").setProperty("/F4ForexIndVal", oData.results);
            oController.getView().getModel("ModelSSUDigitization").refresh();
            busyDialog.close();
          },
          error: function (oResponse) {
            serviceError(oResponse);
            busyDialog.close();
          }
        });
      }
    },
    onIndexValRMChange: function (oEvent) {
      var oController = this;
      if (oEvent.getParameter("selectedItem")) {
        var vRMIndex = oEvent.getParameter("selectedItem").getText();
        oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_RMIndexVal", {
          filters: [new sap.ui.model.Filter("IndexCode", sap.ui.model.FilterOperator.EQ, vRMIndex)],
          success: function (oData, oResponse) {
            oController.getView().getModel("ModelSSUDigitization").setProperty("/F4RMIndexVal", oData.results);
            oController.getView().getModel("ModelSSUDigitization").refresh();
            busyDialog.close();
          },
          error: function (oResponse) {
            serviceError(oResponse);
            busyDialog.close();
          }
        });
      }
    },
    onSelectOERadio: function (oEvent) {
      var vSparePartSameOE =oEvent.getParameter("selectedIndex");
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      if (vSparePartSameOE == 0) {
        var oController = this;
//        var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
        var oItemDetails = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath);
        oItemDetails.SpareCurrency = "";
        oItemDetails.PartCost = "0";
        oItemDetails.Margin = "0";
        oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath, oItemDetails);
      }
      vSparePartSameOE = vSparePartSameOE == 1 ? "X" : "";
      oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/SparePartSameOE", vSparePartSameOE);
    },
    onSelectBusinRedRadio: function (oEvent) {
      var vBusinessRedRequired =oEvent.getParameter("selectedIndex");
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      if (vBusinessRedRequired == 1) {
        var oController = this;
//        var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
        var oItemDetails = oController.getView().getModel("ModelSSUDigitization").getProperty(vSelectedPath);
        oItemDetails.YearBase = "0";
        oItemDetails.Sop1yr = "0";
        oItemDetails.Sop2yr = "0";
        oItemDetails.Sop3yr = "0";
        oItemDetails.Sop4yr = "0";
        oItemDetails.Sop5yr = "0";
        oItemDetails.YoyRed = "";
        oItemDetails.DiscountYear = "";
        oItemDetails.Sop1doe = "";
        oItemDetails.Sop2doe = "";
        oItemDetails.Sop3doe = "";
        oItemDetails.Sop4doe = "";
        oItemDetails.Sop5doe = "";
        oItemDetails.YoyRedRem = "";
        oItemDetails.VolDiscRemarks = "";
        oItemDetails.DiscountValue = "0";
        oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath, oItemDetails);
      }
      vBusinessRedRequired = vBusinessRedRequired == 1 ? "X" : "";
      oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/BusinessRedRequired", vBusinessRedRequired);
    },
    onSelectForexRMRadio: function (oEvent) {
      var vForexRMRequired =oEvent.getParameter("selectedIndex");
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      if (vForexRMRequired == 1) {
        var oController = this;
//        var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
        oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath + "/Nav_Forex", []);
        oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath + "/Nav_RM", []);
      }
      vForexRMRequired = vForexRMRequired == 1 ? "X" : "";
      oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/ForexRMRequired", vForexRMRequired);
    },
    onSelectForexRadio: function (oEvent) {
      var vForexRequired =oEvent.getParameter("selectedIndex");
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      if (vForexRequired == 1) {
        var oController = this;
//        var vSelectedPath = oEvent.getSource().getParent().getParent().getParent().getBindingContextPath();
        oController.getView().getModel("ModelSSUDigitization").setProperty(vSelectedPath + "/Nav_Forex", []);
      }
      vForexRequired = vForexRequired == 1 ? "X" : "";
      oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/ForexRequired", vForexRequired);
    },
    onSelectToolCRadio: function (oEvent) {
      var vToolCostRequired =oEvent.getParameter("selectedIndex") == 1 ? "X" : "";
//      vForexRequired = vForexRequired == 1 ? "X" : "";
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      oEvent.getSource().getModel("ModelSSUDigitization").setProperty(vSelectedPath+"/ToolCostRequired", vToolCostRequired);
    },
    onAddPartPrice: function () {

      var oController = this;
//      oController._fnGetTaxCodeService();
      var oItemFrag = xmlFragment(oController, "ItemDetails");
      // oItemFrag.getButtons()[0].setVisible(true);
      var oModel = new JSONModel(getItemDetailsObject());
      oItemFrag.setModel(oModel);
      oItemFrag.isAddNew = true;
      // oController.getView().getModel("ModelSSUDigitization").setProperty("/isAddNew", true);
      oItemFrag.open();
    },
    onOkItemDetail: function (oEvent) {
      var oController = this;
      var vAllFilled = oController._fnRequredFieldCheck((oEvent.getSource().getParent().getContent()[0]._aElements),"Frg1");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oFragItem = oEvent.getSource().getParent();
      var vChangedData = oFragItem.getModel().getData();
      var vSettlePrice = parseInt(vChangedData.SettledPrice); // Added by AGAWSA-CONT on 01.07.2023
      var vQuotedPrice = parseInt(vChangedData.QuotePrice); // Added by AGAWSA-CONT on 01.07.2023
      if (vAllFilled && oFragItem.isAddNew) { // oModelSSUDigitization.getProperty("/isAddNew")
        var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
        var oFilter = $.grep(oNav_Items, function (grepRow) {
          return ((vChangedData.Plant === grepRow.Plant) && (vChangedData.Vendor === grepRow.Vendor) && (vChangedData.PartNo === grepRow.PartNo));
        });
//        Add start by AGAWSA-CONT on 01.07.2023
        if (oFilter.length <= 0) {
          if(vQuotedPrice != 0 && vSettlePrice > vQuotedPrice){
          Message.warning("Settled Price is Greater than Quoted Price" , {
              actions: [Message.Action.OK, Message.Action.CANCEL],
              emphasizedAction: Message.Action.OK,
              onClose: function (sAction) {
                if(sAction == "OK"){
                  oController._setDataAfterEditItem(oFragItem);
                  oFragItem.close();
                }
              }
            });
        }else{
        oController._setDataAfterEditItem(oEvent);
              oEvent.getSource().getParent().close();
      }
//          oController._setDataAfterEditItem(oEvent);
//            oEvent.getSource().getParent().close();
//          Add end by AGAWSA-CONT on 01.07.2023
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
//      Insert start By AGAWSA-CONT on 01.07.2023
      var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
        var vMarkUp = oController._fnCalculationMarkUp(vChangedData);
        if(vQuotedPrice != 0 && vSettlePrice > vQuotedPrice){
        Message.warning("Settled Price is Greater than Quoted Price" , {
          actions: [Message.Action.OK, Message.Action.CANCEL],
          emphasizedAction: Message.Action.OK,
          onClose: function (sAction) {
            if(sAction == "OK"){
              oController._setDataAfterEditItem(oFragItem);
            oFragItem.close();
            }
          }
        });
      }else{
        oController._setDataAfterEditItem(oEvent);
            oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
            oEvent.getSource().getParent().close();
    }
// Insert end By AGAWSA-CONT on 01.07.2023
// Commented By AGAWSA-CONT on 01.07.2023
//        var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
////        var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
//        var vMarkUp = oController._fnCalculationMarkUp(vChangedData);
//
//        oController._setDataAfterEditItem(oEvent);
//        oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
//        oEvent.getSource().getParent().close();
// Commented By AGAWSA-CONT on 01.07.2023
      }
    },
    onAddNwItemRow: function (oEvent) { //add+ok error
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vChangedData = oEvent.getSource().getParent().getModel().getData();
      var vSelectedPath = "/PaperDataSet/Nav_Items/" + oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length;
      oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
      oModelSSUDigitization.setProperty("/SelectedPath", "");
    },
    onEdit: function () {
      var oController = this;
//      oController._fnLockUnlockService("X");
      oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", true);
      oController.getView().getModel("ModelSSUDigitization").setProperty("/BEValidation", false);
      oController.getView().getModel("ModelSSUDigitization").setProperty("/InitiatedBySSU", true);
    },
    onSave: function () {

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
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
              "oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
              success: function (oData, oResponse) {
                // oController._fnAfterGettingBEData(oData);//use after getting updated BE data
                /*$.each(oPaperData.Nav_Items, function (i, Row) { //need to remove after getting updated BE data
                  Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                  Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                  Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                });*/
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
//                      oController._fnGetNPIHeaderData(oData.NpiNo); //need to remove after getting updated BE data
                    }
                  });
                }else{
                  oController._fnAfterGettingBEData(oPaperData);
                }
              },
              error: function (oResponse) {
                /*$.each(oPaperData.Nav_Items, function (i, Row) {
                  Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                  Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                  Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                });*/
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
      if (oModelSSUDigitization.getProperty("/EditableFlag")) {
        oController.onSave();
      }
      oController._validationMass(oNav_Items);
    },
    onSubmit: function () {

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      /*var oArray = [];
      if (sap.ui.core.Element.registry) {
        sap.ui.core.Element.registry.forEach(function (row) {
          oArray.push(row)
        });
      }
      var oMandatoryFlag = oController._fnRequredFieldCheck(oArray);*/
      var vValiDataField = oController._validationDataFilled();

      if(!oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo")){
        Message.error("Save the Paper before Submit.", {
          title: "Information"
        });
        return;
      }

      if (vValiDataField && oModelSSUDigitization.getProperty("/BEValidation")) {
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
              oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
                success: function (oData, oResponse) {
                  oDialog.close();
                  var vMsgReturn = serviceSucess(oData.Nav_Ret.results);
                  if (vMsgReturn.Title == "Error") {
                    sap.m.MessageBox.error(vMsgReturn.Message, {
                      title: vMsgReturn.Title
                    });
                    oController._fnAfterGettingBEData(oPaperData);
                    /*$.each(oPaperData.Nav_Items, function (i, Row) {
                      Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                      Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                      Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                    });*/
                  } else if (vMsgReturn.Title == "Sucess") {
                    sap.m.MessageBox.success(vMsgReturn.Message, {
                      title: vMsgReturn.Title,
                      onClose: function () {
                        navParentBack();
                        /*var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
                        oRouter.navTo("Home");
                        if (oRouter.getView("com.mahindra.ZSSU_SPD.view.Home").getController())
                          oRouter.getView("com.mahindra.ZSSU_SPD.view.Home").getController()._fnGetMaster();*/
                      }
                    });
                  } else {
                    oController._fnAfterGettingBEData(oPaperData);
                  }
                  // oModelSSUDigitization.setProperty("/EditableFlag", false);
                },
                error: function (oResponse) {
                  /*$.each(oPaperData.Nav_Items, function (i, Row) {
                    Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                    Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                    Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                  });*/
                  oController._fnAfterGettingBEData(oPaperData);
                  serviceError(oResponse);
                }
              });
            }
          })
        });
        oDialog.open();
      } else {
        oModelSSUDigitization.setProperty("/EditableFlag", true);
//        oController._fnLockUnlockService("X");
        Message.error("fill all the mandatory fields", {
          title: "Fill all fields"
        });
      }
    },
    onPrintPreview: function () {
      var oController = this;
      var oPdfViewer = new sap.m.PDFViewer();
      var vNpiNo = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/NpiNo");
      var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF(NpiNo='" + vNpiNo + "',PaperCode='"+vPaperCode+"')/$value?sap-client=100");
//      oPdfViewer.setSource("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF('" + vNpiNo + "')/$value?sap-client=100");
      oPdfViewer.setTitle("SSU Price Paper");
      oPdfViewer.open();
    },
    onSettingPartDetails: function () {
      var oController = this;
      var vColumnListPath = "ModelSSUDigitization>/PartDet";
      columnsSetting(oController, vColumnListPath);
    },
    onSettingBRDetails: function () {
      var oController = this;
      var vColumnListPath = "ModelSSUDigitization>/BusinessReduction";
      columnsSetting(oController, vColumnListPath);
    },
    onSettingToolCost: function () {
      var oController = this;
      var vColumnListPath = "ModelSSUDigitization>/ToolCost";
      columnsSetting(oController, vColumnListPath);
    },
    onEditDispForex: function (oEvent) {
      var oController = this;
      var oForexFrag = xmlFragment(oController, "Forex");
      oForexFrag.setModel(oController._setEditFragmentModel(oEvent));
      oController._fnLoadFXIndexVal(oForexFrag.getModel().getProperty("/ForexIndex"));
      oForexFrag.open();
    },
    onPressFXDelete: function (oEvent) {
      var oController = this;
      var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
      Message.confirm("Are you sure you want to delete this.", {
        title: "Confirm Delete",
        onClose: function (oAction) {
          if (oAction == "OK") {
            var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
            var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
            if (oDeletedData.Posnr) {
              $.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
                if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
                  Row.Delete = "X";
              });
              oDeletedData.Delete = "X";
              var vSetDeltPath = vSelectedPath.split("/");
              vSetDeltPath.reverse().splice(0, 2);
              vSetDeltPath = vSetDeltPath.reverse().join("/");
              var oDeletedForex = oModelSSUDigitization.getProperty(vSetDeltPath + "/DeletedForex") ? oModelSSUDigitization.getProperty(
                vSetDeltPath + "/DeletedForex") : [];
              oDeletedForex.push(oDeletedData);
              oModelSSUDigitization.setProperty(vSetDeltPath + "/DeletedForex", oDeletedForex);
            }
            var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
            oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
            oModelSSUDigitization.refresh();
          }
        }
      });

    },
    onPressRMDelete: function (oEvent) {
      var oController = this;
      var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
      Message.confirm("Are you sure you want to delete this.", {
        title: "Confirm Delete",
        onClose: function (oAction) {
          if (oAction == "OK") {
            var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
            var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
            if (oDeletedData.Posnr) {
              $.each(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS"), function (i, Row) {
                if (Row.PartNo == oDeletedData.PartNo && Row.Plant == oDeletedData.Plant && Row.Vendor == oDeletedData.Vendor)
                  Row.Delete = "X";
              });
              oDeletedData.Delete = "X";
              var vSetDeltPath = vSelectedPath.split("/");
              vSetDeltPath.reverse().splice(0, 2);
              vSetDeltPath = vSetDeltPath.reverse().join("/");
              var oDeletedRM = oModelSSUDigitization.getProperty(vSetDeltPath + "/DeletedRM") ? oModelSSUDigitization.getProperty(
                vSetDeltPath +
                "/DeletedRM") : [];
              oDeletedRM.push(oDeletedData);
              oModelSSUDigitization.setProperty(vSetDeltPath + "/DeletedRM", oDeletedRM);
            }
            var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
            oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
            oModelSSUDigitization.refresh();
          }
        }
      });

    },
    onAddFRX: function (oEvent) {

      var oController = this;
      var oForexFrag = xmlFragment(oController, "Forex");
      // oForexFrag.getButtons()[0].setVisible(true);
      oForexFrag.setModel(new JSONModel(getForexObject()));
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedParentPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      var vSelectedPath = vSelectedParentPath + "/Nav_Forex/" + oModelSSUDigitization.getProperty(vSelectedParentPath + "/Nav_Forex").length
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
      oForexFrag.open();
    },
    onAddFRXContent: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vChangedData = oEvent.getSource().getParent().getModel().getData();
      var vSelectedParentPath = oModelSSUDigitization.getProperty("/SelectedPath");
      oModelSSUDigitization.setProperty(vSelectedParentPath, vChangedData);
      var vSelectedPath = vSelectedParentPath.split("/");
      vSelectedPath.pop();
      vSelectedPath.push((oModelSSUDigitization.getProperty(vSelectedPath.join("/")).length).toString());
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath.join("/"));
    },
    onForexOK: function (oEvent) {
      var oController = this;
      var vAllFilled = oController._fnRequredFieldCheck((oEvent.getSource().getParent().getContent()[0]._aElements),"Frg3");
      if (vAllFilled) {
        oController._setDataAfterEditItem(oEvent);
        oEvent.getSource().getParent().close();
      }
    },
    onForExContent: function (oEvent) {
      var oController = this;
      var oModel = oEvent.getSource().getModel();

      if (oEvent.getParameter("selectedItem")) {
        var vForExContent = oEvent.getParameter("selectedItem").getText();
        oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_IndexHelp(Commodity='" + vForExContent + "')", {
          success: function (oData, oResponse) {
            if (oModel.getData().hasOwnProperty("ForexCur")) {
              oController._fnLoadFXIndexVal(oData.IndexCyc);

              oModel.setProperty("/ForexIndex", oData.IndexCyc);
              oModel.setProperty("/ForexLandFact", oData.ConvFact);
            } else if (oModel.getData().hasOwnProperty("RmGrade")) {
              oController._fnLoadIndexRMVal(oData.IndexCyc);

              oModel.setProperty("/RmIndexCycle", oData.IndexCyc);
              oModel.setProperty("/RmLandingFact", oData.ConvFact);
            }
          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });
      }

    },
    onEditDispRM: function (oEvent) {
      var oController = this;
      var oRMFrag = xmlFragment(oController, "RMDetails");
      oRMFrag.setModel(oController._setEditFragmentModel(oEvent));
      oController._fnLoadIndexRMVal(oRMFrag.getModel().getProperty("/RmIndexCycle"));
      oRMFrag.open();
    },
    onAddRM: function (oEvent) {
      var oController = this;
      var oRMFrag = xmlFragment(oController, "RMDetails");
      // oRMFrag.getButtons()[0].setVisible(true);
      oRMFrag.setModel(new JSONModel(getRMObject()));
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedParentPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      var vSelectedPath = vSelectedParentPath + "/Nav_RM/" + oModelSSUDigitization.getProperty(vSelectedParentPath + "/Nav_RM").length
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
      oRMFrag.open();
    },
    onAddRMContent: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vChangedData = oEvent.getSource().getParent().getModel().getData();
      var vSelectedParentPath = oModelSSUDigitization.getProperty("/SelectedPath");
      oModelSSUDigitization.setProperty(vSelectedParentPath, vChangedData);
      var vSelectedPath = vSelectedParentPath.split("/");
      vSelectedPath.pop();
      vSelectedPath.push((oModelSSUDigitization.getProperty(vSelectedPath.join("/")).length).toString());
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath.join("/"));
    },
    onRmOK: function (oEvent) {
      var oController = this;
      var vAllFilled = oController._fnRequredFieldCheck((oEvent.getSource().getParent().getContent()[0]._aElements),"Frg3");
      if (vAllFilled) {

        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var vSelectedParentPath = oModelSSUDigitization.getProperty("/SelectedPath");
        var vSelectedPath = vSelectedParentPath.split("/");
        vSelectedPath.pop();
        vSelectedPath.pop();
        vSelectedPath = vSelectedPath.join("/");
        var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
        var vMarkUp = oController._fnCalculationMarkUp(oItem);

        oController._setDataAfterEditItem(oEvent);
        oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
        oEvent.getSource().getParent().close();
      }
    },
    onFXAttachment: function (oEvent) {
      var oController = this;
      var oAttachFrag = parentXmlFragment(oController, "AttachmentOld");
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
        new sap.ui.model.Filter("FrxRmStatus", sap.ui.model.FilterOperator.EQ, "FX"),
        new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
      ];
      oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
      oAttachFrag.open();
    },
    onRMAttachment: function (oEvent) {
      var oController = this;
      var oAttachFrag = parentXmlFragment(oController, "AttachmentOld");
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
        new sap.ui.model.Filter("FrxRmStatus", sap.ui.model.FilterOperator.EQ, "RM"),
        new sap.ui.model.Filter("Delete", sap.ui.model.FilterOperator.NE, "X")
      ];
      oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
      oAttachFrag.open();
    },
    onAttachment: function (oEvent) {
      var oController = this;
      var oAttachFrag = parentXmlFragment(oController, "AttachmentOld");
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
    /*onAttachDeleted: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedPath = oEvent.getParameter("item").getBindingContext("ModelSSUDigitization").getPath();
      var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
      if (oDeletedData.Posnr != "") {
        oDeletedData.Delete = "X";
        var oDeletedItems = oModelSSUDigitization.getProperty("/PaperDataSet/DeletedDMS") ? oModelSSUDigitization.getProperty(
          "/PaperDataSet/DeletedDMS") : [];
        oDeletedItems.push(oDeletedData);
        oModelSSUDigitization.setProperty("/PaperDataSet/DeletedDMS", oDeletedItems);
      }
      var vSelectedIndex = Number(vSelectedPath.slice(vSelectedPath.lastIndexOf("/") + 1));
      oModelSSUDigitization.getProperty(vSelectedPath.substr(0, vSelectedPath.lastIndexOf("/"))).splice(vSelectedIndex, 1);
      oModelSSUDigitization.refresh();
    },*/
    onAttachDeleted: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oNavDms = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
//      var vSelectedIndex;
      $.each(oNavDms,function(i,row){
        if(row.Posnr+row.TabId == oEvent.getParameter("documentId")){
          var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
          oDataNewPinfoModel.remove("/ES_DMS(Filekey='"+row.Filekey+"',TabId='"+row.TabId+"',Posnr='"+row.Posnr+"')/$value", {
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
    onExpandToolCost: function (oEvent) {
      var oController = this;
      var oTableToolcost = sap.ui.getCore().byId(oEvent.getSource().getContent()[1].getId());

      if (oEvent.getParameter("expand") && !oTableToolcost.getBindingInfo("columns")) {
        var vColumnListPath = "ModelSSUDigitization>/ToolCost";
        var vTableBindingPath = "ModelSSUDigitization";
        var oAction = new sap.m.HBox({
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
              type: "{ModelSSUDigitization>ErrorTC}",
              visible: "{ModelSSUDigitization>/EditableFlag}",
              press: function (oEvent) {
                var oToolCostFrag = xmlFragment(oController, "ToolCost");
                oToolCostFrag.setModel(oController._setEditFragmentModel(oEvent));
                oToolCostFrag.open();
              }
            }),
            new sap.m.Button({
              icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
              tooltip: "Display",
              visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
              press: function (oEvent) {
                var oToolCostFrag = xmlFragment(oController, "ToolCost");
                oToolCostFrag.setModel(oController._setDisplayFragmentModel(oEvent));
                oToolCostFrag.open();
              }

            }),
            new sap.m.Button({
              icon: "{ModelDefaultDataSet>/Icon/clearIcon}",
              tooltip: "Clear",
              type: "Reject",
              visible: {
                parts: [
                  'ModelSSUDigitization>/EditableFlag',
                  'ModelSSUDigitization>ToolCostRequired'
                ],
                formatter: function (vEditable, vToolReq) {
                  return vEditable && (vToolReq == "X" ? true : false);
                }
              },
              press: function (oEvent) {
                var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
                oController._fnClearToolData(vSelectedPath);
              }
            })
          ]
        });
        createDynamicMTable(oController, oTableToolcost, vColumnListPath, vTableBindingPath, oAction);
      }

    },
    onToolOk: function (oEvent) {
      var oController = this;
      var vAllFilled = oController._fnRequredFieldCheck((oEvent.getSource().getParent().getContent()[0]._aElements),"Frg2");
      if (vAllFilled) {
        oController._setDataAfterEditItem(oEvent);
        oEvent.getSource().getParent().close();
      }
    },
    onExpandBR: function (oEvent) {
      var oController = this;
      var oTableBRDetails = sap.ui.getCore().byId(oEvent.getSource().getContent()[1].getId());
      if (oEvent.getParameter("expand") && !oTableBRDetails.getBindingInfo("columns")) {
        var vColumnListPath = "ModelSSUDigitization>/BusinessReduction";
        var vTableBindingPath = "ModelSSUDigitization";

        var oActionBR = new sap.m.HBox({
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
              type: "{ModelSSUDigitization>ErrorBR}",
              visible: "{ModelSSUDigitization>/EditableFlag}",
              press: function (oEvent) {
                var oBRFrag = xmlFragment(oController, "BusinessReduction");
                oBRFrag.setModel(oController._setEditFragmentModel(oEvent));
                oBRFrag.open();
              }
            }),
            new sap.m.Button({
              icon: "{ModelDefaultDataSet>/Icon/displayIcon}",
              tooltip: "Display",
              visible: "{parts: [{path:'ModelSSUDigitization>/DisplayOnlyFlag'},{path:'ModelSSUDigitization>/EditableFlag'}], formatter: 'formatterDisplayVisible'}",
              press: function (oEvent) {
                var oBRFrag = xmlFragment(oController, "BusinessReduction");
                oBRFrag.setModel(oController._setDisplayFragmentModel(oEvent));
                oBRFrag.open();
              }
            })
          ]
        });
        createDynamicMTable(oController, oTableBRDetails, vColumnListPath, vTableBindingPath, oActionBR);
      }
    },
    onBusiReduOk: function (oEvent) {
      var oController = this;
      var vAllFilled = oController._fnRequredFieldCheck((oEvent.getSource().getParent().getContent()[0]._aElements), "Frg3");
      if (vAllFilled) {
        oController._setDataAfterEditItem(oEvent);
        oEvent.getSource().getParent().close();
      }
    },
    onTaxonamyValHelp: function (oEvent) {
      var oController = this;
      var oTaxonomyFrag = xmlFragment(oController, "Taxonomy");
      oTaxonomyFrag.oParentController = oEvent.getSource();
      var taxJSON = new JSONModel();
      busyDialog.open();
      oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_Taxonomy", {
        success: function (oData, oResponse) {
          busyDialog.close();
          var oDataTemp = {
            "SelectedLevel": 1,
            "NextVisible": true,
            "TableData": oData.results
          };
          taxJSON.setData(oDataTemp);
          oTaxonomyFrag.setModel(taxJSON, "TaxonamyModel");
          oTaxonomyFrag.open();
        },
        error: function (oResponse) {
          serviceError(oResponse);
          busyDialog.close();
        }
      });
      oTaxonomyFrag.getAggregation("content")[0].attachBrowserEvent("dblclick", function () {
        // var oController = this;
        var vSelectedPath = this.getSelectedContextPaths()[0];
        if (this.getModel("TaxonamyModel").getProperty(vSelectedPath + "/Level") == 5)
          oController.onChooseTaxonamy(this);
        else
          oController.onNextTaxonamy(this);
      });
    },
    onNextTaxonamy: function (oEvent) {
      var oController = this;
      var oDialog;
      if (oEvent.getId() == "press") {
        oDialog = oEvent.getSource().getParent();
        var vSelectedPath = oDialog.getContent()[0].getSelectedContextPaths()[0];
      } else {
        oDialog = oEvent.getParent();
        var vSelectedPath = oEvent.getSelectedContextPaths()[0];
      }

      var oTaxonamyModel = oDialog.getModel("TaxonamyModel");
      var oHeaderToolBar = oDialog.getContent()[0].getHeaderToolbar();
      var vSelectedLevel = oTaxonamyModel.getProperty("/SelectedLevel");

      if (oTaxonamyModel.getProperty(vSelectedPath + "/Level") && oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy")) {
        var oDetailTaxonomy = {
          "Level": oTaxonamyModel.getProperty(vSelectedPath + "/Level"),
          "Taxonomy": oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy")
        };

        oHeaderToolBar.addContent(new sap.m.Link({
          "text": oTaxonamyModel.getProperty(vSelectedPath + "/TaxDesc"),
          "wrapping": true,
          press: function (e) {
            var oDetailTaxonomy = e.getSource().data();
            for (var i = 6; i > ((Number(oDetailTaxonomy.Level)) * 2) - 1; i--) {
              e.oSource.getParent().removeContent(i);
            }
            oController._nextTaxonomyService(oDetailTaxonomy, oTaxonamyModel);
            oTaxonamyModel.setProperty("/NextVisible", true);
          }
        }).data(oDetailTaxonomy));
        oController._nextTaxonomyService(oDetailTaxonomy, oTaxonamyModel);
        if (oTaxonamyModel.getProperty(vSelectedPath + "/Level") == 4) {
          oTaxonamyModel.setProperty("/NextVisible", false);
        } else {
          oHeaderToolBar.addContent(new sap.m.Label({
            "text": ">",
            "design": "Bold"
          }));
        }
      } else {
        sap.m.MessageToast.show("Select one from list");
      }

      // vSelectedLevel++;
      // oTaxonamyModel.setProperty("/SelectedLevel", vSelectedLevel);

    },
    _nextTaxonomyService: function (oDetailTaxonomy, oTaxonamyModel) {
      var oController = this;
      var filters = [];
      filters.push(new sap.ui.model.Filter("Level", sap.ui.model.FilterOperator.EQ, oDetailTaxonomy.Level));
      filters.push(new sap.ui.model.Filter("Taxonomy", sap.ui.model.FilterOperator.EQ, oDetailTaxonomy.Taxonomy));
      busyDialog.open();
      oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_TaxLevel", {
        filters: filters,
        success: function (oData, oResponse) {
          oTaxonamyModel.setProperty("/TableData", oData.results);
          busyDialog.close();
        },
        error: function (oResponse) {
          serviceError(oResponse);
          busyDialog.close();
        }
      });
    },
    onChooseTaxonamy: function (oEvent) {
      var oController = this;
      var oDialog;
      if (oEvent.getId() == "press") {
        oDialog = oEvent.getSource().getParent();
        var vSelectedPath = oDialog.getContent()[0].getSelectedContextPaths()[0];
      } else {
        oDialog = oEvent.getParent();
        var vSelectedPath = oEvent.getSelectedContextPaths()[0];
      }
      var oTaxonamyModel = oDialog.getModel("TaxonamyModel");
      if (oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy")) {
        oDialog.oParentController.setValue(oTaxonamyModel.getProperty(vSelectedPath + "/Taxonomy"));
        oDialog.close();
      } else {
        sap.m.MessageToast.show("Select one from list");
      }

    },
    onTaxonomySetting: function () {
      var oController = this;
      var oTaxonomySettingFrag = xmlFragment(oController, "TaxonomySetting");

      oTaxonomySettingFrag.open();
    },
    onTaxonomySettingOK: function () {
      // debugger;
    },
    onDownldTempPartDet: function () {
//      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
//      window.open("/sap/opu/odata/sap/ZMM_SSU_NPI_SRV/ES_NPI_PDF(NpiNo='',PaperCode='"+vPaperCode+"')/$value");
             // Added by REDDRA-CONT on 18-12-2021
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
            if (vExcelDataArray.length > 1 && vExcelDataArray.length <= 51) {
              vExcelDataArray.splice(0, 1);
              oController._fnMassDataSet(vExcelDataArray);
            } else if (vExcelDataArray.length > 51) {
              sap.m.MessageToast.show("Uploaded excel sheet data exceed. Maximum 50 rows.");
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

    onErrMsgValueHelp: function (e) {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ErrorMsgPopOver");
      oValueHelp.toggle(e.getSource());

      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var val = selectedPath.split("/")[3];
      var ErrorData = oModelSSUDigitization.getProperty("/Validation").Nav_ItemsX[val];
      var oValidationError = [];
//    Add start by AGAWSA-CONT SF1K92101
      if (ErrorData.PriceunitFlag != "") {
        oValidationError.push({
          "BEError": ErrorData.PriceunitFlag,
          "BEErrorType": "Warning",
          "Priority": 1
        });
      };
      if (ErrorData.PlantFlag != "") {
        oValidationError.push({
          "BEError": ErrorData.PlantFlag,
          "BEErrorType": "Error",
          "Priority": 0
        });
      }else{
        oValidationError.push({
          "BEError": "Plant " + ErrorData.Plant + " validated successfully",
          "BEErrorType": "Success",
          "Priority": 2
        });
      };
      if (ErrorData.PartNoFlag != "") {
        oValidationError.push({
          "BEError": ErrorData.PartNoFlag,
          "BEErrorType": "Error",
          "Priority": 0
        });
      }else{
        oValidationError.push({
          "BEError": "Part No: " + ErrorData.PartNo + " validated successfully",
          "BEErrorType": "Success",
          "Priority": 2
        });
      };
      if (ErrorData.VendorFlag != "") {
        oValidationError.push({
          "BEError": ErrorData.VendorFlag,
          "BEErrorType": "Error",
          "Priority": 0
        });
      }else{
        oValidationError.push({
          "BEError": "Vendor " + ErrorData.Vendor + " validated successfully",
          "BEErrorType": "Success",
          "Priority": 2
        });
      };
      if (ErrorData.TaxcodeFalg != "") {
        oValidationError.push({
          "BEError": ErrorData.TaxcodeFalg,
          "BEErrorType": "Error",
          "Priority": 0
        });
      }else{
        oValidationError.push({
          "BEError": "Taxcode " + ErrorData.Taxcode + " validated successfully",
          "BEErrorType": "Success",
          "Priority": 2
        });
      };
      if (ErrorData.TaxonomyFlag != "") {
        oValidationError.push({
          "BEError": ErrorData.TaxonomyFlag,
          "BEErrorType": "Error",
          "Priority": 0
        });
      }else{
        oValidationError.push({
          "BEError": "Taxonomy " + ErrorData.Taxonomy + " validated successfully",
          "BEErrorType": "Success",
          "Priority": 2
        });
      };
      if (ErrorData.QuotedPriceFlag != "") {
        oValidationError.push({
          "BEError": ErrorData.QuotedPriceFlag,
          "BEErrorType": "Warning",
          "Priority": 1
        });
      };
      oValidationError.sort(function(a,b){
        if(a.Priority < b.Priority){
          return -1;
        }
        if(a.Priority > b.Priority){
          return 1;
        }
        return 0;
      })
//    Add end by AGAWSA-CONT SF1K92101
//      if (ErrorData.PartNoFlag != "") {
//        oValidationError.push({
//          "BEError": ErrorData.PartNoFlag
//        });
//      };
//      if (ErrorData.VendorFlag != "") {
//        oValidationError.push({
//          "BEError": ErrorData.VendorFlag
//        });
//      };
//      if (ErrorData.TaxcodeFalg != "") {
//        oValidationError.push({
//          "BEError": ErrorData.TaxcodeFalg
//        });
//      };
//      if (ErrorData.TaxonomyFlag != "") {
//        oValidationError.push({
//          "BEError": ErrorData.TaxonomyFlag
//        });
//      };
//      if (ErrorData.PlantFlag != "") {
//        oValidationError.push({
//          "BEError": ErrorData.PlantFlag
//        });
//      };
      oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
    },

    onRMErrMsgValueHelp: function (e) {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ErrorMsgPopOver");
      oValueHelp.toggle(e.getSource());

      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var val = selectedPath.split("/")[3];
      var ErrorData1 = oModelSSUDigitization.getProperty("/Validation").Nav_ItemsX[val];
      var val2 = selectedPath.split("/")[5];
      var oNav = selectedPath.split("/")[4] + "X";
      var oValidationError = [];
      if (oNav == "Nav_RMX") {
        var ErrorData = ErrorData1.Nav_RMX[val2];
        if (ErrorData.RmGradeFlag != "") {
          oValidationError.push({
            "BEError": ErrorData.RmGradeFlag
          });
        };
        if (ErrorData.RmIndexCycleFlag != "") {
          oValidationError.push({
            "BEError": ErrorData.RmIndexCycleFlag
          });
        };
        if (ErrorData.RmLandingFactFlag != "") {
          oValidationError.push({
            "BEError": ErrorData.RmLandingFactFlag
          });
        };
      } else if (oNav == "Nav_ForexX") {
        var ErrorData = ErrorData1.Nav_ForexX[val2];
        if (ErrorData.ForexCurFlag != "") {
          oValidationError.push({
            "BEError": ErrorData.ForexCurFlag
          });
        };
        if (ErrorData.ForexIndexFlag != "") {
          oValidationError.push({
            "BEError": ErrorData.ForexIndexFlag
          });
        };
        if (ErrorData.ForexLandFactFlag != "") {
          oValidationError.push({
            "BEError": ErrorData.ForexLandFactFlag
          });
        };
      }

      oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
    },

    onSectorFinish: function (oEvent) {
      this._getModelPlant(oEvent.getSource().getSelectedKeys());
    },
    /*onModelTokenUpd: function (oEvent) {
      debugger;
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      oModelSSUDigitization.setProperty("/PaperDataSet/Model", oEvent.getParameter("addedTokens")[0].getKey());
      var oSelectedKeys = oEvent.getSource().getSelectedKeys();
      if(oSelectedKeys.toString().length > 100 ) {
        oSelectedKeys.splice(oSelectedKeys.indexOf(oEvent.getParameter("changedItem").getKey()),1);
        oEvent.getSource().setSelectedKeys(oSelectedKeys);
        sap.m.MessageToast.show("Reached maximum selection");
      }
      if (oEvent.getSource().getSelectedKeys().length > 0) {
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        oModelSSUDigitization.setProperty("/PaperDataSet/Model", oEvent.getSource().getSelectedKeys());
      }
    },*/

    oModelSelection: function () {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ModelDialog");
      oValueHelp.open();
    },
    /*oModelSelection: function (oEvent) {
      var oController = this;
      var oValueHelp = xmlFragment(oController, "ModelDialog");
      oValueHelp.open();

      var oSelectedKeys = oEvent.getSource().getSelectedKeys();
      if(oSelectedKeys.toString().length > 100 ) {
        oSelectedKeys.splice(oSelectedKeys.indexOf(oEvent.getParameter("changedItem").getKey()),1);
        oEvent.getSource().setSelectedKeys(oSelectedKeys);
        sap.m.MessageToast.show("Reached maximum selection");
      }
      if (oEvent.getSource().getSelectedKeys().length > 0) {
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        oModelSSUDigitization.setProperty("/PaperDataSet/Model", oEvent.getSource().getSelectedKeys());
      }
    },*/
    onPartValueHelp: function (oEvent) {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ValueHelp");
      oValueHelp.setTitle("Child Part Number");
      var template = new sap.m.StandardListItem({
        title: "{PartNo}",
        description: "{PartDesc}"
      });
      oValueHelp.bindAggregation("items", "/", template);
      oValueHelp.setModel(new JSONModel());
      oValueHelp.parentModel = oEvent.getSource().getBindingContext().getModel();
      oValueHelp.open();
    },
    onParentPartValueHelp: function (oEvent) {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ValueHelp");
      oValueHelp.setTitle("Parent Part Number");
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
        info: "{VendLoc}"
      });
      oVendor.bindAggregation("items", "/", template);
      oVendor.setModel(new JSONModel());
      oVendor.parentModel = e.getSource().getBindingContext().getModel();
      oVendor.open();
    },
    onPurcValueHelp: function (e) {
      var oController = this;
      var oValueHelp = parentXmlFragment(oController, "ValueHelp");
      oValueHelp.setTitle("Purchase Group");
      var template = new sap.m.StandardListItem({
        title: "{PurcGroupDesc}",
        description: "{PurcGroup}"
      });
      oValueHelp.bindAggregation("items", "/", template);
      oValueHelp.parentModel = e.getSource().getBindingContext().getModel();
      oValueHelp.setBusy(true);
      oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_PurcGroup", {
        success: function (oData, oResponse) {
          oValueHelp.setModel(new JSONModel(oData.results));
          oValueHelp.setBusy(false);
        },
        error: function (oResponse) {
          oValueHelp.setModel(new JSONModel());
          oValueHelp.setBusy(false);
        }
      });
      oValueHelp.open();
    },
    handleClose: function (e) {
      var oSelectedItem = e.getParameter("selectedItem");
      var oController = this;
      if (oSelectedItem) {
        var oSelectedData = e.getSource().getModel().getProperty(oSelectedItem.getBindingContextPath());
        var oParentModel = e.getSource().parentModel;
        if (e.getSource().getTitle() == "Child Part Number") {
          oParentModel.setProperty("/PartNo", oSelectedData.PartNo);
          oParentModel.setProperty("/PartDesc", oSelectedData.PartDesc);
          oParentModel.setProperty("/Purgrp", oSelectedData.PurchGroup);
//          oParentModel.setProperty("/NetWtUnit", oSelectedData.NetWtUnit);

        }
        if (e.getSource().getTitle() == "Parent Part Number") {
          oParentModel.setProperty("/PRPartNo", oSelectedData.PartNo);
          oParentModel.setProperty("/PRPartDesc", oSelectedData.PartDesc);
        }
        if (e.getSource().getTitle() == "Vendor Search") {

          oParentModel.setProperty("/VName", oSelectedData.VendName);
          oParentModel.setProperty("/Vendor", oSelectedData.VendCode);
          oParentModel.setProperty("/VLocation", oSelectedData.VendLoc);
          oParentModel.setProperty("/Currency", oSelectedData.CurrCode);

          oParentModel.setProperty("/CondType", oSelectedData.CondType);
          oParentModel.setProperty("/CondTypText", oSelectedData.CondTypText);
          oParentModel.setProperty("/CondPrcnt", oSelectedData.CondPrcnt);
          oParentModel.setProperty("/CondUnit", oSelectedData.CondUnit);

          oController._fnGetTaxCodeService(e.getSource().parentModel);

          oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_Terms(VendCode='" + oSelectedData.VendCode +
            "',Plant='" +
            oParentModel.getProperty("/Plant") + "')", {
              success: function (oData, oResponse) {
                oParentModel.setProperty("/DelTerms", oData.DeliveryTerms);
                oParentModel.setProperty("/PaymntTerms", oData.PaymentTerms);
              },
              error: function (oResponse) {}
            });

        }
        if (e.getSource().getTitle() == "Purchase Group") {
          oParentModel.setProperty("/Purgrp", oSelectedData.PurcGroup);
        }
      }
    },
    handleSearch: function (e) {
      var vSelectedValue = e.getParameter("value").toUpperCase();
      var filters = [];
      var oController = this;
      var valueHelp = e.getSource();
      var oDataNewPinfoModel = this.getOwnerComponent().getModel("oDataNewPinfoModel");
      var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var plant = e.getSource().parentModel.getProperty("/Plant");
      var PartNo = e.getSource().parentModel.getProperty("/PartNo");
      if (e.getSource().getTitle() == "Vendor Search") {
        if (vSelectedValue.length > 4) {
          valueHelp.setBusy(true);

          filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));
          filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
          filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
          filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X"));
          filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
          oDataNewPinfoModel.read("/ES_Vendor", {
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
      } else if (e.getSource().getTitle() == "Child Part Number" || e.getSource().getTitle() == "Parent Part Number" ) {
        if (vSelectedValue.length > 4) {
          valueHelp.setBusy(true);
          oDataNewPinfoModel.read("/ES_Part", {
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
      } else {
        var nameFilter = [];
        if (vSelectedValue != "") {
          nameFilter = new sap.ui.model.Filter("PurcGroup", sap.ui.model.FilterOperator.Contains, vSelectedValue);
        }
        var binding = valueHelp.getBinding("items");
        binding.filter(nameFilter);
      }

    },
    onPlantCode: function (oEvent) {
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      oParentModel.setProperty("/PartNo", "");
      oParentModel.setProperty("/PartDesc", "");
      // oParentModel.setProperty("/Purg?rp", oSelectedData.PurchGroup);
      // oParentModel.setProperty("/NetWtUnit", oSelectedData.NetWtUnit);
      oParentModel.setProperty("/Vendor", "");
      oParentModel.setProperty("/VName", "");
      oParentModel.setProperty("/VLocation", "");
      oParentModel.setProperty("/Currency", "");
      oParentModel.setProperty("/DelTerms", "");
      oParentModel.setProperty("/PaymntTerms", "");

      oParentModel.setProperty("/CondType", "");
      oParentModel.setProperty("/CondTypText", "");
      oParentModel.setProperty("/CondPrcnt", "");
      oParentModel.setProperty("/CondUnit", "");

    },
    onSubmitVendorCode: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      var vPaperCode = oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var filters = [];
      var vVendName = "";
      var vVendCode = "";
      var vVendLoc = "";
      var vCurrCode = "";
      var vDelTerms = "";
      var vPaymntTerms = "";

      var vCondType = "";
      var vCondTypText = "";
      var vCondPrcnt = "";
      var vCondUnit = "";
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        oController._fnGetTaxCodeService(oParentModel);
        filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/PartNo")));
        filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParentModel.getProperty("/Plant")));
        filters.push(new sap.ui.model.Filter("VendCode", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, ""));
        filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
        busyDialog.open();
        oDataNewPinfoModel.read("/ES_Vendor", {
          filters: filters,
          success: function (oData, oResponse) {
            if (oData.results.length > 0 && oData.results[0].Message == "") {
              vVendName = oData.results[0].VendName;
              vVendCode = oData.results[0].VendCode;
              vVendLoc = oData.results[0].VendLoc;
              vCurrCode = oData.results[0].CurrCode;

              vCondType = oData.results[0].CondType;
              vCondTypText = oData.results[0].CondTypText;
              vCondPrcnt = oData.results[0].CondPrcnt;
              vCondUnit = oData.results[0].CondUnit;

              oDataNewPinfoModel.read("/ES_Terms(VendCode='" + vVendCode + "',Plant='" + oParentModel.getProperty("/Plant") + "')", {
                success: function (oData, oResponse) {
                  busyDialog.close();
                  vDelTerms = oData.DeliveryTerms;
                  vPaymntTerms = oData.PaymentTerms;
                  oParentModel.setProperty("/DelTerms", vDelTerms);
                  oParentModel.setProperty("/PaymntTerms", vPaymntTerms);
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

            oParentModel.setProperty("/CondType", vCondType);
            oParentModel.setProperty("/CondTypText", vCondTypText);
            oParentModel.setProperty("/CondPrcnt", vCondPrcnt);
            oParentModel.setProperty("/CondUnit", vCondUnit);
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
        oParentModel.setProperty("/DelTerms", vDelTerms);
        oParentModel.setProperty("/PaymntTerms", vPaymntTerms);

        oParentModel.setProperty("/CondType", vCondType);
        oParentModel.setProperty("/CondTypText", vCondTypText);
        oParentModel.setProperty("/CondPrcnt", vCondPrcnt);
        oParentModel.setProperty("/CondUnit", vCondUnit);
      }

    },
    onSubmitPartNum: function (oEvent) {

      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      var plant = oParentModel.getProperty("/Plant");
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        busyDialog.open();
        oDataNewPinfoModel.read("/ES_Part", {
          filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
            .FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
          success: function (oData, oResponse) {
            busyDialog.close();
            if (oData.results.length > 0 && oData.results[0].Message == "") {
              oParentModel.setProperty("/PartNo", oData.results[0].PartNo);
              oParentModel.setProperty("/PartDesc", oData.results[0].PartDesc);
              oParentModel.setProperty("/Purgrp", oData.results[0].PurchGroup);
//              oParentModel.setProperty("/NetWtUnit", oData.results[0].NetWtUnit);
            } else {
              if(oData.results[0] && oData.results[0].Message != "")
                Message.error(oData.results[0].Message, { title: "Error" });
//              sap.m.MessageToast.show(vSelectedValue + " is not extended for " + plant + " plant.");
              oParentModel.setProperty("/PartNo", "");
              oParentModel.setProperty("/PartDesc", "");
              oParentModel.setProperty("/Purgrp", "");
//              oParentModel.setProperty("/NetWtUnit", "");
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
        oParentModel.setProperty("/Purgrp", "");
        oParentModel.setProperty("/NetWtUnit", "");
      }

    },
    onSubmitParentPartNum: function (oEvent) {

      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      var plant = oParentModel.getProperty("/Plant");
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      if (vSelectedValue.length > 0) {
        busyDialog.open();
        oDataNewPinfoModel.read("/ES_Part", {
          filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant), new sap.ui.model.Filter("PartNo", sap.ui.model
            .FilterOperator.EQ, vSelectedValue),new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "")],
          success: function (oData, oResponse) {
            busyDialog.close();
            if (oData.results.length > 0 && oData.results[0].Message == "") {
              oParentModel.setProperty("/PRPartNo", oData.results[0].PartNo);
              oParentModel.setProperty("/PRPartDesc", oData.results[0].PartDesc);

            } else {
              if(oData.results[0] && oData.results[0].Message != "")
                Message.error(oData.results[0].Message, { title: "Error" });
//              sap.m.MessageToast.show(vSelectedValue + " is not extended for " + plant + " plant.");
              oParentModel.setProperty("/PRPartNo", "");
              oParentModel.setProperty("/PRPartDesc", "");

            }

          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });
      } else {
        busyDialog.close();
        sap.m.MessageToast.show("Maintain part number.");
        oParentModel.setProperty("/PRPartNo", "");
        oParentModel.setProperty("/PR_PART_DESC", "");

      }

    },
    OnTaxCodeChange: function (oEvent) {
      var oController = this;
      var oModel = oEvent.getSource().getModel();
      if (oEvent.getParameter("itemPressed")) {
        oModel.setProperty("/TcDesc", oEvent.getSource().getSelectedItem().getAdditionalText());
      } else {
        var vSelectedValue = oEvent.getParameter("value");
        oEvent.getSource().setValue(vSelectedValue.toUpperCase())
        if (vSelectedValue.length == 2) {
          oController.getOwnerComponent().getModel("oDataNewPinfoModel").read("/ES_TaxCode(TaxCode='" + vSelectedValue + "')", {
            success: function (oData, oResponse) {
              oModel.setProperty("/TcDesc", oData.TaxCodeDes);
              oModel.setProperty("/Taxcode", vSelectedValue);
            },
            error: function (oResponse) {
              Message.error("Error while getting reading tax description.", {
                title: "Error"
              });
            }
          });
        }
      }
    },

    onUploadCompleteSB: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oFile = oEvent.getSource()._getFileUploader()._aXhr.shift().file;
      var oDate = new Date();
      var oData = {
        "Filekey": "",
        "TabId": "SB",
        "PartNo": "",
        "Plant": "",
        "Vendor": "",
        "FrxRmStatus": "",
        "Posnr": "",
        "Doknr": "",
        "Dokar": "",
        "Dokvr": "",
        "Doktl": "",
        "Filename": oFile['name'],
        "Filedesc": oFile['type'],
        "Filesize": oFile['size'].toString(),
        "CreatedBy": oModelSSUDigitization.getProperty("/UserId"), //oModelSSUDigitization.UserId,
        "CreatedOn": oDate, //.join(""),
        "Filecontents": "",
        "FileCatg": "",
        "Delete": ""
      }
      this.onConvertToBase64(oData, oFile)
    },
    onUploadCompleteLB: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oFile = oEvent.getSource()._getFileUploader()._aXhr.shift().file;
      var oDate = new Date();
      var oData = {
        "Filekey": "",
        "TabId": "SCB",
        "PartNo": "",
        "Plant": "",
        "Vendor": "",
        "FrxRmStatus": "",
        "Posnr": "",
        "Doknr": "",
        "Dokar": "",
        "Dokvr": "",
        "Doktl": "",
        "Filename": oFile['name'],
        "Filedesc": oFile['type'],
        "Filesize": oFile['size'].toString(),
        "CreatedBy": oModelSSUDigitization.getProperty("/UserId"), //oModelSSUDigitization.UserId,
        "CreatedOn": oDate, //.join(""),
        "Filecontents": "",
        "FileCatg": "",
        "Delete": ""
      }
      this.onConvertToBase64(oData, oFile)
    },
    onUploadCompleteVMM: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oFile = oEvent.getSource()._getFileUploader()._aXhr.shift().file;
      var oDate = new Date();
      var oData = {
        "Filekey": "",
        "TabId": "VMM",
        "PartNo": "",
        "Plant": "",
        "Vendor": "",
        "FrxRmStatus": "",
        "Posnr": "",
        "Doknr": "",
        "Dokar": "",
        "Dokvr": "",
        "Doktl": "",
        "Filename": oFile['name'],
        "Filedesc": oFile['type'],
        "Filesize": oFile['size'].toString(),
        "CreatedBy": oModelSSUDigitization.getProperty("/UserId"), //oModelSSUDigitization.UserId,
        "CreatedOn": oDate, //.join(""),
        "Filecontents": "",
        "FileCatg": "",
        "Delete": ""
      }
      this.onConvertToBase64(oData, oFile)
    },

    onUploadFragComplete: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oFile = oEvent.getSource()._getFileUploader()._aXhr.shift().file;
      var oDate = new Date();
      var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var vFrxRmStatus = "";
      var vParent = vSelectedPath.split("/");
      vParent.splice(4, 2);
      vParent = vParent.join("/");
      var vTemp = vSelectedPath.split("/");
      vTemp = vTemp.splice(4, 1);
      if (vTemp[0] == "Nav_Forex") {
        vFrxRmStatus = "FX";
      } else if (vTemp[0] == "Nav_RM") {
        vFrxRmStatus = "RM";
      }
      var oData = {
        "Filekey": "",
        "TabId": oModelSSUDigitization.getProperty("/SelectedTab"),
        "PartNo": oModelSSUDigitization.getProperty(vParent + "/PartNo"),
        "Plant": oModelSSUDigitization.getProperty(vParent + "/Plant"),
        "Vendor": oModelSSUDigitization.getProperty(vParent + "/Vendor"),
        "FrxRmStatus": vFrxRmStatus,
        "Posnr": "",
        "Doknr": "",
        "Dokar": "",
        "Dokvr": "",
        "Doktl": "",
        "Filename": oFile['name'],
        "Filedesc": oFile['type'],
        "Filesize": oFile['size'].toString(),
        "CreatedBy": oModelSSUDigitization.getProperty("/UserId"), //oModelSSUDigitization.UserId,
        "CreatedOn": oDate, //.join(""),
        "Filecontents": "",
        "FileCatg": "",
        "Delete": ""
      }
      this.onConvertToBase64(oData, oFile)
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

                  var vXmlText = oEvent.mParameters.files[0].headers.location;//oEvent.mParameters.getParameter("responseRaw");
                  var vPosnr = vXmlText.slice(vXmlText.indexOf("Posnr")+7,vXmlText.indexOf("Posnr")+13);

                  var vNav_DMS = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
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

    onConvertToBase64: function (files, oFile) {
      var that = this;
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      //create a function that returns a promise
      function readFileAndAddToMap(obj) {
        return new Promise(function (resolve, reject) {
          // var file = obj.oFile;
          if (obj) {
            var reader = new FileReader();
            var BASE64_MARKER = 'data:' + obj.Filedesc + ';base64,';
            if (obj.Filename.substr(obj.Filename.lastIndexOf(".") + 1) == "msg") {
              BASE64_MARKER = "data:application/octet-stream;base64,";
            }
            reader.onloadend = (function (theFile) {
              return function (evt) {
                var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
                var base64Data = evt.target.result.substring(base64Index);
                files.Filecontents = base64Data;
                var oNav_DMS = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
                oNav_DMS.push(files);
                oModelSSUDigitization.setProperty("/PaperDataSet/Nav_DMS", oNav_DMS);
              };
              that.getBusy().setBusy(false);
            })(obj);
          }
          reader.readAsDataURL(oFile);
        });
      }
      //create an array to hold your promises
      var promises = [];
      promises.push(readFileAndAddToMap(files));

      //use reduce to create a chain in the order of the promise array
      promises.reduce(function (cur, next) {
        return cur.then(next);
      }, Promise.resolve()).then(function () {
        //all files read and executed!
      }).catch(function (error) {
        //handle potential error
      });
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
      var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo") || "0";
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
      var vFrxRmStatus = "0";
      var vParent = vSelectedPath.split("/");
      vParent.splice(4, 2);
      vParent = vParent.join("/");
      var vTemp = vSelectedPath.split("/");
      vTemp = vTemp.splice(4, 1);
      if (vTemp[0] == "Nav_Forex") {
        vFrxRmStatus = "FX";
      } else if (vTemp[0] == "Nav_RM") {
        vFrxRmStatus = "RM";
      }

      var oFile =oEvent.getParameter("files")[0];

      var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo") || "0";
      var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode") || "0";
      var vTabId = oModelSSUDigitization.getProperty("/SelectedTab") || "0";
      var vPartNo = oModelSSUDigitization.getProperty(vParent + "/PartNo") || "0";
      var vPlant =  oModelSSUDigitization.getProperty(vParent + "/Plant") || "0";
      var vVendor = oModelSSUDigitization.getProperty(vParent + "/Vendor") || "0";

      //PaperCode|FileKey|TabId|PartNo|Vendor|Plant|FxRmStatus|FileName|FileDesc|FileSize
      var slug =vPaperCode+"|"+vPaperNo+"|"+vTabId+"|"+vPartNo+"|"+vVendor+"|"+vPlant+"|"+vFrxRmStatus+"|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
      var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
        name: "slug",
        value: slug
      });
      oUploadCollection.addHeaderParameter(oCustomerHeaderSlug);
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
    onChangeDelevertTime: function (oEvent) {
      var vNewValue = oEvent.getParameter("newValue");
      var vNewValueArray = vNewValue.split(".");
      if (vNewValue.length > 2) {
        oEvent.getSource().setValue(vNewValueArray[0].slice(0, 2));
      } else {
        oEvent.getSource().setValue(vNewValueArray[0]);
      }
    },
    onCheckNumberLeng12: function (oEvent) {

      var vNewValue = oEvent.getParameter("newValue");
      var vNewValueArray = vNewValue.split(".");
      if (vNewValueArray[0].length > 9 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 13) {
        vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 9) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0,
          9);
        oEvent.getSource().setValue(vNewValue);
      }
      oEvent.getSource().setValue(vNewValue);
    },
    onCheckNumberLeng16: function (oEvent) {
      var vNewValue = oEvent.getParameter("newValue");
      var vNewValueArray = vNewValue.split(".");
      if (vNewValueArray[0].length > 13 || (vNewValueArray[1] && vNewValueArray[1].length > 3) || vNewValue.length > 16) {
        vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 13) + "." + vNewValueArray[1].slice(0, 3) : vNewValueArray[0].slice(0,
          13);
        oEvent.getSource().setValue(vNewValue);
      }
      oEvent.getSource().setValue(vNewValue);
    },
    onCheckNumberLeng4: function (oEvent) {
      var vNewValue = oEvent.getParameter("newValue");
      var vNewValueArray = vNewValue.split(".");
      if (vNewValue.length > 4) {
        oEvent.getSource().setValue(vNewValueArray[0].slice(0, 4));
      } else {
        oEvent.getSource().setValue(vNewValueArray[0]);
      }
    },
    onCheckNumberLeng3: function (oEvent) {
      var vNewValue = oEvent.getParameter("newValue");
      var vNewValueArray = vNewValue.split(".");
      if (vNewValueArray[0].length > 2 || (vNewValueArray[1] && vNewValueArray[1].length > 1) || vNewValue.length > 4) {
        vNewValue = vNewValueArray[1] ? vNewValueArray[0].slice(0, 2) + "." + vNewValueArray[1].slice(0, 1) : vNewValueArray[0].slice(0,
          2);
        oEvent.getSource().setValue(vNewValue);
      }
      oEvent.getSource().setValue(vNewValue);
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
            oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
              success: function (oData, oResponse) {
                /*$.each(oData.Nav_Items.results, function (i, Row) { //need to remove after getting updated BE data
                  Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                  Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                  Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                  Row.YearBase = Row.YearBase == "1" ? 1 : 0;
                });*/
                // oController._fnAfterGettingBEData(oData);//use after getting updated BE data
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
//      var vButtonType = oEvent.getSource().getProperty("type");
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
          text: 'OK',
          press: function (oEvent) {
            var vUsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
            if(vUsrComment.length <= 4){
              sap.m.MessageToast.show("Write any reasons for rejection.");
              return;
            }
            var oPaperData = oController._fnDataBeforeSave();
            oPaperData.Action = "4"; // reject action is 4
            oPaperData.UsrComment = vUsrComment;
            busyDialog.open();
            oController.getOwnerComponent().getModel("oDataNewPinfoModel").create("/ES_NPIHeader", oPaperData, {
              success: function (oData, oResponse) {
                oDialog.close();
                /*$.each(oData.Nav_Items.results, function (i, Row) { //need to remove after getting updated BE data
                  Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                  Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                  Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                  Row.YearBase = Row.YearBase == "1" ? 1 : 0;
                });*/
                // oController._fnAfterGettingBEData(oData);//use after getting updated BE data
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
                      var oRouter = sap.ui.core.UIComponent.getRouterFor(oController);
                      oRouter.navTo("Home");
                      if (oRouter.getView("com.mahindra.ZSSU_SPD.view.Home").getController())
                        oRouter.getView("com.mahindra.ZSSU_SPD.view.Home").getController()._fnGetMaster();
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
      var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/NpiNo");
      var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PaperCode");
//      if(!vPaperNo || (vLock=="" && !oModelSSUDigitization.getProperty("/EditableFlag")))
      if(!vPaperNo)
        return;
      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataNewPinfoModel");
      var oData_Url = oDataNewPinfoModel.sServiceUrl+"/ES_LockUnlockSSU(PaperCode='"+vPaperCode+"',PaperNo='"+vPaperNo+"',Lock='"+vLock+"')";
      $.ajax(oData_Url, {
        dataType:"json",
          success: function(oData) {
            oData = oData.d;
            busyDialog.close();
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
          },
          error: function(oResponse) {
            serviceError(oResponse);
          }
       });
    },
    attachEditable: function(vEditable,vNotCreateNew){
      return vEditable && vNotCreateNew;
    },

    onExport: function () {

      var vPaperNumber = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/NpiNo");
      var oRow =this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Nav_Items");
      var oExcelData = [];
      var vIndex = 0;
      $.each(oRow,function(i,row){
        oExcelData[vIndex] = $.extend([], row);
        oExcelData[vIndex].ToolCostRequired = row.ToolCostRequired == "" ? "Yes" : "No";
        oExcelData[vIndex].ForexRequired = row.ForexRequired == "" ? "Yes" : "No";
        oExcelData[vIndex].ForexRMRequired = row.ForexRMRequired == "" ? "Yes" : "No";
//        oExcelData[vIndex].SparePartSameOE = row.SparePartSameOE == "" ? "Yes" : "No";
        oExcelData[vIndex].BusinessRedRequired = row.BusinessRedRequired == "" ? "Yes" : "No";
        oExcelData[vIndex].YearBase = row.YearBase == "0" ? "Year Base" : "Volume Base";
//        oExcelData[vIndex].Nav_Forex = row.Nav_Forex.length > 0 ? "Yes" : "No";
//        oExcelData[vIndex].Nav_RM = row.Nav_RM.length > 0 ? "Yes" : "No";
        /*if(row.ForexRMRequired==""){
          $.each(row.Nav_RM,function(iRm,rowRm){
            if(!oExcelData[vIndex]) 
              oExcelData[vIndex] = $.extend([], oExcelData[vIndex-1]);

            oExcelData[vIndex].RmGrade = rowRm.RmGrade;
            oExcelData[vIndex].RmGrossWt = rowRm.RmGrossWt;
            oExcelData[vIndex].RmIndexCycleVal = rowRm.RmIndexCycleVal;
            oExcelData[vIndex].RmLandingFactVal = rowRm.RmLandingFactVal;
            oExcelData[vIndex].RmBasePeriod = rowRm.RmBasePeriod;
            oExcelData[vIndex].RmBasePeriodYr = rowRm.RmBasePeriodYr;
            oExcelData[vIndex].RmBasePrice = rowRm.RmBasePrice;
            oExcelData[vIndex].RmRemarks = rowRm.RmRemarks;
            vIndex++;
          });
          if(row.ForexRequired == ""){
            $.each(row.Nav_Forex,function(iForex,rowForex){
              if(!oExcelData[vIndex]) 
                oExcelData[vIndex] = $.extend([], oExcelData[vIndex-1]);

              oExcelData[vIndex].ForexCur = rowForex.ForexCur;
              oExcelData[vIndex].ForexContent = rowForex.ForexContent;
              oExcelData[vIndex].ForexIndexVal = rowForex.ForexIndexVal;
              oExcelData[vIndex].ForexLandFactVal = rowForex.ForexLandFactVal;
              oExcelData[vIndex].ForexBaseperiod = rowForex.ForexBaseperiod;
              oExcelData[vIndex].FxBasePeriodYr = rowForex.FxBasePeriodYr;
              oExcelData[vIndex].FxBaseExchRate = rowForex.FxBaseExchRate;
              oExcelData[vIndex].ForexRemarks = rowForex.ForexRemarks;
              vIndex++;
            });
          }
          vIndex--;
        }*/
        if(row.ForexRMRequired==""){
          for(var i=0; i<row.Nav_RM.length || i<row.Nav_Forex.length; i++){
            if(!oExcelData[vIndex]) 
              oExcelData[vIndex] = $.extend([], oExcelData[vIndex-1]);
            oExcelData[vIndex].RmGrade = row.Nav_RM[i] ? row.Nav_RM[i].RmGrade : "";
            oExcelData[vIndex].RmGrossWt = row.Nav_RM[i] ? row.Nav_RM[i].RmGrossWt : "";
            oExcelData[vIndex].RmIndexCycleVal = row.Nav_RM[i] ? row.Nav_RM[i].RmIndexCycleVal : "";
            oExcelData[vIndex].RmLandingFactVal = row.Nav_RM[i] ? row.Nav_RM[i].RmLandingFactVal : "";
            oExcelData[vIndex].RmBasePeriod = row.Nav_RM[i] ? row.Nav_RM[i].RmBasePeriod : "";
            oExcelData[vIndex].RmBasePeriodYr = row.Nav_RM[i] ? row.Nav_RM[i].RmBasePeriodYr : "";
            oExcelData[vIndex].RmBasePrice = row.Nav_RM[i] ? row.Nav_RM[i].RmBasePrice : "";
            oExcelData[vIndex].RmRemarks = row.Nav_RM[i] ? row.Nav_RM[i].RmRemarks : "";

            oExcelData[vIndex].ForexCur = row.Nav_Forex[i] ? row.Nav_Forex[i].ForexCur : "";
            oExcelData[vIndex].ForexContent = row.Nav_Forex[i] ? row.Nav_Forex[i].ForexContent : "";
            oExcelData[vIndex].ForexIndexVal = row.Nav_Forex[i] ? row.Nav_Forex[i].ForexIndexVal : "";
            oExcelData[vIndex].ForexLandFactVal = row.Nav_Forex[i] ? row.Nav_Forex[i].ForexLandFactVal : "";
            oExcelData[vIndex].ForexBaseperiod = row.Nav_Forex[i] ? row.Nav_Forex[i].ForexBaseperiod : "";
            oExcelData[vIndex].FxBasePeriodYr = row.Nav_Forex[i] ? row.Nav_Forex[i].FxBasePeriodYr : "";
            oExcelData[vIndex].FxBaseExchRate = row.Nav_Forex[i] ? row.Nav_Forex[i].FxBaseExchRate : "";
            oExcelData[vIndex].ForexRemarks = row.Nav_Forex[i] ? row.Nav_Forex[i].ForexRemarks : "";
            vIndex++;
          }
          if(row.Nav_RM.length > 0 || row.Nav_Forex.length > 0)
            vIndex--;
        }

        vIndex++;
      });

      var oSettings = {
        workbook: {
          columns: getExportExcelColums(),
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
    _getXsrfToken: function() {
            var token = this.getOwnerComponent().getModel("oDataNewPinfoModel").getHeaders()['x-csrf-token'];
            if (!token) {
                this.getOwnerComponent().getModel("oDataNewPinfoModel").refreshSecurityToken(function(e, o) {
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
      if(oSelectedPath.length > 0){
        Message.confirm("This is confirmation for Post to SAP.", {
          title: "Post to SAP confirmation",
          onClose: function (oAction) {
            if (oAction == "OK") {
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
              if(oSelectedItems.length == 0){
                sap.m.MessageBox.error("All selected items are already processed");
                oController._fnAfterGettingBEData(oPaperData);
                return;
              }

              oPaperDataCopy.Nav_Items = oSelectedItems;
              if(vButtonType == "Accept"){
                oPaperDataCopy.Action = "P";
                oPaperDataCopy.BjStatus = "";
              } else {
                oPaperDataCopy.Action = "M";
                oPaperDataCopy.BjStatus = "R";
              }
              oPaperDataCopy.UsrLevel = oPaperData.Status;
              busyDialog.open();
              oController.getOwnerComponent().getModel(
                "oDataNewPinfoModel").create("/ES_NPIHeader", oPaperDataCopy, {
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

    /*onExit: function(){
      var oController = this;
      oController._fnLockUnlockService("");
    }*/
    /*onMessagePopoverPress: function (oEvent) {
      var oMessagePopover = new sap.m.MessagePopover({
        items: {
          path: '/MessageList',
          template: new sap.m.MessageItem({
            type: '{type}',
            title: '{title}',
            activeTitle: "{active}",
            description: '{description}',
            subtitle: '{subtitle}',
            counter: '{counter}'
          })
        }
      });
      oMessagePopover.setModel(this.getView().getModel("ModelSSUDigitization"));
      oMessagePopover.toggle(oEvent.getSource());
    }*/

    //--------- Event Methods End -----------------

  });

});