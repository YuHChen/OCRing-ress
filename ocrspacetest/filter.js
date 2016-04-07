/*
 * Given output from ocr.space API and a set of filters 
 * (name of stat in string form, ie: "XM Collected"),
 * only returns the stats with the names specified in filters.
 * Any stats specified in filters that were not found
 * are reported in "Failed to find" field.
 */
function filter(out, filter_set) {
    var default_filters = ["Unique Portals Visited", "XM Collected", "Distance Walked", "Resonators Deployed", "Links Created", "Control Fields Created", "Mind Units Captured", "Longest Link Ever Created", "Largest Control Field", "XM Recharged", "Portals Captured", "Unique Portals Captured", "Mods Deployed", "Resonators Destroyed", "Portals Neutralized", "Enemy Links Destroyed", "Enemy Control Fields Destroyed", "Max Time Portal Held", "Max Time Link Maintained", "Max Link Length x Days", "Max Time Field Held", "Largest Field MUs x Days", "Unique Missions Completed", "Hacks", "Glyph Hack Points", "Longest Hacking Streak"];
    var filters = (filter_set != null) ? filter_set : default_filters;

    var lines = out.ParsedResults[0].TextOverlay.Lines;
    var raw_stats = regroup(lines);
    var filtered_stats = {};

    // filter stats
    for(var stat in raw_stats){
	for(var i = 0; i < filters.length; i++){
	    var key = filters[i];
	    // check if current stat is of interest (case insensitive match of filter string)
	    var pos = raw_stats[stat].toLowerCase().search(key.toLowerCase());
	    if(pos != -1){
		// found the filter string, save stat (key value pair) in key:value format (units excluded)
		var val = parseInt(raw_stats[stat].slice(pos + key.length + 1).replace(",", "").replace("O","0"));
		//filtered_stats[key] = raw_stats[stat].slice(pos + key.length + 1) + " " + val;
			
		if(isNaN(val)){ 
		    filtered_stats[key] = "";
		}
		else{
		    // remove the filter (key) if successfully extracted stat value
		    filtered_stats[key] = val;
		    filters.splice(i,1); 
		}
		break;
	    }
	}
    }

    // report any missing stats
    if(filters.length > 0){
	var keys = filters[0];
	for(var i = 1; i < filters.length; i++){
	    keys += ", " + filters[i];
	}
	filtered_stats["Failed to extract stats for"] = keys;
    }
    
    return filtered_stats;
}

/*
 * Given lines of parsed text from ocr.space API,
 * regroups the parsed words into the way the 
 * lines appear on agent profiles (so that the stat
 * name and value appear on the same line). 
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
 * Given a parsed line and stats Object,
 * place the words into the correct lexical line.
 */
function regroupLine(line, stats) {
    var words = line.Words;
    // Assume height of words > 10, so dividing by 10 gives
    // the line number of the stat. Line number is determined
    // by the position of the top of the shortest (height) word.
    var heightVal = Math.round(parseInt(line.MinTop)/10);

    // place words into their corresponding line number
    for(var w = 0; w < words.length; w++){
	var word = words[w];
	
	// place words in the order they appear (from left to right)
	if(stats[heightVal]){
	    stats[heightVal][word.Left] = word.WordText;
	}
	else{
	    stats[heightVal] = {};
	    stats[heightVal][word.Left] = word.WordText;
	}
    }
    
    return stats;
}

/*
 * Given a stats Object, converts the parsed words
 * of a stat line into a single string.
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
 * Pretty print a stats Object (HTML format)
 */
function printStats(stats){
    var text = "";
    
    for(var stat in stats){
	text += stat + ": " + stats[stat] + "</br>";
    }

    return text;
}
