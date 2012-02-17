function getDromRuTable(html)
{
    html = copyAfter(html, "<table class=\"newCatList visitedT\">");
    return html.substring(0, html.search("</table>"));
}

function parseDromRuData()
{
    var urlPattern = new RegExp("<a href=\"([^\"]+)\">(\\d+-\\d+)</a>([^<]+<a href=)?");
    var imgPattern = new RegExp("<img[^s]* src=\"([^\"]+)\"( \/)?>");
    var modelPattern = new RegExp("<td[^>]*>(?:[^<]*<(?:strike|b)>)?([^<]*)(?:[^<]+</(?:strike|b)>[^<]*<(?:strike|b)>)?([^<]*)?(</(?:strike|b)>[^<]*)?</td>");
    var valuePattern = new RegExp("<td[^>]*>([^<]+)</td>");
    var paramsPattern = new RegExp("<td>([^<]*)<br[^>]+>([^<]*)<br[^>]+>([^<]*)<br[^>]+>([^<]*)</td>");
    var pricePattern = new RegExp("<td>[^<]+<span[^>]+>([^<]+)</[^<]+<[^<]+<span[^>]+>([^<]+)");
    
    var data = urls.Urls[current_url_index].Data;
    var lastID;
    if (data == null) {
        data = new Array();
    }
    else {
        if (data.length > 0) {
            lastID = data[data.length - 1].id;
        }
    }

    urls.Urls[current_url_index].Data = new Array();
    
    var table = getDromRuTable(req.responseText);
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
        urls.Urls[current_url_index].AddAdvertisement(id, url, img, date, model.trim(), year.trim(), engine, fuel, gearbox, drive, track, city, price, sold);
    } while (res != null)
    var watchedCount = 0;
    for (var i = 0; i < data.length; ++i){
        if (data[i].watched){
            ++watchedCount;
            if (watchedCount > 40){
                continue;
            }
        }
        urls.Urls[current_url_index].Data[urls.Urls[current_url_index].Data.length] = data[i];
    }
}
