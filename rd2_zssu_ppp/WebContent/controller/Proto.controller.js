sap.ui.define(["sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",

  "sap/m/MessageBox"

], function (Controller, JSONModel, MessageBox) {
  "use strict";
  var vNav_Apprs = [];
  return Controller.extend("com.mahindra.ZProto_PO.controller.Proto", {

     
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
      var appName  = "ZProto_PO";

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
      oDataModel.read("/FioriUsageSet(Appname='ZProto_PO',Device='" + device +
      "',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
      "',Resolution='" + resolution + "')",null,null,null,function(e)   { },
      function(e)
      { });
      var oController = this;

      /*var oModelDefault = new sap.ui.model.json.JSONModel();
      var sUrl = jQuery.sap.getModulePath("com.mahindra.ZProto_PR", "/json/dataSet.json");
      oModelDefault.loadData(sUrl, "", false);
      oController.getView().setModel(oModelDefault, "ModelDefaultDataSet");*/

      /*var oModel = new sap.ui.model.json.JSONModel();
      var sUrl = jQuery.sap.getModulePath('com.mahindra.ZProto_PR', '/json/forex.json');
      oModel.loadData(sUrl, "", false);
      oController.getView().setModel(oModel, "ModelSSUDigitization");*/
      /*var useDetails = new JSONModel();
      useDetails.loadData("proxy/sap/bc/ui2/start_up", null, false);
      oModelDefault.setProperty("/UserId", useDetails.getProperty("/id"));*/
//      oModelDefault.setProperty("/UserId", "MOHAVA-CONT");
      var vStartupPara = getStartupParameters(this);
      oController._onObjectMatched(vStartupPara.PaperNumber);
//      oController._onObjectMatched(["new","FRX"]);
//      oController._onObjectMatched(["new","FRX"]);

//JSON For Demo

      /*var data =   [{
                  "Item": "10",
                  "Vendor": "DP037",
                  "Plant": "MRVA",
                  "Material": "2303BW600410N",
                  "ProtoQty": "5",
                  "ProtoPrice": "100",
                  "CurrentSetQty": "10",
                  "CumulativeSetQty": "80"
                }, {
                  "Item": "20",
                  "Vendor": "DS063F",
                  "Plant": "MRVA",
                  "Material": "0010378",
                  "ProtoQty": "4",
                  "ProtoPrice": "200",
                  "CurrentSetQty": "20",
                  "CumulativeSetQty": "20"
                }]

      oModel.setProperty("/PRDetail",data);*/



    }, //--------- Local Methods Start -------------------------
    _onObjectMatched: function (oParameter) {

      var oController = this;
      var vPaperNo = oParameter[0];
      var oParam = vPaperNo.split(":");
      vPaperNo = oParam[0];
      var oPosnr = oParam[1];
      var vPaperCode = oParameter[1];

      var oModel = new sap.ui.model.json.JSONModel();
      var sUrl = jQuery.sap.getModulePath('com.mahindra.ZProto_PO', '/json/forex.json');
      oModel.loadData(sUrl, "", false);
      oController.getView().setModel(oModel, "ModelSSUDigitization");
      oModel.setProperty("/PartSettlementTracker", oParameter[2] || "");
      var vDate = new Date();
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      oModelSSUDigitization.setProperty("/DeliveryDate",vDate);
//      var oModel= oController.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//      oModel.setProperty("/UserId", oController.getView().getModel("ModelDefaultDataSet").getProperty("/UserId"));
      if (vPaperNo == "new") {
        oModel.setProperty("/NotCreateNew", false);
        oModel.setProperty("/EditableFlag", true);
        oModel.setProperty("/DisplayOnlyFlag", false);
        oModel.setProperty("/DisplayPRNum", false);
        var oData = getProtoHeaderObject();
        //oData.PaperCode= vPaperCode;
        oModel.setProperty("/PaperDataSet", oData);
      } else {
         
         oController._fnGetNPIHeaderData(vPaperNo, oPosnr, vPaperCode);
//         oController._fnAfterGettingBEData(oModel.getProperty("/PaperDataSet"));
      }



      /*oDataAmendmentModel.read("/ES_F4PaperPurp", {
        filters: [new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode)],
        success: function (oData, oResponse) {
          oModel.setProperty("/F4PaperPur", oData.results);
          oModel.refresh();
        },
        error: function (oResponse) {
          MessageBox.error("Error loading Paper Purpose.", {
            title: "Error"
          });
        }
      });*/



//      oController._fnCreatingTables();

    },

    _fnGetNPIHeaderData: function (vPaperNo, oPosnr, vPaperCode) {
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      oController.getView().setBusy(true);
      var vParmeters = {
      //    "$filter": "PrNum eq '"+vPaperNo+"' and Posnr eq '"+oPosnr+"'",
          "$expand": "Nav_Items,Nav_Return,Nav_ItmQtyNote,Nav_Apprs,Nav_DMS,Nav_Wf",
      };
//      oDataAmendmentModel.read("/ES_Header('" + vPnifoNumber + "')", {
      oDataAmendmentModel.read("/ES_Header(PrNum='"+vPaperNo+"',Posnr='"+oPosnr+"')", {
        urlParameters: vParmeters,
        success: function (oData, oResponse) {
//          oModelSSUDigitization.setProperty("/eTag",oResponse.headers.etag);
          oController._fnAfterGettingBEData(oData);
          oController.getView().setBusy(false);
        },
        error: function (oResponse) {
          MessageBox.error("Error while getting data.", {
            title: "Error"
          });
          oController.getView().setBusy(false);
        }
      });
    },

    _fnAfterGettingBEData: function (oData) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      // oData.Sector = oData.Sector ? oData.Sector.split(",") : [];
      oData.Model = oData.Model ? oData.Model.split(",") : [];
      oData.Nav_Items = oData.Nav_Items.results;
      oData.Nav_DMS = oData.Nav_DMS.results;
      oData.Nav_Apprs = oData.Nav_Apprs.results;
      oData.Nav_Wf = oData.Nav_Wf.results;
      // Added By Guruprasad On 11.07.2021.
          if(oData.Pstyp == "3"){
          oData.Pstyp = "Subcontracting";
          oModelSSUDigitization.setProperty("/DetailFlag", true);
          }
          else{
          oData.Pstyp = "Standard";
          oModelSSUDigitization.setProperty("/DetailFlag", false);
          }
           // Added By Guruprasad On 11.07.2021 Ends Here.
      for (var i =0;i< oData.Nav_Apprs.length;i++)
      {
        if(oData.Nav_Apprs[i].Level == "A1")
          {
            oModelSSUDigitization.setProperty("/Approver1", oData.Nav_Apprs[i].ApprName);
            oModelSSUDigitization.setProperty("/Apr1",true);
            oModelSSUDigitization.setProperty("/Apr2",false);
            oModelSSUDigitization.setProperty("/Apr3",false);
            oModelSSUDigitization.setProperty("/Apr4",false); // Added by AGAWSA-CONT on 19-05-2023
            oModelSSUDigitization.setProperty("/Apr5",false);
            oModelSSUDigitization.setProperty("/Apr6",false);
            oModelSSUDigitization.setProperty("/Apr7",false);
            oModelSSUDigitization.setProperty("/Apr8",false);
            oModelSSUDigitization.setProperty("/VisSSUExec",false);
          }
        if(oData.Nav_Apprs[i].Level == "A2")
        {
          oModelSSUDigitization.setProperty("/Approver2", oData.Nav_Apprs[i].ApprName);
          oModelSSUDigitization.setProperty("/Apr2",true);
        }
        if(oData.Nav_Apprs[i].Level == "A3")
        {
          oModelSSUDigitization.setProperty("/Approver3", oData.Nav_Apprs[i].ApprName);
          oModelSSUDigitization.setProperty("/Apr3",true);
        }
     // Add start AGAWSA-CONT on 19-05-2023
        if(oData.Nav_Apprs[i].Level == "A4")
        {
          oModelSSUDigitization.setProperty("/Approver4", oData.Nav_Apprs[i].ApprName);
          oModelSSUDigitization.setProperty("/Apr4",true);
        }
     // Add end AGAWSA-CONT on 19-05-2023
//        Insert start by AGAWSA-CONT on 17.08.2023
        if(oData.Nav_Apprs[i].Level == "A5")
        {
          oModelSSUDigitization.setProperty("/Approver5", oData.Nav_Apprs[i].ApprName);
          oModelSSUDigitization.setProperty("/Apr5",true);
        }
        if(oData.Nav_Apprs[i].Level == "A6")
        {
          oModelSSUDigitization.setProperty("/Approver6", oData.Nav_Apprs[i].ApprName);
          oModelSSUDigitization.setProperty("/Apr6",true);
        }
        if(oData.Nav_Apprs[i].Level == "A7")
        {
          oModelSSUDigitization.setProperty("/Approver7", oData.Nav_Apprs[i].ApprName);
          oModelSSUDigitization.setProperty("/Apr7",true);
        }
        if(oData.Nav_Apprs[i].Level == "A8")
        {
            oModelSSUDigitization.setProperty("/Approver8", oData.Nav_Apprs[i].ApprName);
            oModelSSUDigitization.setProperty("/Apr8",true);
        }
//      Insert end by AGAWSA-CONT on 17.08.2023
        /*if(oData.Nav_Apprs.results[i].Level == "SS")
        {
          oModelSSUDigitization.setProperty("/SSUExec", oData.Nav_Apprs.results[i].ApprName);
          oModelSSUDigitization.setProperty("/VisSSUExec",true);
        }*/

      }

      // Cummulative Set Qty Calculation

      /*$.each(oData.Nav_Items, function (i, Row) {
        var oExtSetQty = Row.ExtSetQty;
        var oCurrenttSetQt = Row.CurrenttSetQt;


        if(oExtSetQty != "")
          {
            var oCumSetQty = parseInt(oCurrenttSetQt) + parseInt(oExtSetQty);
            oCumSetQty = oCumSetQty.toString();
          }

        oData.Nav_Items[i].ExtSetQty = Row.ExtSetQty;
        oData.Nav_Items[i].CumSetQty = oCumSetQty;
      });*/

      //oData.Sign = oData.Sign == "POS" ? 0 : 1; //0 is Increase 1 is Decrease;

      /*  $.each(oData.Nav_Items, function (i, Row) {
          Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
          Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
          Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
          Row.Nav_Forex = Row.Nav_Forex.results;
          Row.Nav_RM = Row.Nav_RM.results;
          // Row.YearBase = parseInt(Row.YearBase);
        });*/
      oModelSSUDigitization.setProperty("/PaperDataSet", oData);
      if ((oModelSSUDigitization.getProperty("/PartSettlementTracker") != "X") && (oData.Status === "S" || oData.Status === "RJ"))
        {oModelSSUDigitization.setProperty("/POEditableFlag", true);
        oModelSSUDigitization.setProperty("/PODisplayOnlyFlag", false);}
      else if (oData.Status === "A1" || oData.Status === "A2" || oData.Status === "A3" || oData.Status === "A4" || oData.Status === "A5" || oData.Status === "A6" || oData.Status === "A7" || oData.Status === "A8" || oData.Status === "C" || oModelSSUDigitization.getProperty("/PartSettlementTracker") == "X")
        {
        oController.getView().getModel("ModelSSUDigitization").setProperty("/ApproveFlag", false);
        oModelSSUDigitization.getData().IconTabBarVisible = true;
        oModelSSUDigitization.setProperty("/PODisplayOnlyFlag", true);
        oModelSSUDigitization.setProperty("/POEditableFlag", false);}

      oModelSSUDigitization.refresh();
//      oController._getAmentmendService();
      oController._getWorkFlow();
      // oController._validationDataFilled();
    },



    /*_getAmentmendService: function(){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");

      var vSign = oPaperData.Sign == 0 ? "POS":"NEG";
      var filters = [
        new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, vSign),
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
    },*/
    _getWorkFlow: function(){
//      new sap.ui.model.Filter("Initiator", sap.ui.model.FilterOperator.EQ, oModel.getProperty("/UserId")),
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var vSign = oPaperData.Sign == 0 ? "POS":"NEG";
      if(vSign && oPaperData.PaperPur){
        var vFilters = [
          new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode),
          new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, vSign),
          new sap.ui.model.Filter("PaperPur", sap.ui.model.FilterOperator.EQ, oPaperData.PaperPur)
        ];
        oDataAmendmentModel.read("/ES_Approver", {
          filters: vFilters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4Approver", oData.results);
            oModelSSUDigitization.refresh();
            var vCycle = oModelSSUDigitization.getProperty("/PaperDataSet/Cycle") || (oData.results.length>0 && oData.results[0].Cycle);
            oController.formattInitiator(vCycle);
          },
          error: function (oResponse) {
            MessageBox.error("Error loading approver.", {
              title: "Error"
            });
          }
        });
      }
    },
    _setEditFragmentModel: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedPath = oEvent.getSource().getBindingContext("ModelSSUDigitization").getPath();
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
      var objectData = [];
      //var vSelectedPathVali = oController._fnDataSettingValidation(vSelectedPath);
      objectData = oModelSSUDigitization.getProperty(vSelectedPath);
      return new JSONModel(objectData);
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
        var oPosnr = oEvent.getSource().getParent().getModel().getData().Posnr;
        oPosnr= (oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items").length*10) + 10;
        oEvent.getSource().getParent().getModel().setProperty("/Posnr",oPosnr.toString());
      }
      delete vChangedData.Validation;
      oModelSSUDigitization.setProperty(vSelectedPath, vChangedData);
      oModelSSUDigitization.setProperty("/SelectedPath", "");
    },

    _fnGetTaxCodeService: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var nVendor = oModelSSUDigitization.getProperty(selectedPath+"/Vendor");
      var nPlant = oModelSSUDigitization.getProperty(selectedPath+"/Plant");
      var filters = [];
      filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, nVendor));
      filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, nPlant));

      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      oDataNewPinfoModel.read("/ES_TaxCodes", {
        filters: filters,
        success: function (oData, oResponse) {
          oModelSSUDigitization.setProperty("/F4TaxCode", oData.results);
          busyDialog.close();
        },
        error: function (oResponse) {
          serviceError(oResponse)
        }
      });
    },

    _fnLockUnlockervice:function(nLock,oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if(oEvent)
        var oFragModel = oController._setEditFragmentModel(oEvent)
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var nPrNum = oModelSSUDigitization.getProperty(selectedPath+"/PrNum");
      var nPosnr = oModelSSUDigitization.getProperty(selectedPath+"/Posnr");
      var nPaperCode = "PPP";


      var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      oDataNewPinfoModel.read("/ES_LockUnlock(PaperCode='PPP',PrNum='"+nPrNum+"',Posnr='"+nPosnr+"',Lock='"+nLock+"')", {
        //filters: filters,
        success: function (oData, oResponse) {
          //alert(oData);
          busyDialog.close();
          if(oData.Message.substr(0,1)=="S" && oFragModel){
            var oItemFrag = xmlFragment(oController, "ItemProto");
            oItemFrag.setModel(oFragModel);
            oItemFrag.open();
            oController._fnGetTaxCodeService();
          }
          else if(oData.Message.substr(0,1)=="E"){
            MessageBox.error(oData.Message);
          }
//          oController.Lock = oData.Lock;
        },
        error: function (oResponse) {
          serviceError(oResponse);
        }
      });
    },

    onExit : function(){
      debugger;
      var nLock = "";
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var nPrNum = oModelSSUDigitization.getProperty(selectedPath+"/PrNum") || oModelSSUDigitization.getProperty("/PaperDataSet/PrNum");
      var nPosnr = oModelSSUDigitization.getProperty(selectedPath+"/Posnr") || oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items/0/Posnr");
      var nPaperCode = "PPP";
//      var oDataNewPinfoModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
      var oData_Url = "/sap/opu/odata/sap/ZMM_SSU_PPP_SRV/";
      var oDataNewPinfoModel = new sap.ui.model.odata.ODataModel(oData_Url, true);

      oDataNewPinfoModel.read("/ES_LockUnlock(PaperCode='PPP',PrNum='"+nPrNum+"',Posnr='"+nPosnr+"',Lock='"+nLock+"')", {
        //filters: filters,
        success: function (oData, oResponse) {
          //alert(oData);
          busyDialog.close();

        },
        error: function (oResponse) {
          serviceError(oResponse);
        }
      });
    },
    _getModelPlant: function (vSelectedSectors) {
      if (vSelectedSectors) {
        var vFilters = [];
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
        oModelSSUDigitization.setProperty("/PaperDataSet/Sector", vSelectedSectors)


          vFilters.push(new sap.ui.model.Filter("Sector", sap.ui.model.FilterOperator.EQ, vSelectedSectors));

        busyDialog.open();

        oDataAmendmentModel.read("/ES_ProjCode", {
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
        /*oDataAmendmentModel.read("/ES_Plant", {
          filters: vFilters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.setProperty("/F4Plant", oData.results);
            // oModelSSUDigitization.refresh();
            busyDialog.close();
          },
          error: function (oResponse) {
            serviceError(oResponse)
          }
        });*/
      }
    },

    _getAmentmendService: function(){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");

      var vSign = oPaperData.Sign == 0 ? "POS":"NEG";
      var filters = [
        new sap.ui.model.Filter("Sign", sap.ui.model.FilterOperator.EQ, vSign),
        new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, oPaperData.PaperCode)
      ];
      oDataAmendmentModel.read("/ES_F4Amandment", {
        filters: filters,
        success: function (oData, oResponse) {
          oModelSSUDigitization.setProperty("/F4Amentment", oData.results);
          oModelSSUDigitization.refresh();
        },
        error: function (oResponse) {
          MessageBox.error("Error loading Amendment.", {
            title: "Error"
          });
        }
      });
    },

    _fnRequredFieldCheck: function (oFields) {
      var oMandatoryFlag = true;
      $.each(oFields, function (i, row) {
        if (row.mProperties.hasOwnProperty("required") && row.getProperty("required")) {
          if (row.mProperties.hasOwnProperty("selectedKeys") && row.getProperty("selectedKeys").length <= 0) {
            row.setValueState("Error");
            row.setValueStateText("this field is required");
            oMandatoryFlag = false;
          } else if (row.mProperties.hasOwnProperty("value") && (row.getProperty("value") == "" || row.getProperty("value") == " ") && !
            row.mProperties.hasOwnProperty("selectedKeys")) {
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
          } else if (row.mProperties.hasOwnProperty("valueState") == true && row.mProperties.valueState == "Error") {
            //row.setValueState("None");
            row.setValueState("Error");
            oMandatoryFlag = false;
          }
        }
      });
      return oMandatoryFlag;
    },

    _fnDataBeforeSave: function () {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      if (oPaperData.Model) {
        delete oPaperData.Model;
      }

      /*for(var i = 0; i< oPaperData.Nav_Items.length; i++)
        {
          oPaperData.Nav_Items[i].DelvryDate = new Date(oPaperData.Nav_Items[i].DelvryDate)
        }*/
       
      if (oPaperData.DeletedItems) {
        oPaperData.Nav_Items = oPaperData.Nav_Items.concat(oPaperData.DeletedItems);
        delete oPaperData.DeletedItems;
      }
      $.each(oPaperData.Nav_Items, function (i, Row) {
        // Row.YearBase = Row.YearBase.toString();
        delete Row.uiFields;
        delete Row.__metadata;

//        delete Row.PinfoCatText;
      });
      /*if (oPaperData.DeletedDMS) {
        oPaperData.Nav_DMS = oPaperData.Nav_DMS.concat(oPaperData.DeletedDMS);
        delete oPaperData.DeletedDMS;
      }*/
      if (oPaperData.DeletedApprs) {
        oPaperData.Nav_Apprs = oPaperData.Nav_Apprs.concat(oPaperData.DeletedApprs);
        delete oPaperData.DeletedApprs;
      }
      oPaperData.Sector = oPaperData.Sector;
      oPaperData.ProjCode = oPaperData.ProjCode;
      // Added By Guruprasad On 08.07.2021.
      if(oPaperData.Pstyp == "Subcontracting" || oPaperData.Pstyp == "3")
      {
        oPaperData.Pstyp = "3";
        delete oPaperData.Value;
      }
      else if (oPaperData.Pstyp == "Standard" || oPaperData.Pstyp == "0"){
        oPaperData.Pstyp = "0";
        delete oPaperData.Value;
      }
      // Added By Guruprasad On 08.07.2021 Ends here.
      delete oPaperData.__metadata;
      //oPaperData.Nav_Log = [];
      oPaperData.Nav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
      oPaperData.Nav_Return = [];
      /*$.each(oPaperData.Nav_Items, function (i, Row) {
        // Row.YearBase = Row.YearBase.toString();
        delete Row.ItemNo;
        delete Row.Error;
        delete Row.FX_RM_PanelState;
        delete Row.__metadata;
        Row.ToolCostRequired = Row.ToolCostRequired == 1 ? "X" : "";
        Row.ForexRequired = Row.ForexRequired == 1 ? "X" : "";
        Row.SparePartSameOE = Row.SparePartSameOE == 1 ? "X" : "";

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
        });
        $.each(Row.Nav_RM, function (i, RowRM) {
          delete RowRM.__metadata;
          delete RowRM.Error;
          delete RowRM.RmNo;
        });
      });*/
      /*$.each(oPaperData.Nav_DMS, function (i, Row) {
        delete Row.__metadata;
      });*/
      return oPaperData;
    },

    _fnMassDataSet:function(vExcelDataArray){

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPaperData = oModelSSUDigitization.getProperty("/PaperDataSet");
      var oMassData = oPaperData.Nav_Items.length > 0 ? oPaperData.Nav_Items : [];
      var oFilter;
      var oForex;
      var oPPP;
      $.each(vExcelDataArray, function (MainIndex, row) {
        oFilter = $.grep(oMassData, function (grepRow) {
          return ((row.Material === grepRow.Material));
        });
        if (oFilter.length <= 0) 
          {

            var oItemData = getProtoItemDetailsObject();
            var vDeliveryDate = row.Delivery_Date || "";
            oItemData.Posnr = row.Item || "",
            oItemData.Vendor = row.Vendor || "",
            oItemData.Plant = row.Plant || "",
            oItemData.StrLoc =row.SLoc || "",
            oItemData.Material = row.Material || "",
            oItemData.DelvryDate = new Date(vDeliveryDate.split(".").reverse()) != "Invalid Date" ? new Date(vDeliveryDate.split(".").reverse()) : null,
            oItemData.ProtoPerVeh = row.Proto_Qty_Per_Vehicle || "",
            oItemData.QutProtoProce = row.Quoted_Proto_Price || "",
            oItemData.CurrenttSetQt = row.Vehicle_Set_Qty_Reqd || "",
            oItemData.Note= row.Remarks || ""
            oMassData.push(oItemData);
          }
      });
      $.each(oMassData, function (i =1, Row) {
        Row.Posnr = (( i * 10) +10).toString();
      });
      oModelSSUDigitization.refresh();
      oController._validationMass(oMassData);
      oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", oMassData);

    },
    _validationMass: function (Nav_Items) {

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      //var vSign = oModelSSUDigitization.getProperty("/PaperDataSet/Sign");
      var oValidation = {
        "ProjCode": oModelSSUDigitization.getProperty("/PaperDataSet/ProjCode"),
        "Sector": oModelSSUDigitization.getProperty("/PaperDataSet/Sector"),
        "PucGrp": oModelSSUDigitization.getProperty("/PaperDataSet/PucGrp"),
        "Nav_ItemsX": [],
        "Nav_ItmXQtyNote":[]
      };
      $.each(Nav_Items, function (item, Row) {
        Row.uiFields.ItemNo = Row.Posnr;
        var selDate = Row.DelvryDate;
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
              //Row.ValidFrom = vChangedDate;

        var oNavItem = {
          "Posnr": Row.Posnr,
          "Plant": Row.Plant,
          "Vendor": Row.Vendor,
          "StrLoc": Row.StrLoc,
          "Material": Row.Material,
          "DelvryDate": vChangedDate
          //"ProtoPerVeh": Row.Proto_Qty_Per_Vehicle,
          //"QutProtoProce": Row.Quoted_Proto_Price,
          //"CurrenttSetQt": Row.Vehicle_Set_Qty_Reqd,
//          "NetWtUnit": Row.NetWtUnit
        };
        oValidation.Nav_ItemsX.push(oNavItem);
      });
      busyDialog.open();
      oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_HeaderX", oValidation, {
        success: function (oData, oResponse) {
          var vMsg = "Items with error are highlighted";
          var vTitle = "Information";
          var vIndexItem;
          var oNav_ItmXQtyNote = oData.Nav_ItmXQtyNote.results;
          oModelSSUDigitization.getData().IconTabBarVisible = false;
          oData.Nav_ItemsX = oData.Nav_ItemsX.results;
          $.each(oData.Nav_ItemsX, function (i, Row) {

            $.each(Nav_Items, function (Index, NavRow) {
              if (NavRow.uiFields.ItemNo == Row.Posnr) {
                vIndexItem = Index;
              }
            });

            if (Row.VendorFlag == "") {
              Nav_Items[vIndexItem].VendName = Row.VendName;
              /*Nav_Items[vIndexItem].VLocation = Row.VLocation;
              Nav_Items[vIndexItem].Currency = Row.Currency;
              Nav_Items[vIndexItem].ExtPrice = Row.ExtPrice;
              Nav_Items[vIndexItem].PirNo = Row.PirNo;
              Nav_Items[vIndexItem].Purorg = Row.Purorg;
              Nav_Items[vIndexItem].Pinforcat = Row.Pinforcat;
//              Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
              Nav_Items[vIndexItem].PinfoCatText = Row.PinfoCatText;*/
            }
            /*if (Row.PlantFlag == "") {
              //Nav_Items[vIndexItem].Plant = Row.Plant;
              Nav_Items[vIndexItem].PlantName = Row.PlantName;
            //  Nav_Items[vIndexItem].Taxonomy = Row.Taxonomy;
            }*/
            /*if(Row.StrLocFlag == ""){
              Nav_Items[vIndexItem].StrLoc = Row.StrLocDesc;
            }*/
            var oExtSetQty = Row.ExtSetQty;
            var oCurrenttSetQt = oModelSSUDigitization.getData().PaperDataSet.Nav_Items[vIndexItem].CurrenttSetQt;

            if(oExtSetQty != "")
              {
                var oCumSetQty = parseInt(oCurrenttSetQt) + parseInt(oExtSetQty);
                oCumSetQty = oCumSetQty.toString();
              }

            Nav_Items[vIndexItem].ExtSetQty = Row.ExtSetQty;
            Nav_Items[vIndexItem].CumSetQty = oCumSetQty;

            var oProtoPerVeh = oModelSSUDigitization.getData().PaperDataSet.Nav_Items[vIndexItem].ProtoPerVeh;
            var oQutProtoProce = oModelSSUDigitization.getData().PaperDataSet.Nav_Items[vIndexItem].QutProtoProce;
            var oCurrenttSetQt = oModelSSUDigitization.getData().PaperDataSet.Nav_Items[vIndexItem].CurrenttSetQt;
            if (oProtoPerVeh != "" || oQutProtoProce != "" || oCurrenttSetQt != "" )  {
              Nav_Items[vIndexItem].uiFields.Error = "Reject";
              Nav_Items[vIndexItem].uiFields.MassValidation = Row;
            } else {
              Nav_Items[vIndexItem].uiFields.Error = "Default";
            }
            if(Row.MaterialFlag == ""){
              Nav_Items[vIndexItem].MaterialDesc = Row.MaterialDesc;
            }
            if(Row.DelvryDateFlag == ""){
              Nav_Items[vIndexItem].DelvryDate = Row.DelvryDate;
            }
            if (Row.VendorFlag != "" || Row.StrLocFlag != "" || Row.MaterialFlag != "" || Row.DelvryDateFlag != "")  {
              Nav_Items[vIndexItem].uiFields.Error = "Reject";
              Nav_Items[vIndexItem].uiFields.MassValidation = Row;
            } else {
              Nav_Items[vIndexItem].uiFields.Error = "Default";
            }

            oController._validationDataFilled();
          });
          if (oData.ErrorFlag != "X") {
            //oModelSSUDigitization.setProperty("/BEValidation", true);
            oModelSSUDigitization.setProperty("/EditableFlag", false);
            vMsg = "All items have been validated successfully";
            vTitle = "Success";
            oModelSSUDigitization.getData().IconTabBarVisible = true;
          }
          oModelSSUDigitization.getData().ValidateButton = true;
          oModelSSUDigitization.setProperty("/Validation", oData);
          oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Items", Nav_Items);
          oModelSSUDigitization.setProperty("/PaperDataSet/Nav_ItmQtyNote", oNav_ItmXQtyNote);
          oModelSSUDigitization.refresh();
          MessageBox.success(vMsg, {
            title: vTitle
          });
          busyDialog.close();
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
      var oApproverFieldColor = {
        "Approver1Field" :"None",
        "Approver2Field" :"None",
        "Approver3Field" :"None",
        "Approver4Field" :"None", //Added by AGAWSA-CONT
        "Approver5Field" :"None", // Added by AGAWSA-CONT on 17.08.2023
        "Approver6Field" :"None",
        "Approver7Field" :"None",
        "Approver8Field" :"None",
      };
      if(oModelSSUDigitization.oData.Apr1 && oPaperData.Nav_Apprs[0] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver1Field = "Error";
      }

      if(oModelSSUDigitization.oData.Apr2 && oPaperData.Nav_Apprs[1] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver2Field = "Error";
      }

      if(oModelSSUDigitization.oData.Apr3 && oPaperData.Nav_Apprs[2] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver3Field = "Error";
      }
//      Add start AGAWSA-CONT on 19-05-2023
      if(oModelSSUDigitization.oData.Apr4 && oPaperData.Nav_Apprs[3] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver4Field = "Error";
      }
//    Add end AGAWSA-CONT on 19-05-2023
//      Insert start by AGAWSA-CONT on 17.08.2023
      if(oModelSSUDigitization.oData.Apr5 && oPaperData.Nav_Apprs[4] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver5Field = "Error";
      }

      if(oModelSSUDigitization.oData.Apr6 && oPaperData.Nav_Apprs[5] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver6Field = "Error";
      }

      if(oModelSSUDigitization.oData.Apr7 && oPaperData.Nav_Apprs[6] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver7Field = "Error";
      }
      if(oModelSSUDigitization.oData.Apr8 && oPaperData.Nav_Apprs[7] == undefined)
      {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
        oApproverFieldColor.Approver8Field = "Error";
      }
//    Insert end by AGAWSA-CONT on 17.08.2023
      if (oPaperData.Nav_DMS.length <= 0) {
        vFlag = false;
        oTabIconColor.Attachment = "Negative";
      } else {
        var vFlagSCP = false;
        $.each(oPaperData.Nav_DMS, function (i, RowDMS) {
          if (RowDMS.TabId == "SCP")
            vFlagSCP = true;
        });
        if (!vFlagSCP) {
          vFlag = false;
          oTabIconColor.Attachment = "Negative";
        }
      }
      /*if (oPaperData.Sector.length <= 0 || oPaperData.ProjCode.length <= 0 || oPaperData.PucGrp == "") {
        vFlag = false;
        oTabIconColor.VendorPartDetails = "Negative";
      }*/
      /*if (oPaperData.Createdby == "") {
        vFlag = false;
        oTabIconColor.Workflow = "Negative";
      }*/
      /*if (oPaperData.Nav_Items.length <= 0) {
        oTabIconColor.VendorPartDetails = "Negative";
      }
      $.each(oPaperData.Nav_Items, function (i, Row) {
        if (Row.uiFields.Error == "Reject") {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
        }
        if (Row.Plant == "" || Row.Vendor == "" || Row.Material == "" || Row.StrLoc == "" || Row.ProtoPerVeh == "0"
          || Row.QutProtoProce == "0" || Row.CurrenttSetQt == "0" || Row.DelvryDate == null) {
          vFlag = false;
          oTabIconColor.VendorPartDetails = "Negative";
        }
      });*/
      oModelSSUDigitization.setProperty("/TabIconColor", oTabIconColor);oApproverFieldColor
      oModelSSUDigitization.setProperty("/ApproverFieldColor", oApproverFieldColor);
      return vFlag;
    },
    //--------- Local Methods End --------------------------

    //---------- Formatter Methods Start --------------------

    visiblePartEdit: function(vEditable, vSector, vModel, vPucGrp) {
      if (vEditable && vSector && vSector.length > 0 && vModel && vModel.length > 0 && vPucGrp.length > 0) {
        return true;
      } else {
        return false;
      }
    },

    formatterPONum : function(nPONum,vStatus){
      if(nPONum == "" || nPONum == undefined)
      {
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
      else
      {
        return "PO No. "+nPONum
      }
    },
    formatterSetStatusColor : function(vStatus) {
      if (vStatus == "S" || vStatus == "NR") {
        return sap.ui.core.ValueState.Information;
      } else if (vStatus == "C") {
        return sap.ui.core.ValueState.None;
      } else if (vStatus == "R") {
        return sap.ui.core.ValueState.Error;
      } else {
        return sap.ui.core.ValueState.Warning;
      }
    },

    formattGetModelPlant: function (vSector) {
      if (vSector) {
        vSector = typeof vSector == "string" ? vSector.split(",") : vSector;
        this._getModelPlant(vSector);
        return vSector;
      }
    },

    formatterPartEdit: function (vEditable, vPlant) {
      return vEditable && (vPlant != "" ? true : false);
    },

    formattValidationError: function (vValue) {
      if (typeof vValue == "string") {
        return vValue != "" ? "Error" : "None";
      }
    },

    formatterGetDmsURL: function(vKey, vPosnr, vTabId) {
      var sServiceUrl = this.getOwnerComponent().getModel("oDataAmendmentModel").sServiceUrl;
      return sServiceUrl+"/ES_DMS(Filekey='" + vKey + "',Posnr='" + vPosnr + "',TabId='" + vTabId + "')/$value";
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
      var oF4Approver = [];
      if (oModelSSUDigitization.getProperty("/F4Approver")) {
        oF4Approver = $.grep(oModelSSUDigitization.getProperty("/F4Approver"), function (grepRow) {
          return (grepRow.Cycle == vValue);
        });
      }
      if (oF4Approver.length > 0) {
        oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", oF4Approver[0].Cycle);
        oModelSSUDigitization.setProperty("/PaperDataSet/Createdby", oF4Approver[0].Initiator);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver1", oF4Approver[0].Appr1);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver2", oF4Approver[0].Appr2);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver3", oF4Approver[0].Appr3);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver4", oF4Approver[0].Appr4);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver5", oF4Approver[0].Appr5);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver6", oF4Approver[0].Appr6);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver7", oF4Approver[0].Appr7);
        oModelSSUDigitization.setProperty("/PaperDataSet/Approver8", oF4Approver[0].Appr8);
      } else {
        oModelSSUDigitization.setProperty("/PaperDataSet/Cycle", "");
        oModelSSUDigitization.setProperty("/PaperDataSet/Createdby", "");
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

    onAddProtoItem: function (oEvent) {
      var oController = this;
      var oItemFrag = xmlFragment(oController, "ItemProto");
      // oItemFrag.getButtons()[0].setVisible(true);
      sap.m.DatePicker.prototype.onAfterRendering = function (e) {
                $('#' + e.srcControl.getId() + "-inner").prop('readonly', true);
            };
      var oModel = new JSONModel(getProtoItemDetailsObject());
      oItemFrag.setModel(oModel);
      oItemFrag.isAddNew = true;
      // oController.getView().getModel("ModelSSUDigitization").setProperty("/isAddNew", true);
      oItemFrag.open();
    },

    onSectorFinish: function (oEvent) {
      this._getModelPlant(oEvent.getSource().getSelectedKey());
    },
    onPurcGroupFinish:function (oEvent) {
      var vSelectedPurGroup = oEvent.getSource().getSelectedKey();
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      oModelSSUDigitization.setProperty("/PaperDataSet/PucGrp", vSelectedPurGroup)
    },

    onProjectCodeSelection: function (oEvent) {

        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        oModelSSUDigitization.setProperty("/PaperDataSet/ProjCode",  oEvent.getParameters().value);

    },

    onChangeTab: function(oEvent){
      var oController = this;
      if(oEvent.getParameters().selectedKey == "WF")
      {
        oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", false);
        oController.getView().getModel("ModelSSUDigitization").setProperty("/DisplayOnlyFlag", true);
      }
      else if(oEvent.getParameters().selectedKey == "VP")
      {
        oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", false);
        oController.getView().getModel("ModelSSUDigitization").setProperty("/DisplayOnlyFlag", false);
      }
    },

    onEditProto: function(oEvent)
    {
      var oController = this;
      var nLock = "X";
      oController._fnLockUnlockervice(nLock,oEvent);
    },

    onEditDispProto: function(oEvent)
    {
      var oController = this;
      var oItemFrag = xmlFragment(oController, "ItemProto");
      oItemFrag.setModel(oController._setDisplayFragmentModel(oEvent));
      oItemFrag.open();

    },


    onEdit: function () {
      var oController = this;
      oController.getView().getModel("ModelSSUDigitization").setProperty("/EditableFlag", true);
      oController.getView().getModel("ModelSSUDigitization").setProperty("/BEValidation", false);
    },

    onPressDelete:function(oEvent){
      var oController = this;
      var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
      MessageBox.confirm("Are you sure you want to delete this.", {
        title: "Confirm Delete",
        onClose: function (oAction) {
          if (oAction == "OK") {
            var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
            var oDeletedData = oModelSSUDigitization.getProperty(vSelectedPath);
            var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items"); 
            var vSetDeltPath = vSelectedPath.split("/");
            var oSelItem = vSetDeltPath.reverse().splice(0, 1);
            oNav_Items.splice(oSelItem,1);
            $.each(oNav_Items, function (i =1, Row) {
              Row.Posnr = (( i * 10) +10).toString();
            });
            oModelSSUDigitization.refresh();
          }
        }
      });
    },

    onOkItemDetail:function(oEvent){
      var oController = this;
      var nLock = "";
      oController._fnLockUnlockervice(nLock);
      var vAllFilled = oController._fnRequredFieldCheck(oEvent.getSource().getParent().getContent()[0]._aElements);
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    //  oModelSSUDigitization.getData().IconTabBarVisible = true;
      oModelSSUDigitization.getData().ValidateButton = true;
      var oFragItem = oEvent.getSource().getParent();
      if (vAllFilled && oFragItem.isAddNew) { // oModelSSUDigitization.getProperty("/isAddNew")
        var oNav_Items = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Items");
        var vChangedData = oFragItem.getModel().getData();
        oController._setDataAfterEditItem(oEvent);
        oEvent.getSource().getParent().close();
      } else if (vAllFilled) {

        var vSelectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
        var oItem = oModelSSUDigitization.getProperty(vSelectedPath);
        var oSettledPrice = oItem.SettledPrice;
        oController._setDataAfterEditItem(oEvent);
        //oModelSSUDigitization.setProperty(vSelectedPath + "/MarkUp", vMarkUp);
        oEvent.getSource().getParent().close();
        oController.getView().setBusy(true);
        var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
        var vParmeters = {
              "$expand":"Nav_Appr1,Nav_Appr2,Nav_Appr3,Nav_Appr4,Nav_Appr5,Nav_Appr6,Nav_Appr7,Nav_Appr8,Nav_SSUExec", // added Nav_appr4 by AGAWSA-CONT
              };
        oDataAmendmentModel.read("/ES_PaperCode(PaperCode='PPP',SettledPrice='"+oSettledPrice+"')", {
          urlParameters: vParmeters,
          success: function (oData, oResponse) {
            oModelSSUDigitization.getData().IconTabBarVisible = true;

            oModelSSUDigitization.getData().SubmitButton = true;


            oModelSSUDigitization.setProperty("/Apr1",true);
            if(oData.Nav_Appr1.results.length > 0)
              {
                oModelSSUDigitization.setProperty("/F4Approver1",oData.Nav_Appr1.results);
                oModelSSUDigitization.setProperty("/Apr1",true);
                oModelSSUDigitization.setProperty("/Apr2",false);
                oModelSSUDigitization.setProperty("/Apr3",false);
                oModelSSUDigitization.setProperty("/Apr4",false); // Added by AGAWSA-CONT
//                Insert start by AGAWSA-CONT on 17.08.2023
                oModelSSUDigitization.setProperty("/Apr5",false);
                oModelSSUDigitization.setProperty("/Apr6",false);
                oModelSSUDigitization.setProperty("/Apr7",false);
                oModelSSUDigitization.setProperty("/Apr8",false);
//              Insert end by AGAWSA-CONT on 17.08.2023
                oModelSSUDigitization.setProperty("/VisSSUExec",false);
              }
            if(oData.Nav_Appr2.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver2",oData.Nav_Appr2.results);
              oModelSSUDigitization.setProperty("/Apr2",true);
            }
            if(oData.Nav_Appr3.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver3",oData.Nav_Appr3.results);
              oModelSSUDigitization.setProperty("/Apr3",true);
            }
//            ADD start by AGAWSA-CONT
            if(oData.Nav_Appr4.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver4",oData.Nav_Appr4.results);
              oModelSSUDigitization.setProperty("/Apr4",true);
            }
//            ADD End by AGAWSA-CONT
//          Insert start by AGAWSA-CONT on 17.08.2023
            if(oData.Nav_Appr5.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver5",oData.Nav_Appr5.results);
              oModelSSUDigitization.setProperty("/Apr5",true);
            }
            if(oData.Nav_Appr6.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver6",oData.Nav_Appr6.results);
              oModelSSUDigitization.setProperty("/Apr6",true);
            }
            if(oData.Nav_Appr7.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver7",oData.Nav_Appr7.results);
              oModelSSUDigitization.setProperty("/Apr7",true);
            }
            if(oData.Nav_Appr8.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4Approver8",oData.Nav_Appr8.results);
              oModelSSUDigitization.setProperty("/Apr8",true);
            }
//          Insert start by AGAWSA-CONT on 17.08.2023
            if(oData.Nav_SSUExec.results.length > 0)
            {
              oModelSSUDigitization.setProperty("/F4SSUExec",oData.Nav_SSUExec.results);
              oModelSSUDigitization.setProperty("/VisSSUExec",true);
            }
//  ==============codee added by deepa on 10.12.2020 to resolve submit button issue============
//            var vSubmitFlag = false;
//
//
//            var vApr3 = oModelSSUDigitization.getProperty("/Apr3");
//            var vApr2 = oModelSSUDigitization.getProperty("/Apr2");
//            var vApr1 = oModelSSUDigitization.getProperty("/Apr1");
//            if(vApr1){
//              if(oModelSSUDigitization.getProperty("/Approver1") && oModelSSUDigitization.getProperty("/Approver1")!=undefined){
//              vSubmitFlag = true;
//              }else{
//                vSubmitFlag = false;
//              }
//            }
//            if(vApr2){
//            if(oModelSSUDigitization.getProperty("/Approver2") &&  oModelSSUDigitization.getProperty("/Approver2")!=undefined){
//              vSubmitFlag = true;
//            }else{
//              vSubmitFlag = false;
//            }
//            }
//            if(vApr3){
//              if(oModelSSUDigitization.getProperty("/Approver3") && oModelSSUDigitization.getProperty("/Approver3")!=undefined){
//                vSubmitFlag = true;
//              }else{
//                vSubmitFlag = false;
//              }
//            }
//
//            if(vSubmitFlag){
//              oModelSSUDigitization.getData().SubmitButton = true;
//            }else{
//              oModelSSUDigitization.getData().SubmitButton = false;
//            }
//            oModelSSUDigitization.refresh(true);
            oController.fnWorkflowValidate();

//  ================end=====================================


            oController.getView().setBusy(false);
          },
          error: function (oResponse) {
            MessageBox.error("Error while getting data.", {
              title: "Error"
            });
            oController.getView().setBusy(false);
          }
        });
      }

    },
//  ==========code added by deepa on 11-12-2020============
    fnWorkflowValidate:function(){
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSubmitFlag = false;
//      Insert start by AGAWSA-CONT on 17.08.2023
      var vApr8 = oModelSSUDigitization.getProperty("/Apr8");
      var vApr7 = oModelSSUDigitization.getProperty("/Apr7");
      var vApr6 = oModelSSUDigitization.getProperty("/Apr6");
      var vApr5 = oModelSSUDigitization.getProperty("/Apr5");
//    	Insert end by AGAWSA-CONT on 17.08.2023
      var vApr4 = oModelSSUDigitization.getProperty("/Apr4");
      var vApr3 = oModelSSUDigitization.getProperty("/Apr3");
      var vApr2 = oModelSSUDigitization.getProperty("/Apr2");
      var vApr1 = oModelSSUDigitization.getProperty("/Apr1");
      if(vApr1){
    	  if(oModelSSUDigitization.getProperty("/Approver1") && oModelSSUDigitization.getProperty("/Approver1")!=undefined){
    		  vSubmitFlag = true;
    	  }else{
    		  vSubmitFlag = false;
    	  }
      }
      if(vApr2){
    	  if(oModelSSUDigitization.getProperty("/Approver2") &&  oModelSSUDigitization.getProperty("/Approver2")!=undefined){
    		  vSubmitFlag = true;
    	  }else{
    		  vSubmitFlag = false;
    	  }
      }
      if(vApr3){
        if(oModelSSUDigitization.getProperty("/Approver3") && oModelSSUDigitization.getProperty("/Approver3")!=undefined){
          vSubmitFlag = true;
        }else{
          vSubmitFlag = false;
        }
      }
//      Add start by AGAWSA-CONT
      if(vApr4){
          if(oModelSSUDigitization.getProperty("/Approver4") && oModelSSUDigitization.getProperty("/Approver4")!=undefined){
            vSubmitFlag = true;
          }else{
            vSubmitFlag = false;
          }
        }
//      Add end By AGAWSA-CONT
//      Insert start by AGAWSA-CONT on 17.08.2023
      if(vApr5){
    	  if(oModelSSUDigitization.getProperty("/Approver5") && oModelSSUDigitization.getProperty("/Approver5")!=undefined){
    		  vSubmitFlag = true;
    	  }else{
    		  vSubmitFlag = false;
    	  }
      }
      if(vApr6){
    	  if(oModelSSUDigitization.getProperty("/Approver6") &&  oModelSSUDigitization.getProperty("/Approver6")!=undefined){
    		  vSubmitFlag = true;
    	  }else{
    		  vSubmitFlag = false;
    	  }
      }
      if(vApr7){
        if(oModelSSUDigitization.getProperty("/Approver7") && oModelSSUDigitization.getProperty("/Approver7")!=undefined){
          vSubmitFlag = true;
        }else{
          vSubmitFlag = false;
        }
      }
      if(vApr8){
          if(oModelSSUDigitization.getProperty("/Approver8") && oModelSSUDigitization.getProperty("/Approver8")!=undefined){
            vSubmitFlag = true;
          }else{
            vSubmitFlag = false;
          }
        }
//      Insert end by AGAWSA-CONT on 17.08.2023
      if(vSubmitFlag){
        oModelSSUDigitization.getData().SubmitButton = true;
      }else{
        oModelSSUDigitization.getData().SubmitButton = false;
      }
      oModelSSUDigitization.refresh(true);
    },
//  =================end==================================

    onSubmit:function(oEvent)
    {

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oArray = [];
      if (sap.ui.core.Element.registry) {
        sap.ui.core.Element.registry.forEach(function (row) {
          oArray.push(row)
        });
      }
      //var oMandatoryFlag = oController._fnRequredFieldCheck(oArray);
      var vValiDataField = oController._validationDataFilled();

      if (vValiDataField) {
        MessageBox.confirm("This is confirmation to submit.", {
          title: "Post to SAP confirmation",
          onClose: function (oAction) {
            if (oAction == "OK") {
              var oPaperData = oController._fnDataBeforeSave();
//              var etag = oModelSSUDigitization.getProperty("/eTag");
              //oPaperData.Action = "S";
              //oPaperData.UsrComment = oEvent.getSource().getParent().getContent()[0].getValue();
              busyDialog.open();
//              oController.getOwnerComponent().getModel("oDataAmendmentModel").oHeaders["LastChange"]=oPaperData.LastChange;
              oController.getOwnerComponent().getModel("oDataAmendmentModel").create("/ES_Header", oPaperData, {
                success: function (oData, oResponse) {

                  var vMsgReturn = serviceSucess(oData.Nav_Return.results);
                  if (vMsgReturn.Title == "Error") {
                    sap.m.MessageBox.error(vMsgReturn.Message, {
                      title: vMsgReturn.Title
                    });

                  } else if (vMsgReturn.Title == "Sucess") {
                    sap.m.MessageBox.success(vMsgReturn.Message, {
                      title: vMsgReturn.Title,
                      onClose: function () {
                        navParentBack();
                      }
                    });
                  }
                  // oModelSSUDigitization.setProperty("/EditableFlag", false);
                },
                error: function (oResponse) {

                  serviceError(oResponse);
                }
              });

            }
          }
        });


        }

       else {
        /*oModelSSUDigitization.setProperty("/EditableFlag", true);*/

        MessageBox.error("fill all the mandatory fields", {
          title: "Fill all fields"
        });
        oEvent.getSource().getParent().getParent().getAggregation("content")[1].setSelectedKey("AT");
      }
    },

    onProtoAttachment:function(oEvent)
    {
      var oController = this;
      var oAttachFrag = xmlFragment(oController, "Attachment");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var vSelectedPath = oEvent.getSource().getParent().getParent().getBindingContextPath("ModelSSUDigitization");
      oModelSSUDigitization.setProperty("/SelectedPath", vSelectedPath);
      var vSectedData = oModelSSUDigitization.getProperty(vSelectedPath);
//      var vSelectedTab = oModelSSUDigitization.getProperty("/SelectedTab");
      var vFilters = [
        new sap.ui.model.Filter("Posnr", sap.ui.model.FilterOperator.EQ, vSectedData.Posnr)
      ];
      oAttachFrag.getContent()[0].getBinding("items").filter(vFilters);
      oAttachFrag.open();
    },

    onDownldTempPartDet: function () {
      window.open("proxy/sap/opu/odata/sap/ZMM_SSU_PPP_SRV/ES_Excel('PPP')/$value");
    },

    onMassUpload: function (oEvent) {
      var oController = this;
      try {
        if (oController.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/Nav_Items").length >= 50) {
          sap.m.MessageToast.show("Mass upload not allowed, because more than 50 items already added.");
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

    onVendorValHelp: function (e) {
      var oController = this;
      var oVendor = xmlFragment(oController, "ValueHelp");
      oVendor.setTitle("Vendor Search");
      var template = new sap.m.StandardListItem({
        title: "{VendName}",
        description: "{Vendor}"
      });
      oVendor.bindAggregation("items", "/", template);
      oVendor.setModel(new JSONModel());
      oVendor.parentModel = e.getSource().getBindingContext().getModel();
      oVendor.open();
    },

    onPurGrpValueHelp: function (e) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oPurGrpValueHelp = xmlFragment(oController, "ValueHelp");
      oPurGrpValueHelp.setTitle("PurGrp Search");
      var template = new sap.m.StandardListItem({
        title: "{ModelSSUDigitization>PucGrp}",
        description: "{ModelSSUDigitization>PucGrpName}"
      });
      oPurGrpValueHelp.bindAggregation("items", "ModelSSUDigitization>/F4PurGrp", template);
      oPurGrpValueHelp.setModel(oModelSSUDigitization,"ModelSSUDigitization");


      //oPurGrpValueHelp.parentModel = e.getSource().getBindingContext().getModel();
      oPurGrpValueHelp.open();
    },

    handlePurGrpSearch:function(e){
      var vSelectedValue = "*"+e.getParameter("newValue").toUpperCase()+"*";
      var filters = [];
      var valueHelp = e.getSource();
      //var oPurGrpValueHelp= sap.ui.getCore().byId("idPurGrp");
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
      valueHelp.setBusy(true);
      oDataAmendmentModel.read("/ES_PurGrp", {
        filters: [new sap.ui.model.Filter("PucGrp", sap.ui.model.FilterOperator.EQ, vSelectedValue)],
        success: function (oData, oResponse) {
          if(oData.results[0].Message == "")
            {
              oModelSSUDigitization.setProperty("/F4PurGrp",oData.results);
              //oModelSSUDigitization.refresh();
              valueHelp.setModel(oModelSSUDigitization,"ModelSSUDigitization");//.refresh();
              //oPurGrpValueHelp.setModel(oModelSSUDigitization,"ModelSSUDigitization");
              //valueHelp.getModel("ModelSSUDigitization").refresh();
                valueHelp.setBusy(false);


            }
          else{
              MessageBox.error(oData.results[0].Message, {
                title: "Error"
              });
              valueHelp.setBusy(false);
            }
        }.bind(this),
        error: function (oResponse) {
          valueHelp.getModel().setData([]);
          valueHelp.setBusy(false);
        }
      });
    },

    onPlantValueHelp: function (e) {
      var oController = this;
      var oPlantValueHelp = xmlFragment(oController, "ValueHelp");
      oPlantValueHelp.setTitle("Plant");
      var template = new sap.m.StandardListItem({
        title: "{Plant}",
        description: "{PlantName}"
      });
      oPlantValueHelp.bindAggregation("items", "/", template);
      oPlantValueHelp.setModel(new JSONModel());
      oPlantValueHelp.parentModel = e.getSource().getBindingContext().getModel();
      oPlantValueHelp.open();

    },

     onStorageLocationValueHelp: function (e) {
      // oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var vPlant = e.getSource().getBindingContext().getModel().getData().Plant;
      if(vPlant == undefined)
        {
          MessageBox.error("Please Enter Plant");
          return;
        }
      var oController = this;
      var oStorageLocationValueHelp = xmlFragment(oController, "ValueHelp");
      oStorageLocationValueHelp.setTitle("StorageLocation");
      var template = new sap.m.StandardListItem({
        title: "{StrLoc}",
        description: "{StrLocDesc}"
      });
      oStorageLocationValueHelp.bindAggregation("items", "/", template);
      oStorageLocationValueHelp.setModel(new JSONModel());
      oStorageLocationValueHelp.parentModel = e.getSource().getBindingContext().getModel();
      oStorageLocationValueHelp.open();
    },

    onMaterialValueHelp: function (e) {
      //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      e.getSource().getBindingContext().getModel().setProperty("/CumSetQty","");
      e.getSource().getBindingContext().getModel().setProperty("/CurrenttSetQt","");
      e.getSource().getBindingContext().getModel().setProperty("/ProtoPerVeh","");
      e.getSource().getBindingContext().getModel().setProperty("/QutProtoProce","");
      var vPlant = e.getSource().getBindingContext().getModel().getData().Plant;
      var vStorageLocation = e.getSource().getBindingContext().getModel().getData().StrLoc;
      //var vProjectCode = e.getSource().getBindingContext().getModel().getData().StrLoc;
      var vVendCode = e.getSource().getBindingContext().getModel().getData().Vendor;
      if(vPlant == undefined)
        {
          MessageBox.error("Please Enter Plant");
          return;
        }
      else if(vStorageLocation == undefined)
        {
          MessageBox.error("Please Enter Storage Location");
          return;
        }
      var oController = this;
      var oMaterialValueHelp = xmlFragment(oController, "ValueHelp");
      oMaterialValueHelp.setTitle("Material");
      var template = new sap.m.StandardListItem({
        title: "{Material}",
        description: "{MaterialDesc}",
        info: "{ExtSetQty}"

      });
      oMaterialValueHelp.bindAggregation("items", "/", template);
      oMaterialValueHelp.setModel(new JSONModel());
      oMaterialValueHelp.parentModel = e.getSource().getBindingContext().getModel();
      oMaterialValueHelp.open();
    },


    onTaxCodeValueHelp: function (e) {
      //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");

      var vPlant = e.getSource().getBindingContext().getModel().getData().Plant;
      var vVendCode = e.getSource().getBindingContext().getModel().getData().Vendor;
      var oController = this;
      var onTaxCodeValueHelp = xmlFragment(oController, "ValueHelp");
      onTaxCodeValueHelp.setTitle("Tax Code");
      var template = new sap.m.StandardListItem({
        title: "{TaxCode}",
        description: "{TaxCodeTxt}"


      });
      onTaxCodeValueHelp.bindAggregation("items", "/", template);
      onTaxCodeValueHelp.setModel(new JSONModel());
      onTaxCodeValueHelp.parentModel = e.getSource().getBindingContext().getModel();
      onTaxCodeValueHelp.open();
    },
    onApprover1ValueHelp : function(e){

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");

      var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
      oApproverValueHelp.setTitle("Approver Level 1");
      var template = new sap.m.StandardListItem({
        title: "{oModelSSUDigitization>Appr}",
        description: "{oModelSSUDigitization>ApprName}",
        info:"{oModelSSUDigitization>Level}"
      });
      oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver1", template);
      oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
      oApproverValueHelp.open();


    },

    onApprover2ValueHelp :function(e){

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
        {
          MessageBox.error("Please Select Approver 1");
          return;
        }

      var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
      oApproverValueHelp.setTitle("Approver Level 2");
      var template = new sap.m.StandardListItem({
        title: "{oModelSSUDigitization>Appr}",
        description: "{oModelSSUDigitization>ApprName}",
        info:"{oModelSSUDigitization>Level}"
      });
      oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver2", template);
      oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
      oApproverValueHelp.open();


    },

    onApprover3ValueHelp :function(e){

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
      {
        MessageBox.error("Please Select Approver 1");
        return;
      }
      else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
      {
        MessageBox.error("Please Select Approver 2");
        return;
      }

      var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
      oApproverValueHelp.setTitle("Approver Level 3");
      var template = new sap.m.StandardListItem({
        title: "{oModelSSUDigitization>Appr}",
        description: "{oModelSSUDigitization>ApprName}",
        info:"{oModelSSUDigitization>Level}"
      });
      oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver3", template);
      oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
      oApproverValueHelp.open();


    },
//    Added start by AGAWSA-CONT
    onApprover4ValueHelp :function(e){
        var oController = this;
        var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
        if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
        {
          MessageBox.error("Please Select Approver 1");
          return;
        }
        else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
        {
          MessageBox.error("Please Select Approver 2");
          return;
        }
        else if(oModelSSUDigitization.getProperty("/Approver3Code") == undefined)
        {
          MessageBox.error("Please Select Approver 3");
          return;
        }
        var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
        oApproverValueHelp.setTitle("Approver Level 4");
        var template = new sap.m.StandardListItem({
          title: "{oModelSSUDigitization>Appr}",
          description: "{oModelSSUDigitization>ApprName}",
          info:"{oModelSSUDigitization>Level}"
        });
        oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver4", template);
        oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
        oApproverValueHelp.open();
      },
//	 Added end by AGAWSA-CONT
//      Insert Start by AGAWSA-CONT on 17.08.2023
      onApprover5ValueHelp :function(e){
    	  var oController = this;
    	  var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    	  if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 1");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 2");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver3Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 3");
    		  return;
    	  }
    	  if(oModelSSUDigitization.getProperty("/Approver4Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 4");
    		  return;
    	  }
    	  var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
    	  oApproverValueHelp.setTitle("Approver Level 5");
    	  var template = new sap.m.StandardListItem({
    		  title: "{oModelSSUDigitization>Appr}",
    		  description: "{oModelSSUDigitization>ApprName}",
    		  info:"{oModelSSUDigitization>Level}"
    	  });
    	  oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver5", template);
    	  oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
    	  oApproverValueHelp.open();
      },
      onApprover6ValueHelp :function(e){
    	  var oController = this;
    	  var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    	  if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 1");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 2");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver3Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 3");
    		  return;
    	  }
    	  if(oModelSSUDigitization.getProperty("/Approver4Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 4");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver5Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 5");
    		  return;
    	  }
    	  var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
    	  oApproverValueHelp.setTitle("Approver Level 6");
    	  var template = new sap.m.StandardListItem({
    		  title: "{oModelSSUDigitization>Appr}",
    		  description: "{oModelSSUDigitization>ApprName}",
    		  info:"{oModelSSUDigitization>Level}"
    	  });
    	  oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver6", template);
    	  oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
    	  oApproverValueHelp.open();
      },
      onApprover7ValueHelp :function(e){
    	  var oController = this;
    	  var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    	  if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 1");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 2");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver3Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 3");
    		  return;
    	  }
    	  if(oModelSSUDigitization.getProperty("/Approver4Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 4");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver5Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 5");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver6Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 6");
    		  return;
    	  }
    	  var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
    	  oApproverValueHelp.setTitle("Approver Level 7");
    	  var template = new sap.m.StandardListItem({
    		  title: "{oModelSSUDigitization>Appr}",
    		  description: "{oModelSSUDigitization>ApprName}",
    		  info:"{oModelSSUDigitization>Level}"
    	  });
    	  oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver7", template);
    	  oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
    	  oApproverValueHelp.open();
      },
      onApprover8ValueHelp :function(e){
    	  var oController = this;
    	  var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
    	  if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 1");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 2");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver3Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 3");
    		  return;
    	  }
    	  if(oModelSSUDigitization.getProperty("/Approver4Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 4");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver5Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 5");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver6Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 6");
    		  return;
    	  }
    	  else if(oModelSSUDigitization.getProperty("/Approver7Code") == undefined)
    	  {
    		  MessageBox.error("Please Select Approver 7");
    		  return;
    	  }
    	  var oApproverValueHelp = xmlFragment(oController, "ValueHelp");
    	  oApproverValueHelp.setTitle("Approver Level 8");
    	  var template = new sap.m.StandardListItem({
    		  title: "{oModelSSUDigitization>Appr}",
    		  description: "{oModelSSUDigitization>ApprName}",
    		  info:"{oModelSSUDigitization>Level}"
    	  });
    	  oApproverValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4Approver8", template);
    	  oApproverValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
    	  oApproverValueHelp.open();
      },
// Insert end By AGAWSA-CONT on 17.08.2023
    onSSUValueHelp:function(e){

      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      if(oModelSSUDigitization.getProperty("/Approver1Code") == undefined)
      {
        MessageBox.error("Please Select Approver 1");
        return;
      }
      else if(oModelSSUDigitization.getProperty("/Approver2Code") == undefined)
      {
        MessageBox.error("Please Select Approver 2");
        return;
      }
      else if(oModelSSUDigitization.getProperty("/Approver3Code") == undefined)
      {
        MessageBox.error("Please Select Approver 3");
        return;
      }

      var oSSUValueHelp = xmlFragment(oController, "ValueHelp");
      oSSUValueHelp.setTitle("SSU Executive");
      var template = new sap.m.StandardListItem({
        title: "{oModelSSUDigitization>Appr}",
        description: "{oModelSSUDigitization>ApprName}",
        info:"{oModelSSUDigitization>Level}"
      });
      oSSUValueHelp.bindAggregation("items", "oModelSSUDigitization>/F4SSUExec", template);
      oSSUValueHelp.setModel(oModelSSUDigitization,"oModelSSUDigitization");
      oSSUValueHelp.open();


    },

    handleConfirm:function(e){
      var oSelectedItem = e.getParameter("selectedItem");
      var oController = this;
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      //var oSelectedData = e.getSource().getModel().getProperty(oSelectedItem.getBindingContextPath());
      //var vNav_Apprs = [];
      var oParentModel = e.getSource().parentModel;
      if(e.getSource().getTitle() == "Vendor Search")
      {
        var vVendorName = e.getParameter("selectedItem").getTitle();
        var vVendorCode = e.getParameter("selectedItem").getDescription();
        //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");

        var oSelectedPath = oModelSSUDigitization.getData().SelectedPath;
        if(oSelectedPath != undefined && oSelectedPath != "" && oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation != undefined)
          {
            oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation.VendorFlag = "";
          }


        oParentModel.setProperty("/Vendor", vVendorCode);
        oParentModel.setProperty("/VendName", vVendorName);
      }
      else if(e.getSource().getTitle() == "PurGrp Search")
      {
        var vPurGrp = e.getParameter("selectedItem").getTitle();
        //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
        //oParentModel.setProperty("/PucGrp", vPurGrp);
        oModelSSUDigitization.setProperty("/PaperDataSet/PucGrp", vPurGrp);
      }
      else if(e.getSource().getTitle() == "Plant")
        {
          var vPlant = e.getParameter("selectedItem").getTitle();
          //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");

          var oSelectedPath = oModelSSUDigitization.getData().SelectedPath;
          if(oSelectedPath != undefined && oSelectedPath != "" && oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation != undefined)
          {
            oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation.PlantFlag = "";
          }
          oParentModel.setProperty("/Plant", vPlant);
      }
      else if(e.getSource().getTitle() == "StorageLocation")
        {
          var vStorageLocation = e.getParameter("selectedItem").getTitle();
          //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");

          var oSelectedPath = oModelSSUDigitization.getData().SelectedPath;
          if(oSelectedPath != undefined && oSelectedPath != "" && oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation != undefined)
          {
            oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation.StrLocFlag = "";
          }
          oParentModel.setProperty("/StrLoc", vStorageLocation);
        }
      else if(e.getSource().getTitle() == "Material")
      {
        var vMaterialCode = e.getParameter("selectedItem").getTitle();
        var vMaterailName = e.getParameter("selectedItem").getDescription();
        var vExtSetQty =  e.getParameter("selectedItem").getInfo();
        //var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
        var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
        for(var i=0; i< oModelSSUDigitization.getData().PaperDataSet.Nav_Items.length; i++)
        {
          if(oModelSSUDigitization.getData().PaperDataSet.Nav_Items[i].Material == vMaterialCode)
          {
            MessageBox.error("Material "+ vMaterialCode +" is already used in this Proto PR", {
            title: "Error"
            });
            return;
          }
        }


        var oSelectedPath = oModelSSUDigitization.getData().SelectedPath;
        if(oSelectedPath != undefined && oSelectedPath != "" && oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation != undefined)
        {
          oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation.MaterialFlag = "";
        }
        oParentModel.setProperty("/Material", vMaterialCode);
        oParentModel.setProperty("/MaterialDesc", vMaterailName);
        oParentModel.setProperty("/ExtSetQty", vExtSetQty);

      }
      else if(e.getSource().getTitle() == "Tax Code")
      {
        var vTaxCode = e.getParameter("selectedItem").getTitle();
        var vTaxName = e.getParameter("selectedItem").getDescription();

        oParentModel.setProperty("/TaxCode", vTaxCode);
        oParentModel.setProperty("/TaxCodeTxt", vTaxName);


      }
      else if(e.getSource().getTitle() == "Approver Level 1")
      {
        var vApprover1Code = e.getParameter("selectedItem").getTitle();
        var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
        if(vArray[0].Appr != vApprover1Code)
          {
            var vApprover1 = e.getParameter("selectedItem").getDescription();
            var vLevel1 = e.getParameter("selectedItem").getInfo();
            var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
            oModelSSUDigitization.setProperty("/Approver1", vApprover1);
            oModelSSUDigitization.setProperty("/Approver1Code", vApprover1Code);
//            oModelSSUDigitization.setProperty("/Approver3Code","");
//            oModelSSUDigitization.setProperty("/Approver3","");

            var oApprover = {
                     "Appr":vApprover1Code,
                     "Level":vLevel1
                     }                                                  
            var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
            var vIndex;
            var vA1 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A1"){vIndex=i;return row} });
                if(vA1.length <= 0)
            {
//                  vNav_Apprs.pop();
              vNav_Apprs.push(oApprover);
            }
            else
            {
              vNav_Apprs[vIndex] = oApprover;
            }
              oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
            this.fnWorkflowValidate();
            //oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
          }
        else
          {
            MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
          }


      }
      else if(e.getSource().getTitle() == "Approver Level 2")
      {
        var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
        var vApprover2Code = e.getParameter("selectedItem").getTitle();
        if(vArray[0].Appr != vApprover2Code)
          {
            /*if(oModelSSUDigitization.getProperty("/Approver1Code") != vApprover2Code)
             {*/
              var vLevel2 = e.getParameter("selectedItem").getInfo();
              var vApprover2 = e.getParameter("selectedItem").getDescription();
              var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
              oModelSSUDigitization.setProperty("/Approver2", vApprover2);
              oModelSSUDigitization.setProperty("/Approver2Code", vApprover2Code);
//              oModelSSUDigitization.setProperty("/Approver3Code","");
//              oModelSSUDigitization.setProperty("/Approver3","");

              var oApprover = {
                       "Appr":vApprover2Code,
                       "Level":vLevel2
                       }                                                  
                                          
              var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
              var vIndex;
              var vA2 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A2"){vIndex=i;return row} });
                  if(vA2.length <= 0)
              {
//                    vNav_Apprs.pop();
                vNav_Apprs.push(oApprover);
              }
              else
              {
                vNav_Apprs[vIndex] = oApprover;
              }
              //oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
              this.fnWorkflowValidate();
               /*}
            else
            {
              MessageBox.error( "User ID "+vApprover2Code +" already used in previous approval level", {
                title: "Error"
              });
            }*/

          }
        else
          {
            MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
          }



      }
      else if(e.getSource().getTitle() == "Approver Level 3")
      {
        var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
        var vApprover3Code = e.getParameter("selectedItem").getTitle();
        if(vArray[0].Appr !=  vApprover3Code)
          {
            /*if(oModelSSUDigitization.getProperty("/Approver2Code") !=   vApprover3Code  && 
                oModelSSUDigitization.getProperty("/Approver1Code") !=  vApprover3Code)
              {*/
                var vLevel3 = e.getParameter("selectedItem").getInfo();
                var vApprover3 = e.getParameter("selectedItem").getDescription();
                var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
                oModelSSUDigitization.setProperty("/Approver3", vApprover3);
                oModelSSUDigitization.setProperty("/Approver3Code", vApprover3Code);
                oModelSSUDigitization.setProperty("/BEValidation", true);

                var oApprover = {
                         "Appr":vApprover3Code,
                         "Level":vLevel3
                         }                                                  
                                            
                var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                var vIndex;
                var vA3 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A3"){vIndex=i;return row} });
                    if(vA3.length <= 0)
                {
//                      vNav_Apprs.pop();
                  vNav_Apprs.push(oApprover);
                }
                else
                {
                  vNav_Apprs[vIndex] = oApprover;
                }
                    /*if(vNav_Apprs.length == 3)
                {
//                      vNav_Apprs.pop();
                  vNav_Apprs.push(oApprover);
                }
                else
                {
                  vNav_Apprs[2] = oApprover;
                }*/


                oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                this.fnWorkflowValidate();
                /*}
            else{
              MessageBox.error("User ID"+vApprover3Code + " already used in previous approval level", {
              title: "Error"
              });
            }*/
            //oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
          }
      }
//      Add Start by AGAWSA-CONT on 19-05-2023
        else if(e.getSource().getTitle() == "Approver Level 4")
        {
          var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
          var vApprover4Code = e.getParameter("selectedItem").getTitle();
          if(vArray[0].Appr !=  vApprover4Code)
            {
              /*if(oModelSSUDigitization.getProperty("/Approver2Code") !=   vApprover3Code  && 
                  oModelSSUDigitization.getProperty("/Approver1Code") !=  vApprover3Code)
                {*/
                  var vLevel4 = e.getParameter("selectedItem").getInfo();
                  var vApprover4 = e.getParameter("selectedItem").getDescription();
                  var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
                  oModelSSUDigitization.setProperty("/Approver4", vApprover4);
                  oModelSSUDigitization.setProperty("/Approver4Code", vApprover4Code);
                  oModelSSUDigitization.setProperty("/BEValidation", true);

                  var oApprover = {
                           "Appr":vApprover4Code,
                           "Level":vLevel4
                           }                                                  
                                              
                  var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                  var vIndex;
                  var vA4 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A4"){vIndex=i;return row} });
                      if(vA4.length <= 0)
                  {
//                        vNav_Apprs.pop();
                    vNav_Apprs.push(oApprover);
                  }
                  else
                  {
                    vNav_Apprs[vIndex] = oApprover;
                  }
                  oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                  this.fnWorkflowValidate();
            }
//          Add end by AGAWSA-CONT on 19-05-2023
        else{
            MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
          }
      }
      else if(e.getSource().getTitle() == "Approver Level 5")
        {
          var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
          var vApprover5Code = e.getParameter("selectedItem").getTitle();
          if(vArray[0].Appr !=  vApprover5Code)
            {
                  var vLevel5 = e.getParameter("selectedItem").getInfo();
                  var vApprover5 = e.getParameter("selectedItem").getDescription();
                  var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
                  oModelSSUDigitization.setProperty("/Approver5", vApprover5);
                  oModelSSUDigitization.setProperty("/Approver5Code", vApprover5Code);
                  oModelSSUDigitization.setProperty("/BEValidation", true);

                  var oApprover = {
                           "Appr":vApprover5Code,
                           "Level":vLevel5
                           }                                                  
                                              
                  var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                  var vIndex;
                  var vA5 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A5"){vIndex=i;return row} });
                      if(vA5.length <= 0)
                  {
//                        vNav_Apprs.pop();
                    vNav_Apprs.push(oApprover);
                  }
                  else
                  {
                    vNav_Apprs[vIndex] = oApprover;
                  }
                  oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                  this.fnWorkflowValidate();
            }
        else{
            MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
          }
      }
      else if(e.getSource().getTitle() == "Approver Level 6")
      {
        var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
        var vApprover6Code = e.getParameter("selectedItem").getTitle();
        if(vArray[0].Appr !=  vApprover6Code)
          {
                var vLevel6 = e.getParameter("selectedItem").getInfo();
                var vApprover6 = e.getParameter("selectedItem").getDescription();
                var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
                oModelSSUDigitization.setProperty("/Approver6", vApprover6);
                oModelSSUDigitization.setProperty("/Approver6Code", vApprover6Code);
                oModelSSUDigitization.setProperty("/BEValidation", true);

                var oApprover = {
                         "Appr":vApprover6Code,
                         "Level":vLevel6
                         }                                                  
                                            
                var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                var vIndex;
                var vA6 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A6"){vIndex=i;return row} });
                    if(vA6.length <= 0)
                {
//                      vNav_Apprs.pop();
                  vNav_Apprs.push(oApprover);
                }
                else
                {
                  vNav_Apprs[vIndex] = oApprover;
                }
                oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                this.fnWorkflowValidate();
          }
      else{
          MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
        }
    }
      else if(e.getSource().getTitle() == "Approver Level 7")
      {
        var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
        var vApprover7Code = e.getParameter("selectedItem").getTitle();
        if(vArray[0].Appr !=  vApprover7Code)
          {
                var vLevel7 = e.getParameter("selectedItem").getInfo();
                var vApprover7 = e.getParameter("selectedItem").getDescription();
                var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
                oModelSSUDigitization.setProperty("/Approver7", vApprover7);
                oModelSSUDigitization.setProperty("/Approver7Code", vApprover7Code);
                oModelSSUDigitization.setProperty("/BEValidation", true);

                var oApprover = {
                         "Appr":vApprover7Code,
                         "Level":vLevel7
                         }                                                  
                                            
                var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                var vIndex;
                var vA7 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A7"){vIndex=i;return row} });
                    if(vA7.length <= 0)
                {
//                      vNav_Apprs.pop();
                  vNav_Apprs.push(oApprover);
                }
                else
                {
                  vNav_Apprs[vIndex] = oApprover;
                }
                oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                this.fnWorkflowValidate();
          }
      else{
          MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
        }
    }
      else if(e.getSource().getTitle() == "Approver Level 8")
      {
        var vArray = $.grep(oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs"),function(row){return row.Level=="SS"});
        var vApprover8Code = e.getParameter("selectedItem").getTitle();
        if(vArray[0].Appr !=  vApprover8Code)
          {
                var vLevel8 = e.getParameter("selectedItem").getInfo();
                var vApprover8 = e.getParameter("selectedItem").getDescription();
                var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
                oModelSSUDigitization.setProperty("/Approver8", vApprover8);
                oModelSSUDigitization.setProperty("/Approver8Code", vApprover8Code);
                oModelSSUDigitization.setProperty("/BEValidation", true);

                var oApprover = {
                         "Appr":vApprover8Code,
                         "Level":vLevel8
                         }                                                  
                                            
                var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                var vIndex;
                var vA8 = $.grep(vNav_Apprs,function(row,i){  if(row.Level=="A8"){vIndex=i;return row} });
                    if(vA8.length <= 0)
                {
//                      vNav_Apprs.pop();
                  vNav_Apprs.push(oApprover);
                }
                else
                {
                  vNav_Apprs[vIndex] = oApprover;
                }
                oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
                this.fnWorkflowValidate();
          }
      else{
          MessageBox.error( "Initiator cannot be an approver", {title: "Error"});
        }
    }
      else if(e.getSource().getTitle() == "SSU Executive")
      {
        var vSSUExecCode = e.getParameter("selectedItem").getTitle();
        var vSSUExec = e.getParameter("selectedItem").getDescription();
        var vLevel4 = e.getParameter("selectedItem").getInfo();
            var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
            oModelSSUDigitization.setProperty("/SSUExec", vSSUExec);
            oModelSSUDigitization.setProperty("/SSUExecCode", vSSUExecCode);
            oModelSSUDigitization.setProperty("/BEValidation", true);

            var oApprover = {
                     "Appr":vSSUExecCode,
                     "Level":vLevel4
                     }                                                  
                                        
            var vNav_Apprs = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_Apprs");
                if(vNav_Apprs.length == 4)
            {
              vNav_Apprs.push(oApprover);
            }
            else
            {
              vNav_Apprs[3] = oApprover;
            }
              oModelSSUDigitization.setProperty("/PaperDataSet/Nav_Apprs", vNav_Apprs);
            this.fnWorkflowValidate();
      }
    },
    handleSearch: function (e) {
      var vSelectedValue = "*"+e.getParameter("value").toUpperCase()+"*";
      var valueHelp = e.getSource();
      var filters = [];

      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var oDataAmendmentModel = this.getOwnerComponent().getModel("oDataAmendmentModel");
//      var plant = e.getSource().parentModel.getProperty("/Plant");
//      var PartNo = e.getSource().parentModel.getProperty("/PartNo");
//      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      if (e.getSource().getTitle() == "Vendor Search") {
        if(vSelectedValue == "**")
          {
            MessageBox.error("Please Enter Vendor Code", {
              title: "Error"
              });
             valueHelp.getModel().setData([]);
            return;
          }
          valueHelp.setBusy(true);
          /*filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
          filters.push(new sap.ui.model.Filter("PartNo", sap.ui.model.FilterOperator.EQ, PartNo));

          filters.push(new sap.ui.model.Filter("F4Flag", sap.ui.model.FilterOperator.EQ, "X"));
//          filters.push(new sap.ui.model.Filter("PaperCode", sap.ui.model.FilterOperator.EQ, vPaperCode));
*/
          filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSelectedValue));
          oDataAmendmentModel.read("/ES_Vendor", {
            filters: filters,
            success: function (oData, oResponse) {
              if(oData.results[0].Message == "")
              {
                valueHelp.getModel().setData(oData.results);
                valueHelp.getModel().refresh();
                valueHelp.setBusy(false);

              }
              else{
                  MessageBox.error(oData.results[0].Message, {
                    title: "Error"
                  });
                  valueHelp.setBusy(false);
                }
            },
            error: function (oResponse) {
              valueHelp.getModel().setData([]);
              valueHelp.setBusy(false);
            }
          });

      } else if (e.getSource().getTitle() == "Plant") {
          if(vSelectedValue == "**")
          {
            MessageBox.error("Please Enter Plant", {
              title: "Error"
              });
            valueHelp.getModel().setData([]);
            return;
          }
          var plant = e.getSource().parentModel.getProperty("/Plant");
          valueHelp.setBusy(true);
          oDataAmendmentModel.read("/ES_Plant", {
            filters: [new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSelectedValue)],
            success: function (oData, oResponse) {
              if(oData.results[0].Message == "")
              {
                valueHelp.getModel().setData(oData.results);
                valueHelp.getModel().refresh();
                valueHelp.setBusy(false);

              }
              else{
                  MessageBox.error(oData.results[0].Message, {
                    title: "Error"
                  });
                  valueHelp.setBusy(false);
                }
            }.bind(this),
            error: function (oResponse) {
              valueHelp.getModel().setData([]);
              valueHelp.setBusy(false);
            }
          });

      } else if(e.getSource().getTitle() == "PurGrp Search") {
          if(vSelectedValue == "**")
          {
            MessageBox.error("Please Enter Purchase Group", {
              title: "Error"
              });
            valueHelp.getModel().setData([]);
            return;
          }
          valueHelp.setBusy(true);
          oDataAmendmentModel.read("/ES_PurGrp", {
            filters: [new sap.ui.model.Filter("PucGrp", sap.ui.model.FilterOperator.EQ, vSelectedValue)],
            success: function (oData, oResponse) {
              if(oData.results[0].Message == "")
                {
                oModelSSUDigitization.setProperty("/F4PurGrp",oData.results);
                oModelSSUDigitization.refresh();
                  valueHelp.setBusy(false);

                }
              else{
                  MessageBox.error(oData.results[0].Message, {
                    title: "Error"
                  });
                  valueHelp.setBusy(false);
                }
            }.bind(this),
            error: function (oResponse) {
              valueHelp.getModel().setData([]);
              valueHelp.setBusy(false);
            }
          });

      } else if(e.getSource().getTitle() == "StorageLocation") {
          if(vSelectedValue == "**")
          {
            MessageBox.error("Please Enter Storage Location", {
              title: "Error"
              });
            valueHelp.getModel().setData([]);
            return;
          }
          valueHelp.setBusy(true);
          /*var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
          var vPlant = oModelSS
          UDigitization.getProperty("/Plant");*/
          var vPlant = e.getSource().parentModel.getProperty("/Plant");

          oDataAmendmentModel.read("/ES_StorageLocation", {
            filters: [
                  new sap.ui.model.Filter("StrLoc", sap.ui.model.FilterOperator.EQ, vSelectedValue),
                  new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vPlant)
                  ],
            success: function (oData, oResponse) {
              if(oData.results[0].Message == "")
              {
                valueHelp.getModel().setData(oData.results);
                valueHelp.getModel().refresh();
                valueHelp.setBusy(false);

              }
              else{
                  MessageBox.error(oData.results[0].Message, {
                    title: "Error"
                  });
                  valueHelp.setBusy(false);
                }
            }.bind(this),
            error: function (oResponse) {
              valueHelp.getModel().setData([]);
              valueHelp.setBusy(false);
            }
          });

      } else if(e.getSource().getTitle() == "Material") {
        if(vSelectedValue == "**")
        {
          MessageBox.error("Please Enter Material Code", {
            title: "Error"
            });
          valueHelp.getModel().setData([]);
          return;
        }
        /*var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
        var vPlant = oModelSSUDigitization.getProperty("/Plant");
        var vStorageLocation = oModelSSUDigitization.getProperty("/StorageLocation");
        var vProjectCode = oModelSSUDigitization.getProperty("/ProjectCode");
        var vVendCode = oModelSSUDigitization.getProperty("/VendCode");*/

        var vPlant = e.getSource().parentModel.getProperty("/Plant");
        var vStorageLocation = e.getSource().parentModel.getProperty("/StrLoc");
        var vProjectCode = "";
        var vVendCode = e.getSource().parentModel.getProperty("/Vendor");

        valueHelp.setBusy(true);
        oDataAmendmentModel.read("/ES_Material", {
          filters: [new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, vSelectedValue),
                new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vPlant),
                new sap.ui.model.Filter("StrLoc", sap.ui.model.FilterOperator.EQ, vStorageLocation),
                new sap.ui.model.Filter("ProjCode", sap.ui.model.FilterOperator.EQ, vProjectCode),
                new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vVendCode),
                
                 ],
          success: function (oData, oResponse) {
            if(oData.results[0].Message == "")
            {
              valueHelp.getModel().setData(oData.results);
              valueHelp.getModel().refresh();
              valueHelp.setBusy(false);

            }
            else{
                MessageBox.error(oData.results[0].Message, {
                  title: "Error"
                });
                valueHelp.setBusy(false);
              }
          }.bind(this),
          error: function (oResponse) {
            valueHelp.getModel().setData([]);
            valueHelp.setBusy(false);
          }
        });

    }  else if(e.getSource().getTitle() == "Tax Code") {
      var vPlant = e.getSource().parentModel.getProperty("/Plant");
      var vVendCode = e.getSource().parentModel.getProperty("/Vendor");

      valueHelp.setBusy(true);
      oDataAmendmentModel.read("/ES_TaxCodes", {
        filters: [
              new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vPlant),
              new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vVendCode),
              
               ],
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
    handleliveSearch: function(oEvent){
      var valueHelp = oEvent.getSource();
      if(oEvent.getSource().getTitle() == "Approver Level 1" || oEvent.getSource().getTitle() == "Approver Level 2" || oEvent.getSource().getTitle() == "Approver Level 3" || oEvent.getSource().getTitle() == "SSU Executive") {
        var nameFilter = [];
        var vSelectedValue = oEvent.getParameter("value").toUpperCase();
        if (vSelectedValue != "") {
          nameFilter = new sap.ui.model.Filter({
            filters: [new sap.ui.model.Filter("Appr", sap.ui.model.FilterOperator.Contains, vSelectedValue),
              new sap.ui.model.Filter("ApprName", sap.ui.model.FilterOperator.Contains, vSelectedValue),
              new sap.ui.model.Filter("Level", sap.ui.model.FilterOperator.Contains, vSelectedValue)
            ],
            and: false
          })
        }
        var binding = valueHelp.getBinding("items");
        binding.filter(nameFilter);
      }
    },

    onDateChange:function(oEvent){
      var oDelvryDate = oEvent.getSource().getValue();
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");

      var oSelectedPath = oModelSSUDigitization.getData().SelectedPath;
      if(oSelectedPath != undefined && oSelectedPath != "" && oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation != undefined)
      {
        oModelSSUDigitization.getProperty(oSelectedPath).uiFields.MassValidation.DelvryDateFlag = "";
      }
      oModelSSUDigitization.setProperty("/DelvryDate", oDelvryDate);

    },

    onProtoQtyPerVehChange:function(oEvent){
      var oProtoPerVeh = oEvent.getSource().getValue();
      this.getView().getModel("ModelSSUDigitization").setProperty("/ProtoPerVeh", oProtoPerVeh);
    },

    onQutProtoPriceChange:function(oEvent){
      var oQutProtoProce = oEvent.getSource().getValue();
      this.getView().getModel("ModelSSUDigitization").setProperty("/QutProtoProce", oQutProtoProce);
    },

    onVehicleQunatityChange:function(oEvent){
      var oExtSetQty = oEvent.getSource().getBindingContext().getModel().getData().ExtSetQty;
      if(oExtSetQty != undefined)
        {
          var oCurrenttSetQt = oEvent.getSource().getValue();
          if(oCurrenttSetQt == "")
            {
              MessageBox.error("Kindly Enter Vehicle Set Qty Required", {
                title: "Error"
              });
              var oCumSetQty = 0;
              oEvent.getSource().getBindingContext().getModel().setProperty("/CumSetQty", oCumSetQty.toString());
              oEvent.getSource().getBindingContext().getModel().setProperty("/CurrenttSetQt", oCurrenttSetQt);

              return;
            }

          var oCumSetQty = parseInt(oCurrenttSetQt) + parseInt(oExtSetQty);
          oEvent.getSource().getBindingContext().getModel().setProperty("/CumSetQty", oCumSetQty.toString());
          oEvent.getSource().getBindingContext().getModel().setProperty("/CurrenttSetQt", oCurrenttSetQt);
        }
      else{
          var oCurrenttSetQt= "";
          this.getView().getModel("ModelSSUDigitization").setProperty("/CurrenttSetQt", oCurrenttSetQt);
          MessageBox.error("Enter Material First To Get Existing Vehicle Set Qty", {
            title: "Error"
          });

        }


    },
    onNoteChange:function(oEvent){
      var oNote = oEvent.getSource().getValue();
      this.getView().getModel("ModelSSUDigitization").setProperty("/Note", oNote);
    },

    handleNumericValidation:function(oEvent)
    {
       var sNumber = "";
        var value = oEvent.getSource().getValue();
        if (value.includes('.')){
        sNumber = value.split('.');
                if(sNumber[1].length > 3){
                   oEvent.getSource().setValue(sNumber[0] + "."+ sNumber[1].substr(0,3));
                   oEvent.getSource().setValueState(sap.ui.core.ValueState.Default);
                }
              }else{
                  oEvent.getSource().setValue(value);
                  oEvent.getSource().setValueState(sap.ui.core.ValueState.Default);
              }
        
//        var regex =(/^-?\d*(\.\d+)?$/);
//             var bNotnumber = isNaN(value);
//             if(bNotnumber == false && value.match(regex) && value != "0")
//           	  {
//                sNumber = value;
//                oEvent.getSource().setValueState(sap.ui.core.ValueState.Default);
//           	  }
//             else if(value == "0")
//              {
//               MessageBox.error("Kindly Maintain Settled Price Greater Than 0", {
//            title: "Error"
//          });
//
//               oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
//              }
//             else
//           	  {
//               MessageBox.error("Enter Only Numeric Value", {
//            title: "Error"
//          });
//           	  //oEvent.getSource().setValue(sNumber);
//           	  oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
//
//           	  }
      /*var _oInput = oEvent.getSource();
      var val = _oInput.getValue();
      val = val.replace(/[^\d]/g, '');
      _oInput.setValue(val);*/
    },
    onSave: function () {

      var oController = this;
      // //by yogesh
      // if (oController.byId("upload1").getItems().length == 0 || oController.byId("upload2").getItems().length == 0) {
      //  var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
      //  Message.alert(
      //    "Please Upload LOBA Mail and VOB PPT.", {
      //      styleClass: bCompact ? "sapUiSizeCompact" : ""
      //    }
      //  );
      //  throw new Error();
      // } else {
      //  ///////////////////

      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      Message.confirm("This is confirmation for save data.", {
        title: "Save confirmation",
        onClose: function (oAction) {
          if (oAction == "OK") {
            oModelSSUDigitization.setProperty("/EditableFlag", false);
            var oPaperData = oController._fnDataBeforeSave();
            var etag = oModelSSUDigitization.getProperty("/eTag");
            oPaperData.Action = "D";
            busyDialog.open();
            oController.getOwnerComponent().getModel(
              "oDataAmendmentModel").create("/ES_Header", oPaperData, {
                eTag : etag,
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
//                  oController._fnAfterGettingBEData(oData);
                } else if (vMsgReturn.Title == "Sucess") {
                  sap.m.MessageBox.success(vMsgReturn.Message, {
                    title: vMsgReturn.Title,
                    onClose: function () {
                      oController._fnAfterGettingBEData(oData);
//                      oController._fnGetNPIHeaderData(oData.NpiNo); //need to remove after getting updated BE data
                    }
                  });
                }
              },
              error: function (oResponse) {
                /*$.each(oPaperData.Nav_Items, function (i, Row) {
                  Row.ToolCostRequired = Row.ToolCostRequired == "X" ? 1 : 0; //0 is yes 1 is no
                  Row.ForexRequired = Row.ForexRequired == "X" ? 1 : 0;
                  Row.SparePartSameOE = Row.SparePartSameOE == "X" ? 1 : 0;
                });*/
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

      oController._validationMass(oNav_Items);
    },
    onSubmitVendorCode: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
//      var vPaperCode = this.getView().getModel("ModelSSUDigitization").getProperty("/PaperDataSet/PaperCode");
      var filters = [];

      var vSelectedValue = "*"+oEvent.getParameter("value").toUpperCase()+"*";
      if (vSelectedValue.length > 0) {
        filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Vendor", {
          filters: filters,
          success: function (oData, oResponse) {
            if (oData.results.length > 0) {
              var vVendName = oData.results[0].VendName;
              var vVendCode = oData.results[0].Vendor;
              var vPurorg = oData.results[0].PurOrg;

//              vTaxonomy = oData.results[0].Taxonomy;
              busyDialog.close();
              /*oDataAmendmentModel.read("/ES_Terms(VendCode='" + vVendCode + "',Plant='" + oParentModel.getProperty("/Plant") + "')", {
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
              });*/
            } else {
              busyDialog.close();
              sap.m.MessageToast.show(vSelectedValue + " is not extended for " + oParentModel.getProperty("/Plant") + " plant.");
            }
            oParentModel.setProperty("/VendName", vVendName);
            oParentModel.setProperty("/Vendor", vVendCode);

            oParentModel.setProperty("/PurOrg", vPurorg);

//            oParentModel.setProperty("/Taxonomy", vTaxonomy);
          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });
      } else {
        sap.m.MessageToast.show("Maintain vendor code.");
        oParentModel.setProperty("/VendName", vVendName);
        oParentModel.setProperty("/Vendor", vVendCode);

        oParentModel.setProperty("/PurOrg", vPurorg);

//        oParentModel.setProperty("/Taxonomy", vTaxonomy);
        // oParentModel.setProperty("/DelTerms", vDelTerms);
        // oParentModel.setProperty("/PaymntTerms", vPaymntTerms);
      }

    },

    onSubmitPurGrpCode: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var filters = [];
      var vPurGrp = "";
      var vSelectedValue = "*"+oEvent.getParameter("value").toUpperCase()+"*";
      filters.push(new sap.ui.model.Filter("PucGrp", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_PurGrp", {
          filters: filters,
          success: function (oData, oResponse) {
            vPurGrp =  oData.results;
            oModelSSUDigitization.setProperty("/PurGrpF4", vPurGrp);
            busyDialog.close();
          },
          error: function (oResponse) {
            busyDialog.close();
            serviceError(oResponse);
          }
        });

    },

    onSubmitPlantCode: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var filters = [];
      var vPlant = "";
      var vSelectedValue ="*"+oEvent.getParameter("value").toUpperCase()+"*";
      filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Plant", {
          filters: filters,
          success: function (oData, oResponse) {
            vPlant = oData.DeliveryTerms;
            oModelSSUDigitization.setProperty("/Plant", vPlant);

          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });

    },

    onSubmitStorageLocation: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var filters = [];
      var vPlant = "";
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      filters.push(new sap.ui.model.Filter("StorageLocation", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_StorageLocation", {
          filters: filters,
          success: function (oData, oResponse) {
            vPlant = oData.DeliveryTerms;
            oModelSSUDigitization.setProperty("/StorageLocation", vPurGrp);

          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });

    },

    onSubmitMaterial: function (oEvent) {
      var oController = this;
      var oParentModel = oEvent.getSource().getBindingContext().getModel();
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = this.getView().getModel("ModelSSUDigitization");
      var filters = [];
      var vPlant = "";
      var vSelectedValue = oEvent.getParameter("value").toUpperCase();
      filters.push(new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, vSelectedValue));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_Material", {
          filters: filters,
          success: function (oData, oResponse) {
            vPlant = oData.DeliveryTerms;
            oModelSSUDigitization.setProperty("/Material", vPurGrp);

          },
          error: function (oResponse) {
            serviceError(oResponse);
          }
        });

    },

    onErrMsgValueHelp:function(e){
      var oController = this;
      var oValueHelp = xmlFragment(oController, "ErrorMsgPopOver");
      oValueHelp.toggle(e.getSource());

      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
//      var val = selectedPath.split("/")[3];
      var ErrorData = oModelSSUDigitization.getProperty(selectedPath+"/uiFields/MassValidation");
      var oValidationError = [];
      if(ErrorData.VendorFlag != ""){
        oValidationError.push({"BEError" :ErrorData.VendorFlag});
      };
      if(ErrorData.PlantFlag != ""){
        oValidationError.push({"BEError" : ErrorData.PlantFlag});
      };
      if(ErrorData.StrLocFlag != ""){
        oValidationError.push({"BEError" : ErrorData.StrLocFlag});
      };
      if(ErrorData.MaterialFlag != ""){
        oValidationError.push({"BEError" :ErrorData.MaterialFlag});
      };
      if(ErrorData.DelvryDateFlag != ""){
        oValidationError.push({"BEError" :ErrorData.DelvryDateFlag});
      };
      oModelSSUDigitization.setProperty("/ValidationError", oValidationError);
    },

    /*onTaxcodeChange:function(){
      var oController = this;
      var oDataAmendmentModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
      var nVendor = oModelSSUDigitization.getProperty(selectedPath+"/Vendor");
      var nPlant = oModelSSUDigitization.getProperty(selectedPath+"/Plant");
      var filters = [];
      filters.push(new sap.ui.model.Filter("Vendor", sap.ui.model.FilterOperator.EQ, nVendor));
      filters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, nPlant));
        busyDialog.open();
        oDataAmendmentModel.read("/ES_TaxCodes", {
          filters: filters,
          success: function (oData, oResponse) {

            oModelSSUDigitization.setProperty("/F4TaxCode", oData.results);
            busyDialog.close();

          },
          error: function (oResponse) {
            serviceError(oResponse);
            busyDialog.close();
          }
        });

    },*/

    OnTaxCodeChange: function (oEvent) {
      var oController = this;
      var vTaxCode = oEvent.getSource().getSelectedItem().getText();
      var vTaxName = oEvent.getSource().getSelectedItem().getAdditionalText();
      var oModel = oEvent.getSource().getModel();
      oModel.setProperty("/TaxCodeTxt", vTaxName);
      oModel.setProperty("/TaxCode", vTaxCode);

    },
    onSubmitTaxCode:function()
    {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var selectedPath = oModelSSUDigitization.getProperty("/SelectedPath");
    },

    onAttachDeleted: function (oEvent) {
      var oController = this;
      var oModelSSUDigitization = oController.getView().getModel("ModelSSUDigitization");
      var oNavDms = oModelSSUDigitization.getProperty("/PaperDataSet/Nav_DMS");
//      var vSelectedIndex;
      $.each(oNavDms,function(i,row){
        if(row.Posnr+row.TabId == oEvent.getParameter("documentId")){
          var oDataNewPinfoModel = oController.getOwnerComponent().getModel("oDataAmendmentModel");
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
      var vPaperNo = oModelSSUDigitization.getProperty("/PaperDataSet/PrNum") || "0";
//      var vPaperCode = oModelSSUDigitization.getProperty("/PaperDataSet/PrNum") || "0";
      var vTabId = oEvent.getSource().getBindingInfo('items').filters[0].oValue1;
      var slug ="PPP|"+vPaperNo+"|"+vTabId+"|0|0|0|0|"+oFile['name']+"|"+oFile['type']+"|"+oFile['size']+"";
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
        }

      //--------- Event Methods End -----------------

  });
});