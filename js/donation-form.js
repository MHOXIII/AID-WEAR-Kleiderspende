/* Spendenformular validieren und absenden */

(function () {
  const GESCHAEFTSSTELLE = {
    plzPrefix: '59'
  };

  const form = document.getElementById('donation-form');
  if (!form) return;

  const plzInput = document.getElementById('plz');
  const hausnrInput = document.getElementById('hausnr');

  // Telefonnummer ist nur bei "Abholung" verpflichtend
  const pickupFieldIds = ['strasse', 'hausnr', 'plz', 'ort', 'telefon'];

  // Erstes Zeichen muss eine Ziffer sein, danach sind Ziffern, Buchstaben und Trennstriche erlaubt.
  const HAUSNR_MUSTER = /^\d[0-9a-zA-ZÄÖÜäöüß-]*$/;

  // Telefonnummer: "+" kann optional gesetzt werden, danach Ziffern, Leerzeichen und Bindestriche.
  const TELEFON_MUSTER = /^\+?\d[\d\s-]*$/;

  function uebergabeWert() {
    const checked = form.querySelector('input[name="uebergabe"]:checked');
    return checked ? checked.value : null;
  }

  function istAbholung() {
    return uebergabeWert() === 'Abholung';
  }

  // Pflichtfelder für die Abholadresse nur aktivieren, wenn "Abholung" gewählt ist
  function pflichtfelderAktualisieren() {
    pickupFieldIds.forEach(id => {
      document.getElementById(id).required = istAbholung();
    });
  }

  form.addEventListener('change', e => {
    if (e.target.name === 'uebergabe') {
      pflichtfelderAktualisieren();
      clearFieldError(plzInput);
    }
  });

  // Fehleranzeigen Eingabefelder
  function setFieldError(input, message) {
    input.classList.add('is-invalid');
    let feedback = input.parentElement.querySelector('.donation-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'donation-feedback';
      input.insertAdjacentElement('afterend', feedback);
    }
    feedback.textContent = message;
  }

  function clearFieldError(input) {
    input.classList.remove('is-invalid');
    const feedback = input.parentElement.querySelector('.donation-feedback');
    if (feedback) feedback.textContent = '';
  }

  // Fehleranzeige Karten (Spendenziel, Kleidung, Übergabe)
  function setCardError(card, message) {
    card.classList.add('is-invalid-card');
    const msg = card.querySelector('.donation-msg');
    if (msg) msg.textContent = message;
  }

  function clearCardError(card) {
    card.classList.remove('is-invalid-card');
    const msg = card.querySelector('.donation-msg');
    if (msg) msg.textContent = '';
  }

  // Erste zwei Ziffern müssen mit der Geschäftsstelle übereinstimmen
  function plzImEinzugsgebiet(value) {
    return value.slice(0, 2) === GESCHAEFTSSTELLE.plzPrefix;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    let gueltig = true;
    const abholung = istAbholung();

    // Karte Spendenziel
    const zielCard = document.getElementById('sec-1');
    const ziel = form.querySelector('input[name="ziel"]:checked');
    clearCardError(zielCard);
    if (!ziel) {
      setCardError(zielCard, 'Bitte wähle ein Spendenziel.');
      gueltig = false;
    }

    // Karte Kleidung (mindestens eine Auswahl)
    const kleidungCard = document.getElementById('sec-2');
    const kleidungAusgewaehlt = Array.from(form.querySelectorAll('input[name="kleidung"]:checked'));
    clearCardError(kleidungCard);
    if (kleidungAusgewaehlt.length === 0) {
      setCardError(kleidungCard, 'Bitte wähle mindestens eine Kleidungsart.');
      gueltig = false;
    }

    // Kontaktdaten
    ['vorname', 'nachname', 'email'].forEach(id => {
      const input = document.getElementById(id);
      clearFieldError(input);
      if (!input.value.trim()) {
        setFieldError(input, 'Bitte ausfüllen.');
        gueltig = false;
      } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
        setFieldError(input, 'Bitte gib eine gültige E-Mailadresse an.');
        gueltig = false;
      }
    });

    // Abholadresse: Wird immer geprüft, sobald ein Feld ausgefüllt ist. Pflichtfeld nur wenn "Abholung durch Sammelfahrzeug" gewählt ist
    ['strasse', 'ort'].forEach(id => {
      const input = document.getElementById(id);
      clearFieldError(input);
      if (!input.value.trim() && abholung) {
        setFieldError(input, 'Bitte ausfüllen.');
        gueltig = false;
      }
    });

    clearFieldError(hausnrInput);
    const hausnrWert = hausnrInput.value.trim();
    if (!hausnrWert) {
      if (abholung) {
        setFieldError(hausnrInput, 'Bitte ausfüllen.');
        gueltig = false;
      }
    } else if (!HAUSNR_MUSTER.test(hausnrWert)) {
      setFieldError(hausnrInput, 'Bitte gib eine gültige Hausnummer an.');
      gueltig = false;
    }

    clearFieldError(plzInput);
    const plzWert = plzInput.value.trim();
    if (!plzWert) {
      if (abholung) {
        setFieldError(plzInput, 'Bitte ausfüllen.');
        gueltig = false;
      }
    } else if (!/^\d{5}$/.test(plzWert)) {
      setFieldError(plzInput, 'Die Postleitzahl muss aus 5 Ziffern bestehen.');
      gueltig = false;
    } else if (!plzImEinzugsgebiet(plzWert)) {
      setFieldError(plzInput, 'Die Adresse liegt außerhalb unseres Abholgebiets. Bitte gib die Kleidung direkt an der Geschäftsstelle ab.');
      gueltig = false;
    }

    // Telefonnummer: Wird immer geprüft. Pflichtfeld nur wenn "Abholung durch Sammelfahrzeug" gewählt ist

    const telefonInput = document.getElementById('telefon');
    clearFieldError(telefonInput);
    const telefonWert = telefonInput.value.trim();
    if (!telefonWert) {
      if (abholung) {
        setFieldError(telefonInput, 'Bitte ausfüllen.');
        gueltig = false;
      }
    } else if (!TELEFON_MUSTER.test(telefonWert)) {
      setFieldError(telefonInput, 'Bitte gib eine gültige Telefonnummer an.');
      gueltig = false;
    }

    if (!gueltig) {
      const ersterFehler = form.querySelector('.is-invalid, .is-invalid-card');
      if (ersterFehler) ersterFehler.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Daten für die Bestätigungsseite
    const jetzt = new Date();
    const strasseWert = document.getElementById('strasse').value.trim();
    const ortWert = document.getElementById('ort').value.trim();

    // Nur anzeigen, wenn tatsächlich eine Adresse eingegeben wurde. Keine automatische Adresse bei "Abgabe an der Geschäftsstelle"
    const adresseZeile1 = (strasseWert && hausnrWert)
      ? escapeHtml(`${strasseWert} ${hausnrWert}`)
      : '';
    const adresseZeile2 = (plzWert && ortWert)
      ? escapeHtml(`${plzWert} ${ortWert}`)
      : '';

    const daten = {
      kleidung: kleidungAusgewaehlt.map(el => escapeHtml(el.value)),
      krisengebiet: escapeHtml(ziel.value),
      uebergabe: abholung ? 'Abholung' : 'Abgabe',
      vorname: escapeHtml(document.getElementById('vorname').value.trim()),
      nachname: escapeHtml(document.getElementById('nachname').value.trim()),
      email: escapeHtml(document.getElementById('email').value.trim()),
      telefon: telefonWert ? escapeHtml(telefonWert) : '',
      adresseZeile1: adresseZeile1,
      adresseZeile2: adresseZeile2,
      datum: jetzt.toLocaleDateString('de-DE'),
      uhrzeit: jetzt.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };

    sessionStorage.setItem('aidwear-bestaetigung', JSON.stringify(daten));
    window.location.href = 'bestaetigung.html';
  });

  pflichtfelderAktualisieren();
})();
