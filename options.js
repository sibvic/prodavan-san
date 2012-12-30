

var last_index = -1;

// Saves options to localStorage.
function save_options() {
  var urls = new MonitoreUrlList();
  var i;
  for (i = 0; ; ++i)
  {
    var input = document.getElementById("url_" + i);
    if (input == null)
      break;
    var inputID = document.getElementById("url_lastID_" + i);
    urls.Urls[i] = new MonitoredUrl(input.value, JSON.parse(inputID.value));
  }
  urls.save();

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Сохранено";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {

  var add_button = document.getElementById("add_button");
  add_button.onclick = function(){ add_more('', '') };
  var save_button = document.getElementById("save_button");
  save_button.onclick = save_options;

  var urls = new MonitoreUrlList();
  urls.load();
  if (urls.length() == 0)
    return;
  for (var i = 0; i < urls.length(); ++i) {
    var value = urls.get(i).Url;
    if (value == null)
        continue;
    add_more(urls.get(i).Url, urls.get(i).Data);
  }

  var models = "";
  var blockid = 0;
  var ignoreList = new IgnoreList();
  ignoreList.load();
  for (var i = 0; i < ignoreList.length(); ++i)
  {
    var car = ignoreList.get(i);
    if (car == null) {
      continue;
    }
    models = models + "<span id=\"car_"  + i +"\">" + car.model + " (";
    for (var ii = 0; ii < car.years.length; ++ii) {
      models = models + "<span id=\"ignore_" + blockid +"\">" + car.years[ii] + "<span class=\"link\" onclick=\"unignore(" + i + ", " + blockid + ", '" + car.model + "', '" + car.years[ii] + "')\">[X]</span></span>, ";
      blockid += 1;
    }
    models = models + ")<br/></span>";
  }

  var listSection = document.getElementById("ignoreList");
  listSection.innerHTML = models;
}

function unignore(carid, id, model, year) {
  var ignored = new IgnoreList();
  ignored.load();
  var ignore = document.getElementById("ignore_" + id);
  var div = document.getElementById("car_" + carid);
  div.removeChild(ignore);
  ignored.unignore(model, year);
}

function remove(index){
    for (var i = index; i < last_index - 1; ++i){
        var input = document.getElementById("url_" + i);
        var inputID = document.getElementById("url_lastID_" + i);
        var inputNext = document.getElementById("url_" + i);
        var inputIDNext = document.getElementById("url_lastID_" + i);
        input.value = inputNext.value;
        inputID.value = inputIDNext.value;
    }
    var input = document.getElementById("url_" + last_index);
    var inputID = document.getElementById("url_lastID_" + last_index);
    var br = document.getElementById("br_" + last_index);
    var remove = document.getElementById("remove_" + last_index);
    var div = document.getElementById("main");
    div.removeChild(input);
    div.removeChild(inputID);
    div.removeChild(br);
    div.removeChild(remove);
    last_index = last_index - 1;
}

function add_more(url, data){
    last_index = last_index + 1;
    var div = document.getElementById("main");

    var input = document.createElement("input");
    div.appendChild(input);
    input.setAttribute('id', "url_" + last_index);
    input.setAttribute('value', url);
    input.setAttribute('class', "url");
    var input2 = document.createElement("input");
    div.appendChild(input2);
    input2.setAttribute('id', "url_lastID_" + last_index);
    input2.setAttribute('type', "hidden");
    input2.setAttribute('value', JSON.stringify(data));
    
    var remove = document.createElement("div");
    remove.appendChild(document.createTextNode("Удалить"));
    remove.setAttribute('class', "link");
    remove.setAttribute('id', "remove_" + last_index);
    remove.setAttribute('onClick', "remove(" + last_index + ")");
    div.appendChild(remove);
    
    var br = document.createElement("br");
    br.setAttribute('id', "br_" + last_index);
    div.appendChild(br);
}
window.onload = restore_options;