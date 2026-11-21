export type Devotional = {
  title: string;
  reference: string;
  reflection: string;
  prayer: string;
};

export const todayDevotional: Devotional = {
  title: 'Rimani nella mia pace',
  reference: 'Giovanni 14,27',
  reflection:
    'La pace che Gesù offre non dipende dall’assenza di difficoltà. È una presenza che accompagna il cuore anche quando la strada non è semplice. Oggi concediti qualche minuto di silenzio, porta a Dio ciò che ti preoccupa e scegli un piccolo gesto di fiducia.',
  prayer:
    'Signore Gesù, accompagna questa giornata. Aiutami a riconoscere la tua presenza, a custodire la pace e a trattare ogni persona con pazienza e amore. Amen.',
};

export const prayerCategories = [
  { title: 'Al mattino', detail: 'Affida a Dio l’inizio della giornata.', icon: 'sunrise' as const },
  { title: 'Nei momenti difficili', detail: 'Trova parole quando il cuore è stanco.', icon: 'heart' as const },
  { title: 'Per la famiglia', detail: 'Prega per le persone che ami.', icon: 'users' as const },
  { title: 'Per ringraziare', detail: 'Riconosci i doni ricevuti.', icon: 'hand-heart' as const },
];

export const bibleTopics = [
  { title: 'Fiducia', reference: 'Proverbi 3,5–6', description: 'Affidare a Dio il proprio cammino.' },
  { title: 'Consolazione', reference: 'Salmo 34,19', description: 'Dio è vicino a chi ha il cuore ferito.' },
  { title: 'Amore', reference: '1 Corinzi 13,4–7', description: 'L’amore vissuto nella quotidianità.' },
  { title: 'Speranza', reference: 'Romani 15,13', description: 'La speranza che nasce dalla fede.' },
];

export const worshipSuggestions = [
  { title: 'Silenzio e ascolto', detail: 'Cinque minuti per fermarti e raccoglierti.' },
  { title: 'Lode e gratitudine', detail: 'Nomina tre motivi per ringraziare.' },
  { title: 'Adorazione personale', detail: 'Rimani alla presenza di Dio con semplicità.' },
];
