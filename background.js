function check()
{
    current_url_index = -1;
    urls = new MonitoreUrlList();
    urls.load();
    req = null;
    downloadNextUrl(0);
}

check();
window.setInterval(function() {
      check();
    }, 60000 * 30);

function printData()
{
    chrome.browserAction.setBadgeBackgroundColor({color: [0, 255, 0, 255]});
    var count = urls.unwatchedCount();
    if (count > 0){
        chrome.browserAction.setBadgeText({text: count.toString()});
        urls.save();
    }
    else
        chrome.browserAction.setBadgeText({text: ""});
    var lastDate = new Date();
    localStorage["last_scan_date"] = lastDate.getFullYear() + '/' + (lastDate.getMonth() + 1) + '/' + lastDate.getDate() + ' ' + lastDate.getHours() + ':' + lastDate.getMinutes();
}

function showData()
{
    if (urls.get(current_url_index).Url.search("drom.ru") >= 0)
        parseDromRuData();
    else
        parseGorod55Data();
    
    downloadNextUrl(current_url_index + 1);
}