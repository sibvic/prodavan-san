function Advertisement(id, url, imgUrl, date, model, year, engine, fuel, gearbox, drive, track, city, price, sold){
	this.id = id;
    this.url = url;
    this.imgUrl = imgUrl;
    this.date = date;
    this.model = model;
    this.year = year;
    this.engine = engine;
    this.fuel = fuel;
    this.gearbox = gearbox;
    this.drive = drive;
    this.track = track;
    this.city = city;
    this.price = price;
    this.sold = sold;
    this.url_index = current_url_index;
    this.watched = false;
}

function MonitoredUrl(url, advertisements) {
	this.Url = url;
	if (advertisements != null) {
		this.Data = advertisements;
	}
	else {
		this.Data = new Array();
	}

	this.AddAdvertisement = function(id, url, imgUrl, date, model, year, engine, fuel, gearbox, drive, track, city, price, sold) {
		this.Data[this.Data.length] = new Advertisement(id, url, imgUrl, date, model, year, engine, fuel, gearbox, drive, track, city, price, sold);
	}
}

function MonitoreUrlList() {
	this.Urls = new Array();

	this.Load = function() {
		this.Urls = new Array();

		var loaded_urls = localStorage["dromru_urls"];
    	if (loaded_urls != null && loaded_urls != "") {
    		localStorage["dromru_urls"] = "";
        	var parsed_urls = JSON.parse(loaded_urls);
        	for (var i = 0; i < parsed_urls.length; ++i) {
        		var monitored_url = new MonitoredUrl(parsed_urls[i].url, parsed_urls[i].data);
        		this.Urls[this.Urls.length] = monitored_url;
        	}
    	}
    	else {
    		var loaded_urls = localStorage["urls"];
    		if (loaded_urls != null) {
    			var urls = JSON.parse(loaded_urls);
    			for (var i = 0; i < urls.length; ++i) {
		    		this.Urls[i] = new MonitoredUrl(urls[i].Url, urls[i].Data);
		    	}
    		}
    	}
	}

	this.Save = function() {
		localStorage["urls"] = JSON.stringify(this.Urls);
	}

	this.UnwatchedCount = function() {
	    var count = 0;
	    for (var i = 0; i < this.Urls.length; ++i){
	        for (var ii = 0; ii < this.Urls[i].Data.length; ++ii){
	            if (!this.Urls[i].Data[ii].watched)
	                ++count;
	        }
	    }
	    return count;
	}

	this.MarkAsRead = function() {
		for (var i = 0; i < this.Urls.length; ++i){
	        for (var ii = 0; ii < this.Urls[i].Data.length; ++ii) {
	            this.Urls[i].Data[ii].watched = true;
	        }
	    }
	    this.Save();
	}
}