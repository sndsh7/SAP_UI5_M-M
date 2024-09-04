getHeaderObjectPC = function () {
  return {
    "PaperCode":"",
    "PaperNo": "",
    "Sector": [],
    "Model": [],
    "PaperPur": "",
    "Sign": "",
    "Status": "",
    "Createdby": "",
    "Crdate": null,
    "Crtime": null,
    "PricePprDesc" : "",
    "Justification":"",
    "Cycle":"",
    "Initiator": "",
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
    "BjStatus": "",
    "Nav_Items": [],
    "Nav_Currency":[],
    "Nav_DMS": [],
    "Associate": "",
  "AssociateFlag": "",
  "AssociateName": "",
  "SelfRoutingFlag": "",
  "TL": "",
  "TLName": "",
  "CorrectionCat": ""
  }
};
getItemDetailsObjectPC = function () {
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
      "DeltaPrice":"",
      "Quantity" : "",
      "AprxCashFlow":"",
      "OgAmndcode" : "",
      "OgAmndcodeDesc" : "",
      "LastAmmndDate":null
    }
};

//getCurrencyStr = function () {
//  return {
//    "PaperNo": "",
//    "Currency": "",
//    "RvToDt": null,
//    "ExFrmDt": null,
//    "ExToDt": null,
//    "ExVal": "0",
//    "RvFrmDt": null,
//    "RvVal": "0",
//    "Delete": ""
//  }
//};

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

getExportExcelColumsPC= function () {
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
//  Insert Start by AGAWSA-CONT on 07.09.2023
  oColoums.push({
      label: 'Amend_Code',
      property: 'Amndcode',
      type: 'string'
    });
  oColoums.push({
      label: 'OgAmend_Code',
      property: 'OgAmndcode',
      type: 'string'
    });
  oColoums.push({
      label: 'Last_AmendDate',
      property: 'LastAmmndDate',
      type: 'string'
    });
//Insert end by AGAWSA-CONT on 07.09.2023
//  Remove Start by AGAWSA-CONT on 08-02-2023
//    oColoums.push({
//    label: 'Last_Amendment_Date',
//    property: 'LastAmmndDate',
//    type: 'string'
//  });
//  Remove End by AGAWSA-CONT on 08-02-2023
  oColoums.push({
    label: 'Valid_From_Date',
    property: 'ValidFrom',
    type: 'string'
  });

  oColoums.push({
    label: 'Remarks',
    property: 'Remarks',
    type: 'string'
  });

  return oColoums;
};