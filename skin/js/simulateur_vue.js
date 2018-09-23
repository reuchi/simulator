var simulator = new Vue({
  el: '#simulator',
  data: {
  	type : '',
  	typeLabel : '',
  	amount : 0,
  	monthly : 0,
  	taeg : 0,
  	duration : 0,
  	total : 0,

  	durations : [],
    credits: [],    
  },
  created() {
  	enableLoader();
  	fetch('https://api.myjson.com/bins/gdy2c')
  		.then(response => response.json())
  		.then(json => {
  			this.credits = json; 
  			this.type = 'credit_perso' 		
  			disableLoader();
  		});
		
  },
  watch : {
  	// Lorsque le type de prêt change
  	type : function(value) {
  		// Valeurs par défaut du prêt
  		this.amount = this.credits[value]['credit']['amount_default'];
  		this.typeLabel = this.credits[value]['description']['title'];
  		this.duration = this.credits[value]['credit']['range_duration_default'];

  		if(this.type == 'credit_hypo_fixed')
  		{
  			this.duration = this.duration * 12;
  		}

  		// Mise à jour des durées sur base du montant par défaut
  		var ranges = getRanges(this.credits, this.amount, this.type);
  		this.durations = getDurations(ranges, this.amount, this.type);
  	},
  	// Lorsque le montant change
  	amount : function(value) {

  		// Mise à jour des durées
  		var ranges = getRanges(this.credits, this.amount, this.type);
  		this.durations = getDurations(ranges, this.amount, this.type);
  		this.setDurationInfos();

  	},
  	// Lorsque la durée change
  	duration : function(value) {
  		this.setDurationInfos();
  	},
  },
  methods : {
  	setDurationInfos: function() {

  		var found = false;
  		var i = 0;
  		while (i<this.durations.length && found == false)
  		{
  			if(this.durations[i]['range_duration'] == this.duration)
  			{
  				this.monthly = this.durations[i]['range_monthly'];
  				this.taeg = this.durations[i]['range_taeg'];
  				this.total = (Math.round(this.monthly*this.duration*100)/100).toFixed(2);
  			}
  			i++;
  		}
  	},
  },
})


function computeMonthly(amount, taeg, duration) {

	var monthly = (amount*(taeg/100)/12) / (1-(Math.pow((1 + (taeg/100)/12),(-duration))));
	monthly = (Math.round(monthly*100)/100).toFixed(2);
	return monthly;
}

function getDurations(ranges, amount, type)
{
	var durations = [];
	for (var i=0 ; i<ranges.length ; i++)
	{
		for(var j=0; j<ranges[i]['range_duration'].length ; j++)
		{
			var durationValue = ranges[i]['range_duration'][j];

			if(type == 'credit_hypo_fixed')
			{
				durationValue = durationValue * 12;
			}

			var monthly = computeMonthly(amount, ranges[i]['range_rate'], durationValue);

			var duration = {
				"range_duration" : durationValue,
				"range_monthly" : monthly,
				"range_taeg" : ranges[i]['range_rate'],
			}

			durations.push(duration);
			
		}
	}

	return durations;
}

/* ############################# */
/* ######### getRanges ######### */
/* ############################# */
function getRanges(credits, amount, creditType) {
	var i=0;
	var found = false;
	var ranges = [];

	// Fonctionnement normal : un seul range en fonction de l'amount
	if(creditType != 'credit_hypo_fixed')
	{
		while(i<credits[creditType]['ranges'].length && found === false)
		{
			if(amount >= credits[creditType]['ranges'][i]['range_min'] && amount <= credits[creditType]['ranges'][i]['range_max'])
			{
				ranges[0] = credits[creditType]['ranges'][i];
				found = true;
			}

			i++;
		}	
	}
	// Si Crédit hypotécaire : tableaux de ranges
	else
	{
		for(var i=0; i<credits[creditType]['ranges'].length ; i++)
		{
			ranges[i] = credits[creditType]['ranges'][i];
		}
	}

	return ranges;
}

/* ################################ */
/* ######### enableLoader ######### */
/* ################################ */
function enableLoader()
{
	// Your existing code unmodified...
	var loader = document.createElement('div');
	loader.id = 'loader';
	document.getElementsByTagName('body')[0].appendChild(loader);
}

/* ################################# */
/* ######### disableLoader ######### */
/* ################################# */
function disableLoader()
{
	document.getElementById("loader").remove();
}