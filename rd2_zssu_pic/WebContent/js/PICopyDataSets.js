getHeaderObjectPIC = function () {
  return {
    "PaperCode":"",
    "NpiNo": "",
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
    "PricePprDesc": "",
    "Justification": "",
    "Nav_Items": [],
    "Nav_DMS": []
  }
};
getItemDetailsObjectPIC = function () {
  return {
    "uiFields": {
        "Error": "Default",
        "ItemNo": ""
      },
    "Plant": "",
    "Vendor": "",
    "RvPlant": "",
    "RvVendor": "",
    "RvVName": "",
    "RvVLocation": "",
    "ExtPrice":"0",
    "DeltaPrice":"0",
    "PartNo": "",
    "PartDesc": "",
    "Currency": "",
    "SettledPrice": "0",
    "Priceunit": "1",
    "ValidFrom": null,
    "Purgrp": "",
    "Taxonomy": "",
    "Pinforcat": "",
    "Purorg": "INPO",
    "Taxcode": "",
    "TcDesc": "",
    "Pdeltime":"03",
    "PirNo":"",
    "PiCopy":"",
    "Delete": "","CondType": "",
    "CondTypText": "",
    "CondPrcnt": "",
    "CondUnit": ""
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
// Add start by AGAWSA-CONT on 01.07.2023
getExportExcelColumsPIC= function () {
  var oColoums = [];
  oColoums.push({
    label: 'Part_Number',
    property: 'PartNo',
    type: 'string'
  });
  oColoums.push({
    label: 'Ex_Vendor_Code',
    property: 'Vendor',
    type: 'string'
  });

  oColoums.push({
    label: 'Ex_Plant',
    property: 'Plant',
    type: 'string'
  });
  oColoums.push({
    label: 'Rev_Plant',
    property: 'RvPlant',
    type: 'string'
  });
  oColoums.push({
    label: 'Rev_Vendor_Code',
    property: 'RvVendor',
    type: 'string'
  });
  oColoums.push({
    label: 'Doc_Type',
    property: 'Pinforcat',
    type: 'string'
  });

  oColoums.push({
    label: 'Validity_date',
    property: 'ValidFrom',
    type: 'string'
  });
  oColoums.push({
    label: 'Delta_Price',
    property: 'DeltaPrice',
    type: 'string'
  });



  oColoums.push({
    label: 'Settled_Price',
    property: 'SettledPrice',
    type: 'string'
  });
  oColoums.push({
    label: 'Price_Unit',
    property: 'Priceunit',
    type: 'string'
  });
  oColoums.push({
    label: 'Tax_Code',
    property: 'Taxcode',
    type: 'string'
  });
  return oColoums;
};
//Add end by AGAWSA-CONT on 01.07.2023