var current_url_index = -1;
var urls = loadUrls();
var req;

function downloadNextUrl(index)
{
    if (index >= urls.length)
    {
        printData();
        return;
    }
    
    current_url_index = index;
    
    var urlToGet = urls[index].url;
    req = new XMLHttpRequest();
    req.open("GET", urlToGet, true);
    req.onload = showData;
    req.send(null);
}

function saveUrls(urls)
{
    localStorage["dromru_urls"] = JSON.stringify(urls);
}

function loadUrls()
{
    var urls = localStorage["dromru_urls"];
    if (urls != null)
        return JSON.parse(urls);
    return new Array();
}

function getUnwatchedCount(urlsArr){
    var count = 0;
    for (var i = 0; i < urlsArr.length; ++i){
        for (var ii = 0; ii < urlsArr[i].data.length; ++ii){
            if (!urlsArr[i].data[ii].watched)
                ++count;
        }
    }
    return count;
}

function parseData()
{
    var expr = new RegExp("[<]tr[^>]+>[^<]+<td>[^<]+<center>[^<]+<a href=\"([^\"]+)\">(\d+-\d+)</a>[^<]+</center>[^<]+</td>[^<]+<td[^>]+>[^<]+<a href=\"[^\"]+\"><img[^s]+ src=\"[^\"]+\"></a>[^<]+</td>[^<]+<td[^>]+>([^<]+)</td>[^<]+<td[^>]+>([^<]+)</td>[^<]+<td[^>]+>([^<]+)</td>[^<]+<td>([^<]+<br>[^<]+<br>[^<]+)</td>[^<]+<td>([^<]+)</td>[^<]+<td>[^<]+<center>([^<]+)</center>[^<]+</td>[^<]+<td>[^<]+<span[^>]+>([^<]+)</span>[^<]+<br>[^<]+<span[^>]+>([^<]+)</span>[^<]+</td>[^<]+</tr>");
    var urlPattern = new RegExp("<a href=\"([^\"]+)\">(\\d+-\\d+)</a>([^<]+<a href=)?");
    var imgPattern = new RegExp("<img[^s]+ src=\"([^\"]+)\">");
    var modelPattern = new RegExp("<td[^>]*>(?:[^<]+<(?:strike|b)>)?([^<]+)(?:[^<]+</(?:strike|b)>[^<]+<(?:strike|b)>)?([^<]+)?(</(?:strike|b)>[^<]+)?</td>");
    var valuePattern = new RegExp("<td[^>]*>([^<]+)</td>");
    var paramsPattern = new RegExp("<td>([^<]*)<b[^<]+>([^<]*)<b[^<]+>([^<]*)</td>");
    var pricePattern = new RegExp("<td>[^<]+<span[^>]+>([^<]+)</[^<]+<[^<]+<span[^>]+>([^<]+)");
    
    var data = urls[current_url_index].data;
    if (data == null)
        data = new Array();
    urls[current_url_index].data = new Array();
    
    var table = getTable(req.responseText);
    var res = null;
    do
    {
        var sold = false;
        res = urlPattern.exec(table);
        if (res == null)
            continue;
        var url = res[1];
        var date = res[2];
        var clipped = res[3] != null;
        table = copyAfter(table, date);
        
        res = imgPattern.exec(table);
        var img;
        if (res != null)
            img = res[1];
        table = copyAfter(table, img);
        
        res = modelPattern.exec(table);
        var model = res[1];
        if (res[2] != null)
        {
            model = model + " " + res[2];
            sold = true;
        }
        table = copyAfter(table, model);
        
        res = valuePattern.exec(table);
        var year = res[1];
        table = copyAfter(table, year);
        
        var engine;
        res = valuePattern.exec(table);
        if (res != null)
            engine = res[1];
        
        var fuel;
        var gearbox;
        var drive;
        res = paramsPattern.exec(table);
        if (res != null)
        {
            fuel = res[1];
            gearbox = res[2];
            drive = res[3];
        }
        table = copyAfter(table, drive);
        
        res = valuePattern.exec(table);
        var track;
        if (res != null)
            track = res[1];
        table = copyAfter(table, track);
        if (track.search("&nbsp;") >= 0)
            track = "-";
        
        var city;
        var price;
        res = pricePattern.exec(table);
        if (res != null)
        {
            price = res[1];
            while (price.search("&nbsp;") >= 0)
            {
                price = price.replace("&nbsp;", " ");
            }
            city = res[2];
        }
        table = copyAfter(table, "</td>");
        var lastID = urls[current_url_index].lastID;
        var idPattern = new RegExp("/(\\d+)\\.htm");
        var res = idPattern.exec(url);
        if (res == null)
            continue;
        var id = parseInt(res[1]);
        if (lastID != null && lastID == id && clipped == false)
            break;
        var found = false;
        for (var i = 0; i < data.length; ++i){
            if (data[i].id == id){
                found = true;
                break;
            }
        }
        if (found)
            continue;
        urls[current_url_index].data[urls[current_url_index].data.length] = new add(id, url, img, date, model, year, engine, fuel, gearbox, drive, track, city, price, sold);
    } while (res != null)
    var watchedCount = 0;
    for (var i = 0; i < data.length; ++i){
        if (data[i].watched){
            ++watchedCount;
            if (watchedCount > 40){
                continue;
            }
        }
        urls[current_url_index].data[urls[current_url_index].data.length] = data[i];
    }
}

function add(id, url, imgUrl, date, model, year, engine, fuel, gearbox, drive, track, city, price, sold)
{
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
