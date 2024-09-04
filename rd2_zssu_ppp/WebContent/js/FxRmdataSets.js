getProtoHeaderObject = function () {
	return {
		//"PaperCode":"",
		//"PaperNo": "",
		"Sector": "",
		"ProjCode":"",
		"PrNum":"",
		"PucGrp":"",
		"Nav_Items": [],
		"Nav_Apprs":[],
		"Nav_Return":[]
		//"Nav_DMS": []
		/*"Model": "",
		"PaperPur": "",
		"Sign": 0,
		"Status": "",
		"Createdby": "",
		"Crdate": null,
		"Crtime": null,
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
		"BjStatus": "",*/
		
	}
};
getProtoItemDetailsObject = function () {
	return {
		 "uiFields": {
			    "Error": "Default",
			    "ItemNo": "",
			  },
		  //"PaperCode": "",
		  //"PaperNo": "",
		  "Posnr":0,
		  "PurOrg": "INPO",
		  "Vendor": "",
		  "VendName": "",
		  //"PucGrp":"",
		  "Plant": "",
		  "StrLoc":"",
		  "Material":"",
		  "MaterialDesc":"",
		  "DelvryDate":null,
		  "ProtoPerVeh":"",
		  "QutProtoProce":"",
		  "CurrenttSetQt":"",
		  "ExtSetQty":"",
		  "CumSetQty":"",
		  "Note":"",
		  "TaxCode":"",
		  "TaxCodeTxt":""
		  //"VLocation": "",
		  //"PartNo": "",
		  //"PartDesc": "",
		  //"PirNo": "",
		  //"Currency": "",
		  //"Pinforcat": "",
		  //"PinfoCatText": "",
		  
		  //"ExtPrice": "0",
		  //"SettledPrice": "0",
		  //"ValidFrom": null,
		  //"Taxonomy": "",
		  //"ChgPrctng": "",
		  //"Amndcode": "",
		  //"AmndcodeDesc": "",
		  //"Sign": "",
		  //"NetWtUniit": "",
		  //"BjStatus": "",
		  //"Remarks": "",
		  //"Delete": ""
		}
};

/*getDMSObject = function () {
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
};*/

getApprsObject = function () {
	return {
		"Appr": "",
		"Level": ""
	}
};