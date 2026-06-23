import React, { useState, useEffect } from 'react';
import { UnbanRequest, SmtpConfig } from '../types';
import { Mail, Send, Edit3, CheckCircle, AlertTriangle, Paperclip, Terminal, FileImage, Sparkles, Copy, ExternalLink } from 'lucide-react';

interface MessagePreviewProps {
  request: UnbanRequest | null;
  smtpConfig: SmtpConfig | null;
  isDemoMode: boolean;
  onSend: (subject: string, body: string) => Promise<{ success: boolean; isDemo: boolean; logs: string[]; error?: string }>;
}

export default function MessagePreview({
  request,
  smtpConfig,
  isDemoMode,
  onSend,
}: MessagePreviewProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendLog, setSendLog] = useState<string[]>([]);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize from request when changed
  useEffect(() => {
    if (request?.optimizedMessage) {
      // Parse subject if Gemini formatted it, otherwise default
      const messageText = request.optimizedMessage;
      const subjectMatch = messageText.match(/Sujet\s*:\s*(.+)/i) || messageText.match(/Objet\s*:\s*(.+)/i);
      
      let cleanSubject = `Demande urgente de débannissement de compte WhatsApp : ${request.phoneNumber}`;
      let cleanBody = messageText;

      if (subjectMatch && subjectMatch[1]) {
        cleanSubject = subjectMatch[1].trim();
        // Remove subject line from body
        cleanBody = messageText.replace(subjectMatch[0], '').trim();
      }

      setSubject(cleanSubject);
      setBody(cleanBody);
      setSendResult(null);
      setSendLog([]);
    } else {
      setSubject('');
      setBody('');
    }
  }, [request]);

  const handleCopyText = () => {
    const textToCopy = `Sujet : ${subject}\n\n${body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    setSendResult(null);
    setSendLog(['Initialisation de la tâche d\'envoi...']);
    
    try {
      const response = await onSend(subject, body);
      setSendLog(response.logs || []);
      
      if (response.success) {
        setSendResult({
          success: true,
          message: response.isDemo
            ? "Simulation d'envoi réussie ! L'e-mail a été enregistré localement comme envoyé."
            : "E-mail officiel envoyé avec succès via votre serveur SMTP !",
        });
      } else {
        setSendResult({
          success: false,
          message: response.error || "Une erreur est survenue lors de l'envoi de l'e-mail.",
        });
      }
    } catch (err: any) {
      setSendLog((prev) => [...prev, `[ERREUR] ${err.message || 'Échec d\'envoi'}`]);
      setSendResult({
        success: false,
        message: err.message || "Une erreur inattendue est survenue.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenEmailClient = (type: 'gmail' | 'mailto') => {
    // Copy content to clipboard as a secure fallback
    const textToCopy = `Sujet : ${subject}\n\n${body}`;
    navigator.clipboard.writeText(textToCopy).catch(() => {});
    
    // Call onSend to mark as sent locally and show a nice success notification
    onSend(subject, body);
    
    setSendResult({
      success: true,
      message: `Votre application de messagerie (${type === 'gmail' ? 'Gmail' : 'Mail par défaut'}) s'ouvre ! Le texte et l'objet ont été copiés dans votre presse-papiers par sécurité.`,
    });
  };

  if (!request) {
    return (
      <div className="bg-white rounded-2xl border border-slate-150 p-10 text-center shadow-sm h-full flex flex-col justify-center items-center min-h-[300px]">
        <Mail className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
        <h3 className="text-base font-bold text-slate-700">Aucune demande sélectionnée</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Remplissez le formulaire de gauche et cliquez sur « Générer et Optimiser » pour prévisualiser la demande ici.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header Email Client Mock */}
      <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-green-400 rounded-full" />
          <span className="text-xs font-bold text-slate-400 ml-2 font-mono">CLIENT DE MESSAGERIE</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer ${
              isEditing
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white text-slate-600 hover:text-slate-800 border border-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Terminer l\'édition' : 'Éditer le texte'}</span>
          </button>
        </div>
      </div>

      {/* Email Fields */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/30 text-xs text-slate-600 space-y-2.5">
        <div className="flex items-center">
          <span className="font-bold w-16 text-slate-400">DE :</span>
          <span className="font-medium text-slate-800 bg-white border border-slate-100 rounded px-2 py-0.5">
            {isDemoMode 
              ? `[DÉMO SIMULÉE] <${smtpConfig?.user || 'demo-support@unban-assistant.com'}>` 
              : `"${smtpConfig?.fromName || 'Expéditeur'}" <${smtpConfig?.user}>`
            }
          </span>
        </div>

        <div className="flex items-center">
          <span className="font-bold w-16 text-slate-400">À :</span>
          <span className="font-mono text-slate-800 bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 rounded px-2 py-0.5">
            {request.targetEmail}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-bold w-16 text-slate-400">OBJET :</span>
          {isEditing ? (
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-800"
            />
          ) : (
            <span className="font-bold text-slate-800">{subject}</span>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="p-6 flex-1 min-h-[250px] overflow-y-auto">
        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full h-full min-h-[220px] p-4 text-sm font-sans text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
          />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 font-sans">
            {body}
          </div>
        )}
      </div>

      {/* Attachments Section */}
      {request.attachments && request.attachments.length > 0 && (
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-400 flex items-center gap-1.5 mb-2">
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            PIÈCES JOINTES ENVOYÉES ({request.attachments.length})
          </span>
          <div className="flex flex-wrap gap-2">
            {request.attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-medium"
              >
                <FileImage className="w-3.5 h-3.5 text-emerald-500" />
                <span>{file.name}</span>
                <span className="text-[10px] text-slate-400">({Math.round(file.size / 1024)} KB)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sending terminal logging */}
      {sendLog.length > 0 && (
        <div className="bg-slate-900 text-slate-200 p-4 font-mono text-xs border-t border-slate-800 max-h-[140px] overflow-y-auto">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1.5 border-b border-slate-800 pb-1">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>CONSOLE D'ENVOI SÉCURISÉ SMTP</span>
          </div>
          {sendLog.map((log, idx) => (
            <p key={idx} className={log.startsWith('[ERREUR]') ? 'text-red-400' : 'text-emerald-400'}>
              &gt; {log}
            </p>
          ))}
        </div>
      )}

      {/* Sending Results Messages */}
      {sendResult && (
        <div className={`px-6 py-4 flex gap-3 border-t ${
          sendResult.success 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-150 text-rose-800'
        }`}>
          {sendResult.success ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="font-bold block">{sendResult.success ? 'Succès !' : 'Erreur d\'envoi'}</span>
            <p className="mt-0.5 opacity-90">{sendResult.message}</p>
          </div>
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div className="p-5 bg-slate-50 border-t border-slate-150 space-y-4">
        {isDemoMode ? (
          <div className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-slate-700">Prêt à envoyer ! Choisissez votre option d'envoi rapide :</span>
              </div>
              
              {request.attachments && request.attachments.length > 0 && (
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50 flex items-center gap-1">
                  ⚠️ Glissez vos pièces jointes après ouverture.
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(request.targetEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleOpenEmailClient('gmail')}
                className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm cursor-pointer hover:shadow-md text-center"
              >
                <Mail className="w-4 h-4" />
                <span>Ouvrir dans Gmail (Web / Mobile)</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <a
                href={`mailto:${request.targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                onClick={() => handleOpenEmailClient('mailto')}
                className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-extrabold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm cursor-pointer hover:shadow-md text-center"
              >
                <Send className="w-4 h-4" />
                <span>Ouvrir l'application Mail par défaut</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
            
            <p className="text-[10px] text-slate-400 text-center">
              💡 Cliquer sur l'un des boutons copiera également automatiquement le texte de votre demande dans le presse-papiers par sécurité.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Prêt à envoyer définitivement via SMTP sécurisé :</span>
            </div>

            <button
              type="button"
              disabled={isSending || !body}
              onClick={handleSendEmail}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Transmission SMTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer définitivement via SMTP</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
