function handleSubmission(event) {
    var file = event.target.files[0];
    if(!file){ return; }

    var formData = new FormData();
    formData.append("file", file);
    formData.append("language", "eng");
    formData.append("apikey", "helloworld");
    formData.append("isOverlayRequired", True);

    var xhttp;    
    if(window.XMLHttpRequest){
	xhttp = new XMLHttpRequest();
    }
    else{
	xhttp = new ActiveObject("Microsoft.XMLHTTP");
    }
    xhttp.open("POST", "https://api.ocr.space/parse/image", true);
    xhttp.send(formData);
    
    document.getElementById("auto").innerHTML = xhttp.responseText;
}

document.getElementById("profile-submit").
    addEventListener('submit', handleSubmission, false);
