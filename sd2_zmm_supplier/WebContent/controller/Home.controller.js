var oView,oController,Year,current,values,dommodelData;
sap.ui.define([ "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/ComboBox",
  "ZMM_Supplier/Model/formatter",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/json/JSONModel",
   "sap/m/BusyDialog",
   "sap/m/library",
   "sap/ui/export/Spreadsheet",
  ], function (Controller,MessageBox,ComboBox,formatter,MessageToast,Filter,JSONModel,BusyDialog,MobileLibrary,Spreadsheet) {
  var itemcnt;
  var attcnt;
  var that ;
  return Controller.extend("ZMM_Supplier.controller.Home", {
    formatter: formatter,

    onInit:function(oEvent){
      that = this;
      this.getView().byId('newpage').setVisible(false);
      oController = this;
      oController.dialog = new sap.m.BusyDialog();
      oView = this.getView();

      this.ExpenseEntryLevel= sap.ui.xmlfragment("ZMM_Supplier.view.nominee",this)
      var datepic = sap.ui.getCore().byId("fromdate");
      datepic.addEventDelegate({
        onAfterRendering : function(e){
          document.getElementById(e.srcControl.sId+"-"+"inner").disabled =true;
        }
      });
      var datepicfm = sap.ui.getCore().byId("todate");
      datepicfm.addEventDelegate({

        onAfterRendering : function(e){
          document.getElementById(e.srcControl.sId+"-"+"inner").disabled =true;
        }
      });


      var jModel = new sap.ui.model.json.JSONModel(this.jData);
      this.getView().setModel(jModel,"J");
      oController.arr =[];
      var device = "Other";
      var os = jQuery.os.os;
      var os_ver = jQuery.os.fVersion;
      var browser = "Other";
      var browser_ver = jQuery.browser.fVersion;
      var height = $(window).height();
      var width = $(window).width();
      var resolution = width + " * " + height;
      var appName  = "ZMM_SUPPLIER";

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
//      var sServiceUrl0 = mConfig.serviceConfig[1].serviceUrl;
      var oModel_fiori = new sap.ui.model.odata.ODataModel(oData_Url, true);
      sap.ui.getCore().setModel(oModel_fiori,"FioriOdata");

      var oDataModel = new sap.ui.getCore().getModel("FioriOdata");
      oDataModel.read("/FioriUsageSet(Appname='ZMM_SUPPLIER',Device='" + device +
          "',Os='" + os + "',OsVer='" + os_ver + "',Browser='" + browser + "',BrowserVer='" + browser_ver +
          "',Resolution='" + resolution + "')",null,null,null,function(e)            {
      },
      function(e)
      { });
      //End Fiori Usage

      var oData = {
          "items" : []
      };
      var oMassFileModel = new JSONModel(oData);
      this.getView().setModel(oMassFileModel,"MASS");

      that.BusyDialog =  new BusyDialog();

      //================================ User Data =================================//
      var useJson     = new JSONModel();
      useJson.loadData("/sap/bc/ui2/start_up",null,false);
      this.CreatedBy    = useJson.getData().id;
      var dateFormatter = sap.ui.core.format.DateFormat.getDateInstance({pattern : "ddMMyyyy" });
      this.toDay      = dateFormatter.format(new Date());


    },
    fnSearch:function(evnt){
      if(!this.ExpenseEntryLevel){
        this.ExpenseEntryLevel= sap.ui.xmlfragment("ZMM_Supplier.view.nominee",this)
        var datepic = sap.ui.getCore().byId("fromdate");
      }
      this.ExpenseEntryLevel.open();

    },
    fnselectedtype:function(Evt){
      if(Evt.mParameters.selectedIndex == 0){
        //service
      }else if(Evt.mParameters.selectedIndex == 1){
        //PO
      }
    },
    onFromDate:function(){
      //var fDt = new Date(sap.ui.getCore().byId("fromdate").getValue());
      //sap.ui.getCore().byId('todate').setMinDate(fDt);
    },
    fnSubmit:function()
    {
      if(oController.fromList=='X'){
        this.getView().byId('newpage').setVisible(false);
      }
      this.fromdate = sap.ui.getCore().byId("fromdate").getValue();   
      this.todate = sap.ui.getCore().byId("todate").getValue();
      if(sap.ui.getCore().byId("select").mProperties.selectedIndex == 0){
        sap.ui.getCore().byId("select").setValueState("None");
        this.selectedtype = "S";
        this.getView().byId('idpono').setText('Service PO');
        this.getView().byId('idasnno').setText('Confirmation No');
        this.getView().byId('idS1').setVisible(false);
        /*this.getView().byId('idS2').setVisible(false);*/
        this.getView().byId('idS3').setVisible(false);
        this.getView().byId('Description').setVisible(false);
        /*this.getView().byId('InvDate').setVisible(false);*/
        this.getView().byId('DocD1ate').setVisible(false);
        this.getView().byId('invoiceamnt').setVisible(false);
        this.getView().byId('invoiceamnt1').setVisible(false);

        this.getView().byId('id_MassUploadBtn').setVisible(false);  // added by chaithra on 27/6/2019 for Mass upload 
        this.getView().byId('domheaderadd').setVisible(true); // added by chaithra on 27/6/2019 for file attachment

      }else if(sap.ui.getCore().byId("select").mProperties.selectedIndex == 1){
        sap.ui.getCore().byId("select").setValueState("None");
        this.selectedtype="M";
        this.getView().byId('idpono').setText('PO Number');
        this.getView().byId('idasnno').setText('ASN Number');
        this.getView().byId('idS1').setVisible(true);
        /*this.getView().byId('idS2').setVisible(true);*/
        this.getView().byId('idS3').setVisible(true);
        this.getView().byId('Description').setVisible(true);
        /*this.getView().byId('InvDate').setVisible(true);*/
        this.getView().byId('DocD1ate').setVisible(true);
        this.getView().byId('invoiceamnt').setVisible(true);
        this.getView().byId('invoiceamnt1').setVisible(true);

        this.getView().byId('id_MassUploadBtn').setVisible(true); // added by chaithra on 27/6/2019 for Mass upload
        this.getView().byId('domheaderadd').setVisible(false); // added by chaithra on 27/6/2019 for file attachment
      }else{
        sap.ui.getCore().byId("select").setValueState("Error");
        sap.ui.getCore().byId("select").setValueStateText("Select Material / Service");

        this.getView().byId('id_MassUploadBtn').setVisible(true);// added by chaithra on 27/6/2019 for Mass upload
        this.getView().byId('domheaderadd').setVisible(true); // added by chaithra on 27/6/2019 for file attachment
      }
      if(!this.fromdate)
      {
        if(!this.todate)
        {
          sap.ui.getCore().byId("todate").setValueState("Error");   
          sap.ui.getCore().byId("fromdate").setValueState("Error");
          sap.ui.getCore().byId("fromdate").setValueStateText("Enter Date");
          return;
        }
        else
        {
          sap.ui.getCore().byId("todate").setValueState("None");
          sap.ui.getCore().byId("fromdate").setValueState("None");
        }
      }
      else
      {
        sap.ui.getCore().byId("todate").setValueState("None");
      }
      //this.selectedtype = this.rvalue ; 
      //this.rvalue = "M";
      oController.isInv = "";
      oController.Category=this.selectedtype;
      this.mySuccessHandler3 = function(oData,oResponse) {

        oController.json2={
            "ASN" :oData,
            "Category":oController.Category
        }

        oController.jmodel2 = new sap.ui.model.json.JSONModel();

        var Count=oController.json2.ASN.results.length;
        oController.jmodel2.setSizeLimit(Count);
        oController.jmodel2.setData(oController.json2);
        oView.setModel(oController.jmodel2,"List");
        oView.getModel('List').refresh();
        if(oController.Category=="M"){
          var header="Purchase Order List (" + oData.results.length +")";
        }else if(oController.Category=="S"){
          var header="Service Document List (" + oData.results.length +")";
        }

        oController.getView().byId('masterTitle').setText(header);
        oController.dialog.close();
        if(oData.results.length == 0)
        {
          MessageBox.show('No data matching selection criteria',{
            icon: sap.m.MessageBox.Icon.ERROR,
            title: "Error"
          });
        }
        oController.onListItemPress();
      }, 


      this.myErrorHandler2 = function(error) {

      } 


      this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read(
          "/EtPoListSet",
          {urlParameters:{
            "$filter":"(DocType eq '"+oController.Category+"' and DateTo  eq '"+this.todate+"' and DateFrom  eq '"+this.fromdate+"' )"},success:this.mySuccessHandler3,error:this.myErrorHandler3}); 
      var list1 = this.getView().byId("list1").setVisible(true);
      //this.fromdate = sap.ui.getCore().byId("fromdate").setValue("");
      //this.todate = sap.ui.getCore().byId("todate").setValue("");
      //this.selectedtype = "" ;

      this.ExpenseEntryLevel.close();
      oController.dialog.open();
    },
    fnUploadUrl : function(oEvent){
      oController = this;
      var f = oEvent.oSource.oFileUpload.files[0];
      oController.oPath = URL.createObjectURL(f);
    },
    fnClose:function(oEvent){
      oController.ExpenseEntryLevel.close();
    },

    fnfileAttachment:function(evnt){
      var vId = evnt.getSource().getId();
      oController.isFirst='X';

      if(evnt.oSource.mProperties.text == "Upload Invoice"){
        //if(oController.getView().getModel('Item').getData().Details.Ebeln == "INVOICE" || oController.isInv == "X")

        if(oController.fileInd != "")  // commented by chaithra on 11/7/2019
        {
          MessageBox.show('Invoice Already Uploaded for this ASN',{
            icon: sap.m.MessageBox.Icon.ERROR,
            title: "Error"
          });
          return;

          /*MessageBox.show("Invoice is already exist for this ASN. Do you want to reupload?",{
            icon: MessageBox.Icon.INFORMATION,
            title : 'Information',
            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
            onClose: function(oAction) { 
              if (oAction === 'YES'){
                oController.isInv = "X";
                if(!oController.FileUploadEntryLevel){
                  oController.FileUploadEntryLevel= sap.ui.xmlfragment("ZMM_Supplier.view.Forward",this)
                  //sap.ui.getCore().byId("fileUploader1").setValue();

                }
                sap.ui.getCore().byId("fileUploader1").setValue();
                oController.FileUploadEntryLevel.open();
              }
              else if (oAction === 'NO'){
                //
              }
            }
          });
          return;*/
        }
        else {
          oController.isInv = "X";

        }
      }
      else{
        oController.isInv = " ";

      }
      /*      if(this.FileUploadEntryLevel){
        this.FileUploadEntryLevel.destroy(true);
      }*/
      if(!this.FileUploadEntryLevel){
        this.FileUploadEntryLevel= sap.ui.xmlfragment("ZMM_Supplier.view.Forward",this)
        //sap.ui.getCore().byId("fileUploader1").setValue();

      }
      sap.ui.getCore().byId("fileUploader1").setValue();
      this.FileUploadEntryLevel.open();
      if(evnt.getSource().mProperties.text === "Upload Invoice"){
      //  sap.ui.getCore().byId("fileUploader1").setFileType("pdf");   // added by singvi-cont
        sap.m.MessageToast.show("File Type must be in .pdf Format");
      }else{
        //sap.ui.getCore().byId("fileUploader1").setFileType(null);   // added by singvi-cont
      }
      if(that.selectedtype == 'M'){
        if (vId.indexOf('idBtnIA') != -1){
          sap.ui.getCore().byId('id_Check1').setVisible(true);
          sap.ui.getCore().byId('id_Check1').setSelected(false);
          sap.ui.getCore().byId("id_Check1").setEnabled(false);
        }else if (vId.indexOf('domheaderadd') != -1){
          sap.ui.getCore().byId('id_Check1').setVisible(false);
          sap.ui.getCore().byId('id_Check1').setSelected(false);
          sap.ui.getCore().byId("id_Check1").setEnabled(false);
        }
      }else if (that.selectedtype == 'S'){
        sap.ui.getCore().byId('id_Check1').setVisible(false);
      }



    },
    upldStart:function(e){
      if(oController.isInv == "X"){
        var tArray=e.oSource.getValue().split(".");
        var type=tArray[tArray.length -1];
        e.oSource.setValue('Inv_' + oController.ASN + '.' + type);
      }
      sap.ui.getCore().byId("id_Check1").setEnabled(true);
    },
    fnAttach:function(Oevent){
      var vCheckSel ;
      if(that.selectedtype == 'M'){
        if (sap.ui.getCore().byId('id_Check1').getVisible() == true){
          if(sap.ui.getCore().byId("id_Check1").getSelected() != true){
            sap.ui.getCore().byId("id_Check1").setValueState('Error');
            sap.ui.getCore().byId("id_Check1").focus();
            vCheckSel = false ;
          }
          else{
            sap.ui.getCore().byId("id_Check1").setValueState('None');
            vCheckSel = true ;
          }
        }else {
          vCheckSel = true ;
        }
      }
      else if(that.selectedtype == 'S'){
        vCheckSel    = true ;
      }
      if (vCheckSel == true){
        if(oController.isFirst=='X'){
          oController.isFirst='';
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
//            var type = arr[1];
            var type = arr[arr.length - 1]; // AGAWSA-CONT on 07.09.2023
            var reader = new FileReader();
            var binary = "";
            var pt = this;
            // Insert start by AGAWSA-CONT on 07.09.2023 from SF1
            if(fname.length > 50){
              MessageBox.show('Filename lenght should not be more than 50 characters. Please shorten your filename',{
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error"
                  });
                  return;
            }
            // Insert end by AGAWSA-CONT on 07.09.2023
            if(oController.isInv == "X"){
              fname = 'Inv_' + oController.ASN + '.' + type;
              sap.ui.getCore().byId("fileUploader1").oFileUpload.files[0].name = fname;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
              var oEntity ={};
              oEntity.Asnno = oController.ASN;

              if(oController.isInv == "X"){
              //  oEntity.OBJDES = 'Inv_' + oEntity.Asnno + '.' + type;
                oEntity.OBJDES = fname ; // Added by chaithra on 23/7/2019 
                if(type == "pdf" || type == "PDF"){
//                  Added start By AGAWSA-CONT on 07.09.2023
                  var vTemp = fname.split(".", 2);
                  oEntity.OBJDES = vTemp[0]+vTemp[1]+".PDF"; 
//                  Added end By AGAWSA-CONT on 07.09.2023
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
              var table = oView.byId("attachTab");
              //**************file with same name logic************************************************
              var attachdata = table.getModel("Item").getData().Details.NAV_MasterToAttachments.results;
              // Insert start by AGAWSA-CONT on 07.09.2023
              var nameMatched = "";
              $.each(attachdata, function(i,row){
                if(fname.toUpperCase() == row.OBJDES){
                  nameMatched = "X";
                }
              });
              if(nameMatched == "X"){
                MessageBox.show('Same file name " '+fname+' " already exists, so change file name',{
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error"
                  });
                  return;
              }else{
                table.getModel("Item").getData().Details.NAV_MasterToAttachments.results.push({OBJDES:fname,FILE_EXT:file.type});
              }
              // Insert end by AGAWSA-CONT on 07.09.2023
              // Removed start by AGAWSA-CONT on 07.09.2023
              /*for(var l=0;l<attachdata.length;l++)
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

              }*/
              // Removed end by AGAWSA-CONT on 07.09.2023
  //            **************************************************************** 
              table.getModel("Item").refresh(true);
              oEntity.FileContent = oController.FileContnet;
              oEntity.Category=oController.Category;
              oEntity.isInvoice = oController.isInv;
//              Remove start by AGAWSA-CONT on 07.09.2023
              if(oEntity.isInvoice === "X"){
                oEntity.ivAction = 'SIMULATE_OCR'
              }
           // Removed end by AGAWSA-CONT on 07.09.2023
              oController.arr.push(oEntity);
              oController.attachData = oEntity;
              that.BusyDialog.open();
              oController.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").create("/ET_FileAttachSet",oEntity,{success: oController.mySuccessCr, error: oController.myErrorHandlerCr});
              oController.dialog.open();
            }
          }
          reader.readAsArrayBuffer(file);
          // }
  //        }
          this.getView().byId("delete").setVisible(true);
          this.FileUploadEntryLevel.close();
        }
      }


    },

    onCloseAttach:function(oEvent){
      this.FileUploadEntryLevel.close();
      if(oController.isInv == "X"){
        oController.isInv = " ";
      }
    },


    mySuccessCr:function(oData,oResponse)
    {
      oController.BusyDialog.close(); // 
      oController.respData = oData;
      var cInd=oController.getView().getModel('Item').getData().Details.NAV_MasterToAttachments.results.length - 1;
      oController.dialog.close();
      oController.getView().getModel('Item').getData().Details.NAV_MasterToAttachments.results[cInd].INSTID_B = oData.INSTID_B + ';' + oController.ASN;
      if(oResponse.headers['sap-message'] !== undefined){
        var msg = JSON.parse(oResponse.headers['sap-message']);
        var bCompact = !!oController.getView().$().closest(".sapUiSizeCompact").length;
        if (msg.severity == 'error'){
          oController.getView().getModel('Item').getData().Details.NAV_MasterToAttachments.results.splice(cInd,1);
          oController.getView().getModel('Item').refresh(true);
          var vmeesage = msg.message.split('/',3)[1];
          MessageBox.error(vmeesage,{
            styleClass: bCompact ? "sapUiSizeCompact" : ""
          });
        }
        else {

          var vmeesage = msg.message.split('/',3)[1];
          MessageBox.success(vmeesage,{
              actions: [MessageBox.Action.OK],
                            onClose: function (sAction) {
                                if (sAction === "OK") {

                                }
                            }
          });
//              {
//                styleClass: bCompact ? "sapUiSizeCompact" : ""
//              }
//          );
          oController.getView().getModel('Item').refresh();
          if(oController.isInv == 'X'){
            oController.fileInd = "INVOICE";
          }
          oController.FileContnet =  "";
          oController.fromList='';

        }
      }
      else{
        if(oData.OCRApplicable === "X"){
              oController.OCRfragment = null;
                    if (!oController.OCRfragment) {
                      oController.OCRfragment = sap.ui.xmlfragment("ZMM_Supplier.view.OCR",oController);
                      oController.getView().addDependent(oController.OCRfragment);
                    }
                    oController.OCRfragment.open(); 
//                    var that = this;
//            var urlPara={"$expand":"NAV_get_OCR_Details"};
            oController.BusyDialog.open();
            oController.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read("/EtPoListSet('"+oController.ASN+"')/NAV_get_OCR_Details",{
//                          urlParameters: urlPara,
                          success: function (oData, oResponce) {
                              debugger;
                              oController.BusyDialog.close();
                              oController.dialog.close()
                              var headerData =oController.json3.Details.NAV_MasterToHeader
                              var fullDate = headerData.InvDate;
                              var vCount = 0;
                              headerData.OCRStatus = oController.respData.OCRStatus
                              headerData.OCRStatusCOLOR = oController.respData.OCRStatusCOLOR
                              headerData.OCRSubmitButton = oController.respData.OCRSubmitButton 
                              if(oData.results[0].CUSTOM3 == "X"){
                                headerData.OCRStatus = oData.results[0].CUSTOM2;
                              }else{
                                $.each(oData.results, function(index,row)
                                  {
                                    if(row.STATUS == "NOT MATCHED"){
                                      if(row.CUSTOM1 == "X"){
                                        vCount++;
                                      }
                                    }
                                   })
                                  if(vCount < 1){
                                    headerData.OCRSubmitButton = "X";
                                    headerData.OCRStatus = "Matched";
                                  }else{
                                    headerData.OCRSubmitButton = "";
                                    headerData.OCRStatus = "Not Matched";

                                  }
                              }

                              if(headerData.OCRSubmitButton === ""){
                                oController.OCRfragment.getAggregation('buttons')[1].setEnabled(false)
                              }else{
                                oController.OCRfragment.getAggregation('buttons')[1].setEnabled(true)
                              }
                              
                              headerData.InvDate = fullDate.slice(6,8) + "." +  fullDate.slice(4,6) + "." + fullDate.slice(0,4)
                                var myJSONModel = new JSONModel();
                                myJSONModel.setData(headerData);
                                oController.getView().setModel(myJSONModel ,"header");
                                oController.OCRfragment.setTitle("OCR Simulation Screen ( ASN / CNF No " + headerData.Asnno + ")");
                                var myOCRModel = new JSONModel();
                                myOCRModel.setData(oData);
                                oController.getView().setModel(myOCRModel ,"OCR");
                          },
                          error: function (oError) {
                            oController.dialog.close();
//                              MessageBox.error(oError.message);
                          }
                      });
            }
      }
      oController.fnSubmit();

    //  window.location.reload();
    },
    //added by beena-50002903 on 25-07-2023
    onApprDialogSubmit : function(){
            oController.getView().getModel('header').setData(null);
            oController.getView().getModel('OCR').setData(null);
            oController.OCRfragment.close();
            oController.OCRfragment.destroy(true);
            //oController.OCRfragment = null; // added by AGAWSA-CONT on 03-11-2023

    },
    onOCRSubmit : function(){
      debugger
      oController.dialog.open();
      var object = oController.attachData ;
      object.ivAction = 'SUBMIT'
      oController.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").create("/ET_FileAttachSet",object,{
                success: function (oData, oResponse) {
                    debugger;
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
                    MessageBox.success(oData[0].ErrorMessage,{
                      title: oData[0].type
                    });
                    oController.onListItemPress();
                    oController.dialog.close()
                    oController.OCRfragment.close();
                    oController.OCRfragment.destroy(true);
                    //oController.OCRfragment = null; // added by AGAWSA-CONT on 03-11-2023
                },
                error: function (oError) {
                  oController.dialog.close();
//                    MessageBox.error(oError.message);
                    oController.OCRfragment.destroy(true);
                  //oController.OCRfragment = null; // added by AGAWSA-CONT on 03-11-2023
                }
            });
    },

    myErrorHandlerCr:function(oFail)
    {
         oController.dialog.close()
    },
    onSearching:function(oEvt)
    {
      var filters = [];
      var sQuery = oEvt.getSource().getValue();
      if (sQuery && sQuery.length > 0) {
        var aFilters= new Filter({
          filters: [new Filter("AsnConfNo", sap.ui.model.FilterOperator.Contains, sQuery,true),
            new Filter("Ebeln", sap.ui.model.FilterOperator.Contains, sQuery,true),
            new Filter("Invoice", sap.ui.model.FilterOperator.Contains, sQuery,true)
          ],
          and:false
        });

        /*        var filter = new sap.ui.model.Filter("Ebeln",
            sap.ui.model.FilterOperator.StartsWith, sQuery);
        filters.push(filter);*/
      }
      var list = this.getView().byId("list1");
      var binding = list.getBinding("items");
      binding.filter(aFilters, "Application");
    },
    fnDelete:function(oEvent)
    {

      oController.dltIndex = oEvent.getSource().getBindingContext("Item").sPath.split('/results/')[1];
      var vFileName ;
      var id_file = oEvent.getSource().getBindingContext("Item").getObject().INSTID_B;
      if(id_file)
        if(oEvent.getSource().getBindingContext("Item").getObject().OBJDES.indexOf('Inv_') !== -1 ){
          oController.InvDlt = "X";
          oController.fileInd = "";
        }else{
          oController.InvDlt = "";

        }
      vFileName = oEvent.getSource().getBindingContext("Item").getObject().OBJDES ;
      oController.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read("/ET_FileAttachSet",
          {urlParameters:
          {$filter:"INSTID_B eq'"+id_file+"' and Asnno eq '"+this.ASN+"' and isInvoice eq '"+oController.InvDlt+"' and FileName eq '"+vFileName+"'"},
          success: oController.mySucs, error: oController.myErrorHandler});
      oController.dialog.open();

    },
    mySucs:function(JSON,oResponse){
      oController.jmodel3.oData.Details.NAV_MasterToAttachments.results.splice(oController.dltIndex,1);
      oView.setModel(oController.jmodel3,"Item");
      oView.getModel('Item').refresh();
      var vardata=oController.getView().getModel('Item').getData();

      oController.getView().byId('idAttachment').setCount(vardata.Details.NAV_MasterToAttachments.results.length);

      var bCompact = !!oController.getView().$().closest(".sapUiSizeCompact").length;
      MessageBox.success(
          "File Deleted Successfully!",
          {
            styleClass: bCompact ? "sapUiSizeCompact" : ""
          }
      );
      if(oController.InvDlt == "X"){

        oController.getView().getModel('Item').getData().Details.Ebeln = "";
        oController.getView().getModel('Item').refresh();
        oController.isInv = "";
        oController.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read(
            "/EtPoListSet",
            {urlParameters:{
              "$filter":"(DocType eq '"+oController.Category+"' and DateTo  eq '"+this.todate+"' and DateFrom  eq '"+this.fromdate+"' )"},
              success:this.mySuccessHandler3,error:this.myErrorHandler3}); 

      }
      oController.fromList='';
      oController.fnSubmit();
      oController.dialog.close();

    },

    RequestStatus1:function(value)
    {
      var item=parseInt(value);
      return item;
    },
    fnAccept:function()
    {

    },
    onListItemPress: function(oEvent){

      //this.getView().byId('newpage').setVisible(true);
      if (oEvent != undefined){
        oController.fromList='X';
        var sarray=oEvent.oSource.oBindingContexts.List.sPath.split("/");
        oController.lIndex=sarray[3];
        oController.isInv = "";
        this.ASN1 = oEvent.getSource().getTitle();
        this.ASN = this.ASN1.substring(8);
        oController.ASN =  this.ASN1.substring(8);
      }
      if ((this.ASN != undefined && this.ASN != '') && 
          (oController.Category != '' && oController.Category != undefined))
      {

        oView.setBusy(true);
        oController.dialog.open();
        oController.arr =[];
        oView.byId('domheaderadd').setVisible(true);
        oController.mySuccessHandler4 = function(oData1,oResponse) {
        oView.byId('newpage').setVisible(true);
        oController.InvDlt = "";

        var oData=oData1.results[0];
        oController.fileInd = oData1.results[0].Ebeln;
        oController.json3={
            Details :oData
        }
        oView.byId("PoDate").setDateValue(oData.NAV_MasterToHeader.CreationDate);
        oView.byId("DocD1ate").setDateValue(oData.NAV_MasterToHeader.DelDate);
        oView.byId("InvDate").setValue(oData.NAV_MasterToHeader.InvDate);
        oView.byId("Description").setValue(oData.NAV_MasterToHeader.Description);
        oView.byId("ASNNumber").setValue(oData.NAV_MasterToHeader.Asnno);
        oView.byId("InvoiceNumber").setValue(oData.NAV_MasterToHeader.InvNo);
        oView.byId("invoiceamnt").setValue(oData.NAV_MasterToHeader.InvAmt);
        oView.byId("PONumber").setValue(oData.NAV_MasterToHeader.EccEbeln);

        if(oData.NAV_MasterToHeader.Status == 'P')
        {
          oView.byId("idStatus").setValue('In Process');
          oView.byId('domheaderadd').setEnabled(true);
        }else if(oData.NAV_MasterToHeader.Status == 'A')
        {
          oView.byId('domheaderadd').setEnabled(false);
          oView.byId("idStatus").setValue('Approved');
        }else if(oData.NAV_MasterToHeader.Status == '')
        {
          oView.byId("idStatus").setValue(' ');
          oView.byId('domheaderadd').setEnabled(true);
        }

        oController.jmodel3 = new sap.ui.model.json.JSONModel();
        oController.jmodel3.setData(oController.json3);
        oView.setModel(oController.jmodel3,"Item");
        //oView.byId("attachTab").setModel(oController.jmodel3,"Item");
        oView.setBusy(false);
        oController.dialog.close();
        } ,

        oController.myErrorHandler4 = function(error) {
          oView.byId('newpage').setVisible(false);
          oView.setBusy(false);
          oController.dialog.close();
        }
        var urlPara={"$filter":"AsnConfNo eq '"+this.ASN+"' and DocType eq '"+oController.Category+"'","$expand":"NAV_MasterToHeader,NAV_MasterToItem,NAV_MasterToAttachments"};
        this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read("/EtPoListSet",
            {urlParameters:urlPara,
          success: oController.mySuccessHandler4, error:oController.myErrorHandler4});
      }

    },
    onDispDoc: function(oEvent){


      if(oEvent.getSource().getBindingContext("Item").getObject().INSTID_B)
      {
        //this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read("/ET_SHOWATTACHMENTCollection(INSTID_B='FOL33000000000004EXT42000000009301')/$value");

        var data = {};
        var vFlieName = oEvent.oSource.getText();
        var oModel = new sap.ui.model.json.JSONModel();
        oModel.loadData("../../../../../../../sap/bc/ui2/start_up",null,false);

        //oModel.loadData("proxy/sap/bc/ui2/start_up",null,false);
        // data.user = oModel.getData().id;

        data.system = oModel.getData().system; 

        if (data.system === "SF1" || data.system === "SF2" )
          var http = 'http://';
        else
          var http = 'https://';


        if(sap.ui.Device.browser.name =="ie")
        {
          window.open(http + location.host + "/sap/opu/odata/sap/ZZSRM_ASN_TO_INVOICE_SRV/ES_ShowAttachment(INSTID_B='"+oEvent.getSource().getBindingContext("Item").getObject().INSTID_B+"',Filename='" + vFlieName + "')/$value");
        }   
        else
        {
          window.open(location.origin + "/sap/opu/odata/sap/ZZSRM_ASN_TO_INVOICE_SRV/ES_ShowAttachment(INSTID_B='"+oEvent.getSource().getBindingContext("Item").getObject().INSTID_B+"',Filename='" + vFlieName + "')/$value");
        }
      }
      else
      {
        //  var asn    =  oEvent.getSource().getBindingContext("Item").getObject().Asnno;
        var objdes = oEvent.getSource().getBindingContext("Item").getObject().OBJDES; 
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

    onUpdTbl : function(oEvt){

      var vardata=this.getView().getModel('Item').getData();
      this.getView().byId('idItem').setCount(vardata.Details.NAV_MasterToItem.results.length);
      this.getView().byId('idAttachment').setCount(vardata.Details.NAV_MasterToAttachments.results.length);


      for(var i=0;i<oController.jmodel3.oData.Details.NAV_MasterToAttachments.results.length;i++)
      {
        if( vardata.Details.NAV_MasterToHeader.Status == "P")
        {
          if(i == 0){
            //this.getView().byId('domheaderadd').setEnabled(true);
          }
          oController.jmodel3.oData.Details.NAV_MasterToAttachments.results[i].dlt = true;
        }
        else
        {
          if(i == 0)
          {

            //this.getView().byId('domheaderadd').setEnabled(false);
          }
          oController.jmodel3.oData.Details.NAV_MasterToAttachments.results[i].dlt = false;
        }
      }

      oView.setModel(oController.jmodel3,"Item");
      oView.getModel('Item').refresh();
    },

    onDone:function(oEvnt){
      var filters = [];
      var filter = new sap.ui.model.Filter("DocType",
          sap.ui.model.FilterOperator.EQ, 'X');
      filters.push(filter);

      var list = this.getView().byId("list1");
      var binding = list.getBinding("items");
      binding.filter(filters, "Application");
      if(oController.Category=="M"){
        var header="Purchase Order List (" + binding.iLength +")";
      }else if(oController.Category=="S"){
        var header="Service Document List (" + binding.iLength +")";
      }
      oController.getView().byId('masterTitle').setText(header);
    },
    onPending:function(oEvnt){
      var filters = [];
      var filter = new sap.ui.model.Filter("DocType",
          sap.ui.model.FilterOperator.EQ, '');
      filters.push(filter);

      var list = this.getView().byId("list1");
      var binding = list.getBinding("items");
      binding.filter(filters, "Application");
      if(oController.Category=="M"){
        var header="Purchase Order List (" + binding.iLength +")";
      }else if(oController.Category=="S"){
        var header="Service Document List (" + binding.iLength +")";
      }
      oController.getView().byId('masterTitle').setText(header);
    },
    onAll:function(oEvnt){
      var filters = [];

      var list = this.getView().byId("list1");
      var binding = list.getBinding("items");
      binding.filter(filters, "Application");
      if(oController.Category=="M"){
        var header="Purchase Order List (" + binding.iLength +")";
      }else if(oController.Category=="S"){
        var header="Service Document List (" + binding.iLength +")";
      }
      oController.getView().byId('masterTitle').setText(header);
    },

  //======================================================================================================//
 //============================== Multiple File Upload added by chaithra on 19/6/2019   =================//
//======================================================================================================//
    onHandleMultiUpload : function(oEvent){
      that.BusyDialog.open();
      /*var vNoDesc     = this.CreatedBy +"_" + 123456789 + "_" + this.toDay + " " + "(" + "DDMMYYYY" + ")" + "\n";
      vNoDesc       = vNoDesc + "\n" + " ( File Size must be less than 300 KB  )" ;*/
      var that1 = this;
      this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read(
          "/ET_SAMPLE_EXAMPLESet",{
      success : function(oData,oResponse){
        that.BusyDialog.close();

        that1.vNoDesc = '';
        that1.vNoDesc = "Sample Example : " + oData.results[0].Example + "";
        that1.vNoDesc = that1.vNoDesc +"\n"  + "( File Size must be less than 500 KB )" ;
        that1.vNoDesc = that1.vNoDesc +"\n"  + "(Maximum 50 file can be uploaded in Single Request...!!!)" ;   //changed by vivek on 06.11.2020.
        that.LoadMassupLoad(that1.vNoDesc);
      },
      error:that.myErrorVendor}); 
    },

    LoadMassupLoad : function (vNoDesc){
      var that1 = this;
      that1.oMassUpload = sap.ui.xmlfragment("ZMM_Supplier.view.MassUpload",this);
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
      sap.ui.getCore().byId('id_Check').setVisible(false);
      that.Error = [];
      var Array = {
          "items" : []
      };
      sap.ui.getCore().byId("id_MassUpload").setModel(new JSONModel(Array),"MASS");
      //this.getView().getModel("MASS").setData(Array);
      sap.ui.getCore().byId("id_SubmitMass").setEnabled(false);
      that.BusyDialog.close();
    },

    onSelectionChange: function(){
    },
    onTypeMissmatch: function(oEvent){
      MessageBox.error("Type mismatched");
    },
    onFileSizeExceed : function(oEvent){
      MessageBox.error("File size exceeded");  
    },
    onFilenameLengthExceed : function(oEvent){
      MessageBox.error("File name is too long");
      },
    onBeforeUploadStarts: function(oEvent){
      /*if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length > 1){
        that.onUploadTerminated(); 
      }*/
      sap.ui.getCore().byId("id_SubmitMass").setEnabled(true);
      sap.ui.getCore().byId("id_CancelMass").setEnabled(true);
      sap.ui.getCore().byId('id_Check').setVisible(true);
    },
    /*onUploadTerminated:function(){
      MessageBox.error("You can only select maximum 50 file in single request"); 
    },*/
    onFileChange : function(oEvent){
      sap.ui.getCore().byId("id_SubmitMass").setEnabled(false);
      sap.ui.getCore().byId("id_CancelMass").setEnabled(false);
      sap.ui.getCore().byId('id_Check').setVisible(false);
    },


    onUploadComplete : function(oEvent){
      var that    = this;
      var vLength = oEvent.getSource()._oFileUploader._aXhr.length;
      var file    =  oEvent.oSource._oFileUploader._aXhr[0]['file'];
      var object  = {}
    //  if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length <=49){
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
      else if(file['size'] > 530000){           //  changed by singvi-cont on 06.01.2019
        that.Error.push({
           'type'     : 'Error',
           'ErrorMessage' : file.name + ' ' + 'File size exceeding 500 kb' 
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
          function readFileAndAddToMap(file){
            return new Promise(function(resolve, reject){
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
    onFileDeleted: function(oEvent){
      this.deleteItemById(oEvent.getParameter("documentId"));
      if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length == 0){
        sap.ui.getCore().byId("id_SubmitMass").setEnabled(false);
        sap.ui.getCore().byId('id_Check').setVisible(false);
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


    fnAttachMassUpload : function(oEvent){
      var that  = this ; 
      if(sap.ui.getCore().byId("id_Check").getSelected() != true){
        sap.ui.getCore().byId("id_Check").setValueState('Error');
        sap.ui.getCore().byId("id_Check").focus();
      }
      else{
        sap.ui.getCore().byId("id_Check").setValueState('None');
        if(sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items.length != 0){
          var aItems = sap.ui.getCore().byId("id_MassUpload").getModel("MASS").getData().items;
          var NavMassUpload =[];
          aItems.forEach(function(Obj, i){
            NavMassUpload.push({
              "AsnConfNo"   : "00",
              "FileContent" : Obj.FileContent,
              "FileType"    : Obj.FileType,
              "FileName"    : Obj.FileName

            })
          });

          var payLoad = {
              "AsnConfNo" : "00",
              "NAV_MDU" : NavMassUpload
          }
          that.BusyDialog.open();
          this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").create("/EtPoListSet",payLoad,{
            success: oController.mySuccessHandler, 
            error: oController.myErrorHandlerHandler
          })

        }
        else {
           MessageBox.error("Upload files to submit"); 
        }
      }

    },

    mySuccessHandler : function(oData, oResponse){
      //var that = this;
      that.oMassUpload.destroy();
      that.BusyDialog.close();
      if(oResponse.requestUri.indexOf('ZZSRM_ASN_TO_INVOICE_SRV/EtPoListSet') !== -1){
        /*that.Msg =  sap.ui.xmlfragment("ZMM_Supplier.view.MessageView",this);
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
    },

    myErrorHandlerHandler : function(oResponse){
    //  var that = this;
      that.BusyDialog.close();
    },
    onCloseMassAttach : function(){
      var Array = {
          "items" : []
      };
      sap.ui.getCore().byId("id_MassUpload").getModel("MASS").setData(Array);
      this.oMassUpload.destroy();
    },
    onCloseMsg : function(oEvent){
      var vId = oEvent.getSource().getId();
      if(vId.indexOf("id_Check") != -1){
        if(sap.ui.getCore().byId('id_Check').getSelected() == true){
          sap.ui.getCore().byId('id_Check').setValueState('None');
        }
      }
      else{
        oController.oDialog.destroy();
      }

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

    fnCallReload  : function (){
      oController.oDialog.destroy();
      if(oController.Category && oController.todate && oController.fromdate){
        this.getOwnerComponent().getModel("ZZSRM_ASN_TO_INVOICE").read(
            "/EtPoListSet",
            {urlParameters:{
            "$filter":"(DocType eq '"+oController.Category+"' and DateTo  eq '"+oController.todate+"' and DateFrom  eq '"+oController.fromdate+"' )"},
            success : this.mySuccessHandler1, 
            error : this.myErrorHandler1
        });
      }

    },
    mySuccessHandler1 : function(oData, oResponse){
      oController.json2={
          "ASN" :oData,
          "Category":oController.Category
      }

      oController.jmodel2 = new sap.ui.model.json.JSONModel();

      var Count=oController.json2.ASN.results.length;
      oController.jmodel2.setSizeLimit(Count);
      oController.jmodel2.setData(oController.json2);
      oView.setModel(oController.jmodel2,"List");
      oView.getModel('List').refresh();
      if(oController.Category=="M"){
        var header="Purchase Order List (" + oData.results.length +")";
      }else if(oController.Category=="S"){
        var header="Service Document List (" + oData.results.length +")";
      }

      oController.getView().byId('masterTitle').setText(header);
    //  oController.dialog.close();
      if(oData.results.length == 0)
      {
        MessageBox.show('No data matching selection criteria',{
          icon: sap.m.MessageBox.Icon.ERROR,
          title: "Error"
        });
      }
    },

    myErrorHandler1 : function(){
      //
    },

//=================== checkbox of single file upload ==================//
    onCloseMsg1 : function(oEvent){
      if(sap.ui.getCore().byId('id_Check1').getSelected() == true){
        sap.ui.getCore().byId('id_Check1').setValueState('None');
      }
    },
//================ download error log =================================//
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
            fileName : "ASN error log -"+ vDate + vMonth + vFullYear+""
          };

      oSheet = new Spreadsheet(oSettings);
      oSheet.build()
        .then( function() {
          MessageToast.show('Spreadsheet export has finished');
        })
        .finally(function() {
          oSheet.destroy();
        });

    }

  });
});