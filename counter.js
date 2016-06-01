function Counter(max = 10, wait = 3600000, element, retry = 500) {
    this.max = max;
    this.cur = this.max;
    this.wait = wait;
    this.content = element;
    this.retry = retry;

    this.hasStorage = this.storageAvailable('localStorage');
    this.tsKey = 'timestamp';
    this.timestamps = this.restoreTimestamps();

    this.content.innerHTML = this.cur;
    this.content.dispatchEvent(new Event('change', { 'bubbles' : true }));
}

Counter.prototype = {
    decrement : function() {
	if(this.cur > 0){ 
	    this.cur--;
	    this.timestamps.push(Date.now());
	    this.storeTimestamps();
	    setTimeout(this.increment.bind(this), this.wait);
	    this.updateHTML();
	}
    },
    increment : function() {
	if(this.timestamps && this.timestamps.length > 0){
	    var wait = this.timeRemaining(this.timestamps[0]);
	    if(wait > 0){
		// ongoing timestamp
		setTimeout(this.increment.bind(this), wait);
	    }
	    else{
		// expired timestamp
		this.cur++;
		this.timestamps.shift();
		this.storeTimestamps();
		this.updateHTML();
	    }
	}
	else{
	    // possibly still restoring timestamps, 
	    // try again after retry milliseconds
	    setTimeout(this.increment.bind(this), this.retry);
	}
    },
    restoreTimestamps : function() {
	var timestamps = [];
	if(this.hasStorage){
	    var str = localStorage.getItem(this.tsKey);
	    if(str){
		// successfully retrieved timestamps from storage
		// restore ongoing timestamps
		var strs = str.split(',');
		for(var i = 0; i < strs.length; i++){
		    var ts = parseInt(strs[i]);
		    var wait = this.timeRemaining(ts);
		    if(wait > 0){
			// ongoing timestamp
			this.cur--;
			timestamps.push(ts);
			setTimeout(this.increment.bind(this), wait);
		    }
		}
	    }   
	}
	return timestamps;
    },
    storageAvailable : function(type) {
	try{
	    var storage = window[type];
	    var x = '__storage_test__';
	    storage.setItem(x, x);
	    storage.removeItem(x);
	    return true;
	}
	catch(e){
	    return false;
	}
    },
    storeTimestamps : function() {
	if(this.hasStorage){
	    localStorage.setItem(this.tsKey, this.timestamps.toString());
	}
    },
    timeRemaining : function(old) {
	return old - Date.now() + this.wait;
    },
    updateHTML : function() {
	this.content.innerHTML = this.cur;
	this.content.dispatchEvent(new Event('change', { 'bubbles' : true }));
    }
};
