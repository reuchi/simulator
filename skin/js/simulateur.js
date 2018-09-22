var creditData;

$(document).ready(function () {

	// Load Simulator Data
	var pathJson = "https://api.myjson.com/bins/gdy2c";	
	loadJson(pathJson);

	// Events
	$("#type").on("change", CreditTypeChange);
	$("#amount").on("change", CreditAmountChange);


	// BOUTTONS RADIOS
	initRadioButtonsBehavior()

});

/* ############################ */
/* ######### loadJson ######### */
/* ############################ */
function loadJson(jsonUrl) {

	// Activation du loader pour bloquer l'utilisation de la page tant que toutes les données n'ont pas été chargée
	enableLoader();

	// Récupération du fichier Json
	$.getJSON(jsonUrl, function(data) {
		creditData = data;		
	})
  .done(function() {
  	// Chargement des données du simaleur sur base du fichier json
  	loadSimulatorData()
  	// Désactivation du loader
    disableLoader();
  })

}

/* ############################################ */
/* ######### initRadioButtonsBehavior ######### */
/* ############################################ */
function initRadioButtonsBehavior() {
	
	$(document).on("change",".radio-custom input",function(){

		// update active class
		var group = $(this).closest(".radios_container");
		var label = $(this).closest("label");

		$("label", group).removeClass("active");
		$(label).addClass("active");
		
	})

	$("input[type='radio']").prop('checked', false);
}

/* ################################ */
/* ######### enableLoader ######### */
/* ################################ */
function enableLoader()
{
	  $( "<div/>", {
	    "id": "loader",
	  }).appendTo( "body" );
}

/* ################################# */
/* ######### disableLoader ######### */
/* ################################# */
function disableLoader()
{
	$("#loader").remove();
}

function loadSimulatorData()
{
	loadCreditType();
}


/* ################################## */
/* ######### loadCreditType ######### */
/* ################################## */
function loadCreditType() {
	
	var typeOptions;
	for (key in creditData) {
    typeOptions += "<option duration-default='"+creditData[key]['credit']['range_duration_default']+"' value='"+creditData[key]['credit']['loan_type_unique_name']+"'>"+ creditData[key]['description']['title'] +"</option>";
	}
	$("#type").append(typeOptions).change();
}

/* #################################### */
/* ######### CreditTypeChange ######### */
/* #################################### */
function CreditTypeChange() {

	// Chargement du montant min, max et par défaut
	$("#amount")
		.val(creditData[this.value]['credit']['amount_default'])
		.attr("min", creditData[this.value]['credit']['amount_min'])
		.attr("max", creditData[this.value]['credit']['amount_max'])		
		.change();
}

/* ###################################### */
/* ######### CreditAmountChange ######### */
/* ###################################### */
function CreditAmountChange() {

	// On vérifie si on reste entre les montants min et max
	var amount = checkAmount($(this));
	// On récupère le type de crédit préalablement sélectionné
	var creditType = $('#type').val();
	var durationDefault = $("#type option:selected").attr("duration-default");
	alert(durationDefault)
	// On récupère le range en fonction du montant et du type de crédit
	var ranges = getRange(amount, creditType);
	// On charge les durées disponibles
	loadDuration(ranges, amount, durationDefault);
}

/* ############################### */
/* ######### checkAmount ######### */
/* ############################### */
function checkAmount(input)
{
	var max = parseFloat(input.attr('max'));
  var min = parseFloat(input.attr('min'));
  if (input.val() > max) 
  {
    input.val(max);
  } else if (input.val() < min) 
  {
    input.val(min);
  }
  var amount = input.val();
  return amount;
}

/* ############################ */
/* ######### getRange ######### */
/* ############################ */
function getRange(amount, creditType)
{
	var i=0;
	var found = false;
	var ranges = [];

	if(creditType != 'credit_hypo_fixed')
	{
		while(i<creditData[creditType]['ranges'].length && found === false)
		{
			if(amount >= creditData[creditType]['ranges'][i]['range_min'] && amount <= creditData[creditType]['ranges'][i]['range_max'])
			{
				ranges[0] = creditData[creditType]['ranges'][i];
				found = true;
			}

			i++;
		}	
	}
	else
	{
		for(var i=0; i<creditData[creditType]['ranges'].length ; i++)
		{
			ranges[i] = creditData[creditType]['ranges'][i];
		}
	}

	return ranges;
}

/* ################################ */
/* ######### loadDuration ######### */
/* ################################ */
function loadDuration(ranges, amount, durationDefault) {

	var durations = "";
	for (var i=0 ; i<ranges.length ; i++)
	{
		for(var j=0; j<ranges[i]['range_duration'].length ; j++)
		{
			var durationValue = ranges[i]['range_duration'][j];
			var monthly = (amount*(ranges[i]['range_rate']/100)/12) / (1-(Math.pow((1 + (ranges[i]['range_rate']/100)/12),(-durationValue))));
			monthly = (Math.round(monthly*100)/100).toFixed(2);

			var checked = "";
			var active = "";
			if(durationValue == durationDefault)
			{
				checked = "checked";
				active = "active";
			}

			durations += '<div> \
											<div class="radio radio-custom"> \
												<label class="'+active+'"for="duration_'+durationValue+'"> \
													<input id="duration_'+durationValue+'" value="'+durationValue+'" '+checked+' name="duration" type="radio"> \
													<span>'+durationValue+' mois</span>\
													<span class="monthly">'+monthly+ '€</span>\
												</label> \
											</div> \
										</div>';
		}
	}

	$("#durations .radios_container").empty().append(durations);
}
