import { useState, useEffect } from 'react';
import { UnbanRequest, SmtpConfig } from './types';
import { generateLocalUnbanMessage } from './utils/templates';
import SmtpConfigPanel from './components/SmtpConfigPanel';
import UnbanForm from './components/UnbanForm';
import MessagePreview from './components/MessagePreview';
import Dashboard from './components/Dashboard';
import SupportSection from './components/SupportSection';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Layers, 
  Send, 
  Settings, 
  Sparkles, 
  MessageSquare, 
  Mail, 
  CheckCircle, 
  History,
  PhoneCall
} from 'lucide-react';

export default function App() {
  const [requests, setRequests] = useState<UnbanRequest[]>([]);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  
  // Selected request for editing and previewing
  const [selectedRequest, setSelectedRequest] = useState<UnbanRequest | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard' | 'settings'>('create');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load initial data from localStorage
  useEffect(() => {
    const savedRequests = localStorage.getItem('whatsapp_unban_requests');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error('Failed to parse saved requests', e);
      }
    }

    const savedSmtp = localStorage.getItem('whatsapp_unban_smtp');
    if (savedSmtp) {
      try {
        setSmtpConfig(JSON.parse(savedSmtp));
      } catch (e) {
        console.error('Failed to parse saved SMTP', e);
      }
    }

    const savedDemoMode = localStorage.getItem('whatsapp_unban_demo_mode');
    if (savedDemoMode !== null) {
      setIsDemoMode(savedDemoMode === 'true');
    }
  }, []);

  // Save requests to localStorage whenever changed
  const saveRequestsToStorage = (updatedRequests: UnbanRequest[]) => {
    setRequests(updatedRequests);
    localStorage.setItem('whatsapp_unban_requests', JSON.stringify(updatedRequests));
  };

  const handleSaveSmtp = (config: SmtpConfig | null) => {
    setSmtpConfig(config);
    if (config === null) {
      localStorage.removeItem('whatsapp_unban_smtp');
    } else {
      localStorage.setItem('whatsapp_unban_smtp', JSON.stringify(config));
    }
    showToast('Configuration SMTP mise à jour avec succès.', 'success');
  };

  const handleToggleDemoMode = (isDemo: boolean) => {
    setIsDemoMode(isDemo);
    localStorage.setItem('whatsapp_unban_demo_mode', String(isDemo));
    showToast(
      isDemo 
        ? 'Mode Démo activé : Les e-mails seront simulés.' 
        : 'Mode SMTP activé : Veuillez vous assurer d’avoir configuré vos identifiants.',
      'success'
    );
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Submit form to optimize unban email with Gemini or Local templates
  const handleOptimizeRequest = async (formData: any) => {
    setIsOptimizing(true);
    
    try {
      let optimizedMessage = '';
      let isDemo = false;

      if (formData.engine === 'local') {
        // Instant, client-side, lifetime zero cost generation
        optimizedMessage = generateLocalUnbanMessage(formData.style, formData);
        isDemo = true;
      } else {
        // Gemini AI generation via server proxy
        try {
          const response = await fetch('/api/optimize-unban-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientName: formData.clientName,
              phoneNumber: formData.phoneNumber,
              reason: formData.reason,
              suspensionDate: formData.suspensionDate,
              deviceType: formData.deviceType,
              additionalDetails: formData.additionalDetails,
            }),
          });

          if (!response.ok) {
            throw new Error('La clé API Gemini est absente ou expirée.');
          }

          const data = await response.json();
          optimizedMessage = data.optimizedMessage;
          isDemo = data.isDemo;
        } catch (serverError: any) {
          console.warn("Gemini Server Error, falling back to local offline model:", serverError);
          // Seamless fallback to local generation so the app never fails!
          optimizedMessage = generateLocalUnbanMessage('formal', formData);
          isDemo = true;
          showToast("Moteur de secours local activé automatiquement (Clé API Gemini absente ou expirée).", 'success');
        }
      }
      
      // Create new request
      const newRequest: UnbanRequest = {
        id: selectedRequest?.id || `req_${Date.now()}`,
        clientName: formData.clientName,
        phoneNumber: formData.phoneNumber,
        reason: formData.reason,
        suspensionDate: formData.suspensionDate,
        deviceType: formData.deviceType,
        additionalDetails: formData.additionalDetails,
        optimizedMessage: optimizedMessage,
        status: 'optimized',
        createdAt: selectedRequest?.createdAt || new Date().toISOString(),
        targetEmail: formData.targetEmail,
        attachments: formData.attachments,
      };

      // Add to requests list
      let updatedList;
      if (selectedRequest) {
        updatedList = requests.map((r) => (r.id === selectedRequest.id ? newRequest : r));
      } else {
        updatedList = [newRequest, ...requests];
      }
      
      saveRequestsToStorage(updatedList);
      setSelectedRequest(newRequest);
      
      if (formData.engine === 'local') {
        showToast("Lettre d'appel générée instantanément via le moteur local à vie !", 'success');
      } else if (isDemo) {
        showToast("Message d'appel généré à l'aide du modèle local de secours.", 'success');
      } else {
        showToast("Message d'appel généré et optimisé par l'IA Gemini !", 'success');
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Impossible de générer le message d'appel.", 'error');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Execute SMTP or simulated email unban request sending
  const handleSendEmail = async (subject: string, body: string) => {
    if (!selectedRequest) return { success: false, isDemo: isDemoMode, logs: ['[ERREUR] Aucune fiche active.'], error: 'Pas de fiche active' };

    // Set sending state
    const sendingRequest: UnbanRequest = {
      ...selectedRequest,
      status: 'sending'
    };
    saveRequestsToStorage(requests.map((r) => (r.id === selectedRequest.id ? sendingRequest : r)));

    try {
      const response = await fetch('/api/send-unban-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtpConfig: isDemoMode ? null : smtpConfig,
          targetEmail: selectedRequest.targetEmail,
          subject: subject,
          body: body,
          attachments: selectedRequest.attachments,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const successRequest: UnbanRequest = {
          ...selectedRequest,
          optimizedMessage: body,
          status: 'sent',
          sentAt: new Date().toISOString()
        };
        saveRequestsToStorage(requests.map((r) => (r.id === selectedRequest.id ? successRequest : r)));
        setSelectedRequest(successRequest);
        showToast(isDemoMode ? "Envoi simulé réussi !" : "E-mail de débannissement envoyé !", 'success');
        return {
          success: true,
          isDemo: data.isDemo,
          logs: data.logs,
        };
      } else {
        throw new Error(data.error || "Une erreur s'est produite lors de la transmission SMTP.");
      }
    } catch (err: any) {
      console.error(err);
      const failedRequest: UnbanRequest = {
        ...selectedRequest,
        status: 'failed'
      };
      saveRequestsToStorage(requests.map((r) => (r.id === selectedRequest.id ? failedRequest : r)));
      setSelectedRequest(failedRequest);
      showToast(err.message || "Échec de l'envoi SMTP", 'error');
      return {
        success: false,
        isDemo: isDemoMode,
        logs: [
          `[ERREUR] Connexion impossible ou rejetée par le serveur SMTP.`,
          `[DÉTAILS] ${err.message}`,
          `[CONSEIL] Vérifiez votre mot de passe d'application, le port ou activez le Mode Démo pour tester.`
        ],
        error: err.message,
      };
    }
  };

  const handleSelectRequest = (request: UnbanRequest) => {
    setSelectedRequest(request);
    setActiveTab('create');
    showToast(`Fiche de ${request.clientName} chargée dans l'éditeur.`, 'success');
  };

  const handleDeleteRequest = (id: string) => {
    const updated = requests.filter((r) => r.id !== id);
    saveRequestsToStorage(updated);
    if (selectedRequest?.id === id) {
      setSelectedRequest(null);
    }
    showToast('Fiche de demande supprimée avec succès.', 'success');
  };

  const handleClearAllRequests = () => {
    saveRequestsToStorage([]);
    setSelectedRequest(null);
    showToast('Historique des demandes entièrement effacé.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Upper Navigation Bar & Branding */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-150 shadow-xs px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-6 h-6" id="logo-shield-icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight leading-none">WhatsApp Recovery Pro</span>
                <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded leading-none">v1.2</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Plateforme de débannissement professionnel & optimisations IA</p>
            </div>
          </div>

          {/* Core Tabs Menu */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nouvelle Mission</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Suivi Dashboard</span>
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full border-2 border-white leading-none">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Config SMTP</span>
            </button>
          </div>

          {/* Quick Info & Telegram Contact */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Support en direct</span>
              <a 
                href="https://t.me/SLIME_TECH_EMPIRE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1 mt-0.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>@SLIME_TECH_EMPIRE</span>
              </a>
            </div>
          </div>

        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 space-y-8">
        
        {/* Toast Alert message banner */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-md border max-w-2xl mx-auto ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            <CheckCircle className={`w-5 h-5 shrink-0 ${toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`} />
            <span className="text-xs font-bold">{toast.message}</span>
          </motion.div>
        )}

        {/* Dynamic Views Switcher */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Split creation layout: Form on Left, Email Preview Client on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              <div className="lg:col-span-6">
                <UnbanForm
                  onSubmit={handleOptimizeRequest}
                  initialValues={selectedRequest}
                  isOptimizing={isOptimizing}
                />
              </div>

              <div className="lg:col-span-6 h-full lg:sticky lg:top-24">
                <MessagePreview
                  request={selectedRequest}
                  smtpConfig={smtpConfig}
                  isDemoMode={isDemoMode}
                  onSend={handleSendEmail}
                />
              </div>

            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              requests={requests}
              onSelectRequest={handleSelectRequest}
              onDeleteRequest={handleDeleteRequest}
              onClearAll={handleClearAllRequests}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SmtpConfigPanel
              config={smtpConfig}
              onSave={handleSaveSmtp}
              isDemoMode={isDemoMode}
              onToggleDemoMode={handleToggleDemoMode}
            />
          </motion.div>
        )}

        {/* Telegram Support Channels Footer Banner always visible */}
        <SupportSection />

      </main>

      {/* Page Footer Credits */}
      <footer className="bg-white border-t border-slate-150 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 WhatsApp Recovery Assistant Pro. Développé par <strong>THE SLIME TECH EMPIRE</strong>.</p>
          <div className="flex gap-4">
            <a href="https://t.me/SLIME_TECH_EMPIRE" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">Telegram SLIME TECH</a>
            <a href="https://t.me/APK_MOD_BY_STE" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">Telegram APK MOD</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
