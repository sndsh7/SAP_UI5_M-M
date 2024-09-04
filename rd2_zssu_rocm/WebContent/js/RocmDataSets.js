getHeaderObjectRCM = function () {
	return {
		"PaperCode":"",
		"PaperNo": "",
		"Sector": [],
		"Model": [],
		"PaperPur": "00",
		"Sign": "",
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
		"BjStatus": "",
		"PricePprDesc":"",
		"Justification":"",
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
getItemDetailsObjectRCM = function () {
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
		  "ImportFlag":"",
		  "ExtPrice": "0",
		  "SettledPrice": "0",
		  "ValidFrom": null,
		  "Taxonomy": "",
		  "ChgPrctng": "0",
		  "Amndcode": "",
		  "AmndcodeDesc": "",
		  "Sign": "",
		  "NetWtUniit": "",
		  "BjStatus": "",
		  "Remarks": "",
		  "Delete": "",
		  "SanctiondBudget": "",
		  "QtyPerVeh": "",
		  "LOIPrice": ""

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
getExportExcelColumsROCM= function () {
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
		label: 'Valid_From_Date',
		property: 'ValidFrom',
		type: 'string'
	});
	
	oColoums.push({
		label: 'Settled_Price',
		property: 'SettledPrice',
		type: 'string'
	});

	oColoums.push({
		label: 'Sanctiond_Budget',
		property: 'SanctiondBudget',
		type: 'string'
	});
	oColoums.push({
		label: 'Qty_Per_Vehicle',
		property: 'QtyPerVeh',
		type: 'string'
	});
	oColoums.push({
		label: 'LOI_Price',
		property: 'LOIPrice',
		type: 'string'
	});
		oColoums.push({
		label: 'Remarks',
		property: 'Remarks',
		type: 'string'
	});

	return oColoums;
};