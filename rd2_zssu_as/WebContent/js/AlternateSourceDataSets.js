getHeaderObjectAS = function () {
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
		"Nav_DMS": [],
		"Nav_VenSyn":[]
	}
};
getItemDetailsObjectAS = function () {
	return {
		"uiFields": {
		    "Error": "Default",
		    "ItemNo": ""
		  },
		"BusinessRedRequired": "",
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
		"ValidFrom":new Date(),
		"Purgrp": "",
		"Taxonomy": "",
		"Pinforcat": "",
		"Purorg": "INPO",
		"Taxcode": "",
		"TcDesc": "",
		"Pdeltime":"03",
		"PirNo":"",
		"PiCopy":"",
		"Delete": "",
		"RevisedSob":"",
		"ExistingSob":"0",
		"Remarks":"",
		"YearBase": "0",
		"Sop1yr": "0",
		"Sop2yr": "0",
		"Sop3yr": "0",		
		"YoyRed": "",
		"DiscountYear": "",
		"Sop1doe": "",
		"Sop2doe": "",
		"Sop3doe": "",
		"DiscountValue":"0",
		"CondType": "",
		"CondTypText": "",
		"CondPrcnt": "",
		"CondUnit": ""
	}
};

getVendorSynObject = function () {
	return {
		"PaperNo":"",
		"VendCode": "",
		"InitialQuote": "0",
		"FinalQuote": "0",
		"SettledQuote": "0",
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
getExportExcelColumsAS= function () {
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
		label: 'Revised_Vendor_Code',
		property: 'RvVendor',
		type: 'string'
	});
	oColoums.push({
		label: 'Doc_Type',
		property: 'Pinforcat',
		type: 'string'
	});
	oColoums.push({
		label: 'Tax_Code',
		property: 'Taxcode',
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
		label: 'Revised_SOB',
		property: 'RevisedSob',
		type: 'string'
	});
	oColoums.push({
		label: 'Business_Red_Required',
		property: 'BusinessRedRequired',
		type: 'string'
	});
	oColoums.push({
		label: 'Remarks',
		property: 'Remarks',
		type: 'string'
	});
	return oColoums;
};