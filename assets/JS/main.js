let text_tokens = [];


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
				segmentation_ligne();
                document.getElementById("logger").innerHTML = '<span class="infolog">Fichier chargé avec succès, ' + text_tokens.length + ' tokens dans le texte. </br>Il y a '+texte_en_ligne.length + ' lignes dans le texte chargé.</span>';
            }

            // on lit concrètement le fichier.
            // Cette lecture lancera automatiquement la fonction "onload" juste au-dessus.
            reader.readAsText(file);
        } else { // pas un fichier texte : message d'erreur.
            fileDisplayArea.innerText = "";
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
    let display = document.getElementById("page-analysis");

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

    // global_var_tokens = tokens; // décommenter pour vérifier l'état des tokens dans la console développeurs sur le navigateur
    // display.innerHTML = tokens.join(" ");
}

function segmentation_ligne() {
	let textA = document.getElementById("fileDisplayArea").innerText;
	texte_en_ligne = textA.split("</br>");
	/** ici j'ai mis une variable générale pour pouvoir l'utiliser ailleurs dans le programme, ex : dans le message qui indique le nombre de lignes **/
}
/** cette fonction focntionne mais pas sur tous les fichiers pour certains elle affiche "1 ligne" **/


function dictionnaire() {
	if (document.getElementById("delimID")='')
	{
		alert("Attention, vous n'avez pas renseigné le(s) délimiteur(s) !")
	}
	
	else 
	{
		let comptes = new Map();
		let display = document.getElementById("page-analysis");

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

		display.appendChild(table);
	}
}


function grep() {
	if (document.getElementById("poleID").value ='')
	{
		alert("Attention, aucun pôle n'a été renseigné !");
	}
	else 
	{
		texte_en_ligne.forEach(function(ligne)
		{
			let pole = document.getElementById("poleID").innerHTML;
			let myReg = new RegExp(pole, "g");
			if (ligne.search(myReg) == true) 
			{
				document.getElementById("page-analysis").innerHTML = "<p style='color:red'>" + ligne + "</p>";
			}
			// else 
			// {
				// continue;
			// }
		}
	);
	}
}

/** ici ma ligne ne s'affiche pas dans la div id="page-analysis" **/
/** l'alert ne s'affiche pas non plus **/






