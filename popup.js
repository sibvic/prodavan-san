
var urls = new MonitoreUrlList();
urls.load();
window.setTimeout(function() {
      printData();
    }, 500);

function compareCars(a, b)
{
    return b.id - a.id;
}

function markAsRead()
{
    urls.markAsRead();
    chrome.browserAction.setBadgeText({text: ""});
}

function hideAdRow(id)
{
    var table = document.getElementById("adverts");
    var row = document.getElementById("ad_" + id);
    table.removeChild(row);
}

function ignoreModel(model, year, id)
{
    hideAdRow(id);
    
    var ignoreList = new IgnoreList();
    ignoreList.load();
    if (ignoreList.isIgnored(model, year))
        return;
    ignoreList.ignore(model, year);
}

function printData()
{
    if (urls.length() == 0) {
        var a = document.createElement("div");
        a.setAttribute('class', "text");
        a.appendChild(document.createTextNode("Добавьте ссылки для слежения в настройках!"));
        document.body.appendChild(a);
        return;
    }
    var count = urls.unwatchedCount();
    if (count == 0)
    {
        var a = document.createElement("div");
        a.setAttribute('class', "text");
        a.appendChild(document.createTextNode("Нет новых объявлений"));
        document.body.appendChild(a);

        a = document.createElement("div");
        a.setAttribute('class', "text");
        var lastDate = getLastScanDate();
        a.appendChild(document.createTextNode("Время последней проверки: " + lastDate));
        document.body.appendChild(a);
        return;
    }
    var a = document.createElement("div");
    a.onclick = markAsRead;
    a.setAttribute('class', "link");
    a.appendChild(document.createTextNode("Пометить как прочитанные"));
    document.body.appendChild(a);
    
    var mainTable = document.createElement("table");
    mainTable.setAttribute('id', "adverts");
    document.body.appendChild(mainTable);
    for (var urlidx = 0; urlidx < urls.length(); ++urlidx){
        var data = urls.get(urlidx).Data;
        for (var i = 0; i < data.length; ++i){
            if (data[i].watched)
                continue;
            var row = document.createElement("tr");
            row.setAttribute('id', "ad_" + i);
            mainTable.appendChild(row);
            
            var cell = document.createElement("td");
            row.appendChild(cell);
            var a = document.createElement("div");
            a.setAttribute('class', "link");
            a.data = data[i];
            a.onclick = function() {chrome.tabs.create({'url': this.data.url});}
            a.appendChild(document.createTextNode(data[i].date));
            cell.appendChild(a);
            
            cell = document.createElement("td");
            row.appendChild(cell);
            var a = document.createElement("div");
            a.data = data[i];
            a.onclick = function() {chrome.tabs.create({'url': this.data.url});}
            var img = document.createElement("img");
            img.setAttribute('src', data[i].imgUrl);
            a.appendChild(img);
            cell.appendChild(a);
            
            cell = document.createElement("td");
            row.appendChild(cell);
            if (data[i].sold)
            {
                var strike = document.createElement("strike");
                cell.appendChild(strike);
                strike.appendChild(document.createTextNode(data[i].model));
            }
            else
            {
                cell.appendChild(document.createTextNode(data[i].model));
                a = document.createElement("div");
                a.setAttribute('class', "link");
                a.data = data[i];
                a.i_value = i;
                a.onclick = function() {ignoreModel(this.data.model.trim(), this.data.year.trim(), this.i_value);}
                a.appendChild(document.createTextNode("Игнорировать"));
                cell.appendChild(a);
            }
            cell.appendChild(document.createElement("br"));
            cell.appendChild(document.createTextNode(data[i].year + " | " + data[i].engine + " (" + data[i].fuel + ")"));
            cell.appendChild(document.createElement("br"));
            cell.appendChild(document.createTextNode(data[i].gearbox + " | " + data[i].drive));
            
            cell = document.createElement("td");
            row.appendChild(cell);
            cell.appendChild(document.createTextNode(data[i].price));
            cell.appendChild(document.createElement("br"));
            cell.appendChild(document.createTextNode(data[i].track));
            cell.appendChild(document.createElement("br"));
            cell.appendChild(document.createTextNode(data[i].city));
        }
    }
}

function printError(error)
{
    var message = document.createElement("p");
    var text = document.createTextNode(error);
    message.appendChild(text);
    document.body.appendChild(message);
}