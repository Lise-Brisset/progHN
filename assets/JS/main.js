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

function concordencier() 
{
    let pole = document.getElementById("poleID").value.trim();
    let longueur = document.getElementById("lgID").value.trim();
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
    let pole_regex = new RegExp('(".{'+ longueur +'})(' + pole + ')(.{' + longueur + '})")', "g");
	let partieGauche = pole_regex.replace(pole_regex,"\1");
	let partieDroite = pole_regex.replace(pole_regex,"\3");

	var table='';
    table += '<table align="center" class="myTable">';
    table += '<tr><th><b>Concordance</b></th></tr><tr>';
	table +='    <th>Indice</th>';
    table +='    <th>Contexte de gauche</th>';
    table +='    <th>Pôle</th>';
    table +='    <th>Contexte de droite</th>';
    table += '</tr>';
	
	let lignesTexte = document.getElementById("fileDisplayArea").innerHTML;
	lignesTexte = lignesTexte.split("\n");
	let indice = 0;
	
    display.innerHTML = "";
	
	if (document.getElementById("lgID").value =="")
	{
		alert("Attention, vous devez entrer une longeur !");
		return;
	};
	
	if (document.getElementById("poleID").value =="")
	{
		alert("Attention, vous devez entrer un pôle !");
		return;
	};
	
    for (let line of text_lines) 
	{
		if (line.search(pole_regex) != -1) 
		{
			table += '<tr><td>' + indice + '</td>';
			table += '<td>' + line.replaceAll(pole_regex,partieGauche) +'</td>';
			table += '<td>' + pole +'</td>';
			table += '<td>' + line.replaceAll(pole_regex,partieDroite) +'</td>';
			table += '</tr>'
			indice = indice + 1;
		}
	}
}

// IDEES POUR LES PRICHAINES FONCTIONS : maj/min du texte ; Calculer le nombre de phrases ; Afficher un tableau des verbes et/ou adverbes ; Trouver tous les noms propres du texte