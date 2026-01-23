// === CONFIG ===
const SHEET_ID   = "1v0o3UYb_n9MLrqJoB5Y_n_64zOGgguRrE8hViVkaQDk";
const SHEET_NAME = "Inscriptions";
const HEADERS    = ["created_at","email","country_iso2","interest","interest_code","lang","user_agent"];

function doGet() {
  return ContentService
    .createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Mapping des choix vers des chiffres
function interestCode_(interest) {
  const code = String(interest || "").toLowerCase().trim();
  switch (code) {
    case "follow":
    case "group":
      return 1;  // suivre cette initiative
    case "propose":
      return 2;  // Proposer une initiative
    case "partner":
      return 3;  // Devenir partenaire
    case "funder":
      return 4;  // Devenir financeur
    case "support":
      return 5;  // Soutenir ou accompagner l'initiative
    case "events":
      return 6;  // Être informé des rencontres et événements
    case "observer":
      return 7;  // Observateur / Suivi institutionnel
    default:
      return 0;  // Inconnu
  }
}

// Mapping lisible des intérêts
function interestLabel_(code) {
  switch ((code || "").toLowerCase()) {
    case "follow":
    case "group":
      return "Suivre cette initiative";
    case "propose":
      return "Proposer une initiative";
    case "partner":
      return "Devenir partenaire";
    case "funder":
      return "Devenir financeur";
    case "support":
      return "Soutenir ou accompagner l'initiative";
    case "events":
      return "Être informé des rencontres et événements";
    case "observer":
      return "Observateur / Suivi institutionnel";
    default:
      return String(code || "").trim();
  }
}

// Mapping ISO2 vers nom complet du pays
function countryName_(iso2) {
  if (!iso2 || typeof iso2 !== 'string') return iso2 || '';
  
  const code = String(iso2).trim().toUpperCase();
  const countries = {
    "AD": "Andorre", "AE": "Émirats arabes unis", "AF": "Afghanistan", "AG": "Antigua-et-Barbuda",
    "AI": "Anguilla", "AL": "Albanie", "AM": "Arménie", "AO": "Angola", "AQ": "Antarctique",
    "AR": "Argentine", "AS": "Samoa américaines", "AT": "Autriche", "AU": "Australie",
    "AW": "Aruba", "AX": "Îles Åland", "AZ": "Azerbaïdjan", "BA": "Bosnie-Herzégovine",
    "BB": "Barbade", "BD": "Bangladesh", "BE": "Belgique", "BF": "Burkina Faso",
    "BG": "Bulgarie", "BH": "Bahreïn", "BI": "Burundi", "BJ": "Bénin",
    "BL": "Saint-Barthélemy", "BM": "Bermudes", "BN": "Brunei", "BO": "Bolivie",
    "BQ": "Pays-Bas caribéens", "BR": "Brésil", "BS": "Bahamas", "BT": "Bhoutan",
    "BV": "Île Bouvet", "BW": "Botswana", "BY": "Biélorussie", "BZ": "Belize",
    "CA": "Canada", "CC": "Îles Cocos", "CD": "République démocratique du Congo",
    "CF": "République centrafricaine", "CG": "Congo", "CH": "Suisse", "CI": "Côte d'Ivoire",
    "CK": "Îles Cook", "CL": "Chili", "CM": "Cameroun", "CN": "Chine",
    "CO": "Colombie", "CR": "Costa Rica", "CU": "Cuba", "CV": "Cap-Vert",
    "CW": "Curaçao", "CX": "Île Christmas", "CY": "Chypre", "CZ": "République tchèque",
    "DE": "Allemagne", "DJ": "Djibouti", "DK": "Danemark", "DM": "Dominique",
    "DO": "République dominicaine", "DZ": "Algérie", "EC": "Équateur", "EE": "Estonie",
    "EG": "Égypte", "EH": "Sahara occidental", "ER": "Érythrée", "ES": "Espagne",
    "ET": "Éthiopie", "FI": "Finlande", "FJ": "Fidji", "FK": "Îles Malouines",
    "FM": "Micronésie", "FO": "Îles Féroé", "FR": "France", "GA": "Gabon",
    "GB": "Royaume-Uni", "GD": "Grenade", "GE": "Géorgie", "GF": "Guyane française",
    "GG": "Guernesey", "GH": "Ghana", "GI": "Gibraltar", "GL": "Groenland",
    "GM": "Gambie", "GN": "Guinée", "GP": "Guadeloupe", "GQ": "Guinée équatoriale",
    "GR": "Grèce", "GS": "Géorgie du Sud-et-les Îles Sandwich du Sud", "GT": "Guatemala",
    "GU": "Guam", "GW": "Guinée-Bissau", "GY": "Guyane", "HK": "Hong Kong",
    "HM": "Îles Heard-et-MacDonald", "HN": "Honduras", "HR": "Croatie", "HT": "Haïti",
    "HU": "Hongrie", "ID": "Indonésie", "IE": "Irlande", "IL": "Israël",
    "IM": "Île de Man", "IN": "Inde", "IO": "Territoire britannique de l'océan Indien",
    "IQ": "Irak", "IR": "Iran", "IS": "Islande", "IT": "Italie",
    "JE": "Jersey", "JM": "Jamaïque", "JO": "Jordanie", "JP": "Japon",
    "KE": "Kenya", "KG": "Kirghizistan", "KH": "Cambodge", "KI": "Kiribati",
    "KM": "Comores", "KN": "Saint-Kitts-et-Nevis", "KP": "Corée du Nord",
    "KR": "Corée du Sud", "KW": "Koweït", "KY": "Îles Caïmans", "KZ": "Kazakhstan",
    "LA": "Laos", "LB": "Liban", "LC": "Sainte-Lucie", "LI": "Liechtenstein",
    "LK": "Sri Lanka", "LR": "Liberia", "LS": "Lesotho", "LT": "Lituanie",
    "LU": "Luxembourg", "LV": "Lettonie", "LY": "Libye", "MA": "Maroc",
    "MC": "Monaco", "MD": "Moldavie", "ME": "Monténégro", "MF": "Saint-Martin",
    "MG": "Madagascar", "MH": "Îles Marshall", "MK": "Macédoine du Nord",
    "ML": "Mali", "MM": "Myanmar", "MN": "Mongolie", "MO": "Macao",
    "MP": "Îles Mariannes du Nord", "MQ": "Martinique", "MR": "Mauritanie",
    "MS": "Montserrat", "MT": "Malte", "MU": "Maurice", "MV": "Maldives",
    "MW": "Malawi", "MX": "Mexique", "MY": "Malaisie", "MZ": "Mozambique",
    "NA": "Namibie", "NC": "Nouvelle-Calédonie", "NE": "Niger", "NF": "Île Norfolk",
    "NG": "Nigeria", "NI": "Nicaragua", "NL": "Pays-Bas", "NO": "Norvège",
    "NP": "Népal", "NR": "Nauru", "NU": "Niue", "NZ": "Nouvelle-Zélande",
    "OM": "Oman", "PA": "Panama", "PE": "Pérou", "PF": "Polynésie française",
    "PG": "Papouasie-Nouvelle-Guinée", "PH": "Philippines", "PK": "Pakistan",
    "PL": "Pologne", "PM": "Saint-Pierre-et-Miquelon", "PN": "Pitcairn",
    "PR": "Porto Rico", "PS": "Palestine", "PT": "Portugal", "PW": "Palaos",
    "PY": "Paraguay", "QA": "Qatar", "RE": "La Réunion", "RO": "Roumanie",
    "RS": "Serbie", "RU": "Russie", "RW": "Rwanda", "SA": "Arabie saoudite",
    "SB": "Îles Salomon", "SC": "Seychelles", "SD": "Soudan", "SE": "Suède",
    "SG": "Singapour", "SH": "Sainte-Hélène", "SI": "Slovénie", "SJ": "Svalbard et Jan Mayen",
    "SK": "Slovaquie", "SL": "Sierra Leone", "SM": "Saint-Marin", "SN": "Sénégal",
    "SO": "Somalie", "SR": "Suriname", "SS": "Soudan du Sud", "ST": "São Tomé-et-Príncipe",
    "SV": "Salvador", "SX": "Saint-Martin", "SY": "Syrie", "SZ": "Eswatini",
    "TC": "Îles Turques-et-Caïques", "TD": "Tchad", "TF": "Terres australes françaises",
    "TG": "Togo", "TH": "Thaïlande", "TJ": "Tadjikistan", "TK": "Tokelau",
    "TL": "Timor oriental", "TM": "Turkménistan", "TN": "Tunisie", "TO": "Tonga",
    "TR": "Turquie", "TT": "Trinité-et-Tobago", "TV": "Tuvalu", "TW": "Taïwan",
    "TZ": "Tanzanie", "UA": "Ukraine", "UG": "Ouganda", "UM": "Îles mineures éloignées des États-Unis",
    "US": "États-Unis", "UY": "Uruguay", "UZ": "Ouzbékistan", "VA": "Vatican",
    "VC": "Saint-Vincent-et-les-Grenadines", "VE": "Venezuela", "VG": "Îles Vierges britanniques",
    "VI": "Îles Vierges des États-Unis", "VN": "Viêt Nam", "VU": "Vanuatu",
    "WF": "Wallis-et-Futuna", "WS": "Samoa", "YE": "Yémen", "YT": "Mayotte",
    "ZA": "Afrique du Sud", "ZM": "Zambie", "ZW": "Zimbabwe"
  };
  const result = countries[code];
  return result || code;
}

// Formatage de la date et heure (format: YYYY-MM-DD HH:MM:SS) avec fuseau horaire Europe/Paris
function formatDateTime_(date) {
  const timezone = "Europe/Paris";
  const formatted = Utilities.formatDate(date, timezone, "yyyy-MM-dd HH:mm:ss");
  return formatted;
}

function doPost(e) {
  try {
    // ✅ Vérifier que e existe
    if (!e) {
      Logger.log("⚠️ doPost appelé sans paramètre (test depuis l'éditeur?)");
      return json_({ ok: false, error: "no_event_parameter", message: "doPost doit être appelé via HTTP POST" });
    }
    
    // ✅ Logging pour débogage
    Logger.log("=== doPost appelé ===");
    Logger.log("e existe: " + (e ? "oui" : "non"));
    Logger.log("e.parameter: " + (e.parameter ? JSON.stringify(e.parameter) : "undefined"));
    Logger.log("e.postData: " + (e.postData ? e.postData.contents : "null"));
    Logger.log("e.headers: " + (e.headers ? JSON.stringify(e.headers) : "undefined"));
    
    // ✅ Gestion des données POST (formulaire ou JSON)
    let body = {};
    
    // Priorité 1: e.parameter (formulaire HTML standard ou query string)
    if (e.parameter && Object.keys(e.parameter).length > 0) {
      body = e.parameter;
      Logger.log("Données reçues via e.parameter: " + Object.keys(body).length + " champs");
    }
    // Priorité 2: e.postData (JSON ou form-urlencoded)
    else if (e.postData && e.postData.contents) {
      Logger.log("Données reçues via e.postData");
      const contentType = e.postData.type || "";
      Logger.log("Content-Type: " + contentType);
      
      if (contentType.indexOf('application/json') !== -1 || e.postData.contents.trim().startsWith('{')) {
        // JSON POST
        try {
          body = JSON.parse(e.postData.contents);
          Logger.log("Données parsées comme JSON: " + Object.keys(body).length + " champs");
        } catch (parseErr) {
          Logger.log("Erreur parsing JSON: " + parseErr.toString());
          Logger.log("Contenu reçu: " + e.postData.contents.substring(0, 200));
        }
      } else {
        // Form data (application/x-www-form-urlencoded ou multipart/form-data)
        try {
          const postData = e.postData.contents;
          Logger.log("Parsing form data, longueur: " + postData.length);
          
          // Essayer d'abord comme form-urlencoded simple
          if (postData.indexOf('&') !== -1 || postData.indexOf('=') !== -1) {
            const params = postData.split('&');
            params.forEach(function(param) {
              const pair = param.split('=');
              if (pair.length === 2) {
                body[decodeURIComponent(pair[0].replace(/\+/g, ' '))] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
              }
            });
            Logger.log("Données parsées comme form-urlencoded: " + Object.keys(body).length + " champs");
          } else {
            Logger.log("Format de données non reconnu");
          }
        } catch (parseErr) {
          Logger.log("Erreur parsing form data: " + parseErr.toString());
          Logger.log("Contenu reçu: " + e.postData.contents.substring(0, 200));
        }
      }
    }
    // Si aucune donnée n'est trouvée, essayer de combiner les deux
    else if (e.parameter) {
      body = e.parameter || {};
      Logger.log("Utilisation de e.parameter comme fallback");
    }
    
    Logger.log("Body final: " + JSON.stringify(body));
    
    // Vérifier si on a reçu des données
    if (!body || Object.keys(body).length === 0) {
      Logger.log("⚠️ AUCUNE DONNÉE REÇUE - Le formulaire n'envoie peut-être pas les données correctement");
      return json_({ 
        ok: false, 
        error: "no_data_received",
        debug: {
          hasParameter: !!e.parameter,
          hasPostData: !!(e.postData && e.postData.contents),
          postDataType: e.postData ? e.postData.type : null
        }
      });
    }

    // ✅ Honeypot anti-spam
    if (body.hp && String(body.hp).trim().length > 0) {
      Logger.log("Requête ignorée (honeypot détecté)");
      return json_({ ok: true, ignored: true });
    }

    const email     = String(body.email || "").trim();
    const country   = String(body.country || "").trim().toUpperCase(); // ISO2
    const interest  = String(body.interest || "").trim();             // follow | group | propose | partner | funder | support | events | observer
    const lang      = String(body.lang || "fr").trim().slice(0, 2);
    const createdAt = new Date();
    const ua        = String((e.headers && e.headers["User-Agent"]) || (e.headers && e.headers["user-agent"]) || "");

    Logger.log("Données extraites - email: " + email + ", country: " + country + ", interest: " + interest);

    // ✅ Validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Logger.log("Validation échouée: email invalide");
      return json_({ ok: false, error: "invalid_email" });
    }

    if (!country || country.length !== 2) {
      Logger.log("Validation échouée: pays invalide (" + country + ")");
      return json_({ ok: false, error: "invalid_country", received: country });
    }

    // Validation des intérêts (mise à jour avec tous les choix possibles)
    const validInterests = ["follow", "group", "propose", "partner", "funder", "support", "events", "observer"];
    if (!validInterests.includes(interest)) {
      Logger.log("Validation échouée: intérêt invalide (" + interest + ")");
      return json_({ ok: false, error: "invalid_interest", received: interest });
    }

    // ✅ Accès au Google Sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      Logger.log("Feuille créée: " + SHEET_NAME);
    }

    // ✅ Création de l'en-tête si nécessaire
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      Logger.log("En-têtes créés");
    }

    // ✅ Calculer le code numérique de l'intérêt
    const interestCode = interestCode_(interest);
    const interestLabel = interestLabel_(interest);
    const countryFullName = countryName_(country);
    const formattedDateTime = formatDateTime_(createdAt);
    
    Logger.log("Données à écrire - pays: " + country + " -> " + countryFullName);
    Logger.log("Intérêt: " + interest + " -> Code: " + interestCode + ", Label: " + interestLabel);
    Logger.log("Date formatée: " + formattedDateTime);
    
    // ✅ Écriture avec nom de pays complet, date/heure formatée et code numérique
    const rowData = [
      formattedDateTime,
      email,
      countryFullName,
      interestLabel,
      interestCode,  // NOUVELLE COLONNE : Code numérique (1, 2, 3, 4, 5, 6, ou 7)
      lang,
      ua
    ];
    
    Logger.log("Ajout de la ligne...");
    sheet.appendRow(rowData);
    Logger.log("✅ Ligne ajoutée avec succès. Total lignes: " + sheet.getLastRow());

    return json_({ ok: true, message: "Inscription enregistrée avec succès", rows: sheet.getLastRow(), interestCode: interestCode });

  } catch (err) {
    // Logger l'erreur pour le débogage
    Logger.log("=== ERREUR doPost ===");
    Logger.log("Erreur: " + err.toString());
    Logger.log("Stack: " + err.stack);
    Logger.log("Type: " + typeof err);
    return json_({ ok: false, error: String(err), details: err.stack });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fonction de test pour vérifier que l'ajout fonctionne
function testAddRow() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    
    const testData = [
      formatDateTime_(new Date()),
      "test@example.com",
      countryName_("FR"),
      interestLabel_("group"),
      interestCode_("group"),  // Code numérique : 1
      "fr",
      "Test User-Agent"
    ];
    
    sheet.appendRow(testData);
    Logger.log("Test réussi : ligne ajoutée");
    Logger.log("Nombre de lignes totales : " + sheet.getLastRow());
    return "Test réussi : " + sheet.getLastRow() + " lignes dans la feuille";
  } catch (err) {
    Logger.log("Erreur test : " + err.toString());
    return "Erreur : " + err.toString();
  }
}
