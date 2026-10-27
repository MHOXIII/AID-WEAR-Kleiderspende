/* Bestätigung für Spendenregistrierung */

(function () {
  const box = document.getElementById('confirmation-box');
  if (!box) return;

  const raw = sessionStorage.getItem('aidwear-bestaetigung');

  if (!raw) {
    box.innerHTML = `
      <div class="confirmation-empty">
        <h2>Keine Registrierung gefunden</h2>
        <p>Es liegt aktuell keine abgeschlossene Registrierung vor. Bitte fülle zunächst das Formular aus.</p>
        <a class="button" href="spende.html">Zur Registrierung</a>
      </div>
    `;
    return;
  }

  let daten;
  try {
    daten = JSON.parse(raw);
  } catch (err) {
    box.innerHTML = `
      <div class="confirmation-empty">
        <h1>Registrierung konnte nicht geladen werden</h1>
        <p>Bitte fülle das Formular erneut aus.</p>
        <a class="button" href="spende.html">Zur Registrierung</a>
      </div>
    `;
    return;
  }

  const uebergabeText = daten.uebergabe === 'Abholung'
    ? 'Abholung durch Sammelfahrzeug'
    : 'Abgabe an der Geschäftsstelle';

  const telefonZeile = daten.telefon ? `<br>${daten.telefon}` : '';

  // Adresse nur anzeigen, wenn tatsächlich vorhanden.

  const adresseBlock = (daten.adresseZeile1 || daten.adresseZeile2)
    ? `${daten.adresseZeile1}<br>${daten.adresseZeile2}<br><br>`
    : '';

  const abholungHinweis = daten.uebergabe === 'Abholung'
    ? '<br><br>Ein Mitarbeiter wird Dich zeitnah telefonisch kontaktieren, um einen Abholtermin zu vereinbaren.'
    : '';

  box.innerHTML = `
    <div class="confirmation-success">
      Die Registrierung war erfolgreich.
    </div>

    <div class="confirmation-summary">
      <h2>Zusammenfassung deiner Angaben</h2>

      <dl class="confirmation-list">
        <div class="confirmation-row">
          <dt>Spendenziel</dt>
          <dd>${daten.krisengebiet}</dd>
        </div>

        <div class="confirmation-row">
          <dt>Kleidung</dt>
          <dd>${daten.kleidung.join(', ')}</dd>
        </div>

        <div class="confirmation-row">
          <dt>Übergabe</dt>
          <dd>${uebergabeText}${abholungHinweis}</dd>
        </div>

        <div class="confirmation-row">
          <dt>Kontaktdaten</dt>
          <dd>
            ${daten.vorname} ${daten.nachname}<br>
            ${adresseBlock}${daten.email}${telefonZeile}
          </dd>
        </div>

        <div class="confirmation-row">
          <dt>Zeitstempel</dt>
          <dd>${daten.datum}, ${daten.uhrzeit} Uhr</dd>
        </div>
      </dl>
    </div>
  `;
})();
