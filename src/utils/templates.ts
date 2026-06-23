/**
 * Moteur Local de Modèles de Lettre de Débannissement (Garanti à vie sans API Key)
 * Conçu par THE SLIME TECH EMPIRE
 */

export type TemplateStyle = 'formal' | 'professional' | 'legal' | 'hacked' | 'concise';

export const TEMPLATE_STYLES = [
  { id: 'formal' as TemplateStyle, name: 'Poli, Courtois & Administratif', desc: 'Idéal pour prouver sa bonne foi avec déférence et politesse.' },
  { id: 'professional' as TemplateStyle, name: 'Urgence Professionnelle / Business', desc: 'Met l\'accent sur l\'impact financier et l\'isolement professionnel.' },
  { id: 'legal' as TemplateStyle, name: 'Technique, Précis & Juridique', desc: 'Conteste les faux positifs automatiques en citant le respect des CGU.' },
  { id: 'hacked' as TemplateStyle, name: 'Piratage / Usurpation Temporaire', desc: 'Explique une anomalie due à une faille ou usurpation extérieure.' },
  { id: 'concise' as TemplateStyle, name: 'Direct & Synthétique (Fast Track)', desc: 'Court, précis et facile à valider rapidement par le modérateur humain.' }
];

export function generateLocalUnbanMessage(
  style: TemplateStyle,
  data: {
    clientName: string;
    phoneNumber: string;
    reason: string;
    suspensionDate: string;
    deviceType: string;
    additionalDetails?: string;
  }
): string {
  const { clientName, phoneNumber, reason, suspensionDate, deviceType, additionalDetails } = data;
  const dateFormatted = suspensionDate ? new Date(suspensionDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'récemment';
  const device = deviceType === 'android' ? 'Android' : deviceType === 'ios' ? 'iPhone (iOS)' : 'mobile';

  const detailsBlock = additionalDetails ? `\nContexte additionnel : ${additionalDetails}\n` : '';

  switch (style) {
    case 'formal':
      return `Objet : Demande de réévaluation de la suspension de mon compte WhatsApp - [${phoneNumber}]

Bonjour l'équipe d'assistance WhatsApp,

Je me permets de vous contacter avec le plus grand respect afin de solliciter un examen approfondi de la suspension récente de mon compte WhatsApp associé au numéro de téléphone : ${phoneNumber}.

Mon compte a été suspendu le ${dateFormatted}. Je crains que cette action ne résulte d'une erreur d'analyse automatique de votre algorithme de sécurité. J'utilise cette application quotidiennement sur mon appareil ${device} de manière parfaitement conforme à vos Conditions d'Utilisation.

Motif probable de l'alerte : ${reason}
${detailsBlock}
Je vous affirme sur l'honneur n'avoir jamais eu l'intention d'envoyer de spams, de nuire à d'autres utilisateurs ou de violer les règles de la communauté WhatsApp. Je joins à cet e-mail des captures d'écran prouvant ma bonne foi.

Cette suspension soudaine me coupe de mes proches. Je vous remercie d'avance de bien vouloir restaurer mon accès.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

Cordialement,
${clientName}
Numéro de téléphone : ${phoneNumber}`;

    case 'professional':
      return `Objet : [URGENT] Impact professionnel majeur suite à la suspension de la ligne WhatsApp [${phoneNumber}]

Madame, Monsieur,

Je vous contacte en urgence concernant la suspension inattendue de mon compte WhatsApp associé au numéro de téléphone professionnel : ${phoneNumber}.

La suspension est survenue le ${dateFormatted}. J'utilise WhatsApp sur mon appareil ${device} comme outil de travail indispensable pour échanger avec mes clients, partenaires et collaborateurs de manière légitime et respectueuse de votre charte d'utilisation.

Raison suspectée : ${reason}
${detailsBlock}
La coupure de ce canal de communication engendre un préjudice commercial et financier critique pour mon activité professionnelle au quotidien. Je n'ai en aucun cas fait un usage abusif (ni spam, ni automatisations) de ce compte.

Je vous prie de bien vouloir analyser les pièces jointes prouvant mon activité légitime et de procéder au débannissement immédiat de mon numéro de téléphone afin que je puisse reprendre mon travail.

Je vous remercie infiniment pour votre compréhension et votre réactivité professionnelle.

Cordialement,
${clientName}
Contact professionnel : ${phoneNumber}`;

    case 'legal':
      return `Objet : Contestation de décision automatique / Demande de débannissement [Ligne : ${phoneNumber}]

À l'attention du Service de Modération de WhatsApp,

Par le présent e-mail, je viens contester formellement la suspension de mon compte WhatsApp lié au numéro de téléphone ${phoneNumber}, survenue le ${dateFormatted}.

Après relecture attentive de vos Conditions d'Utilisation et de la Politique de Confidentialité, je certifie que mon comportement sur la plateforme est irréprochable. Cette suspension automatique est très probablement un faux positif généré par un système d'analyse automatisé de comportements suspects.

Motif présumé à l'origine de l'anomalie : ${reason}
${detailsBlock}
J'utilise mon terminal personnel ${device} et je n'utilise aucun émulateur ou application modifiée non autorisée avec de mauvaises intentions. Les captures d'écran ci-jointes démontrent ma bonne foi technique.

Je vous demande de bien vouloir solliciter une relecture humaine de mon dossier afin d'annuler cette sanction injustifiée et de réactiver mon compte dans les plus brefs délais.

Je reste disponible pour tout échange complémentaire.

Cordialement,
${clientName}
Numéro de ligne : ${phoneNumber}`;

    case 'hacked':
      return `Objet : Demande de récupération de compte WhatsApp suite à une anomalie ou usurpation temporaire [${phoneNumber}]

Bonjour,

Je sollicite votre assistance urgente afin de récupérer l'accès à mon compte WhatsApp correspondant au numéro : ${phoneNumber}, suspendu le ${dateFormatted}.

Je suspecte que mon compte ou mon réseau a subi une usurpation ou qu'une activité inhabituelle indépendante de ma volonté a été détectée sur mon appareil ${device}. Je n'ai jamais sciemment enfreint les règles d'utilisation de WhatsApp.

Détail de l'incident : ${reason}
${detailsBlock}
Je viens de sécuriser entièrement mon appareil et je souhaite restaurer mon compte d'origine. Les captures d'écran de mon écran d'accueil WhatsApp sont jointes pour valider mon identité.

Merci de m'aider à restaurer ma connexion sécurisée afin de protéger mes données personnelles et de me reconnecter à mes contacts légitimes.

Avec mes remerciements,
${clientName}
Numéro sécurisé : ${phoneNumber}`;

    case 'concise':
      return `Objet : Demande de réactivation de compte WhatsApp suspendu par erreur - ${phoneNumber}

Bonjour,

Mon compte WhatsApp associé au numéro ${phoneNumber} a été suspendu le ${dateFormatted} sur mon ${device}.

Il s'agit visiblement d'un faux positif automatique. Je vous confirme que je respecte scrupuleusement les conditions d'utilisation de WhatsApp et que je ne fais aucun envoi de spam.

Motif présumé : ${reason}
${detailsBlock}
Je joins les captures d'écran de l'erreur WhatsApp comme preuve de ma bonne foi. Merci de bien vouloir débloquer mon compte rapidement.

Cordialement,
${clientName}
Téléphone : ${phoneNumber}`;

    default:
      return '';
  }
}
