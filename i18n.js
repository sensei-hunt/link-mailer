// i18n.js — all user-facing text, per language.
//
// ADD A LANGUAGE: copy an entry below and translate the values. The key (e.g.
// "es") is what you put in LANG in .env. ADD/EDIT WORDING: just change the
// strings here. The QUESTION itself lives in .env (see getQuestion in server.js).

const STRINGS = {
  en: {
    hello: 'Hello',
    chooseWisely: 'Choose wisely',
    submit: 'Submit',
    submitting: 'Submitting…',
    thankYou: 'Thank you',
    submitted: 'Your answer has been submitted.',
    emailIntro: "Quick one for the class project — we're settling the debate:",
    emailButton: 'Cast my vote →',
    emailFallback: 'Button not working? Paste this link:',
    emailFooter: 'Class project · one vote per classmate',
  },
  es: {
    hello: 'Hola',
    chooseWisely: 'Elige sabiamente',
    submit: 'Enviar',
    submitting: 'Enviando…',
    thankYou: 'Gracias',
    submitted: 'Tu respuesta ha sido enviada.',
    emailIntro: 'Una rápida para el proyecto de clase: zanjamos el debate:',
    emailButton: 'Emitir mi voto →',
    emailFallback: '¿El botón no funciona? Pega este enlace:',
    emailFooter: 'Proyecto de clase · un voto por compañero',
  },
  nl: {
    hello: 'Hallo',
    chooseWisely: 'Kies verstandig',
    submit: 'Verzenden',
    submitting: 'Verzenden…',
    thankYou: 'Bedankt',
    submitted: 'Je antwoord is verzonden.',
    emailIntro: 'Eén vraagje voor het klasproject — we beslechten het debat:',
    emailButton: 'Breng mijn stem uit →',
    emailFallback: 'Werkt de knop niet? Plak deze link:',
    emailFooter: 'Klasproject · één stem per klasgenoot',
  },
  fr: {
    hello: 'Bonjour',
    chooseWisely: 'Choisissez bien',
    submit: 'Envoyer',
    submitting: 'Envoi…',
    thankYou: 'Merci',
    submitted: 'Votre réponse a été envoyée.',
    emailIntro: 'Une petite question pour le projet de classe — on tranche le débat :',
    emailButton: 'Voter →',
    emailFallback: 'Le bouton ne marche pas ? Collez ce lien :',
    emailFooter: 'Projet de classe · un vote par camarade',
  },
  de: {
    hello: 'Hallo',
    chooseWisely: 'Wähle weise',
    submit: 'Senden',
    submitting: 'Wird gesendet…',
    thankYou: 'Danke',
    submitted: 'Deine Antwort wurde gesendet.',
    emailIntro: 'Kurze Frage fürs Klassenprojekt — wir klären die Debatte:',
    emailButton: 'Abstimmen →',
    emailFallback: 'Button geht nicht? Diesen Link einfügen:',
    emailFooter: 'Klassenprojekt · eine Stimme pro Person',
  },
};

// "to your Gmail inbox" style label (name = provider, or null for generic).
const INBOX = {
  en: (n) => (n ? `to your ${n} inbox` : 'to your inbox'),
  es: (n) => (n ? `a tu bandeja de ${n}` : 'a tu bandeja de entrada'),
  nl: (n) => (n ? `naar je ${n}-inbox` : 'naar je inbox'),
  fr: (n) => (n ? `vers ta boîte ${n}` : 'vers ta boîte mail'),
  de: (n) => (n ? `zu deinem ${n}-Postfach` : 'zu deinem Postfach'),
};

export const LANGS = Object.keys(STRINGS);

export function normalizeLang(lang) {
  const l = String(lang || '').toLowerCase().slice(0, 2);
  return STRINGS[l] ? l : 'en';
}

// Resolved strings object for a language (falls back to English).
export function strings(lang) {
  return STRINGS[normalizeLang(lang)];
}

export function inboxLabel(lang, providerName) {
  return (INBOX[normalizeLang(lang)] || INBOX.en)(providerName);
}
