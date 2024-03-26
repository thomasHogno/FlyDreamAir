// Load header content
window.onload = function() {
    var header = document.getElementById("header");
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            header.innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", "header.html", true);
    xhttp.send();
};