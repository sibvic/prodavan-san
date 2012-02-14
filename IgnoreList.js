function IgnoreList () {
	this.Ignored = new Array();

	this.trim = function(str) {
		return str.replace(/^\s+/, '').replace(/\s+$/, '');
	};

    this.load = function() {
    	var ignoreList = localStorage["ignore_list"];
	    if (ignoreList != null) {
	    	try {
	    		this.Ignored = JSON.parse(ignoreList);
	    	}
	    	catch (exception) {
	    		Ignored = new Array();
	    	}
	    }
    };

    this.save = function() {
    	localStorage["ignore_list"] = JSON.stringify(this.Ignored);
    };

    this.getYearsForModel = function(model) {
    	for (var i = 0; i < this.Ignored.length; ++i) {
	        if (this.Ignored[i] == null || this.Ignored[i].years == null) {
	            continue;
	        }
	        if (this.Ignored[i].model == model) {
	            return this.Ignored[i].years;
	        }
	    }
	    return null;
    };

    this.createNewCar = function(model) {
    	this.model = model;
    	this.years = new Array();
    };

    this.isIgnored = function(model, year) {
    	model = this.trim(model);
    	year = this.trim(year);

    	var years = this.getYearsForModel(model);
    	if (years == null) {
    		return false;
    	}
    	for (var i = 0; i < years.length; ++i) {
	        if (years[i] == year) {
	            return true;
	        }
	    }
	    return false;
    };

    this.ignore = function(model, year) {
    	model = this.trim(model);
    	year = this.trim(year);

    	var years = this.getYearsForModel(model);
    	if (years == null) {
    		var newCar = new this.createNewCar(model);
    		newCar.years[0] = year;
    		this.Ignored[this.Ignored.length] = newCar;
    	}
    	else {
    		for (var i = 0; i < years.length; ++i) {
		        if (years[i] == year) {
		            return;
		        }
		    }
    		years[years.length] = year;
    	}
    	this.save();
    };

    this.unignore = function(model, year) {
    	model = this.trim(model);
    	year = this.trim(year);

   		var newIgnoreList = new Array();
		for (var i = 0; i < this.Ignored.length; ++i) {
			var car = this.Ignored[i];
		    if (car == null || car.years == null) {
		    	continue;
		    }
		    if (car.model == model) {
		    	var newYears = new Array();
		    	for (var ii = 0; ii < car.years.length; ++ii) {
		    		if (car.years[ii] != year) {
		    			newYears[newYears.length] = car.years[ii];
		    		}
		    	}
		    	if (newYears.length == 0) {
		    		continue;
		    	}
		    	car.years = newYears;
		    }
		    else {
		    	newIgnoreList[newIgnoreList.length] = car;
		    }
		}
		this.Ignored = newIgnoreList;
		this.save();
    };
}