/*getLoBAHeaderObject = function () {
	return {
		  "NpiNo": "",
		  "LoBAOwner":"",
		  "SameAsOe":"",
		  "Vendor": "",
		  "VName": "",
		  "VLocation": "",
		  "Sector": "",
		  "Model": "",
		  "PaperType": "",
		  "Plant": "",
		  "PlantDesc": "",
		  "FiscalYear1": "",
		  "FiscalYear2": "",
		  "FiscalYear3": "",
		  "FiscalYear4": "",
		  "FiscalYear5": "",
		  "SopDate": null,
		  "Nav_LoBANpiItem": [],
		  "Nav_Forex": [],
		  "Nav_RM": [],
		  "Nav_LoBAProp": [],
		  "Nav_LoBASub": [],
		  "Nav_LoBATmaker": []
		}
};*/
getLoBASupplierObject = function () {
	return {
		  "Supplier1": "",
		  "PartNo1": "",
		  "Maktx1": "",
		  "Rate": "0",
		  "Supplier2": "",
		  "PartNo2": "",
		  "Maktx2": ""
		}
};
getLoBAProtoPartObject = function () {
	return {
		  "ProtoPartNo": "",
		  "Maktx": "",
		  "Currency": "",
		  "ProtoCost": "0",
		  "ToolingCost": "0",
		  "DvpCost": "0",
		  "Testing": "0",
		  "ProtoMfcLoc": ""
		}
};
getLoBAToolMakerObject = function () {
	return {
		  "Tmaker": "",
		  "TmakDesc": ""
		}
};
getLoBASparePartObject = function () {
	return {
		  "SparePartNo": "",
		  "SpareDesc": "",
		  "SpareCurr": "",
		  "SparePartCost": "0",
		  "SparePackCost": "0",
		  "Margin": "0"
		}
};
getHeaderObject = function () {
		return {
	
			"PaperCode":"",
			"LoBARequired": "",
			"NpiNo": "",
			"PaperType" :"Regular NPI",
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
//			"oVOB": ""
		}
	};
getItemDetailsObject = function () {
	return {
		"DrawingRevisedNo":"",
		"Pieces":"0",
		"ToolYears":"0",
		"Strokes":"0",
		"BusinessRedRequired": "",
		"ToolCostRequired": "",
		"ForexRequired": "",
		"ForexRMRequired": "",
		"SparePartSameOE": "",
		"Plant": "",
		"Vendor": "",
		"VName": "",
		"VLocation": "",
		"PartNo": "",
		"PartDesc": "",
		"Currency": "",
		"QuotePrice": "0",
		"Sbcprice": "0",
		"SettledPrice": "0",
		"Priceunit": "1",
//		"PriceunitFlag": "",
		"PkgCost": "0",
		"TranspCost": "0",
		"ValidFrom":new Date(),
		"Purgrp": "",
		"Pdeltime": "03",
		"NetWeight": "",
		"Taxonomy": "",
		"AnnualCap": "0",
		"StrategyInd": "",
		"DelTerms": "",
		"PaymntTerms": "",
		"Pinforcat": "STANDARD",
		"Purorg": "INPO",
		"Taxcode": "",
		"TcDesc": "",
		"ModelVar": "",
		"NetWtUnit": "",
		"TlCostCurrency": "",
		"CurrDenomination": "",
		"Budgeted": "0",
		"FinalAmortized": "0",
		"Finalupfront": "0",
		"Amortisation": "0",
//		"Noy": "0", // Added by AGAWSA-CONT..
//		Add start AGAWSA-CONT 05.06.2023
//		"TL_Pcs": "", 
//		"TL_Years": "", 
//		"TL_Strokes": "",
//		Add end AGAWSA-CONT 05.06.2023
		"ToolAmortisation": "0",
		"Dvp": "0",
		"RevCurrency": "",
		"RevDenomination": "",
		"RevBudgeted": "0",
		"RevFinalAmortized": "0",
		"RevFinalUpfront": "0",
		"RevAmortization": "0",
		"RevTlAmortization": "0",
		"EdD": "0",
		"EdCurrency": "",
		"EdDenomination": "",
		"EdBudgeted": "0",
		"EdFinalAmortized": "0",
		"EdFinalUpfront": "0",
		"EdAmortization": "0",
		"ToolAmortization": "0",
		"BtOutParts": "0",
		"ConvCost": "0",
		"MarkUp": "0",
		"YearBase": "0",
		"Sop1yr": "0",
		"Sop2yr": "0",
		"Sop3yr": "0",
		"Sop4yr": "0",
		"Sop5yr": "0",
		"YoyRed": "%",
		"DiscountYear": "",
		"Sop1doe": "",
		"Sop2doe": "",
		"Sop3doe": "",
		"Sop4doe": "",
		"Sop5doe": "",
		"YoyRedRem": "",
		"VolDiscRemarks": "",
		"DiscountValue": "0",
		"SpareCurrency": "",
		"PartCost": "0",
		"Margin": "0",
		"Delete": "",
		"CondType": "",
		"CondTypText": "",
		"CondPrcnt": "0",
		"CondUnit": "",
		"Nav_Forex": [],
		"Nav_RM": []
	}
};

getForexObject = function () {
	return {
		"Herkl":"",
		"NpiNo": "",
		"PartNo": "",
		"Posnr": "",
		"ForexCur": "",
		"ForexContent": "",
		"ForexIndex": "",
		"ForexIndexVal": "",
		"ForexLandFact": "",
		"ForexLandFactVal": "",
		"ForexBaseperiod": "",
		"FxBasePeriodYr": "",
		"FxBaseExchRate": "",
		"ForexRemarks": "",
		"Delete": ""
	}
};
getRMObject = function () {
	return {
		"RmNetWeight":"",
		"NpiNo": "",
		"PartNo": "",
		"Posnr": "",
		"RmGrade": "",
		"RmGrossWt": "",
		"RmIndexCycle": "",
		"RmIndexCycleVal": "",
		"RmLandingFact": "",
		"RmLandingFactVal": "",
		"RmBasePeriod": "",
		"RmBasePeriodYr": "",
		"RmBasePrice": "",
		"RmRemarks": "",
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

sap.ui.require(['sap/ui/export/library'], function(exportLibrary) {

	  // instantiate a Something and call foo() on it
	var EdmType = exportLibrary.EdmType;
	getExportExcelColumsNPI= function () {
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
			label: 'Purchase_Organisation',
			property: 'Purorg',
			type: 'string'
		});

		oColoums.push({
			label: 'Quote_Price',
			property: 'QuotePrice',
			type: 'number'
		});

		oColoums.push({
			label: 'SBC',
			property: 'Sbcprice',
			type: 'number'
		});

		oColoums.push({
			label: 'Settled_Price',
			property: 'SettledPrice',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Price_Unit',
			property: 'Priceunit',
			type: 'number'
		});

		oColoums.push({
			label: 'Packaging_Cost',
			property: 'PkgCost',
			type: 'number'
		});

		oColoums.push({
			label: 'Transport_Cost',
			property: 'TranspCost',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Net_Weight_of_part',
			property: 'NetWeight',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Net_Weight_Unit',
			property: 'NetWtUnit',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Taxonomy',
			property: 'Taxonomy',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Annual_Capacity_of_Part',
			property: 'AnnualCap',
			type: 'number'
		});
		
		oColoums.push({
			label: 'P_Info_category',
			property: 'Pinforcat',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Tax_Code',
			property: 'Taxcode',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Model_Variant',
			property: 'ModelVar',
			type: 'string'
		});
		oColoums.push({
			label: 'Drawing_Rev_No',
			property: 'DrawingRevisedNo',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Tool_Cost_Required',
			property: 'ToolCostRequired',
			type: 'string'
		});
		
		/*oColoums.push({
			label: 'Tool_Cost_Required',
			property: 'ToolCostRequired',
			valueMap: {
				'': 'Yes',
				'X': 'No'
			},
			type: EdmType.Enumeration
		});*/
		
		oColoums.push({
			label: 'BASIC_Tol_Currency',
			property: 'TlCostCurrency',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Denomination',
			property: 'CurrDenomination',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Budgeted',
			property: 'Budgeted',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Finalized_Amortised',
			property: 'FinalAmortized',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Finalised_UpFront',
			property: 'Finalupfront',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Amortization_Nos',
			property: 'Amortisation',
			type: 'number'
		});
		oColoums.push({
			label: 'Rev_CURRENCY',
			property: 'RevCurrency',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Rev_Denomination',
			property: 'RevDenomination',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Rev_Budgeted',
			property: 'RevBudgeted',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Rev_Finalized_Amortised',
			property: 'RevFinalAmortized',
			type: 'number'
		});
							
		oColoums.push({
			label: 'Rev_Finalised_UpFront',
			property: 'RevFinalUpfront',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Rev_Amortization_Nos',
			property: 'RevAmortization',
			type: 'number'
		});
		
		oColoums.push({
			label: 'ED_CURRENCY',
			property: 'EdCurrency',
			type: 'string'
		});
		
		oColoums.push({
			label: 'ED_Denomination',
			property: 'EdDenomination',
			type: 'string'
		});
		
		oColoums.push({
			label: 'ED_Budgeted',
			property: 'EdBudgeted',
			type: 'number'
		});
		
		oColoums.push({
			label: 'ED_Finalized_Amortised',
			property: 'EdFinalAmortized',
			type: 'number'
		});
		
		oColoums.push({
			label: 'ED_Finalized_Upfront',
			property: 'EdFinalUpfront',
			type: 'number'
		});
							
		oColoums.push({
			label: 'ED_Amortization_Nos',
			property: 'EdAmortization',
			type: 'number'
		});
//		Add start AGAWSA-CONT 
//		oColoums.push({
//			label: 'NOY',
//			property: 'Noy',
//			type: 'number'
//		});	
//		Add END AGAWSA-CONT
//		Add start AGAWSA-CONT 05.06.2023
		oColoums.push({
			label: 'TL_Pcs',
			property: 'Pieces',
			type: 'string'
		});
		oColoums.push({
			label: 'TL_Years',
			property: 'ToolYears',
			type: 'string'
		});
		oColoums.push({
			label: 'TL_Strokes',
			property: 'Strokes',
			type: 'string'
		});
//		Add end AGAWSA-CONT 05.06.2023
		oColoums.push({
			label: 'RM_Forex_Required',
			property: 'ForexRMRequired',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Details',
			property: 'ForexRequired',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Currency',
			property: 'ForexCur',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Content',
			property: 'ForexContent',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Index_Cycle_val',
			property: 'ForexIndexVal',
			type: 'string'
		});
					
		oColoums.push({
			label: 'FX_Landing_Factor_val',
			property: 'ForexLandFactVal',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Base_Period_Month',
			property: 'ForexBaseperiod',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Base_Period_Year',
			property: 'FxBasePeriodYr',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Base_exchange_rate',
			property: 'FxBaseExchRate',
			type: 'string'
		});
		
		oColoums.push({
			label: 'FX_Remarks',
			property: 'ForexRemarks',
			type: 'string'
		});
		oColoums.push({
			label: 'Part_Desc_CO',
			property: 'Herkl',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Details',
			property: 'ForexRMRequired',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Grade_of_RM',
			property: 'RmGrade',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Gross_Weight',
			property: 'RmGrossWt',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Index_Cycle_Val',
			property: 'RmIndexCycleVal',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Landing_Factor_Val',
			property: 'RmLandingFactVal',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Base_Period_Month',
			property: 'RmBasePeriod',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Base_Period_Year',
			property: 'RmBasePeriodYr',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Base_Price',
			property: 'RmBasePrice',
			type: 'string'
		});
		
		oColoums.push({
			label: 'RM_Remarks',
			property: 'RmRemarks',
			type: 'string'
		});
		oColoums.push({
			label: 'Finished_Weight',
			property: 'RmNetWeight',
			type: 'string'
		});
						
		oColoums.push({
			label: 'Bought_Out_Part_INR',
			property: 'BtOutParts',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Conversion_Cost_INR',
			property: 'ConvCost',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Business_Red_Required',
			property: 'BusinessRedRequired',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Volume_Year',
			property: 'YearBase',
			type: 'string'
		});
		
		oColoums.push({
			label: 'YOY_Reduction',
			property: 'YoyRed',
			type: 'string'
		});
					
		oColoums.push({
			label: 'SOP1_Year_Base_or_Volume_base',
			property: 'Sop1yr',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP2_Year_Base_or_Volume_base',
			property: 'Sop2yr',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP3_Year_Base_or_Volume_base',
			property: 'Sop3yr',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP4_Year_Base_or_Volume_base',
			property: 'Sop4yr',
			type: 'string'
		});
						
		oColoums.push({
			label: 'SOP5_Year_Base_or_Volume_base',
			property: 'Sop5yr',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP_Date_Effective_Date_Year_of_Discount',
			property: 'DiscountYear',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP1_Date_or_Volume',
			property: 'Sop1doe',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP2_Date_or_Volume',
			property: 'Sop2doe',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP3_Date_or_Volume',
			property: 'Sop3doe',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP4_Date_or_Volume',
			property: 'Sop4doe',
			type: 'string'
		});
		
		oColoums.push({
			label: 'SOP5_Date_or_Volume',
			property: 'Sop5doe',
			type: 'string'
		});
		
		oColoums.push({
			label: 'YOY_Reduction_Remarks',
			property: 'YoyRedRem',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Volume_Discount_Remarks',
			property: 'VolDiscRemarks',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Value_Of_Discount',
			property: 'DiscountValue',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Spareprice_Same_OE',
			property: 'SparePartSameOE',
			type: 'string'
		});
		
		oColoums.push({
			label: 'Part_Cost',
			property: 'PartCost',
			type: 'number'
		});
		
		oColoums.push({
			label: 'Margin',
			property: 'Margin',
			type: 'number'
		});
		
		return oColoums;
												
	};
});
