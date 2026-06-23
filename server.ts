import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Set high payload limits for base64 screenshots
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Shared Gemini API Setup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "placeholder_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Optimize unban message endpoint using Gemini
app.post("/api/optimize-unban-message", async (req, res) => {
  try {
    const { clientName, phoneNumber, reason, suspensionDate, deviceType, additionalDetails } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Le numéro de téléphone est obligatoire." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Return a very professional static unban template if Gemini is not configured
      const fallbackTemplate = `Objet : Demande de réévaluation et débannissement de mon compte WhatsApp [${phoneNumber}]

Bonjour,

Je me permets de contacter l'assistance de WhatsApp afin de solliciter la réactivation de mon compte associé au numéro de téléphone ${phoneNumber}.

Mon compte a été suspendu le ${suspensionDate || "récemment"}. Je suppose que cette suspension est le résultat d'une erreur technique ou d'un malentendu. En effet, j'utilise WhatsApp au quotidien sur mon appareil ${deviceType || "mobile"} à des fins personnelles et professionnelles légitimes, et je veille scrupuleusement à respecter les Conditions d'Utilisation de WhatsApp.

Motif supposé : ${reason || "Utilisation standard sans intention de spam"}
${additionalDetails ? `Précisions additionnelles : ${additionalDetails}` : ""}

Je tiens à certifier que je n'ai jamais envoyé de messages indésirables (spam) ni violé les règles de la communauté. Cette suspension soudaine cause un préjudice important à mes communications quotidiennes.

Je vous transmets ci-joint les captures d'écran de l'état de mon écran d'accueil WhatsApp en guise de preuve de ma bonne foi.

Je vous remercie par avance pour votre réactivité et l'attention que vous porterez à l'examen de mon dossier.

Cordialement,
${clientName || "Utilisateur WhatsApp"}
Numéro : ${phoneNumber}`;

      return res.json({ 
        optimizedMessage: fallbackTemplate, 
        isDemo: true, 
        warning: "Le message a été généré via un modèle de secours car la clé API Gemini n'est pas encore configurée dans les paramètres." 
      });
    }

    const ai = getGeminiClient();

    const prompt = `Tu es un expert en communication de crise et en relations clients. Ta mission est de rédiger une lettre d'appel extrêmement convaincante, polie, respectueuse et professionnelle destinée au support technique de WhatsApp pour demander le débannissement immédiat d'un compte suspendu par erreur.

Voici les informations fournies par l'utilisateur :
- Nom de l'utilisateur : ${clientName || "Non spécifié"}
- Numéro de téléphone WhatsApp : ${phoneNumber}
- Date de la suspension : ${suspensionDate || "Récemment"}
- Motif supposé de la suspension : ${reason || "Non spécifié précisément / Erreur technique suspectée"}
- Type d'appareil utilisé : ${deviceType || "Inconnu"}
- Détails additionnels / Contexte : ${additionalDetails || "Aucun"}

Consignes importantes de rédaction :
1. Rédige en français irréprochable, très soigné, sans aucune faute de grammaire ou d'orthographe.
2. Adopte un ton sincère, respectueux mais ferme dans sa bonne foi. Explique clairement que le compte respecte scrupuleusement les conditions d'utilisation de WhatsApp et qu'il s'agit très probablement d'un faux positif généré par un algorithme automatique de détection du spam.
3. Évoque l'impact négatif et handicapant de cette suspension (isolement familial, perte de contact avec des clients/partenaires professionnels importants, etc.).
4. Fais référence de manière naturelle aux captures d'écran jointes à l'e-mail qui prouvent la bonne foi de l'utilisateur ou le message d'erreur de suspension.
5. Inclus des variables ou espaces clairs de politesse au début et à la fin.
6. Le message final doit être prêt à être copié-collé ou envoyé tel quel. Ne mets aucun texte d'introduction ou de conclusion de l'IA. Donne uniquement le contenu de l'e-mail (Sujet et Corps).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const optimizedMessage = response.text || "Erreur lors de la génération du message.";
    return res.json({ optimizedMessage });
  } catch (error: any) {
    console.error("Gemini optimization error:", error);
    return res.status(500).json({ error: "Une erreur est survenue lors de l'optimisation par IA : " + error.message });
  }
});

// 2. SMTP Mail Sender
app.post("/api/send-unban-email", async (req, res) => {
  const { smtpConfig, targetEmail, subject, body, attachments } = req.body;

  if (!targetEmail || !subject || !body) {
    return res.status(400).json({ error: "Destinataire, objet et contenu de l'e-mail sont requis." });
  }

  // If smtpConfig is not provided or incomplete, we simulate a successful sending to prevent blockages
  const isDemoMode = !smtpConfig || !smtpConfig.host || !smtpConfig.user || !smtpConfig.pass;

  if (isDemoMode) {
    console.log("=== ENVOI EMAIL DEMO ===");
    console.log(`Vers: ${targetEmail}`);
    console.log(`Sujet: ${subject}`);
    console.log(`Pièces jointes: ${attachments?.length || 0} fichier(s)`);
    console.log("========================");
    
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return res.json({
      success: true,
      isDemo: true,
      message: "L'e-mail a été simulé avec succès ! Pour envoyer de réels e-mails, configurez vos informations SMTP sécurisées dans le volet dédié de l'application.",
      logs: [
        "Connexion au serveur virtuel WhatsApp Support...",
        "Authentification réussie en mode Démo...",
        `Préparation du message pour : ${targetEmail}`,
        `Encodage des ${attachments?.length || 0} pièce(s) jointe(s)...`,
        "Envoi sécurisé TLS/SSL simulé...",
        "E-mail transmis au système de file d'attente WhatsApp Support."
      ]
    });
  }

  try {
    // Real SMTP configuration
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: Number(smtpConfig.port) || 465,
      secure: smtpConfig.secure ?? true, // SSL/TLS
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });

    // Parse base64 attachments for Nodemailer
    const formattedAttachments = (attachments || []).map((att: any) => {
      // Remove data url prefix if present (e.g. "data:image/png;base64,")
      let cleanData = att.data;
      if (cleanData.includes(";base64,")) {
        cleanData = cleanData.split(";base64,").pop();
      }
      return {
        filename: att.name,
        content: Buffer.from(cleanData, "base64"),
        contentType: att.mimeType,
      };
    });

    // Send email
    const mailOptions = {
      from: smtpConfig.fromName 
        ? `"${smtpConfig.fromName}" <${smtpConfig.user}>`
        : smtpConfig.user,
      to: targetEmail,
      subject: subject,
      text: body,
      attachments: formattedAttachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return res.json({
      success: true,
      isDemo: false,
      messageId: info.messageId,
      message: "L'e-mail de demande de débannissement a été envoyé avec succès via votre serveur SMTP !",
      logs: [
        `Connexion établie avec ${smtpConfig.host}:${smtpConfig.port}`,
        "Authentification SMTP réussie.",
        `E-mail envoyé avec succès. ID: ${info.messageId}`,
        "Pièces jointes transmises et sécurisées."
      ]
    });
  } catch (error: any) {
    console.error("SMTP Mail Send Error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur de connexion ou d'envoi SMTP : " + error.message,
      logs: [
        `Tentative de connexion à ${smtpConfig.host}:${smtpConfig.port}`,
        `Erreur rencontrée : ${error.code || "AUTH"}`,
        "Échec de la transmission du message."
      ]
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
