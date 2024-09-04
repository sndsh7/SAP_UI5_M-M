sap.ui.define([],function(){
  "use strict";
  return {
	  
	  statusText: function (sStatus) {
		
			switch (sStatus) {
				case "A":
					return "invoiceStatusA";
				case "B":
					return "invoiceStatusB";
				case "C":
					return oResourceBundle.getText("invoiceStatusC");
				default:
					return sStatus;
			}
	  },


	  RequestStatus:function(value)
  {
	debugger;
	  switch(value){
	  case 'N':
		  return 'Save As Draft';
		 
	  case 'A':
		  return 'Approved';
		  
	  case 'T':
		  return 'Pending';
		  	
	  }
  },

  }
}
)