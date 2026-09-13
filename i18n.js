// i18n.js — all user-facing text, per language.
//
// ADD A LANGUAGE: copy an entry below and translate the values. The key (e.g.
// "es") is what you put in APP_LANG in .env / Railway. EDITING ENGLISH DOES NOT
// change the other languages — each block is independent, so translate each one.
// The QUESTION itself lives in .env (see getQuestion in server.js).

const STRINGS = {
  en: {
    hello: 'Hello',
    dear: 'Dear',
    selectHonorably: 'Select honorably',
    chooseWisely: 'Choose wisely',
    submit: 'Submit',
    submitting: 'Submitting…',
    thankYou: 'Thank you',
    submitted: 'Your answer has been submitted.',
    emailButton: 'Cast my vote →',
    emailFallback: 'Button not working? Paste this link:',
    emailFooter: 'Class project · one vote per classmate',
  },
  es: {
    hello: 'Hola',
    dear: 'Estimado/a',
    selectHonorably: 'Elige con honor',
    chooseWisely: 'Elige sabiamente',
    submit: 'Enviar',
    submitting: 'Enviando…',
    thankYou: 'Gracias',
    submitted: 'Tu respuesta ha sido enviada.',
    emailButton: 'Emitir mi voto →',
    emailFallback: '¿El botón no funciona? Pega este enlace:',
    emailFooter: 'Proyecto de clase · un voto por compañero',
  },
  nl: {
    hello: 'Hallo',
    dear: 'Beste',
    selectHonorably: 'Kies met eer',
    chooseWisely: 'Kies verstandig',
    submit: 'Verzenden',
    submitting: 'Verzenden…',
    thankYou: 'Bedankt',
    submitted: 'Je antwoord is verzonden.',
    emailButton: 'Breng mijn stem uit →',
    emailFallback: 'Werkt de knop niet? Plak deze link:',
    emailFooter: 'Klasproject · één stem per klasgenoot',
  },
  fr: {
    hello: 'Bonjour',
    dear: 'Cher/Chère',
    selectHonorably: 'Choisis avec honneur',
    chooseWisely: 'Choisissez bien',
    submit: 'Envoyer',
    submitting: 'Envoi…',
    thankYou: 'Merci',
    submitted: 'Votre réponse a été envoyée.',
    emailButton: 'Voter →',
    emailFallback: 'Le bouton ne marche pas ? Collez ce lien :',
    emailFooter: 'Projet de classe · un vote par camarade',
  },
  de: {
    hello: 'Hallo',
    dear: 'Liebe/r',
    selectHonorably: 'Wähle mit Ehre',
    chooseWisely: 'Wähle weise',
    submit: 'Senden',
    submitting: 'Wird gesendet…',
    thankYou: 'Danke',
    submitted: 'Deine Antwort wurde gesendet.',
    emailButton: 'Abstimmen →',
    emailFallback: 'Button geht nicht? Diesen Link einfügen:',
    emailFooter: 'Klassenprojekt · eine Stimme pro Person',
  },
};

// The email body sentence (uses the recipient email, today's date, deadline).
const EMAIL_BODY = {
  en: ({ email, date, deadline }) =>
    `We mailed you at ${email} because we'd like you to take part in this exercise today (${date}). Please finish before ${deadline}.`,
  es: ({ email, date, deadline }) =>
    `Te escribimos a ${email} porque nos gustaría que participes en este ejercicio hoy (${date}). Termina antes de las ${deadline}.`,
  nl: ({ email, date, deadline }) =>
    `We hebben je gemaild op ${email} omdat we willen dat je vandaag (${date}) aan deze oefening meedoet. Rond af vóór ${deadline}.`,
  fr: ({ email, date, deadline }) =>
    `Nous t'avons écrit à ${email} car nous aimerions que tu participes à cet exercice aujourd'hui (${date}). Termine avant ${deadline}.`,
  de: ({ email, date, deadline }) =>
    `Wir haben dir an ${email} geschrieben, weil wir möchten, dass du heute (${date}) an dieser Übung teilnimmst. Bitte beende sie vor ${deadline}.`,
};

// "to your Gmail inbox" style label (name = provider, or null for generic).
const INBOX = {
  en: (n) => (n ? `to your ${n} inbox` : 'to your inbox'),
  es: (n) => (n ? `a tu bandeja de ${n}` : 'a tu bandeja de entrada'),
  nl: (n) => (n ? `naar je ${n}-inbox` : 'naar je inbox'),
  fr: (n) => (n ? `vers ta boîte ${n}` : 'vers ta boîte mail'),
  de: (n) => (n ? `zu deinem ${n}-Postfach` : 'zu deinem Postfach'),
};

// Locale used to format the date/time in the chosen language.
const LOCALES = { en: 'en-US', es: 'es-ES', nl: 'nl-NL', fr: 'fr-FR', de: 'de-DE' };

export const LANGS = Object.keys(STRINGS);

export function normalizeLang(lang) {
  const l = String(lang || '').toLowerCase().slice(0, 2);
  return STRINGS[l] ? l : 'en';
}

export function strings(lang) {
  return STRINGS[normalizeLang(lang)];
}

export function inboxLabel(lang, providerName) {
  return (INBOX[normalizeLang(lang)] || INBOX.en)(providerName);
}

export function emailBodyText(lang, vars) {
  return (EMAIL_BODY[normalizeLang(lang)] || EMAIL_BODY.en)(vars);
}

export function locale(lang) {
  return LOCALES[normalizeLang(lang)] || 'en-US';
}
