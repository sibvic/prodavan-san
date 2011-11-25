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
    var lastDate = new Date();
    localStorage["last_scan_date"] = lastDate.getFullYear() + '/' + (lastDate.getMonth() + 1) + '/' + lastDate.getDate();
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

function getLastScanDate()
{
    return localStorage["last_scan_date"];
}

function getIgnoreList()
{
    var ignoreList = localStorage["ignore_list"];
    if (ignoreList != null)
        return JSON.parse(ignoreList);
    return new Array();
}

function saveIgnoreList(ignoreList)
{
    localStorage["ignore_list"] = JSON.stringify(ignoreList);
}

function isModelIgnored(model, year, ignoreList)
{
    for (var i = 0; i < ignoreList.length; ++i){
        if (ignoreList[i] == null)
            continue;
        if (!ignoreList[i].model == model && ignoreList[i].year == year)
            return true;
    }
    return false;
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

function copyAfter(text, pattern)
{
    if (pattern == null)
        return "";
    var i = text.search(pattern);
    return text.substring(i + pattern.length);
}

function getGorod55Table(html)
{
    html = copyAfter(html, "<table id=\"common_table\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" class=\"find_result");
    return html.substring(0, html.search("</table>"));
}

function parseGorod55Data()
{
    var datePattern = new RegExp("(\\d\\d\\.\\d\\d\\.\\d\\d)(?:[^<]+)?<br>(\\d\\d:\\d\\d)");
    var urlPattern = new RegExp("<a href='/auto/autoad/view/\\?id=(\\d+)'");
    var imgPattern = new RegExp("<img id=\"(?:[^\"]+)\" title=\"(?:[^\"]+)\" alt=\"(?:[^\"]+)\" src=\"([^\"]+)\"");
    var valuePattern = new RegExp(">([^<]+)<");
    
    var data = urls[current_url_index].data;
    if (data == null)
        data = new Array();
    urls[current_url_index].data = new Array();
    
    var table = getGorod55Table(req.responseText);
    var res = null;
    do
    {
        table = copyAfter(table, "date_small");
        res = datePattern.exec(table);
        if (res == null)
            continue;
        var date = res[1] + " " + res[2];
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        
        res = urlPattern.exec(table);
        var id = res[1];
        table = copyAfter(table, id);
        var url = "http://www.gorod55.ru/auto/autoad/view/?id=" + id;
        
        res = imgPattern.exec(table);
        var img = res[1];
        table = copyAfter(table, img);
        table = copyAfter(table, id);
        
        res = valuePattern.exec(table);
        var model = res[1];
        table = copyAfter(table, model);
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        
        res = valuePattern.exec(table);
        var year = res[1];
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        
        res = valuePattern.exec(table);
        var gearbox = res[1];
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        
        res = valuePattern.exec(table);
        var engine = res[1];
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        
        res = valuePattern.exec(table);
        var trip = res[1];
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");
        
        res = valuePattern.exec(table);
        var price = res[1];
        table = copyAfter(table, "line_v");
        table = copyAfter(table, "</td>");

        var found = false;
        for (var i = 0; i < data.length; ++i){
            if (data[i].id == id){
                found = true;
                break;
            }
        }
        if (found)
            continue;
        urls[current_url_index].data[urls[current_url_index].data.length] = new add(id, url, img, date, model, year, engine, "", gearbox, "", trip, "Omsk", price, false);
    } while (res != null)
    var watchedCount = 0;
    for (var i = 0; i < data.length; ++i){
        if (data[i].watched){
            ++watchedCount;
            if (watchedCount > 100){
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
