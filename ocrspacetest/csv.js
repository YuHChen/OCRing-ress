document.getElementById('toggle-options').onclick = function() {
    if(this.value === "More Options"){
	document.getElementById('options').style.display = 'block';
	this.value = "Hide Options";
    }
    else if(this.value === "Hide Options"){
	document.getElementById('options').style.display = 'none';
	this.value = "More Options";
    }
}

document.getElementById('append').onclick = function() {
    if(this.checked){
	document.getElementById('append').form.elements['csv'].disabled = false;
    }
    else{
	document.getElementById('append').form.elements['csv'].disabled = true;
    }
}

function enable_downloadCSV(stats_array) {
    var form = document.getElementById('download');

    form.style.display = 'block';
    
    form.onsubmit = function(event) {
	//downloadCSV(stats_array, form.elements['csv-filename'].value);
	downloadCSV(stats_array, "export.csv");
	event.preventDefault();
    };
    
}

function csv(stats_array) {
    var colDelim = ',';
    var rowDelim = '\n';
    
    keys = Object.keys(stats_array[0]);
 
    var csv = '';
    csv += keys.join(colDelim);
    csv += rowDelim;

    var pos;
    stats_array.forEach(function(stat) {
	pos = 0;
	keys.forEach(function(key) {
	    if(pos > 0){ csv += colDelim; }
	    csv += stat[key];
	    pos++;
	});
	csv += rowDelim;
    });

    return csv;
}

function downloadCSV(stats_array, filename) {
    var file = 'data:text/csv;charset=utf-8,' + csv(stats_array);
    file = encodeURI(file);

    var link = document.createElement('a');
    link.setAttribute('href', file);
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
