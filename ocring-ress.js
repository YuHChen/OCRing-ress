/************************
 * Filtering
 ************************/
/*
 * Given output from ocr.space API and a set of filters (name of stat in string
 * form, ie: "XM Collected"), only returns the stats with the names specified 
 * in filters. Any stats specified in filters that were not found are reported
 * in the "failed" field.
 *
 * Returns an object of the form:
 * { filtered : {
 *     KEY1 : VALUE1,
 *     KEY2 : VALUE2,
 *         ...
 *   },
 *   failed : [
 *     KEY1,
 *     KEY2,
 *     ... ]};
 */
function filter(out, filter_set) {
    var default_filters = [
	"Unique Portals Visited", 
	"XM Collected", 
	"Distance Walked", 
	"Resonators Deployed", 
	"Links Created", 
	"Control Fields Created", 
	"Mind Units Captured", 
	"Longest Link Ever Created", 
	"Largest Control Field", 
	"XM Recharged", 
	"Portals Captured", 
	"Unique Portals Captured", 
	"Mods Deployed", 
	"Resonators Destroyed", 
	"Portals Neutralized", 
	"Enemy Links Destroyed", 
	"Enemy Control Fields Destroyed", 
	"Max Time Portal Held", 
	"Max Time Link Maintained", 
	"Max Link Length x Days", 
	"Max Time Field Held", 
	"Largest Field MUs x Days", 
	"Unique Missions Completed", 
	"Hacks", 
	"Glyph Hack Points", 
	"Longest Hacking Streak"
    ];
    //var filters = (filter_set != null) ? filter_set : default_filters;
    var filters = filter_set || default_filters;
  
    var lines = out.ParsedResults[0].TextOverlay.Lines;
    var raw_stats = regroup(lines);
    var filtered_stats = {};

    // filter stats
    for(var stat in raw_stats){
	for(var i = 0; i < filters.length; i++){
	    var key = filters[i];
	    // check if current stat is of interest 
	    // (case insensitive match of filter string)
	    var pos = raw_stats[stat].toLowerCase().search(key.toLowerCase());
	    if(pos != -1){
		// found the filter string, save stat (key value pair) 
		// in key:value format (units excluded)
		// Note: removes commas and replaces letter O with zero
		var val = parseInt(raw_stats[stat].slice(pos + key.length + 1)
				   .replace(",", "").replace("O","0"));
		
		if(isNaN(val)){ 
		    filtered_stats[key] = "";
		}
		else{
		    // remove the filter (key) if successfully extracted
		    filtered_stats[key] = val;
		    filters.splice(i,1); 
		}
		break;
	    }
	}
    }

    return {
	"filtered" : filtered_stats,
	"failed" : filters };
}

/*
 * Given lines of parsed text from ocr.space API, regroups the parsed words into
 * the way the lines appear on agent profiles (so that the stat name and value 
 * appear on the same line). 
 */
function regroup(lines) {
    var stats = {};
    
    // place words from each parsed line into correct lexical line
    for(var l = 0; l < lines.length; l++){
	stats = regroupLine(lines[l], stats);
    }

    // stringify the stat values
    stats = compress(stats);

    return stats;
}

/*
 * Helper for regroup function. 
 * Given a parsed line and stats Object, place the words into the correct 
 * lexical line.
 */
function regroupLine(line, stats) {
    var words = line.Words;
    // Assume height of words > 10, so dividing by 10 gives
    // the line number of the stat. Line number is determined
    // by the position of the top of the shortest (height) word.
    var height_est = Math.round(parseInt(line.MinTop)/10);

    // place words into their corresponding line number
    for(var w = 0; w < words.length; w++){
	var word = words[w];
	
	// place words in the order they appear (from left to right)
	if(stats[height_est]){
	    stats[height_est][word.Left] = word.WordText;
	}
	else{
	    stats[height_est] = {};
	    stats[height_est][word.Left] = word.WordText;
	}
    }
    
    return stats;
}

/*
 * Given a stats Object, converts the parsed words of a stat line into a single
 * string.
 */
function compress(stats) {
    var compressed_stats = {};    

    for(var stat in stats){
	var text = "";
	for(var word in stats[stat]){
	    text += stats[stat][word] + " ";
	}
	compressed_stats[stat] = text;
    }

    return compressed_stats;
}

/*
 * Pretty print a stats Object (in HTML)
 */
function printStats(stats){
    var text = "";
    for(var key in stats){
	text += "<tr>"
	    + "<td>" + key + "</td>"
	    + "<td>" + stats[key] + "</td>"
	    + "</tr>";
    }

    return text;
}

/*
 * Pretty print failed stats (in HTML)
 */
function printFails(fails){
    var text = "";
    for(var key in fails){
	text += "<li>" + fails[key] + "</li>"
    }
    
    return text;
}

/************************
 * Options
 ************************/
function toggleOptions(button, options) {
    if(button.classList.toggle('toggled')){
	// button toggled to show more options
	button.value = "Hide Options";
	options.style.display = 'block';
    }
    else{
	// button toggled to hide options
	button.value = "More Options";
	options.style.display = 'none';
    }
}

function enableOption(checkbox, option) {
    option.disabled = !checkbox.checked;
}

function parseOptions(options) {
    var parsed_opts = {
	csvAppend : options.csvAppend.checked,
	csv       : null
    };

    if(parsed_opts.csvAppend && options.csv.files.length > 0){
	parsed_opts.csv = options.csv.files[0];
    }

    return parsed_opts;
}

/************************
 * OCRs Remaining Counter
 ************************/
function toggleOcrsRemMsg(ocrs_rem, msg){
    msg.style.display = (ocrs_rem.innerHTML === "0") ? 'block' : 'none';
}

/************************
 * CSV
 ************************/
function enableCsvDownload(form, stats, options) {
    form.style.display = 'block';
    form.onsubmit = function(event) {
	event.preventDefault();
	downloadCsv(stats, options.csv);
    };
}

/************************
 * OCR
 ************************/
function handleResponse(resp, config) {
    if(!resp.IsErroredOnProcessing){
	// Decrement OCRs remaining
	config.ocrsRemCntr.decrement();

	// Filter response
	// then report failures and results
	var f = filter(resp, config.filters);
	if(f.failed.length > 0){
	    config.failed.innerHTML = printFails(f.failed);
	    config.failed.parentNode.style.display = 'block';
	}
	config.results.innerHTML = printStats(f.filtered);
	config.results.parentNode.parentNode.style.display = 'block';
	
	// Parse options for downloading
	var options = parseOptions(config.options);
	// enable CSV download
	enableCsvDownload(config.download, f.filtered, options);
    }
}

function handleUpload(config) {
    var files = config.form.elements[config.filesId].files;
    if(!files){ return; }

    var form_data = toFormData({
	language          : config.lang,
	apikey            : config.apikey,
	isOverlayRequired : config.overlay,
	file              : files
    });

    simpleAJAX({
	url     : config.ocrUrl,
	method  : 'post',
	data    : form_data,
	type    : 'json',
	error   : function() {
	    alert('Failed to perform OCR');
	},
	success : function(res) {
	    handleResponse(res, config);
	}
    });
    
}

/************************
 * INIT
 ************************/
window.onload = function() {
    // Settings
    var ocrs_rem_max  = 10;
    var ocrs_rem_wait = 60 * 60 * 1000; // 1 hour
    //var ocrs_rem_wait = 20 * 1000; // 20 secs

    // IDs
    var ids = {
	form       : 'upload',
	files      : 'profiles',
	optsToggle : 'options-toggle',
	optsMenu   : 'options-menu',
	csvAppend  : 'csv-append',
	csv        : 'csv',
	ocrsRem    : 'ocrs-remaining',
	ocrsRemMsg : 'ocrs-remaining-msg', 
	failed     : 'failed',
	results    : 'results',
	download   : 'download'
    };

    // Get elements by id
    var elems     = {};
    var ids_keys  = Object.keys(ids);
    var elems_arr = ids_keys.map(function(key) {
	return document.getElementById(ids[key]); 
    });
    ids_keys.forEach(function(key, index) {
	elems[key] = elems_arr[index];
    });

    // Init OCRs remaining counter
    var ocrs_rem_cntr = new Counter(
	ocrs_rem_max, ocrs_rem_wait, elems.ocrsRem
    );

    // Options
    var options = {
	csvAppend : elems.csvAppend,
	csv       : elems.csv
    };

    // Config upload handler
    var uph_config = {
	ocrUrl      : 'https://api.ocr.space/parse/image',
	lang        : 'eng',
	apikey      : 'helloworld',
	overlay     : 'True',
	form        : elems.form,
	filesId     : ids.files,
	options     : options,
	failed      : elems.failed,
	results     : elems.results,
	download    : elems.download,
	filters     : null,
	ocrsRemCntr : ocrs_rem_cntr,
    };

    // Bind profile upload submission
    bindListener(
	elems.form, 
	'submit', 
	function(event) {
	    event.preventDefault();
	    handleUpload(uph_config);
	}
    );

    // Bind OCRs remaining counter
    bindListener(
	elems.ocrsRem,
	'change',
	function(event) {
	    event.preventDefault();
	    toggleOcrsRemMsg(elems.ocrsRem, elems.ocrsRemMsg);
	}
    );

    // Bind options button
    bindListener(
	elems.optsToggle,
	'click',
	function(event) {
	    event.preventDefault();
	    toggleOptions(elems.optsToggle, elems.optsMenu);
	}
    );

    // Bind append CSV option
    bindListener(
	elems.csvAppend,
	'click',
	function(event) {
	    enableOption(elems.csvAppend, elems.csv);
	}
    );
    
};
