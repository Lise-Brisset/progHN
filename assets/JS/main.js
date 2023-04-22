let text_tokens = [];
let text_lines = [];


window.onload = function() {
    let fileInput = document.getElementById('fileInput');
    let fileDisplayArea = document.getElementById('fileDisplayArea');

    // On "écoute" si le fichier donné a été modifié.
    // Si on a donné un nouveau fichier, on essaie de le lire.
    fileInput.addEventListener('change', function(e) {
        // Dans le HTML (ligne 22), fileInput est un élément de tag "input" avec un attribut type="file".
        // On peut récupérer les fichiers données avec le champs ".files" au niveau du javascript.
        // On peut potentiellement donner plusieurs fichiers,
        // mais ici on n'en lit qu'un seul, le premier, donc indice 0.
        let file = fileInput.files[0];
        // on utilise cette expression régulière pour vérifier qu'on a bien un fichier texte.
        let textType = new RegExp("text.*");

        if (file.type.match(textType)) { // on vérifie qu'on a bien un fichier texte
            // lecture du fichier. D'abord, on crée un objet qui sait lire un fichier.
            var reader = new FileReader();

            // on dit au lecteur de fichier de placer le résultat de la lecture
            // dans la zone d'affichage du texte.
            reader.onload = function(e) {
                fileDisplayArea.innerText = reader.result;
                segmentation();

                if (text_tokens.length != 0) {
                    document.getElementById("logger").innerHTML = '<span class="infolog">Fichier chargé avec succès, ' + text_tokens.length + ' tokens dans le texte et ' + text_lines.length + ' lignes non vides.</span>';
                }
            }

            // on lit concrètement le fichier.
            // Cette lecture lancera automatiquement la fonction "onload" juste au-dessus.
            reader.readAsText(file);
        } else { // pas un fichier texte : message d'erreur.
            fileDisplayArea.innerText = "";
            text_tokens = [];
            text_lines = [];
            document.getElementById("logger").innerHTML = '<span class="errorlog">Type de fichier non supporté !</span>';
        }
    });
}


function afficheCacheAide() {
    let aide = document.getElementById("aide");
    let boutonAide = document.getElementById("boutonAide");
    let display = aide.style.display;
    
    if (display === "none") {
        aide.style.display = "block";
        boutonAide.innerText = "Cacher l'aide";
    } else {
        aide.style.display = "none";
        boutonAide.innerText = "Afficher l'aide";
    }
}


function segmentation() {
    let text = document.getElementById("fileDisplayArea").innerText;
    let delim = document.getElementById("delimID").value;
    
    if (delim === "") {
        document.getElementById("logger").innerHTML = '<span class="errorlog">Aucun délimiteur donné !</span>'
        return;
    }

    let regex_delim = new RegExp(
        "["
        + delim
            .replace("-", "\\-") // le tiret n'est pas à la fin : il faut l'échapper, sinon erreur sur l'expression régulière
            .replace("[", "\\[").replace("]", "\\]") // à changer sinon regex fautive, exemple : [()[]{}] doit être [()\[\]{}], on doit "échapper" les crochets, sinon on a un symbole ] qui arrive trop tôt.
        + "\\s" // on ajoute tous les symboles d'espacement (retour à la ligne, etc)
        + "]+" // on ajoute le + au cas où plusieurs délimiteurs sont présents : évite les tokens vides
    );

    let tokens_tmp = text.split(regex_delim);
    text_tokens = tokens_tmp.filter(x => x.trim() != ''); // on s'assure de ne garder que des tokens "non vides"
    
    text_lines = text.split(new RegExp("[\\r\\n]+")).filter(x => x.trim() != '');

    // global_var_tokens = tokens; // décommenter pour vérifier l'état des tokens dans la console développeurs sur le navigateur
    // display.innerHTML = tokens.join(" ");
}


function dictionnaire() {
    let comptes = new Map();
    let display = document.getElementById("page-analysis");

    if (text_tokens.length === 0) {
        document.getElementById("logger").innerHTML = '<span class="errorlog">Il faut d\'abord charger un fichier !</span>';
        return;
    }

    for (let token of text_tokens) {
        comptes.set(token, (comptes.get(token) ?? 0) + 1);
    }
    
    let comptes_liste = Array.from(comptes);
    comptes_liste = comptes_liste.sort(function(a, b) {
        // solution attendue
        return b[1] - a[1]; // tri numérique inversé

        /*
         * // solution alternative
         * // on trie sur les comptes en priorité
         * // puis, pour les comptes identiques, on trie sur la forme
         * let a_form = a[0];
         * let a_count = a[1];
         * let b_form = b[0];
         * let b_count = b[1];
         * let comparaison = 0;
         *
         * // utiliser +2 et -2 permet de donner plus de poids aux comptes (permet le trie du plus fréquent au moins fréquent)
         * if (a_count < b_count) {
         *     comparaison += 2;
         * } else if (a_count > b_count) {
         *     comparaison -= 2;
         * }
         * // -1 et +1 permettent d'ajuster le tri en cas de comptes égaux, mais ne peut pas inverser l'ordre pour des comptes différents
         * if (a_form < b_form) {
         *     comparaison -= 1;
         * } else if (a_form > b_form) {
         *     comparaison += 1;
         * }
         *
         * return comparaison;
         */
    });

    let table = document.createElement("table");
    table.style.margin = "auto";
    let entete = table.appendChild(document.createElement("tr"));
    entete.innerHTML = "<th>mot</th><th>compte</th>";
    
    for (let [mot, compte] of comptes_liste) {
        let ligne_element = table.appendChild(document.createElement("tr"));
        let cellule_mot = ligne_element.appendChild(document.createElement("td"));
        let cellule_compte = ligne_element.appendChild(document.createElement("td"));
        cellule_mot.innerHTML = mot;
        cellule_compte.innerHTML = compte;
    }

    display.innerHTML = "";
    display.appendChild(table);
    document.getElementById("logger").innerHTML = '';
}


function grep() {
    let pole = document.getElementById("poleID").value.trim();
    let display = document.getElementById("page-analysis");
    
    if (text_lines.length === 0) {
        // pas de lignes: erreur
        document.getElementById("logger").innerHTML = '<span class="errorlog">Il faut d\'abord charger un fichier !</span>';
        return;
    }

    if (pole === '') {
        // pas de pôle: erreur
        document.getElementById("logger").innerHTML = '<span class="errorlog">Le pôle n\'est pas renseigné !</span>';
        return;
    }
    let pole_regex = new RegExp('(' + pole + ')', "g");

    display.innerHTML = "";
    for (let line of text_lines) {
        if (line.search(pole_regex) != -1) {
            let paragraph = document.createElement("p");
            paragraph.innerHTML = line.replaceAll(pole_regex, '<span style="color:red;">$1</span>')
            display.appendChild(paragraph);
        }
    }
}

function concordancier() 
{
    let pole = document.getElementById("poleID").value.trim();
    let display = document.getElementById("page-analysis");

    if (text_tokens.length === 0) {
        // pas de lignes: erreur
        document.getElementById("logger").innerHTML = '<span class="errorlog">Il faut d\'abord charger un fichier !</span>';
        return;
    }

    if (pole === '') {
        // pas de pôle: erreur
        document.getElementById("logger").innerHTML = '<span class="errorlog">Le pôle n\'est pas renseigné !</span>';
        return;
    }

    let pole_regex = new RegExp("^" + pole + "$", "g");
    let tailleContexte = Number(document.getElementById('lgID').value ?? "10");

    let table = document.createElement("table");
    table.style.margin = "auto";
    let entete = table.appendChild(document.createElement("tr"));
    entete.innerHTML = "<th>contexte gauche</th><th>pôle</th><th>contexte droit</th>";

    display.innerHTML = "";
    for (let i=0; i < text_tokens.length; i++) {
        if (text_tokens[i].search(pole_regex) != -1) {
            let start = Math.max(i - tailleContexte, 0);
            let end = Math.min(i + tailleContexte, text_tokens.length);
            let lc = text_tokens.slice(start, i);
            let rc = text_tokens.slice(i+1, end+1);
            let row = document.createElement("tr");

            // manière fainéante
            row.appendChild(document.createElement("td"));
            row.childNodes[row.childNodes.length - 1].innerHTML = lc.join(' ');
            row.appendChild(document.createElement("td"));
            row.childNodes[row.childNodes.length - 1].innerHTML = text_tokens[i];
            row.appendChild(document.createElement("td"));
            row.childNodes[row.childNodes.length - 1].innerHTML = rc.join(' ');
            table.appendChild(row);
        }
    }

    display.innerHTML = "";
    display.appendChild(table);
}

// IDEES POUR LES PRICHAINES FONCTIONS : maj/min du texte ; Calculer le nombre de phrases ; Afficher un tableau des verbes et/ou adverbes ; Trouver tous les noms propres du texte

function minuscule()
{
	// je récupère le texte pour le placer dans une variable
	let texte = document.getElementById("fileDisplayArea").innerHTML;
	let minuscule = texte.toLowerCase();
	// Après avoir passé le texte en minuscules je l'affiche dans la div page-analysis.
	document.getElementById("page-analysis").innerHTML = minuscule;
}

function majuscule()
{
	// je récupère le texte pour le placer dans une variable
	let texte = document.getElementById("fileDisplayArea").innerHTML;
	let majuscule = texte.toUpperCase();
	// Après avoir passé le texte en majuscules je l'affiche dans la div page-analysis.
	document.getElementById("page-analysis").innerHTML = majuscule;
}

function nbrPhrases() 
{
	// Je place le contenu du texte dans une variable pour y effectuer le changements necessaires.
	let texte = document.getElementById("fileDisplayArea").innerHTML;
	// Je déclare l'expression régulière permettant de reconaitre une phrase.
	// let regex_phrase = new RegExp("^.+\.$");
	let liste_phrase = [];
	// Je place tous les matchs dans une liste.
	liste_phrase = [...texte.matchAll("[.+|!+|?+]")];
	// Je viens compter le nombre d'éléments dans la liste.
	let nbr_phrase = liste_phrase.length;
	// J'affiche le résultat dans la div page-analysis.
	document.getElementById("page-analysis").innerHTML = "<center><p>Il y a <b>" + nbr_phrase + "</b> phrases dans le texte.</p></center>";
	console.log(nbr_phrase);
	console.log(liste_phrase);
	
	// J'effectue le même traitement pour calculer le nombre de phrases interrogatives : 
	let liste_inter = [];
	liste_inter = [...texte.matchAll("[?+]")];
	let nbr_inter = liste_inter.length;
	document.getElementById("page-analysis").innerHTML += "<center><p>Il y a <b>" + nbr_inter + "</b> phrases interrogatives dans le texte.</p></center>";
	console.log(nbr_inter);
	console.log(liste_inter);

	// J'effectue le même traitement pour calculer le nombre de phrases exclamatives : 
	let liste_excla = [];
	liste_excla = [...texte.matchAll("[!+]")];
	let nbr_excla = liste_excla.length;
	document.getElementById("page-analysis").innerHTML += "<center><p>Il y a <b>" + nbr_excla + "</b> phrases exclamatives dans le texte.</p></center>";
	console.log(nbr_excla);
	console.log(liste_excla);

	// J'effectue le même traitement pour calculer le nombre de phrases déclaratives : 
	let liste_decla = [];
	liste_decla = [...texte.matchAll("[.]")];
	let nbr_decla = liste_decla.length;
	document.getElementById("page-analysis").innerHTML += "<center><p>Il y a <b>" + nbr_decla + "</b> phrases déclaratives dans le texte.</p></center>";
	console.log(nbr_decla);
	console.log(liste_decla);
}


// Les deux fonctions suivantes n'ont pas abouti. Je préfère tout de même en garder une trace en les laissant en commentaires.

function adverbes()
{
	// let display = document.getElementById("page-analysis");
	// let regex_adv = new RegExp('\\b\\w+e?ment\\b', "g");
	// let text = document.getElementById"fileDisplayArea").innerText;
	// text_lines = text.split(new RegExp("[\\r\\n]+")).filter(x => x.trim() != '');
	// let tableaux_adv = "";
	// tableaux_adv += "<tr><td>Indexe</td><td>Forme adverbe</td></tr>";
	// let indexe = 0;
	// let adverbe = "";
	
	// display.innerHTML = "";
	

	// if (text.matchAll(regex_adv) != -1) 
	// {
		// let adverbe = text.shift();
		// tableaux_adv += "<tr><td>" + indexe + "</td><td>" + adverbe + "</td></tr>";
		// display.innerHTML = tableaux_adv;
		// indexe = indexe + 1 ;
		// console.log(adverbe);
			
			// for(let item in array)
			// {
				// adverbe = item[0];
				// tableaux_adv += "<tr><td>" + indexe + "</td><td>" + item[0] + "</td></tr>";
				// display.innerHTML = tableaux_adv;
				// indexe = indexe + 1 ;
			// }
	// }

	
	// for (let line of text_lines)
	// {
		// if (line.search(regex_adv) != -1) 
		// {
			// let adverbe = line.replaceAll(regex_adv, "$1");
			// tableaux_adv += "<tr><td>" + indexe + "</td><td>" + adverbe + "</td></tr>";
			// display.innerHTML = tableaux_adv;
			// indexe = indexe + 1 ;
		// }
	// }
    
	// for (let line of text_lines) 
	// {
        // if (line.search(regex_adv) != -1) {
            // let table_adv = document.createElement("table");
            // table_adv.innerHTML = line.replaceAll(regex_adv, "<tr><td>" + indexe + "</td><td>$1</td></tr>");
            // display.appendChild(table_adv);
			// indexe = indexe + 1 ;
		// }
	// }
}

/* matchAll  + for item in array, recupérer item 0
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll */

function nomsPropres()
{
	// let display = document.getElementById("page-analysis");
	// let text = document.getElementById("fileDisplayArea").innerText;
	// let regex_np = new RegExp('(\b[A-Z][a-z]*\b)', "g");
	// segmentation();
	// for (let nomsP of text_tokens)
	// {
		// if (nomsP.search(regex_np) != -1)
		// {
			// let liste_np = document.createElement("ul");
			// liste_np.innerHTML = nomsP;
			// display.appendChild(liste_np);
		// }
	// }
}
