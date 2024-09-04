var oView,oController;
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  'sap/m/Button',
  'sap/m/Text',

  "sap/m/BusyDialog",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/library",
  "sap/ui/core/util/Export",
  "sap/ui/core/util/ExportTypeCSV",
  "sap/ui/export/Spreadsheet"
  ], function(Controller, JSONModel, Button, Text, BusyDialog, MessageBox, MessageToast, MobileLibrary, Export, ExportTypeCSV, Spreadsheet) {
  "use strict";

  var that;

  return Controller.extend("ZSRM_SINVOICE.controller.SInvoice", {
    onInit : function() {
debugger;
    this.flength= 0;
    //  bcone-11372 - sanika chavan - Fiori Usage
      var device = "Other";
      var os = jQuery.os.os;
      var os_ver = jQuery.os.fVersion;
      var browser = "Other";
      var browser_ver = jQuery.browser.fVersion;
      var height = $(window).height();
      var width = $(window).width();
      var resolution = width + " * " + height;
      var appName  = "ZSRM_SINVOICE";

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
      oDataModel.read("/FioriUsageSet(Appname='ZSRM_SINVOICE',Device='" + device +
      "',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
      "',Resolution='" + resolution + "')",null,null,null,function(e)   { },
      function(e)
      { });
      //end fiori usage

      oController = this;
      oController.dialog = new sap.m.BusyDialog();
      oView = this.getView();

      that = this;
      this.period;
      var oData = {
          "items" : []
      };
      var oMassFileModel = new JSONModel(oData);
      this.getView().setModel(oMassFileModel,"MASS");
      this.detailMsg = [],
      this.SInvoiceModel = this.getOwnerComponent().getModel('ZSRM_SINVOICE');
      var oView = this.getView();
      oView.setModel(this.oModel);
      that.SInvoiceModel.read("/ES_VENDORSet",{success : this.VendorSearchSuccess,error : this.VendorSearchError}); 
      //that.SInvoiceModel.read("/ET_PENDING_INVSet",{success : this.InvoiceSearchSuccess,error : this.InvoiceSearchError}); 
      that.getView().setBusy(true);

// to get the user id on server
      var ModelSess_S = new sap.ui.model.json.JSONModel();
      ModelSess_S.loadData("/sap/bc/ui2/start_up",null,false);
      var SessiUserId_S = ModelSess_S.getData().id;

// to get the user id while running locally
    /*  var ModelSess_L = new sap.ui.model.json.JSONModel();
      ModelSess_L.loadData("http://localhost:49696/ZSRM_SINVOICE/proxy/sap/bc/ui2/start_up",null,false);
      var SessiUserId_L = ModelSess_L.getData().id;
      */
      if (SessiUserId_S != undefined)
        { this.SessiUserId = SessiUserId_S;}
    /*  else
      if (SessiUserId_L != undefined)
        { this.SessiUserId = SessiUserId_L;}
      */
      /*if ((SessiUserId_S == "SRM") || (SessiUserId_L == "SRM"))

      if ( (SessiUserId_L == "SRM"))
      {
        this.byId("GRFromId").setValue("5000057462");
      }*/


    },

    VendorSearchSuccess  : function(oData,Response){
      that.getView().setBusy(false);

      var Selectmodel = new sap.ui.model.json.JSONModel(oData);
      Selectmodel.setSizeLimit(oData.results.length); 
      that.getView().byId("LifnrId").setModel(Selectmodel, 'selectModel');                 

    },
    VendorSearchError:function(oError){
//      debugger; 
      that.getView().setBusy(false);
      try{
        var tr_err_mesg = JSON.parse(oError.responseText).error.message.value;
        MessageBox.error(tr_err_mesg);
      }
      catch(oError){
        MessageBox.error("No Records!! ");
      }
      that.onReset();
    },

  /*  InvoiceSearchSuccess: function(oData,Response){
      that.getView().setBusy(false);

      var Selectmodel1 = new sap.ui.model.json.JSONModel(oData);
      Selectmodel1.setSizeLimit(oData.results.length); 
      that.getView().byId("InvoiceId").setModel(Selectmodel1, 'selectModel1');    
    },

    InvoiceSearchError: function(oError){
      that.getView().setBusy(false);
      try{
        var tr_err_mesg = JSON.parse(oError.responseText).error.message.value;
        MessageBox.error(tr_err_mesg);
      }
      catch(oError){
        MessageBox.error("No Records!! ");
      }
      that.onReset();
    },*/
    onGRChange:function(oEvent)
    {
//      checking if number is the input
//      var id = oEvent.getSource().getId().split("--")[1];
//      var str = oEvent.mParameters.newValue;
//      if (($.isNumeric(str) == false) && (str != ""))
//      {
//      MessageBox.error("Only numbers allowed");
//      this.getView().byId(id).setValue('');
//      return;
//      }  

//      checking if To GR cannot be higher then From GR   
      var GRlow   = this.getView().byId("GRFromId").getValue();
      var GRHigh  = this.getView().byId("GRToId").getValue();  
      if ( GRlow > GRHigh){
        if (GRHigh != ""){
          MessageBox.error("From-GR Number cannot be greater then To-GR Number!");
          this.getView().byId('idTable').setVisible(false);
          return;
        }
      }
    },

    onDtChange:function(oEvent){
      var Datlow   = this.getView().byId("DTI1").mProperties.dateValue;
      var DatHigh = this.getView().byId("DTI2").mProperties.dateValue;
      var date = new Date();

      if (Datlow > date ){
        MessageBox.error("From-Posting Date cannot be Future Date!");
        this.getView().byId('DTI1').setValue('');
        return;
      }

      if ( DatHigh > date ){
        MessageBox.error("To-Posting Date cannot be Future Date!");
        this.getView().byId('DTI2').setValue('');
        return;
      }

      if (DatHigh != null  && Datlow > DatHigh){
        MessageBox.error("From-Date cannot be greater then To-Date!");
        this.getView().byId('DTI1').setValue('');
        this.getView().byId('DTI2').setValue('');
        return;
      } 
    },
    onSInvoiceChange:function(oEvent){
//      debugger;
//      checking if number is the input
//      var id = oEvent.getSource().getId().split("--")[1];
//      var str = oEvent.mParameters.newValue;
//      if (($.isNumeric(str) == false) && (str != ""))
//      {
//      MessageBox.error("Only numbers allowed");
//      this.getView().byId(id).setValue('');
//      return;
//      }  

//      if table S-invoice value is more than 16 digits then it will stop processing    
      if (oEvent.mParameters.newValue.length > 16)
      {MessageBox.error("S-Invoice entered more than 16 characters!! ");
      oEvent.getSource().setValue('');
//      id = oEvent.getSource().getId();
//      this.getView().byId(id).setValueState("Error");
      return;}

      var value = oEvent.mParameters.newValue;
      var regex = /[~!@#$%^&*()_+={}"\[\]'<>.,?]/g;
       if (value.match(regex)) 
         { MessageBox.error("No special Charaters are allowed except / and -");
//         oEvent.mParameters.newValue = '';
         var ind = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
           var value = this.getView().byId("idTable").getModel().getData().results[ind].S_INVOICE_NO;
//          value = '';
           value = value.replace(regex,'');
           this.getView().byId("idTable").getModel().getData().results[ind].S_INVOICE_NO = value;
           return;
         }
    },


    onGetdetail:function(oEvent){
//      debugger;   

      this.getView().byId("LifnrId").setValueState("None");
      this.getView().byId("InvoiceId").setValueState("None");
      this.getView().byId("GRFromId").setValueState("None");
      this.getView().byId("GRToId").setValueState("None");
      this.getView().byId("DTI1").setValueState("None");
      this.getView().byId("DTI2").setValueState("None");
      this.getView().byId("idPlant").setValueState("None");
      this.getView().byId("InvoiceId").setValueState("None");


//      var GRfrom      = this.getView().byId("GRFromId").getValue().toUpperCase();
//      var GRto      = this.getView().byId("GRFromId").getValue().toUpperCase();
//      if( (GRfrom === "") || (GRto === "") ) {
//      sap.m.MessageToast.show("GR Number is Mandatory!");
//      this.getView().byId("GRFromId").setValueState("Error");
//      this.getView().byId("GRToId").setValueState("Error");
//      this.getView().byId("GRFromId").setValueStateText("GR Number is mandatory!!");
//      this.getView().byId("GRToId").setValueStateText("GR Number is mandatory!!");
//      this.getView().byId("idTable").setVisible(false);
//      return;
//      }

      var Ventokens = this.getView().byId("LifnrId").getSelectedItems().length;
    //  var Invtokens = this.getView().byId("InvoiceId").getSelectedItems().length;
      var Datlow   = this.getView().byId("DTI1").getValue();
      var DatHigh = this.getView().byId("DTI2").getValue();  
      var GRlow   = this.getView().byId("GRFromId").getValue();
      var GRHigh = this.getView().byId("GRToId").getValue();
//      if (Datlow == "") {
//      if (DatHigh == ""){
//      if (GRlow == ""){
//      if (GRHigh == ""){
//      MessageBox.error("Please enter Posting Date or Vendor. !");
//      return;
//      }
//      } 
//      } 
//      }

      if (Ventokens != "0"){
        if ((GRlow == "") && (GRHigh == "") && (Datlow == "") && (DatHigh == "")) {
          MessageBox.error("Please enter GR Number or Posting Date also!!");
          this.getView().byId("GRFromId").setValueState("Error");
          this.getView().byId("GRToId").setValueState("Error");
          this.getView().byId("DTI1").setValueState("Error");
          this.getView().byId("DTI2").setValueState("Error");
          this.getView().byId('idTable').setVisible(false);
          return;
        }
      }
      else{
        MessageBox.error("Please select Vendor!!");
        this.getView().byId("LifnrId").setValueState("Error");
        this.getView().byId('idTable').setVisible(false);
        return;
      }


      this.getView().byId('idTable').setVisible(true);
      var Fromdate = this.getView().byId("DTI1").getValue();
      var Todate = this.getView().byId("DTI2").getValue();
      var GRFrom = this.getView().byId("GRFromId").getValue();
      var GRTo = this.getView().byId("GRToId").getValue();
      var plant1 = this.getView().byId("idPlant").getValue().toUpperCase();
      //var InvA = this.getView().byId("InvoiceId").getValue();
      var InvB = this.getView().byId("InvoiceId").getSelectedKey();
//      var Lifnr = this.getView().byId("LifnrId").getSelectedKey();

      if (Fromdate == '' && Todate == '' )
      { Fromdate = '03.01.1980' ; Todate = '28.12.9999';  }          
      if (Fromdate == '')
      { Fromdate = '01.01.1990';  }
      if (Todate == '')
      {     Todate = Fromdate;  }

      if (GRFrom == '' && GRTo == '' )
      {GRFrom = '1'; GRTo ='9999999999'}
      if (GRFrom == '')
      {     GRFrom = '1';  }
      if (GRTo == '')
      {     GRTo = GRFrom;  }

      var dtl = Fromdate.substr(6,4)+'-'+Fromdate.substr(3,2)+'-'+Fromdate.substr(0,2)+'T05:30:00';
      var dth = Todate.substr(6,4)+'-'+Todate.substr(3,2)+'-'+Todate.substr(0,2)+'T05:30:00';

//      var value1 = "(GR_NO gt '"+GRFrom+"' ";
//      var value2 = "and GR_NO le '"+GRTo+"') ";
//      var value3 = "and LIFNR  eq '"+Count+"' ";
//      var value4 = "and (POSTED_ON ge datetime'"+dtl+"' "; 
//      var value5 = "and POSTED_ON le datetime'"+dth+"')";
//      var value = value1 + value2 + value3 + value4 + value5 ;
//      that.getView().setBusy(true);
//      that.SInvoiceModel.read("/ES_SInvoiceSet",{urlParameters:{"$filter" : value},success : that.myGRsearchSuccess,error : that.myGRsearchError});

      var flag = 'R'; 
      var oFilter = [
//        new sap.ui.model.Filter("LIFNR",sap.ui.model.FilterOperator.EQ, Lifnr),
        new sap.ui.model.Filter("GR_NO",sap.ui.model.FilterOperator.BT, GRFrom, GRTo),
        new sap.ui.model.Filter("POSTED_ON",sap.ui.model.FilterOperator.BT, dtl, dth),                
        new sap.ui.model.Filter("FLAG", sap.ui.model.FilterOperator.EQ, flag),
        new sap.ui.model.Filter("INV_FLAG", sap.ui.model.FilterOperator.EQ, InvB),
        new sap.ui.model.Filter("WERKS", sap.ui.model.FilterOperator.EQ, plant1)];
      /*
      if(plant1 !== ''){

        oFilter.push(new sap.ui.model.Filter("WERKS",sap.ui.model.FilterOperator.EQ, plant1));
      }
      else{
        var plant2= "";
        oFilter.push(new sap.ui.model.Filter("WERKS",sap.ui.model.FilterOperator.EQ, plant2));
      }
*/
      for (var j = 0; j<this.getView().byId("LifnrId").getSelectedItems().length  ;j++)
      { 
        var Lifnr = this.getView().byId("LifnrId").getSelectedItems()[j].getProperty("key");
        oFilter.push(new sap.ui.model.Filter("LIFNR",sap.ui.model.FilterOperator.EQ, Lifnr));

      } 
      /*if(InvA !== ''){

        for (var i = 0; i<this.getView().byId("InvoiceId").getSelectedItems().length  ;i++)
        { 
          var InvB = this.getView().byId("InvoiceId").getSelectedItems()[i].getProperty("key");
          oFilter.push(new sap.ui.model.Filter("LIFNR",sap.ui.model.FilterOperator.EQ, InvB));

        } 
      }
      else{
        var InvB = "";
        oFilter.push(new sap.ui.model.Filter("LIFNR",sap.ui.model.FilterOperator.EQ, InvB));
      }
*/
      this.getView().setBusy(true);
      this.SInvoiceModel.read("/ES_SInvoiceSet", { filters: oFilter,
        success:this.ReportSearchSuccess, 
        error: this.ReportSearchError
      });
    },

    ReportSearchSuccess:function(oData)
    {
      debugger;         
      that.getView().setBusy(false);
      that.Itemmodel = new sap.ui.model.json.JSONModel(oData);

      for (var j = 0; j<that.Itemmodel.oData.results.length  ;j++)
      { 
        if (that.Itemmodel.oData.results[j].POSTED_ON != null)
        { 
          that.Itemmodel.oData.results[j].Change = '';
          that.Itemmodel.oData.results[j].POSTED_ON = that.Itemmodel.oData.results[j].POSTED_ON.toString();
          var g = new Date(that.Itemmodel.oData.results[j].POSTED_ON);
//          that.Itemmodel.oData.results[j].POSTED_ON = g.getDate()+"."+(g.getMonth()+1)+"."+g.getFullYear();

          var i_date = g.getDate(); if (i_date < 10){ i_date = '0' + i_date};
          var i_month = g.getMonth()+1;
          if (i_month < 10){ i_month = '0' + i_month};

          that.Itemmodel.oData.results[j].POSTED_ON =
 i_date+"."+i_month+"."+g.getFullYear();                                                 
        }             
//        removing padding zeros
//        oData.results[j].BE_REFOBJ_ITEM = +oData.results[0].BE_REFOBJ_ITEM;
      }

      that.getView().byId("idTable").unbindElement('/');
//      var oView = that.getView().byId("idTable");

      that.getView().byId("idTable").setModel(that.Itemmodel);
      that.getView().byId("idTable").bindElement('/results');
    },

    ReportSearchError:function(oError)
    {
      debugger;      
      that.getView().setBusy(false);
      that.getView().byId("idTable").unbindElement('/');
//      var oView = that.getView().byId("idTable");
      try{
        var tr_err_mesg = JSON.parse(oError.responseText).error.message.value;
        MessageBox.error(tr_err_mesg);
      }
      catch(oError){
        MessageBox.error("No Records!! ");
      }
//      that.onReset();
      that.getView().byId("idTable").setVisible(false); 
    },

    onSignChange : function(oEvent) {
      var id = oEvent.oSource.sId;
//      var vValue = oEvent.getSource().getSelectedKey();
      var vValue = oEvent.mParameters.selectedItem.mProperties.key;
      if (vValue == '0') { return; }
      oEvent.oSource.setSelectedKey(vValue);
      var oData = this.getView().byId("idTable").getModel().getData();
      oData.results.map(function(obj) {
         if  (id.indexOf("idsignsel") != -1) 
         { 
           if ((obj.STATS == '') && (obj.FILE_NAME == ''))
           {
            obj.IS_DIGI_SIGNED = vValue; 
           }
         }
      });
      this.getView().byId("idTable").getModel().refresh();
    },

    onHandleMultiUpload : function(oEvent){
    //  that.BusyDialog.open();
      /*var vNoDesc     = this.CreatedBy +"_" + 123456789 + "_" + this.toDay + " " + "(" + "DDMMYYYY" + ")" + "\n";
      vNoDesc       = vNoDesc + "\n" + " ( File Size must be less than 300 KB  )" ;*/
      var that1 = this;
    /*  this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read(
          "/ET_SAMPLE_EXAMPLESet",{
      success : function(oData,oResponse){
        //that.BusyDialog.close();
        */
        that1.vNoDesc = '';
      //  that1.vNoDesc = "Sample Example : " + oData.results[0].Example + "";
        that1.vNoDesc = that1.vNoDesc +"\n"  + "( File Size must be less than 300 KB )" ;
        that1.vNoDesc = that1.vNoDesc +"\n"  + "(Maximum 50 files can be uploaded in Single Upload...!!!)" ;   //changed by vivek on 06.11.2020.
        that.LoadMassupLoad(that1.vNoDesc);
      /*},
      error:that.myErrorVendor}); */
    },

    LoadMassupLoad : function (vNoDesc){
      var that1 = this;
      that.flength=0
      that1.oMassUpload = sap.ui.xmlfragment("ZSRM_SINVOICE.view.MassUpload",this);
      that1.oMassUpload.open();
      that1.getView().setModel(new JSONModel({
        "maximumFilenameLength": 80,          //changed by vivek on 06.11.2020
        "maximumFileSize": 0.1,
        "mode": MobileLibrary.ListMode.SingleSelectMaster,
        "uploadEnabled": true,
        "uploadButtonVisible": true,
        "enableEdit": false,
        "enableDelete": true,
        "visibleEdit": false,
        "visibleDelete": true,
        "noDataDescription" : vNoDesc,
        "listSeparatorItems": [
          MobileLibrary.ListSeparators.All,
          MobileLibrary.ListSeparators.None
        ],
        "showSeparators": MobileLibrary.ListSeparators.All,
        "listModeItems": [
          {
            "key": MobileLibrary.ListMode.SingleSelectMaster,
            "text": "Single"
          }, {
            "key": MobileLibrary.ListMode.MultiSelect,
            "text": "Multi"
          }
        ]
      }), "settings");
      sap.ui.getCore().byId('id_MassUpload').setNoDataDescription(vNoDesc);
    //  sap.ui.getCore().byId('id_Check').setVisible(false);
      that.Error = [];
      var Array = {
          "items" : []
      };
      sap.ui.getCore().byId("id_MassUpload").setModel(new JSONModel(Array),"MASS");
      //this.getView().getModel("MASS").setData(Array);
      //sap.ui.getCore().byId("id_SubmitMass").setEnabled(false);
      //that.BusyDialog.close();
    },

    fnAttachMassUpload : function(oEvent){

      //  sap.ui.getCore().byId("id_Check").setValueState('None');
        if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length != 0){
         if(sap.ui.getCore().byId("id_Check").getSelected()== true){
          var aItems = sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items;
          var NavMassUpload =[];
          aItems.forEach(function(Obj, i){
            NavMassUpload.push({
              //"AsnConfNo"   : "00",
              "FileContent" : Obj.FileContent,
              //"FileType"    : Obj.FileType,
              "FileName"    : Obj.FileName
            })
          });

          var payLoad = {
              FLAG  : "M",
              NAV_MASS_UPLOADset  : NavMassUpload
          };
      //    that.BusyDialog.open();
          that.SInvoiceModel.create("/ES_SInvoiceSet",payLoad,{
            success: oController.mySuccessHandler, 
            error: oController.myErrorHandlerHandler
          });

         }
         else{
          // MessageBox.error(""); 
           sap.ui.getCore().byId("id_Check").setValueState('Error');
           MessageToast.show("Select Checkbox to Submit");
           
          // sap.ui.getCore().byId("id_Check").setValueStateText("Select to Submit")
         }
        }
        else {
           MessageBox.error("Upload files to submit"); 
        }

    },

    mySuccessHandler : function(oData, oResponse){
      //var that = this;
      that.oMassUpload.destroy();
      //that.BusyDialog.close();
      that.flength=0;                      //changed by sanika
      if(oResponse.requestUri.indexOf('ZZSRM_VENDORINVOICE_SRV/ES_SInvoiceSet') !== -1){
        /*that.Msg =  sap.ui.xmlfragment("ZSRM_SINVOICE.view.MessageView",this);
        that.getView().addDependent(that.Msg);*/
        var vMsg   = JSON.parse(oResponse.headers["sap-message"]);
        if(JSON.parse(oResponse.headers["sap-message"]).severity == "error"){
          var vError = 'Error'
        }
        else {
          var vError = 'Success'
        }
        var Filename = vMsg.message.split("/",3);
        var oData = [];
        oData.push({
          "Message"     : Filename[0], 
          "ErrorMessage"  : Filename[1],
          "description" : Filename[2],
          "type"      : vError
        });
        if(vMsg.details.length != 0){
          vMsg.details.forEach(function(item, i){
            var Filename = item.message.split("/",3);
            if(item.severity == "error"){
              var vError = 'Error'
            }
            else {
              var vError = 'Success'
            }
            oData.push({
              "Message"       : Filename[0], 
              "ErrorMessage"      : Filename[1],
              "description"   : Filename[2],
              "type"        : vError
            });
          })
        }

        that.onMessageView(oData);
      }
    //  that.onGetdetail();
    },

    myErrorHandlerHandler : function(oResponse){
    //  var that = this;
    //  that.BusyDialog.close();
    },
    onCloseMassAttach : function(){
      var Array = {
          "items" : []
      };
      sap.ui.getCore().byId("id_MassUpload").getModel("MASS").setData(Array);
      this.oMassUpload.destroy();
      that.flength=0                            //changed by sanika 08.12.2020
    },
    onSelectionChange : function(){
      debugger;
    },

    onFileDeleted: function(oEvent){
      this.deleteItemById(oEvent.getParameter("documentId"));
      if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length == 0){
        sap.ui.getCore().byId("id_SubmitMass").setEnabled(false);
      //  sap.ui.getCore().byId('id_Check').setVisible(false);
      }
    },
    deleteItemById: function(sItemToDeleteId) {
        var oData = sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData();
        var aItems = jQuery.extend(true, {}, oData).items;
        jQuery.each(aItems, function(index) {
          if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
            aItems.splice(index, 1);
          }
        });
        sap.ui.getCore().byId("id_MassUpload").getModel("MASS").setData({
          "items": aItems
        });
        sap.ui.getCore().byId("id_MassUpload").getModel("MASS").refresh();
    },

    lengthChk: function(a){
      var that1=this;
      if(a== 51){
        MessageBox.error("You can only select maximum 50 files in single upload",{
          onClose: function(){
            that1.oMassUpload.destroy();
          }
        });
      //  sap.ui.getCore().byId("id_SubmitMass").setEnabled(false);
        that1.flength=0;
      }
      else{

        //sap.ui.getCore().byId("id_SubmitMass").setEnabled(true);

        return;
      }
    },

    onUploadComplete : function(oEvent){
      var that    = this;

      that.flength ++ ;
      var vLength = oEvent.getSource()._oFileUploader._aXhr.length;
      var file    =  oEvent.oSource._oFileUploader._aXhr[0]['file'];
      var object  = {}
    //  if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length <=49){
      //var vLength = 55;

      /*if(vLength > 50){
        MessageBox.error("You can only select maximum 50 file in single request");
        return;
      }*/

      that.lengthChk( that.flength);

       if(file['size'] >= 1000000){
         var fileSize = Math.floor((file['size']/1000000)) + " MB";
       }
        else {
          var fileSize = Math.floor((file['size']/1000)) + " KB";
        }



      if(file.type != 'application/pdf'){
        that.Error.push({
           'type'         : 'Error',
           'ErrorMessage'   :  file.name + ' ' + 'File format should be pdf '
         })
         oEvent.oSource._oFileUploader._aXhr.splice(0,1);
      }
      else if(file['size'] > 350000){           //  changed by singvi-cont on 06.01.2019
        that.Error.push({
           'type'     : 'Error',
           'ErrorMessage' : file.name + ' ' + 'File size exceeding 300 kb' 
         }) 
         oEvent.oSource._oFileUploader._aXhr.splice(0,1);
       }else{
         object.documentId = jQuery.now().toString();
         object.FileName  = file.name;
         object.FileType  = file.type;
         object.uploadedOn = new Date(jQuery.now()).toLocaleDateString();
         object.size     = fileSize;
         object.AsnConfNo = "";
         oEvent.oSource._oFileUploader._aXhr.splice(0,1);
         
        var items = sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items;
        var flag = true;
        if(items.length != 0){
          for(var index in items){
            if(items[index].FileName  == object.FileName){
               MessageBox.error("This file is already exist");  
               flag = false;
               break;
            }
          }
        }
        if(flag == true){

          var readFileAndAddToMap=function(file){
            return new Promise(function(resolve, reject){
              debugger;
              if (file) {
                var reader = new FileReader();
                var BASE64_MARKER = 'data:' + file.type+ ';base64,';
                reader.onloadend  = (function(theFile) {
                  return function(evt) {
                    var base64Index   = evt.target.result.indexOf(BASE64_MARKER)+ BASE64_MARKER.length;
                    var base64Data    = evt.target.result.substring(base64Index);
                    object.FileContent  = base64Data;
                    items.unshift(object);
                    object = {};  //clear
                    sap.ui.getCore().byId("id_MassUpload").getModel("MASS").refresh();
                  };
                  that.getBusy().setBusy(false);
                })(file);
              }
              reader.readAsDataURL(file);
            });
          }
        }

        var promises = [];
        promises.push(readFileAndAddToMap(file));
        //use reduce to create a chain in the order of the promise array
        promises.reduce(function(cur, next) {
          return cur.then(next);
        }, Promise.resolve()).then(function() {
          //all files read and executed!
        }).catch(function(error){
          //handle potential error
        });
       }
      if(oEvent.oSource._oFileUploader._aXhr.length == 0 && that.Error.length != 0){
        that.onMessageView(that.Error);
        that.Error =[];       //changed by singvi-cont on 06.01.2020
      }

      /*} else{

        MessageBox.error("You can only select maximum 50 file in single request");
      }*/
    },

    onMessageView : function (oData){
      that.aError  = oData.filter(function(obj){
        return obj.type === "Error";
      })
      var vVisible ;
      if (that.aError.length !== 0){
        vVisible = true;
      }
      else {
        vVisible = false;
      }
      var bCompact = !oController.getView().$().closest(".sapUiSizeCompact").length;
      var oMessageTemplate = new sap.m.MessageItem({
        type        : '{type}',
        title       : '{ErrorMessage}',
        description     : '{description}',
        styleClass      : bCompact ? "sapUiSizeCompact" : "",
        subtitle      : '{Message}',
        markupDescription : '{markupDescription}',
      });
      var oModel = new JSONModel();
      oModel.setData(oData);
      that.oMessageView = new sap.m.MessageView({
        showDetailsPageHeader: false,
        styleClass: bCompact ? "sapUiSizeCompact" : "",
        itemSelect: function () {
          oBackButton.setVisible(true);
        },
        items: {
          path: "/",
          template: oMessageTemplate
        }
      });

      var oBackButton = new sap.m.Button({
        icon: sap.ui.core.IconPool.getIconURI("nav-back"),
        visible: false,
        styleClass: bCompact ? "sapUiSizeCompact" : "",
        press: function () {
          that.oMessageView.navigateBack();
          this.setVisible(false);
        }
      });

      that.oMessageView.setModel(oModel);

      that.oDialog = new sap.m.Dialog({
        resizable: true,
        styleClass: bCompact ? "sapUiSizeCompact" : "",
        content: that.oMessageView,
        beginButton : new sap.m.Button({
          press : function(){
            that.fnDownloadExcell();
          },
          text : "Error log",
          visible : vVisible,
          icon : "sap-icon://download"
        }),
        endButton: new sap.m.Button({
          press: function(){
            that.fnCallReload();
            //oController.oDialog.close();
          },
          text: "Close"
        }),
        customHeader: new sap.m.Bar({
          contentMiddle: [
            new sap.m.Text({ text: "Information"})
          ],
          contentLeft: [oBackButton]
        }),
        contentHeight: "200px",
        contentWidth: "400px",
        verticalScrolling: false
      });
      oController.oDialog.open();
    },
    fnCallReload : function(){
      oController.oDialog.destroy();
      that.onGetdetail();

    },

    fnDownloadExcell : function (){
      var vToday    = new Date();
      var vFullYear = vToday.getFullYear();
      var vMonth    = vToday.getMonth() + 1;
      var vDate     = vToday.getDate();
      var aColumns  = [
        {
          Label     : 'ErrorMessage',
          property  : 'ErrorMessage'
        }
      ];

      var  aProducts, oSettings,oSheet;
      aProducts = that.aError
      oSettings = {
            workbook: { columns: aColumns },
            dataSource: aProducts,
            fileName : "Error log -"+ vDate + vMonth + vFullYear+""
          };

      oSheet = new Spreadsheet(oSettings);
      oSheet.build()
        .then( function() {
          MessageToast.show('Spreadsheet export has finished');
        })
        .finally(function() {
          oSheet.destroy();
        });

    },

    onLoadAddiAsset:function(){
//      need to disable the check box of table row item whose status(STATS) is not empty
//      debugger;
      var that=this;
      var tbl= that.getView().byId("idTable");

//      var header= tbl.$().find("thead");
//      var selectAllCb= header.find(".sapMCb");
//      selectAllCb.remove(); //  to remove SELECT-ALL check box at table header level

      tbl.getItems().forEach(function(r)
       {
        var obj= r.getBindingContext().getObject();
//        var oStatus= obj.STATS;
        var cb= r.$().find(".sapMCb");
        var oCd=sap.ui.getCore().byId(cb.attr("id"));
        if (obj.STATS == "") 
          { oCd.setEnabled(true);  }
        else
          { oCd.setEnabled(false);  }
       });
      },

// triggers when SELECT-ALL of table check box is called
    onTbSelect1:function(oEvent){    
//      debugger;
//      var selected = oEvent.getParameters("selected").listItem.mProperties.selected;
//      if (selected == true)
//      {
//        var tbl= this.getView().byId("idTable");
//        tbl.getItems().forEach(function(r)
//           {
//            var obj= r.getBindingContext().getObject(); // item
//
//            // get core of check/uncheck the table check box
//            var cb= r.$().find(".sapMCb");
//            var oCd=sap.ui.getCore().byId(cb.attr("id"));
//
//            // get core of select/unselect the table line item
//            var ro= r.$().find(".sapMLIB");
//            var oRo=sap.ui.getCore().byId(ro.context.id);
//
//            if (obj.STATS == "") 
//              { oCd.setSelected(true);  
//                oRo.setSelected(true); 
//              }
//            else
//              { oCd.setSelected(false);  
//                oRo.setSelected(false); 
//              }
//           });
//      }
    },

// triggers when SELECT-ALL of table check box is called
    onTbSelectionChange1:function(oEvent){   
//      debugger;
      var selected = oEvent.getParameters("selected").listItem.mProperties.selected;
      if (selected == true)
      {
        var tbl= this.getView().byId("idTable");
        tbl.getItems().forEach(function(r)
           {
            var obj= r.getBindingContext().getObject(); // item

        // for check/uncheck the table line item check box
            var cb= r.$().find(".sapMCb");
            var oCd=sap.ui.getCore().byId(cb.attr("id"));

        // for select/unselect the table row
            //var ro= r.$().find(".sapMLIB");
            //var oRo=sap.ui.getCore().byId(ro.context.id);

            if (obj.STATS == "") 
              { oCd.setSelected(true);  
              //  oRo.setSelected(true); 
              }
            else
              { oCd.setSelected(false);  
              //  oRo.setSelected(false); 
              }
           });
      }
    },

    onListDtChange:function(oEvent){    
//      debugger;
      var Dtselected = oEvent.getSource().getDateValue();;
      var date = new Date();

      if (Dtselected > date ){
        MessageBox.error("Future Invoice date not possible!");
        oEvent.getSource().setValue('');
        return;
      }
    },

    onReset:function(evt){
      this.getView().byId("DTI1").setValue();
      this.getView().byId("DTI2").setValue();
      this.getView().byId("GRFromId").setValue();
      this.getView().byId("GRToId").setValue();
      this.getView().byId("idPlant").setValue();
      this.getView().byId("LifnrId").setSelectedKeys();
      this.getView().byId("InvoiceId").setSelectedKey();
      this.getView().byId("idTable").setVisible(false);        
    },

    onDownload:function(oEvent) {   
      debugger;
      if ( that.Itemmodel == undefined )
      { MessageBox.error("Table is empty.Click Search first!");  }
      else
      {
        this.getView().setBusy(true);
        var oTable = this.getView().byId('idTable');
        that.oTable;
        var oModel = new sap.ui.model.json.JSONModel(that.Itemmodel.oData);
        var oModel = this.getView().byId('idTable').getModel('that.Itemmodel');
        var path = that.Itemmodel.oData;               

        var temp;
        var char = "'";
        for(var i=0;i<path.results.length;i++){
          temp = path.results[i].DESCRIPTION;
//          replacing any data with ENTER symbol with SPACE.                           
//          path.results[i].DESCRIPTION = temp.replace(/\n/g, ' ');

//          to convert number to string in the downloaded CSV or excel
//          path.results[i].ZZINVOICEDATE  = "'"+path.results[i].ZZINVOICEDATE;
//          path.results[i].BE_REFOBJ    = char+path.results[i].BE_REFOBJ;                           

          path.results[i].GR_NO     = "'"+path.results[i].OBJECT_ID;
          path.results[i].LIFNR       = "'"+path.results[i].POSTING_DATE;
          path.results[i].WERKS     = char+path.results[i].WERKS;
          path.results[i].S_INVOICE_NO  = char+path.results[i].S_INVOICE_NO;
          path.results[i].S_INVOICE_DT  = char+path.results[i].S_INVOICE_DT;
          path.results[i].OLD_PRICE   = "'"+path.results[i].OLD_PRICE;
          path.results[i].NEW_PRICE   = "'"+path.results[i].NEW_PRICE;
          path.results[i].S_INVOICE_AMT = "'"+path.results[i].S_INVOICE_AMT;
          path.results[i].POSTED_ON   = "'"+path.results[i].POSTED_ON;
          path.results[i].STATS     = "'"+path.results[i].STATS;
          path.results[i].MWSKZ     = "'"+path.results[i].MWSKZ;
        }

        var oExport = new Export({
          exportType : new ExportTypeCSV({  }),
          models : that.Itemmodel ,
          rows: { path : '/results' },
          columns: this.buildColArrforExp(oTable)
        });

        oExport.saveFile().always(function(){
          this.destroy();
        })   
        this.getView().setBusy(false); 
      }
    },

    buildColArrforExp: function(oTable){
//      debugger;
      var oTable = this.getView().byId('idTable');
      var cols = oTable.getAggregation('columns');
      var i,columns=[] ;
      for(i=0;i<cols.length;i++){
        var  template={};
        var col= {} ;
//        if(cols[i].getVisible()){
        col.name = cols[i].getHeader().getTitle();
        if(i === 0)
          var element = 'title';
        else
          var element = 'text';

        template.content = '{' + cols[i].getParent().getBindingInfo('items').template.getAggregation('cells')[i].mBindingInfos.text.parts[0].path + '}';
        col.template = template;
        columns.push(col);                             
//        }
      }
      return columns;
    },

    onActionPress: function(oEvent){
//      debugger;
      var table = this.getView().byId("idTable");
//      var rowid = table.getSelectedIndices();
      var rowid = table.getSelectedItems();
      var ModelData = this.getView().byId("idTable").getModel().getData().results;
      if  (rowid.length == 0)
      { MessageBox.error("No Items selected!!");
      return; }
      var hdr = {};
      hdr.NAV_SINVOICE = [];
      hdr.GR_NO = '1234567890';
      hdr.LIFNR = 'XYZ123';  // this.SessiUserId
      hdr.USER = this.SessiUserId;

//      hdr.FLAG = 'U';
/////////    getting the button id pressed.
      var str = oEvent.getSource().getId();
      var IdButton = str.split("-");
      var id = IdButton[IdButton.length - 1];

      if (id == "idSave")
       {  hdr.FLAG = 'U';  }
      else if (id == "idDelete")
       {
        var reason = this.getView().byId("IdDelReason").getSelectedItem().getText();
        if (reason == "Select")
        {
          MessageBox.error("Select the reason for deleting the records!!");
          return;
        }
        hdr.FLAG = 'D';
        hdr.REASON = reason;
       }
///////////////////////////////////////////////////////

      for (var i = 0; i < rowid.length; i++) {
        var itm = {};
//        var idx = rowid[i];
//        itm = table.getModel().oData[idx];
        var status = rowid[i].mAggregations.cells[11].getText();
        if (status != "X")  // ignoring the 'X' status records
        {
          itm.GR_NO       = rowid[i].mAggregations.cells[0].mProperties.text;
          itm.LIFNR       = rowid[i].mAggregations.cells[1].mProperties.text
          itm.WERKS       = rowid[i].mAggregations.cells[2].mProperties.text
          itm.S_INVOICE_NO  = rowid[i].mAggregations.cells[3].getValue();
  //        as day reduces by 1 in Bg --> adding 1 day
          if (rowid[i].mAggregations.cells[4].getDateValue() != null)
          {
            itm.S_INVOICE_DT  = rowid[i].mAggregations.cells[4].getDateValue();
            itm.S_INVOICE_DT = itm.S_INVOICE_DT.setDate(itm.S_INVOICE_DT.getDate() + 1);
            itm.S_INVOICE_DT = new Date(itm.S_INVOICE_DT);
          }

          itm.OLD_PRICE     = rowid[i].mAggregations.cells[5].getText().replace(/\s+/g, '');  // condense
          itm.NEW_PRICE     = rowid[i].mAggregations.cells[6].getText().replace(/\s+/g, '');
          itm.NET_VALUE     = rowid[i].mAggregations.cells[7].getText().replace(/\s+/g, '');
          itm.S_INVOICE_AMT   = rowid[i].mAggregations.cells[8].getText().replace(/\s+/g, '');

          if (rowid[i].mAggregations.cells[9].getText() != null)
          {
            itm.POSTED_ON     = rowid[i].mAggregations.cells[9].getText();
            itm.POSTED_ON = itm.POSTED_ON.substr(6,4)+'-'+itm.POSTED_ON.substr(3,2)+'-'+itm.POSTED_ON.substr(0,2);
            itm.POSTED_ON = new Date(itm.POSTED_ON); 
            itm.POSTED_ON = itm.POSTED_ON.setDate(itm.POSTED_ON.getDate());
            itm.POSTED_ON = new Date(itm.POSTED_ON);
          }
          itm.MWSKZ     = rowid[i].mAggregations.cells[10].getText();
          itm.STATS     = status; // rowid[i].mAggregations.cells[10].getText();
          itm.IS_DIGI_SIGNED  = rowid[i].mAggregations.cells[12].getSelectedKey();
          itm.INV_RECV_STAT = rowid[i].mAggregations.cells[16].getText();
          itm.RESN      = rowid[i].mAggregations.cells[17].getText();
          itm.TCS       = rowid[i].mAggregations.cells[18].getText();
          itm.FLAG      = 'X';

          for (var j = 0; j < ModelData.length; j++){

            if (( itm.GR_NO == ModelData[j].GR_NO ) && 
                ( itm.LIFNR      == ModelData[j].LIFNR) &&
                ( itm.OLD_PRICE  == ModelData[j].OLD_PRICE.replace(/\s+/g, '') ))
            {
              itm.FILE_NAME  = ModelData[j].FILE_NAME;
              itm.FILE_TYPE  = ModelData[j].FILE_TYPE;
              itm.PDF_CONTENT = ModelData[j].PDF_CONTENT;
              itm.Change = ModelData[j].Change;
//              if ((itm.PDF_CONTENT == "") && (hdr.FLAG != 'U'))
//              {
//                MessageBox.error("Please attach S-Invoice copy & upload!!");
//                return;
//              }
            } j
          }
          hdr.NAV_SINVOICE.push(itm);
        }
      }
//      table.getModel().refresh();
      debugger;
      that.getView().setBusy(true);
      this.SInvoiceModel.create("/ES_SInvoiceSet",hdr,{success:this.myActionPressSuccess ,error:this.myActionPressError});
    },

    myActionPressSuccess : function(oData,Response) {
//      debugger;
      that.onGetdetail();
      that.getView().setBusy(false);
      MessageBox.success("Action was Successful");
    },

    myActionPressError  : function(eError) {
//      debugger;
      that.onGetdetail();
      that.getView().setBusy(false);
//      oMessagePopover.setModel(new JSONModel([]));
//      var mesgs = JSON.parse(eError.responseText).error.innererror.errordetails;
//      MessageBox.success(mesgs);
    },

///////////////////////////////////////////////////////////////////////////////////////////

//    on attachment button press on line item
    fnfileAttachment:  function(oEvent){
//      debugger;
//      ---------- AJAY : INS -- Start   ---------    //
      oController.RECINDX     = oEvent.oSource.getParent().getParent().indexOfItem(oEvent.oSource.getParent());
      oController.VENDOR    = this.getView().byId('idTable').getModel().oData.results[oController.RECINDX].LIFNR;
      oController.SINVOICE  = this.getView().byId('idTable').getModel().oData.results[oController.RECINDX].S_INVOICE_NO;
      var day   =   this.getView().byId('idTable').getModel().oData.results[oController.RECINDX].S_INVOICE_DT.getDate();
      if (day <10 ){ day = '0' + day};
      var month = ( this.getView().byId('idTable').getModel().oData.results[oController.RECINDX].S_INVOICE_DT.getMonth() + 1 );
      if (month <10 ){ month = '0' + month};
      var year  =   this.getView().byId('idTable').getModel().oData.results[oController.RECINDX].S_INVOICE_DT.getFullYear();
      oController.SINVDATE  = year + month + day;
//      ---------- AJAY : INS -- Start   ---------    //
      if(!this.FileUploadEntryLevel){
        this.FileUploadEntryLevel= sap.ui.xmlfragment("ZSRM_SINVOICE.view.Attachment", this);
      }   
      sap.ui.getCore().byId("fileUploader1").setValue();
      this.FileUploadEntryLevel.open();
    },

//    on pressing of choose file in file attachment fragment
    upldStart:function(e){
//      debugger;
//      if(oController.isInv == "X"){
      var tArray=e.oSource.getValue().split(".");
      var type=tArray[1];
//      e.oSource.setValue('Inv_' + oController.ASN + '.' + type);
      e.oSource.setValue( oController.VENDOR + '_' + 
          oController.SINVOICE + '_' + 
          oController.SINVDATE + 
          '.' + type );
//      }
    },

//    on "Submit Document" press in the attachment fragment  
    fnAttach:function(Oevent){
      debugger;
//      if(oController.isFirst=='X'){
//      oController.isFirst='';
      var oModelUpload = new sap.ui.model.json.JSONModel();

      var files = sap.ui.getCore().byId("fileUploader1").oFileUpload.files;
      if(files.length == 0){
        MessageBox.show('Please browse and upload a file',{
          icon: sap.m.MessageBox.Icon.ERROR,
          title: "Error"
        });
      }else {
        var file = sap.ui.getCore().byId("fileUploader1").oFileUpload.files[0];
        var fname = file.name;
        var arr = fname.split(".");
        var type = arr[1];
        var reader = new FileReader();
        var binary = "";
        var pt = this;
        if(oController.isInv == "X"){
//          fname = 'Inv_' + oController.ASN + '.' + type;
          fname = ( oController.VENDOR + '_' + 
              oController.SINVOICE + '_' + 
              oController.SINVDATE + 
              '.' + type );
          sap.ui.getCore().byId("fileUploader1").oFileUpload.files[0].name = fname;
        }
        var reader = new FileReader();
        reader.onload = function (e) {
          var oEntity ={};
          oEntity.Asnno = oController.ASN;

          if(oController.isInv == "X"){
            oEntity.OBJDES = 'fnAttach_' + oEntity.Asnno + '.' + type;
            if(type == "pdf" || type == "PDF"){
            }else{
              MessageBox.show('Please upload a pdf invoice',{
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error"
              });
              return;
            }
          }else{
            oEntity.OBJDES = fname;
          }
          var bytes = new Uint8Array(reader.result);
          var length = bytes.byteLength;
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          //pt.result  - readonly so assign content to another property
          pt.content = binary;
          // pt.onload(); // thanks to @Denis comment
          oController.FileContnet =  btoa(pt.content);
          var table =
 oView.byId("idTable");
                     
          //**************file with same name logic************************************************
          var attachdata = table.getModel("Item").getData().Details.NAV_MasterToAttachments.results;
          for(var l=0;l<attachdata.length;l++)
          {
            if(file.name == attachdata[l].OBJDES )
            {
              var flaggg = "X";
              break;
            }
            else
            {
              var flaggg ="";
            }
          }
          if(flaggg == "X")
          {
            MessageBox.show('File with same name cannot be uploded',{
              icon: sap.m.MessageBox.Icon.ERROR,
              title: "Error"
            });
            return;
          }
          else
          {
            table.getModel("Item").getData().Details.NAV_MasterToAttachments.results.push({OBJDES:fname,FILE_EXT:file.type});

          }
//          **************************************************************** 
          table.getModel("Item").refresh(true);
          oEntity.FileContent = oController.FileContnet;
          oEntity.Category=oController.Category;
          oEntity.isInvoice = oController.isInv;
          oController.arr.push(oEntity);
//          oController.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").create("/ET_FileAttachSet",oEntity,{success: oController.mySuccessCr, error: oController.myErrorHandlerCr});
          this.SInvoiceModel.create("/ET_FileAttachSet",oEntity,{success: oController.mySuccessCr, error: oController.myErrorHandlerCr});
          oController.dialog.open();
        }
      }
      reader.readAsArrayBuffer(file);
      // }
//      }
      this.getView().byId("delete").setVisible(true);
      this.FileUploadEntryLevel.close();
//      }
    },


    onCloseAttach:function(oEvent){
      this.FileUploadEntryLevel.close();
      this.flength=0
      if(oController.isInv == "X"){
        oController.isInv = " ";
      }
    },

    fnDelete:function(oEvent)
    {
      debugger;

      var ind      = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
      var id_file = this.getView().byId("idTable").getModel().getData().results[ind].INSTID_B;
      var ASN     = this.getView().byId("idTable").getModel().getData().results[ind].GR_NO;
      oController.InvDlt = "X";

//      oController.dltIndex = oEvent.getSource().getBindingContext("Item").sPath.split('/results/')[1];

  // row delete option
      var id = oEvent.getParameters("selected").id.split("-")[2];
      if (id != "delete")
      {
      that.getView().setBusy(true);
      this.SInvoiceModel.read("/ET_FileAttachSet",
          {urlParameters:
          {$filter:"INSTID_B eq'"+id_file+"' and Asnno eq '"+ASN+"' and isInvoice eq '"+oController.InvDlt+"'"},
          success: oController.mySucs, error: oController.myErr});
      }
      else
      {
        debugger;
        this.getView().byId("idTable").getModel().getData().results[ind].PDF_CONTENT = '';
        this.getView().byId("idTable").getModel().getData().results[ind].FILE_NAME = '';
        this.getView().byId("idTable").getModel().getData().results[ind].FILE_TYPE = '';
        this.getView().byId("idTable").getModel().getData().results[ind].INV_RECV_STAT='';
        this.getView().byId("idTable").getModel().getData().results[ind].RESN='';
        this.getView().byId("idTable").getModel().getData().results[ind].Change = 'X';
        this.getView().byId("idTable").getModel().refresh();
      }

      this.getView().byId("idSave").setVisible(true);    //Added by Stephen

    },
    mySucs:function(JSON,oResponse){ 
//      debugger;
      that.onGetdetail();
      that.getView().setBusy(false);
      MessageBox.success("Successfully deleted!! ");

    },
    myErr: function(oError){
      debugger;
      that.getView().setBusy(false);
    },

    onDispDoc: function(oEvent){
      debugger;
      var ind      = oEvent.getSource().getParent().getParent().indexOfItem(oEvent.getSource().getParent());
      var INSTID_B = this.getView().byId("idTable").getModel().getData().results[ind].INSTID_B;
        // Added By Guruprasad On 25.08.2021.
        INSTID_B = INSTID_B + ";" + this.getView().byId("idTable").getModel().getData().results[ind].OLD_PRICE.replace(/\s/g, '');
        // Added By Guruprasad On 25.08.2021 Ends Here.
//      if(oEvent.getSource().getBindingContext("Item").getObject().INSTID_B)
      if(INSTID_B)
      {
        //this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read("/ET_SHOWATTACHMENTCollection(INSTID_B='FOL33000000000004EXT42000000009301')/$value");
        var data = {};
        var oModel = new sap.ui.model.json.JSONModel();
//        oModel.loadData("../../../../../../../sap/bc/ui2/start_up",null,false);
        oModel.loadData("/sap/bc/ui2/start_up",null,false);

        //oModel.loadData("proxy/sap/bc/ui2/start_up",null,false);
        // data.user = oModel.getData().id;

        data.system = oModel.getData().system; 

        if (data.system === "SF1" || data.system === "SF2" )
           {  var http = 'http://'; }
        else
           {  var http = 'https://'; }


        if(sap.ui.Device.browser.name =="ie")
        {
//          window.open(http + location.host + "/sap/opu/odata/sap/ZZSRM_ASN_TO_INVOICE_SRV/ES_ShowAttachment(INSTID_B='"+oEvent.getSource().getBindingContext("Item").getObject().INSTID_B+"')/$value");
          window.open(http + location.host + "/sap/opu/odata/sap/ZZSRM_VENDORINVOICE_SRV/ES_ShowAttachment(INSTID_B='"+INSTID_B+"')/$value");
        }   
        else
        {
//          window.open(location.origin + "/sap/opu/odata/sap/ZZSRM_ASN_TO_INVOICE_SRV/ES_ShowAttachment(INSTID_B='"+oEvent.getSource().getBindingContext("Item").getObject().INSTID_B+"')/$value");
          window.open(location.origin + "/sap/opu/odata/sap/ZZSRM_VENDORINVOICE_SRV/ES_ShowAttachment(INSTID_B='"+INSTID_B+"')/$value");
        }
      }
      else
      {
        //  var asn    =  oEvent.getSource().getBindingContext("Item").getObject().Asnno;
//        var objdes = oEvent.getSource().getBindingContext("Item").getObject().OBJDES; 
        var objdes   = this.getView().byId("idTable").getModel().getData().results[0].FILE_NAME;
        for(var k=0;k<oController.arr.length;k++)
        {
          if( objdes == oController.arr[k].OBJDES)
          {
            var content = oController.arr[k].FileContent

            //*********************************************************************

            var byteCharacters = atob(content);

            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            var blob1 = new Blob([byteArray], {type: "application/pdf"});
            // var blob2 = new Blob(["cool"], {type: "application/pdf"});
            var fileName2 = objdes;
            saveAs(blob1, fileName2);


            function saveAs(blob, fileName) {
              var url1 = window.URL.createObjectURL(blob);
              var a = document.createElement("a");
              document.body.appendChild(a);
              a.style = "display: none"; 
              a.href = url1;
              a.download = fileName;
              a.click(); 
            }
            //*****************************************************************
          }
        }
      }
    },

///////////////////////////////////////////////////////////////////////////////////////////
// called while attaching the file
    fnAttach1:function(oEvent){
//      Anmol upload logic
      debugger;
      oController.RECINDX = oEvent.oSource.getParent().getParent().indexOfItem(oEvent.oSource.getParent());
//// --------------------------////
      var lifnr   = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].LIFNR;
      var Inv_no  = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_NO;
      if (Inv_no == '')
      {
        MessageBox.error("S-Invoice Number cannot be empty !!");
        return;
      }

      if (that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT != null)
        {
        var I_day   = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT.getDate();
        if ( I_day < 10 ) {I_day = '0' + I_day };
        var I_month = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT.getMonth();
        I_month = I_month + 1;
        if ( I_month < 10 ) {I_month = '0' + I_month };
        var I_year  = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT.getFullYear();
        var Inv_dt = I_year+""+I_month+I_day;
        }
      else
        {
        MessageBox.error("S-Invoice Date cannot be empty !!");
        return;
        }

//      var sign = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].IS_DIGI_SIGNED;
//      if (sign == '')
//      {
//        MessageBox.error("Select if Document is digitally singed or not!!");
//        return;
//      }
//// --------------------------////


      var TYPE_FILE = oEvent
      .getParameters().id;
      if (TYPE_FILE
          .includes("uploaderDETTSP")) {
        TYPE_FILE = "Detailed Technical Specifications";

      } else if (TYPE_FILE
          .includes("uploaderTECHCS")) {
        TYPE_FILE = "Technical Comparison Sheet";

      } else if (TYPE_FILE
          .includes("uploaderENDUCR")) {
        TYPE_FILE = "End User Confirmation of Requirement";

      }

      var CompanyV = {};
      CompanyV.arr = [];
      CompanyV.Contentarr = [];
      CompanyV.count = 0;
      CompanyV.variable = "X";
      CompanyV.filelength = oEvent
      .getParameter("files").length;
      for (var i = 0; i < oEvent
      .getParameter("files").length; i++) {
        if (oEvent
            .getParameter("files")[i].name.length > 100) {
          MessageToast
          .show(
              "File Name Cannot exceed 100 Characters",
              {
                duration : 5000,
                width : "25em",
                my : "center center",
                at : "center center",
              });
          break;
        } else if (oEvent
            .getParameter("files")[i].size > 1000000) {
          MessageToast
          .show(
              "File Size should be less than 1 MB",
              {
                duration : 5000,
                width : "25em",
                my : "center center",
                at : "center center",
              });
          break;
        } else if (oEvent
            .getParameter("files")[i].size == 0) {
          MessageToast
          .show(
              "Blank file uploaded",
              {
                duration : 5000,
                width : "25em",
                my : "center center",
                at : "center center",
              });
          break;
        } else {
          var FileName = oEvent
          .getParameter("files")[i].name;
          var file = oEvent
          .getParameter("files")[i];
          var obj = {};
          obj.name = oEvent
          .getParameter("files")[i].name;
          obj.type = oEvent
          .getParameter("files")[i].type;
          CompanyV.Contentarr
          .push(obj);
          // if(file &&
          // window.FileReader) {
          var reader = new FileReader();
          reader
          .readAsArrayBuffer(file);
          // ************************************************************************************
          // var binaryString =
          // readerEvt.target.result;
          reader.onload = function(
              readerEvt) {
            var bytes = new Uint8Array(
                readerEvt.target.result);
            var length = bytes.byteLength;
            var binary = "";
            for (var i = 0; i < length; i++) {
              binary += String
              .fromCharCode(bytes[i]);
            }
            CompanyV.content = binary;
            var fcontent = btoa(CompanyV.content);
            CompanyV.arr
            .push({
              "Content" : fcontent
            });
            CompanyV.content = "";

            // *************************************************************************************
            if (CompanyV.Contentarr[0].type != "application/pdf")
            {
              MessageToast.show(
                  "Please upload PDF Document",
                  {
                    duration : 5000,
                    width : "25em",
                    my : "center center",
                    at : "center center",
                  });
              return;
            }
            if (CompanyV.arr.length) {
              debugger;
              that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].PDF_CONTENT =  CompanyV.arr[0].Content;
//              that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_NAME =  CompanyV.Contentarr[0].name;

//              var lifnr   = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].LIFNR;
//              var Inv_no  = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_NO;
//
//              if (Inv_no == '')
//              {
//                MessageBox.error("S-Invoice Number cannot be empty !!");
//                return;
//              }
//
//              if (that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT != null)
//                {
//                var I_day   = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT.getDate();
//                if ( I_day < 10 ) {I_day = '0' + I_day };
//                var I_month = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT.getMonth();
//                I_month = I_month + 1;
//                if ( I_month < 10 ) {I_month = '0' + I_month };
//                var I_year  = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].S_INVOICE_DT.getFullYear();
//                var Inv_dt = I_year + I_month + I_day;
//                }
//              else
//                {
//                MessageBox.error("S-Invoice Date cannot be empty !!");
//                return;
//                }

              var name = lifnr  + '_' + Inv_no + '_' + Inv_dt + '.pdf';
              that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_NAME = name;
              that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_TYPE =  CompanyV.Contentarr[0].type;
              that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].Change = 'X';
              that.getView().byId("idTable").getModel().refresh();


            // Added by Stephen
              if (!that._oDisc) {
                that._oDisc = sap.ui.xmlfragment("ZSRM_SINVOICE.view.Disclaimer", that);

                that.getView().addDependent(that._oDisc);
              }
              that._oDisc.open();

            }
          }
        }
      }
    },


    onAfterRendering: function() {
      //Stopping Manual date entry of user instead of calender use
      $("#"+this.byId("DTI1").sId+"-inner").prop("readonly", true);
      $("#"+this.byId("DTI2").sId+"-inner").prop("readonly", true);
    },

    onExit : function () {
      if (this._oDialog) {
        this._oDialog.destroy();
      }
    },    

    //Added by Stephen

    selectCheck : function(oEvent){
       sap.ui.getCore().byId("id_Check").setValueState('None');
    },

    /*onTbSelect : function(oEvent){


    },
    */
    onTbSelectionChange : function(oEvent){
      /*if(oEvent.getSource().getSelectedItems().length > 0){
        this.getView().byId("idSave").setVisible(true);
      }else{
        this.getView().byId("idSave").setVisible(false);
      }*/


    },

    fnclose : function(oEvent){ 
    	that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_NAME = "";
    	that.getView().byId("idTable").getModel().refresh();
      this._oDisc.close();
    },

    fnPressok : function(oEvent){
//    	----------------------------------------[ADD AGAWSA-CONT on 02.02.2024]------------------------------------------------------	//
//    	----------------------------------------[validation for digital sign in attachment]------------------------------------------	//
    	if(sap.ui.getCore().byId("id_CheckInd").getSelected() == true){
    		var vSelectedRowData = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX]; 
        	var vFileName = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_NAME;
        	var vFileType = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_TYPE;
        	var vPDFContent = that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].PDF_CONTENT;
        	var oFilter = [];
        	var payload = {
        			"FILE_NAME": that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_NAME,
        			"FILE_TYPE": that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].FILE_TYPE,
        			"PDF_CONTENT": that.getView().byId("idTable").getModel().getData().results[oController.RECINDX].PDF_CONTENT
        	}
//        	oFilter.push(new sap.ui.model.Filter('FILE_NAME', sap.ui.model.FilterOperator.EQ, vFileName));
//        	oFilter.push(new sap.ui.model.Filter('FILE_TYPE', sap.ui.model.FilterOperator.EQ, vFileType));
//        	oFilter.push(new sap.ui.model.Filter('PDF_CONTENT', sap.ui.model.FilterOperator.EQ, vPDFContent));
        	that.getView().setBusy(true);
        	that.SInvoiceModel.create("/ES_InvDigiValSet", payload ,{
//        		filters: oFilter,
        		success: function (oData,oResponse){
        			that.getView().setBusy(false);
                	that.getView().byId("idSave").setVisible(true);
                	that._oDisc.close();
                }, 
                error: function (oResponse){
                	that.getView().setBusy(false);
                	var response = oResponse.responseText.split("\"");
                	MessageBox.error(response[15]); 
                }
              });
    	}else{
    		sap.ui.getCore().byId("id_CheckInd").setValueState("Error");
    	}
//    	----------------------------------------[END AGAWSA-CONT on 02.02.2024]------------------------------------------------------	//
    },

    fnSelCheckInd : function(){
      sap.ui.getCore().byId("id_CheckInd").setValueState("None");
    }


  });
});