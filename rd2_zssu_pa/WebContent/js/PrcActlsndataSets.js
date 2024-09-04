getHeaderObjectPA = function () {
  return {
    "PaperCode":"",
    "PaperNo": "",
    "Sector": [],
    "Model": [],
    "PaperPur": "",
    "PaperPurDesc":"",
    "Disclaimer":"",
    "Sign": "POS",
    "Status": "",
    "Createdby": "",
    "Crdate": null,
    "Crtime": null,
    "Cycle":"",
    "Initiator": "",
    "InitiName":"",
    "Action": "",
    "UsrComment": "",
    "UsrLevel": "",
    "Approver1": "",
    "Approver2": "",
    "Approver3": "",
    "Approver4": "",
    "Approver5": "",
    "Approver6": "",
    "Approver7": "",
    "Approver8": "",
    "Appr1Name":"",
    "Appr3Name":"",
    "Appr4Name":"",
    "Appr5Name":"",
    "Appr6Name":"",
    "Appr7Name":"",
    "Appr8Name":"",
    "BjStatus": "",
    "Nav_Items": [],
    "Nav_Currency":[],
    "Nav_DMS": [],
    "Associate": "",
    "AssociateFlag": "",
    "AssociateName": "",
    "SelfRoutingFlag": "",
    "TL": "",
    "TLName": ""
  }
};
getItemDetailsObjectPA = function () {
  return {
      "uiFields": {
          "Error": "Default",
          "ItemNo": "",
          "maxDate":  new Date(),
          "minDate": minDate()
        },
      "PaperCode": "",
      "PaperNo": "",
      "Plant": "",
      "Vendor": "",
      "VName": "",
      "VLocation": "",
      "PartNo": "",
      "PartDesc": "",
      "PirNo": "",
      "Currency": "",
      "Pinforcat": "",
      "PinfoCatText": "",
      "Purorg": "",
      "ExtPrice": "0",
      "SettledPrice": "0",
      "ValidFrom": null,
       "ExtValidFrom":null,
       "ImportFlag":"",
      "Taxonomy": "",
      "ChgPrctng": "0",
      "Amndcode": "",
      "AmndcodeDesc": "",
      "Sign": "",
      "NetWtUniit": "",
      "BjStatus": "",
      "Remarks": "",
      "Delete": "",
      "LOIPrice" : "0"
    }
};

getCurrencyStr = function () {
  return {
    "PaperNo": "",
    "Currency": "",
    "RvToDt": null,
    "ExFrmDt": null,
    "ExToDt": null,
    "ExVal": "0",
    "RvFrmDt": null,
    "RvVal": "0",
    "Delete": ""
  }
};

getDMSObject = function () {
  return {
    "Filekey": "",
    "TabId": "",
    "PartNo": "",
    "FrxRmStatus": "",
    "Posnr": "",
    "Doknr": "",
    "Dokar": "",
    "Dokvr": "",
    "Doktl": "",
    "Filename": "",
    "Filedesc": "",
    "Filesize": "",
    "CreatedBy": "",
    "CreatedOn": "",
    "Filecontents": "",
    "FileCatg": "",
    "Delete": ""
  }
};

getExportExcelColumsPA = function () {
  var oColoums = [];
  oColoums.push({
    label: 'Part_Number',
    property: 'PartNo',
    type: 'string'
  });
  oColoums.push({
    label: 'Vendor_Code',
    property: 'Vendor',
    type: 'string'
  });

  oColoums.push({
    label: 'Plant',
    property: 'Plant',
    type: 'string'
  });
  oColoums.push({
    label: 'Doc_Type',
    property: 'Pinforcat',
    type: 'string'
  });
  oColoums.push({
    label: 'Settled_Price',
    property: 'SettledPrice',
    type: 'string'
  });

 	oColoums.push({
    label: 'Existing_Price',
    property: 'ExtPrice',
    type: 'string'
  });
  oColoums.push({
    label: 'Valid_From_Date',
    property: 'ValidFrom',
    type: 'string'
  });
//  Remove Start By AGAWSA-CONT on 09-02-2023
//  oColoums.push({
//    label: 'Price_Change_Code',
//    property: 'Amndcode',
//    type: 'string'
//  });
//  Remove End By AGAWSA-CONT on 09-02-2023
  oColoums.push({
    label: 'Remarks',
    property: 'Remarks',
    type: 'string'
  });
  return oColoums;
};