/**
 * Enregistre les réponses du questionnaire Vico dans l'onglet « Réponses » de la feuille « Chips vico ».
 * Copie du script installé dans Extensions > Apps Script de la feuille, déployé en « Application Web »
 * (Exécuter en tant que : moi ; Qui a accès : tout le monde).
 * Aucune adresse IP ni identité n'est enregistrée : seulement les colonnes envoyées par la page.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Réponses') || ss.insertSheet('Réponses');
    if (sheet.getLastRow() === 0) sheet.appendRow(data.colonnes);
    sheet.appendRow(data.ligne);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Pour vérifier que l'application web répond (ouvrir l'URL dans un navigateur).
function doGet() {
  return ContentService.createTextOutput('Questionnaire Vico : enregistrement actif');
}
