sap.ui.define([
	], function () {
		"use strict";
		var formatterObj = {
		   get_Status :  function (sStatus) {
			   if(sStatus !== undefined && sStatus !== null){
				   if (sStatus === "01") {
						return "Draft";
					} else if (sStatus === "02") {
						return "Pending with approver 1";
					} else if (sStatus === "03"){
						return "Rejected by approver 1";
					} else if (sStatus === "04"){
						return "Pending with approver 2";
					} else if (sStatus === "05"){
						return "Rejected by approver 2";
					} else if (sStatus === "06"){
						return "Pending with approver 3";
					} else if (sStatus === "07"){
						return "Rejected by approver 3";
					} else if (sStatus === "08"){
						return "Pending for Bill passing (MIRO)";
					} else {
						return "Completed";
					}
			   }
		   },
		   get_State :  function (sStatus) {
			   if(sStatus !== undefined  && sStatus !== null){
					if (sStatus === "01") {
						return "None";
					} else if (sStatus === "02") {
						return "Indication01";
					} else if (sStatus === "03"){
						return "Error";
					} else if (sStatus === "04"){
						return "Indication06";
					} else if (sStatus === "05"){
						return "Error";
					} else if (sStatus === "06"){
						return "Indication03";
					} else if (sStatus === "07"){
						return "Error";
					} else if (sStatus === "08"){
						return "Information";
					} else {
						return "Success";
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
			setStatusHDR: function(vStatus) {
				if (vStatus == "NR") {	
					return "SSU Buyers Request";	
				} else if (vStatus == "S") {
					return "SSU Buyers Draft";
				} else if (vStatus == "AR") {
					return "Associate Request";
				} else if (vStatus == "R") {
					return "SSU Buyers Rejected";
				}else if (vStatus == "AC") {
					return "Associate Complete";
				}
				else if (vStatus == "AJ") {
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
				}else if(vStatus == "C"){
					return "Completed"
				}
			},
		   setDateformatter:function(oDate){
			   //debugger
			   			if(oDate !== null || oDate !== undefined){
			   			 var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
			                   pattern: "dd-MM-yyyy"
			               });
			               var dateFormatted = dateFormat.format(oDate);
			               return dateFormatted
			   			}			              
			           },
			   
			   /*getVisibility : function(status){
				   debugger
				   if(status !== null){
					   if(status === "AR" || status === "AJ" || status === "AC" || status === "AD" ){
						   return true
					   }else{
						   return false
					   }
					   if(status === "A1" || status === "A2" || status === "A3" || status === "A4"){
						   return true				   
					   }else{
						   return false
					   }
					   if(status === "S" || status === "NR" || status === "R" || status === "IC"){
						   return true
					   }else{
						   return false
					   }
				   }
				  
				
			   },*/
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