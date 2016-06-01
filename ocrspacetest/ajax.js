function bindListener(element, event, listener) {
    if(element.addEventListener){
	element.addEventListener(event, listener, false);
    }
    else if(element.attachEvent){
	// IE8- and Opera6- support
	element.attachEvent('on'+event, listener);
    }
}

function randName(text){
    var endl = "</br>";

    reqwest({
	url: 'https://randomuser.me/api/',
	method: "GET",
	type: 'json',
	crossOrigin: true,
	error: function(err) {
	    text.innerHTML = "Error:"+endl+JSON.stringify(err)+endl;
	},
	success: function(res) {
	    var nameObj = res.results[0].name;
	    var name = nameObj.title + ". " + nameObj.first + " " + nameObj.last;
	    text.innerHTML += name + endl;
	}
    });

    /*
    reqwest('https://randomuser.me/api/', function(res) {
	var nameObj = res.content.results[0].user.name;
	var name = nameObj.title + ". " + nameObj.first + " " + nameObj.last;
	text.innerHTML = name + endl;
    });
    */
}

function randName2(text) {
    var endl = "</br>";
    var xhttp = new XMLHttpRequest();
    
    xhttp.onload = function() {
	var nameObj = JSON.parse(xhttp.responseText).results[0].name;
	var name = nameObj.title + ". " + nameObj.first + " " + nameObj.last;
	text.innerHTML += name + endl;
    }

    xhttp.open('GET', 'https://randomuser.me/api/');
    xhttp.send();
}

function randName3(text) {
    var endl = "</br>";

    simpleAJAX({
	url: 'https://randomuser.me/api/',
	method: "GET",
	type: 'json',
	error: function(err) {
	    text.innerHTML = "Error:"+endl+JSON.stringify(err)+endl;
	},
	success: function(res) {
	    var nameObj = res.results[0].name;
	    var name = nameObj.title + ". " + nameObj.first + " " + nameObj.last;
	    text.innerHTML += name + endl;
	}
    });
}

var context = this;
if('window' in context){
    var doc      = document;
    var byId     = 'getElementById';
    var gen_id   = 'gen-name';
    var name_id  = 'name';
    var generate = doc[byId](gen_id);
    var results  = doc[byId](name_id);

    bindListener(generate, 'click', function(){
	randName(results);
	randName2(results);
	randName3(results);
    });
}
