window.onload = pageLoad;
function pageLoad(){
    var khodpum = document.getElementById("display");
	khodpum.onsubmit = checkregister
}

function checkregister() {
    let pass =document.forms["display"]["password"].value.trim();
    let repass =document.forms["display"]["rePassword"].value.trim();
    if (pass !== repass) {
        displayErrorMessage("**wrong password**");
        return false;
    }
    return true;
}

function displayErrorMessage(message) {
    document.getElementById("errormsg").innerHTML = message;
}