getHeaderObjectCIT = function () {
  return {
    "PaperCode":"",
    "PaperNo": "",
    "TermsType" : "01",
    "PriceChange" : "Y",
    "Sign": "",
    "Sector": [],
    "Model": [],
    "Status": "",
    "Createdby": "",
    "Crdate": null,
    "Crtime": null,
    "Cycle":"01",
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
    "Nav_Items": [],
    "Nav_DMS": [],
    "Nav_Wf" : [],
    "Associate": "",
    "AssociateFlag": "",
    "AssociateName": "",
    "SelfRoutingFlag": "",
    "TL": "",
    "TLName": ""
  }
};
getItemDetailsObjectCIT = function () {
  return {
    "uiFields": {
        "Error": "Default",
        "ItemNo": "",
      },
    "Plant": "",
    "Vendor": "",
    "VName": "",
    "VLocation": "",
    "PartNo": "",
    "PartDesc": "",
    "Currency": "",
    "ExtPrice": "",
    "SettledPrice": "0",
    "ChgPrctng" : "0",
    "ValidFrom":null,
    "ImportFlag":"",
    "CurrentTerm":"",
    "NewPayTerm":"",
    "NewPayTermDesc":"",
    "ExtValidFrom":null,
    "IncoTerm" : "",
    "NewIncoTerm": "",
    "NewIncoTermDesc": "",
    "PaperCode": "",
    "PaperNo": "",
    "PirNo" : "",
    "Pinforcat": "",
//    "PinfoCatText" : "",
    "DiscountCond":"",
    "Purorg": "",
    "Delete": "",
    "Amndcode": "",
    "AmndcodeDesc": "",
    "Sign": "",
  }
};
getDMSObjectCIT = function () {
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
//Remove Start By AGAWSA-CONT on 10-02-2023
//getExportExcelColumsCIT= function () {
//  var oColoums = [];
//  oColoums.push({
//    label: 'Part_Number',
//    property: 'PartNo',
//    type: 'string'
//  });
//  oColoums.push({
//    label: 'Vendor_Code',
//    property: 'Vendor',
//    type: 'string'
//  });
//
//  oColoums.push({
//    label: 'Plant',
//    property: 'Plant',
//    type: 'string'
//  });
//  oColoums.push({
//    label: 'Doc_Type',
//    property: 'Pinforcat',
//    type: 'string'
//  });
//  oColoums.push({
//    label: 'New_Payment_Term',
//    property: 'NewPayTerm',
//    type: 'string'
//  });
//  oColoums.push({
//    label: 'New_Inco_Term',
//    property: 'NewIncoTerm',
//    type: 'string'
//  });
//
//  oColoums.push({
//    label: 'Amendment_Code',
//    property: 'Amndcode',
//    type: 'string'
//  });
//  oColoums.push({
//    label: 'Valid_From_Date',
//    property: 'ValidFrom',
//    type: 'string'
//  });
//
//  oColoums.push({
//    label: 'Change_In_Price',
//    property: 'ChgPrctng',
//    type: 'string'
//  });
//
//  oColoums.push({
//    label: 'Settled_Price',
//    property: 'SettledPrice',
//    type: 'string'
//  });
//    oColoums.push({
//    label: 'Remarks',
//    property: 'Remarks',
//    type: 'string'
//  });
//
//  return oColoums;
//};
// Remove End By AGAWSA-CONT on 10-02-2023
// Add Start by AGAWSA-CONT on 10-02-2023
getExportExcelColumsCIT01= function () {
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
    label: 'New_Payment_Term',
    property: 'NewPayTerm',
    type: 'string'
  });

  oColoums.push({
    label: 'SettledPrice',
    property: 'SettledPrice',
    type: 'string'
  });

  oColoums.push({
    label: 'ExtPrice',
    property: 'ExtPrice',
    type: 'string'
  });

  oColoums.push({
    label: 'Amendment_Code',
    property: 'Amndcode',
    type: 'string'
  });
  oColoums.push({
    label: 'Valid_From_Date',
    property: 'ValidFrom',
    type: 'string'
  });
  oColoums.push({
    label: 'Amount',
    property: 'SettledPrice',
    type: 'string'
  });
    oColoums.push({
    label: 'Remarks',
    property: 'Remarks',
    type: 'string'
  });

  return oColoums;
};
getExportExcelColumsCIT02= function () {
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
    label: 'New_Inco_Term',
    property: 'NewIncoTerm',
    type: 'string'
  });
  oColoums.push({
    label: 'Amendment_Code',
    property: 'Amndcode',
    type: 'string'
  });
  oColoums.push({
    label: 'Valid_From_Date',
    property: 'ValidFrom',
    type: 'string'
  });
  oColoums.push({
    label: 'Amount',
    property: 'SettledPrice',
    type: 'string'
  });
    oColoums.push({
    label: 'Remarks',
    property: 'Remarks',
    type: 'string'
  });

  return oColoums;
};
// Add End by AGAWSA-CONT on 10-02-2023