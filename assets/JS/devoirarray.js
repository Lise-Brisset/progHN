function exercice1() {
	let tableau = ["A", "B", "C", "D", "E", "F", "G"];
	let valeur = tableau.pop();
	tableau.unshift(valeur);
	document.getElementById('exercice1Resultat').innerHTML = tableau;
}


function exercice2() {
	let texte = document.getElementById("texteExercice2").value;
	let monTableau = texte.split(" ");
	
	let elements_tableau = [];
	monTableau.forEach(function (element) 
	{
		elements_tableau.push(element.toUpperCase());
	}
	);	
	
	document.getElementById('exercice2Resultat').innerHTML = elements_tableau;
}


function exercice3() {
	let texte2 = document.getElementById("texteExercice3").value;
	let texte2_nettoye = texte2.replace(/[,|.|"|"]/g,"");
	texte2_nettoye = texte2_nettoye.replace(/[']/g," ");
	let monTableau2 = texte2_nettoye.split(" ");
	let tableau_modifie = monTableau2.filter(element => element.length >3);
	document.getElementById('exercice3Resultat').innerHTML = tableau_modifie;
}


function exercice4() {
	let texte3 = document.getElementById("texteExercice4").value;
	let monTableau3 = texte3.split(" ");
	
	let div_exo4 = "<table>";
	monTableau3.forEach(function (element)
	{
		div_exo4 += "<tr><td>" + element + "</td></tr>";
	}
	);
	div_exo4 += "</table>";
	
	document.getElementById("exercice4Resultat").innerHTML = div_exo4;
}
