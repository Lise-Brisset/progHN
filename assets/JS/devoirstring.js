// exercice 1
function prenom() {
    // on récupère le prénom on le met dans l'élément avec id holder1
	document.getElementById('holder1').innerHTML = document.getElementById("prenom").value;
}

function nomdefamille() {
    // on récupère le nom on le met dans l'élément avec id holder1
    document.getElementById('holder1').innerHTML = document.getElementById("nomdefamille").value;
}

function nomcomplet() {
    // on concatène prénom et nom pour afficher le nom entier et on met le résultat dans l'élément avec id holder1
    document.getElementById('holder1').innerHTML = document.getElementById("prenom").value.concat(" ",document.getElementById("nomdefamille").value);
}


// exercice 2
function segmentText() {
    // on récupère le texte de l'élément d'id texte, on le découpe et on le place dans l'élément avec id holder2
	var texte = document.getElementById("texte").value;
	texte = texte.toLowerCase();
	var texte_nettoye = texte.replace(/[,|.|"|"]/g,"");
	texte_nettoye = texte_nettoye.replace(/[']/g," ");
    document.getElementById("holder2").innerHTML = texte_nettoye.split(new RegExp(" "));
}
