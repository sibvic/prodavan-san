var current_url_index = -1;
var urls = new MonitoreUrlList();
urls.load();
var req;
String.prototype.trim = function() { return this.replace(/^\s+/, '').replace(/\s+$/, ''); };

function downloadNextUrl(index)
{
    if (index >= urls.length())
    {
        printData();
        return;
    }
    
    current_url_index = index;
    
    var urlToGet = urls.get(index).Url;
    req = new XMLHttpRequest();
    req.open("GET", urlToGet, true);
    req.onload = showData;
    req.send(null);
}

function getLastScanDate()
{
    return localStorage["last_scan_date"];
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
    var ignoreList = new IgnoreList();
    ignoreList.load();
    
    var data = urls.get(current_url_index).Data;
    urls.get(current_url_index).Data = new Array();
    
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
        if (!ignoreList.isIgnored(model, year)) {
            urls.get(current_url_index).addAdvertisement(id, url, img, date, model, year, engine, "", gearbox, "", trip, "Omsk", price, false);
        }
    } while (res != null)
    var watchedCount = 0;
    for (var i = 0; i < data.length; ++i){
        if (data[i].watched){
            ++watchedCount;
            if (watchedCount > 100){
                continue;
            }
        }
        urls.get(current_url_index).Data[urls.get(current_url_index).Data.length] = data[i];
    }
}
