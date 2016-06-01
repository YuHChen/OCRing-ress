/*
 * Bind event listener to DOM element.
 */
function bindListener(element, event, listener) {
    if(element.addEventListener){
	element.addEventListener(event, listener, false);
    }
    else if(element.attachEvent){
	// IE8- and Opera6- support
	element.attachEvent('on'+event, listener);
    }
}

/*
 * Convert object of fields to FormData.
 * 
 * PARAM fields is an object of the form:
 * { NAME1 : VALUE1,
 *   NAME2 : VALUE2,
 *        ...        }
 * VALUE could be an array or FileList, in which case 
 * there will be VALUE.length NAME fields with each 
 * value from VALUE
 *
 * RET FormData object
 */
function toFormData(fields) {
    var formData = new FormData();
    var keys = Object.keys(fields);
    
    keys.forEach(function(key) {
	var val = fields[key];
	if(Array.isArray(val)){
	    val.forEach(function(v) {
		formData.append(key, v);
	    });
	}
	else if(val instanceof FileList){
	    for(var i = 0; i < val.length; i++){
		formData.append(key, val[i]);
	    }
	}
	else if(typeof val === 'string'){
	    formData.append(key, val);
	}
	else {
	    // TODO error?
	}
    });

    return formData;
}

/*
 * Perform AJAX call.
 *
 * PARAM args is an object of the form: 
 * { url : "URL",
 *   method : "get|post",
 *   data : data,
 *   type: "json|xml|html",
 *   error : err_callback,
 *   success : succ_callback };
 * Required: url
 */
function simpleAJAX(args) {
    if(args.url){
	// parse args
	var url = args.url;
	var method = (args.method || 'GET').toUpperCase();
	var data = (args.data || null);
	var type = (args.type || 'html');
	var error = args.error || function() {};
	var success = args.success || function() {};

	var xhttp;
	if(window.XMLHttpRequest){
	    xhttp = new XMLHttpRequest();
	}
	else{
	    // IE6 and IE5 support
	    xhttp = new ActiveObject("Microsoft.XMLHTTP");
	}

	xhttp.onload = function() {
	    /* !!! Check for success (2XX) codes */
	    var text = xhttp.responseText;
	    var xml = xhttp.responseXML;
	    var res;
	    switch(args.type){
	    case 'json':
		try{
		    res = JSON ? JSON.parse(text) : eval('(' + text + ')');
		}
		catch(err){
		    return error(err, 'Could not parse JSON in response', text);
		}
		break;
	    case 'xml':
		res = xml;
		break;
	    case 'html':
	    default:
		res = text;
	    }
	    success(res);
	}
	
	xhttp.onerror = error;

	switch(method){
	case 'GET':
	    xhttp.open('GET', url, true);
	    xhttp.send();
	    break;
	case 'POST':
	    xhttp.open('POST', url, true);
	    xhttp.send(data);
	    break;
	}
    }
}

/*
 * Convert an array of objects into CSV format, where column headers are the 
 * objects' keys and each row contains the values of a single object. If a file 
 * is provided, the array of objects will be appended. Note: only the values
 * corresponding to the column headers will be appended.
 *
 * PARAM objs is an array of objects to be converted to CSV format
 *
 * PARAM file is a File object corresponding to the CSV file to append the new 
 * objects to
 *
 * PARAM cb is a callback of the form:
 * function(csv_str) { ... }
 *
 * Reference:
 * http://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
 */
function csv(objs, file = null, cb) {
    var delim = {
	col : ',',
	row : '\n'
    };

    objs = Array.isArray(objs) ? objs : [objs];

    if(file){
	// parse file and append new objects
	var reader = new FileReader();
	reader.onload = function(event) {
	    var keys = event.target.result.split(delim.row)[0].split(delim.col);
	    cb(csvAppend(event.target.result, delim, objs, keys));
	};
	reader.readAsText(file);
    }
    else{
	// create new csv: write column headers
	var keys = Object.keys(objs[0]);
	var csv_file = keys.join(delim.col);
	csv_file += delim.row;
	cb(csvAppend(csv_file, delim, objs, keys));
    }

}

/*
 * Appends objs to the csv_file using the row and column delimiters in delim. 
 * Note: for each object, only the values of the specified keys are appended
 *
 * PARAM csv_file is a string representing the contents in the CSV file to 
 * append to
 *
 * PARAM delim is an object of the form:
 * { col : COL_DELIM, row : ROW_DELIM }
 * which specifies the delimiters for the CSV file
 * 
 * PARAM objs is an array of objects to be converted to CSV format
 *
 * PARAM keys is an array of strings of headers for the CSV file
 *
 * Reference:
 * http://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
 */
function csvAppend(csv_file, delim, objs, keys) {
    var pos;
    objs.forEach(function(obj) {
	pos = 0;
	keys.forEach(function(key) {
	    if(pos > 0){ csv_file += delim.col; }
	    csv_file += obj.hasOwnProperty(key) ? obj[key] : '';
	    pos++;
	});
	csv_file += delim.row;
    });
    
    return csv_file;
}

/*
 * Convert an array of objects to a CSV file (see function csv above) and starts
 * a download of the file.
 *
 * PARAM objs is an array of objects to be converted to CSV format
 *
 * PARAM file is a File object corresponding to the CSV file to append the new 
 * objects to
 *
 * PARAM (optional) filename is the name of the generated CSV file
 *
 * Reference:
 * http://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
 */
function downloadCsv(objs, file = null, filename = "export.csv") {
    csv(objs, file, function(csv_str) {
	var csv_file = 'data:text/csv;charset=utf-8,' + csv_str;
	csv_file = encodeURI(csv_file);

	var link = document.createElement('a');
	link.setAttribute('href', csv_file);
	link.setAttribute('download', filename);
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
    });
}
