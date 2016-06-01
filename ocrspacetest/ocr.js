var testStats = [{"Unique Portals Visited":50,"XM Collected":466183,"Distance Walked":7,"Resonators Deployed":58,"Links Created":19,"Control Fields Created":19,"Mind Units Captured":108,"Longest Link Ever Created":"","Largest Control Field":27,"XM Recharged":365127,"Portals Captured":6,"Unique Portals Captured":6,"Mods Deployed":23,"Resonators Destroyed":123,"Portals Neutralized":12,"Enemy Links Destroyed":26,"Enemy Control Fields Destroyed":13,"Max Time Portal Held":165,"Max Time Link Maintained":4,"Max Link Length x Days":1,"Max Time Field Held":4,"Largest Field MUs x Days":107,"Unique Missions Completed":"","Hacks":97,"Glyph Hack Points":358,"Longest Hacking Streak":13,"Failed to extract stats for":"Longest Link Ever Created, Unique Missions Completed"}];

function parseOptions() {
    var options = {};
    var form = document.getElementById('profile');
    options.append = form.elements['append'].checked;
    alert(options.append);
}

function handleResponse(response) {
    //var options = parseOptions();
    document.getElementById("auto").innerHTML = response;
    var stats = filter(JSON.parse(response), null);
    document.getElementById("user").innerHTML = printStats(stats);
    //document.getElementById("user").innerHTML = JSON.stringify(filter(JSON.parse(response), null));
    //document.getElementById("user").innerHTML = printStats(filter(JSON.parse(response), ["Hacks", "XM Collected"]));
    
    enable_downloadCSV([stats]);
}

function handleSubmission(event) {
    var files = document.getElementById("profile").elements['files'].files;
    //var file = event.target.files[0];
    if(!files){ return; }

    var formData = new FormData();
    formData.append("language", "eng");
    formData.append("apikey", "helloworld");
    formData.append("isOverlayRequired", "True");
    for(var i = 0; i < files.length; i++){
	var file = files[i];
	//if(!file.type.match("jpg|png")){ continue; }
	formData.append("file", file);
    }
    
    var xhttp; 
    if(window.XMLHttpRequest){
	xhttp = new XMLHttpRequest();
    }
    else{
	xhttp = new ActiveObject("Microsoft.XMLHTTP");
    }

    xhttp.onload = function() {
	if(xhttp.status == 200){
	    handleResponse(xhttp.responseText);
	}
	else{
	    document.getElementById("user").innerHTML = "Error Occurred";
	    alert('Failed to perform OCR');
	}
    };

    xhttp.open("POST", "https://api.ocr.space/parse/image", true);
    xhttp.send(formData);

    event.preventDefault();
}

/*
function handleSubmission(event) {
    handleResponse("");
    event.preventDefault();
}
*/

document.getElementById("profile").
    addEventListener('submit', handleSubmission);
