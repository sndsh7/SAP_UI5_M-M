sap.ui.define([
	], function () {
		"use strict";
		var formatterObj = {
		   get_Status :  function (vStatus) {
			   debugger
			   if(vStatus !== undefined && vStatus !== null){
				   if (vStatus == "NR") {	
						return "SSU Buyers Request";	
					} else if (vStatus == "S") {
						return "SSU Buyers Draft";
					} else if (vStatus == "AR") {
						return "Associate Request";
					} else if (vStatus == "R") {
						return "SSU Buyers Rejected";
					} else if (vStatus == "AJ") {
						return "Associate Rejected";
					} else if (vStatus == "IC") {
						return "SSU Buyers Post to SAP";
					} else if (vStatus == "AC") {
						return "Associate Post to SAP";
					} else if (vStatus == "TR") {
						return "";
					} else if (vStatus == "A1") {
						return "Approver 1";
					} else if (vStatus == "A2") {
						return "Approver 2";
					} else if (vStatus == "A3") {
						return "Approver 3";
					} else if (vStatus == "A4") {
						return "Approver 4";
					} else if (vStatus == "A5") {
						return "Approver 5";
					} else if (vStatus == "AS") {
						return "Associate Draft";
					}   
			   }
		   },
		   get_State :  function (sStatus) {
			   if(sStatus !== undefined  && sStatus !== null){
				   if (sStatus == "S" || sStatus == "NR" || sStatus == "AR" || sStatus == "AS") {
						return sap.ui.core.ValueState.Information;
					} else if (sStatus == "AC") {
						return sap.ui.core.ValueState.Success;
					} else if (sStatus == "RJ") {
						return sap.ui.core.ValueState.Error;
					} else {
						return sap.ui.core.ValueState.Warning;
					}
			   }
		   },
		   get_State_visible :  function (sStatus) {
			   if(sStatus !== undefined  && sStatus !== null){
					if (sStatus === "01") {
						return true;
					} else {
						return false;
					}
			   }
		   }, 
		   get_visible_Icon :  function (sStatus) {
			   if(sStatus !== undefined  && sStatus !== null){
					return true;
			   }else{
				   return false;
			   }
		   },
		   get_remark_Select :  function (remark) {
			   if(remark !== undefined  && remark !== null){
					if(remark !== ""){
						return true
					}else{
						return false
					}
			   }
		   },
		   get_remark_Text :  function (sStatus) {
			   if(sStatus !== undefined  && sStatus !== null){
					if(sStatus === "03" || sStatus === "05" || sStatus === "07"){						
						return "Rejected"
					}else if(sStatus === "02" || sStatus === "04" || sStatus === "06" ||sStatus === "08" ){
						return "OK"
					}else{
						return ""
					}
			   }
		   },
		   get_valueState :  function (sStatus) {
			   if(sStatus !== undefined  && sStatus !== null){
					if(sStatus === "03" || sStatus === "05" || sStatus === "07"){						
						return "Error"
					}else if(sStatus === "02" || sStatus === "04" || sStatus === "06" ||sStatus === "08" ){
						return "Success"
					}else if(sStatus === "01"){
						return "Information"
					}
			   }
		   },
		};
		return formatterObj;
	}
);