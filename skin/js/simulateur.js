var creditData;

$(document).ready(function () {

	// Load Simulator Data
	var pathJson = "https://api.myjson.com/bins/gdy2c";	
	loadJson(pathJson);

	// Events
	$("#type").on("change", CreditTypeChange);
	$("#amount").on("change", CreditAmountChange);
	$(document).on("change","input[name='duration']", CreditDurationChange);


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

	// Remplissage résumé simulation
	$("#summary-type").empty().append($("option:selected",this).text())
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
	// On récupère le range en fonction du montant et du type de crédit
	var ranges = getRange(amount, creditType);
	// Remplissage résumé simulation
	$("#summary-amount").empty().append(amount + " €")
	$("#summary-monthly").empty().append("--")
	$("#summary-taeg").empty().append("--")
	$("#summary-duration").empty().append("--")
	$("#summary-total").empty().append("--")
	
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

	// Fonctionnement normal : un seul range en fonction de l'amount
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
	// Si Crédit hypotécaire : tableaux de ranges
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

			durations += '<div> \
											<div class="radio radio-custom"> \
												<label for="duration_'+durationValue+'"> \
													<input duration-type="mois" taeg="'+ranges[i]['range_rate']+'" duration="'+durationValue+'" monthly="'+monthly+'" id="duration_'+durationValue+'" value="'+durationValue+'" name="duration" type="radio"> \
													<span>'+durationValue+' mois</span>\
													<span class="monthly">'+monthly+ '€</span>\
												</label> \
											</div> \
										</div>';
		}
	}

	$("#durations .radios_container").empty().append(durations);
	$("input[id='duration_"+durationDefault+"']").click();

}

/* ######################################## */
/* ######### CreditDurationChange ######### */
/* ######################################## */
function CreditDurationChange() {

	var monthly = parseFloat($(this).attr("monthly"));
	var duration = parseFloat($(this).attr("duration"));
	var total = (Math.round(monthly*duration*100)/100).toFixed(2);
	$("#summary-monthly").empty().append(monthly + " €")
	$("#summary-taeg").empty().append($(this).attr("taeg") + " %")
	$("#summary-duration").empty().append(duration + " " + $(this).attr("duration-type"))
	$("#summary-total").empty().append(total + " €")
}