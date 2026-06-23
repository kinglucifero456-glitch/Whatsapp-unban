import React, { useState } from 'react';
import { SmtpConfig } from '../types';
import { Shield, Eye, EyeOff, Save, CheckCircle2, AlertCircle, Info, ToggleLeft, ToggleRight } from 'lucide-react';

interface SmtpConfigPanelProps {
  config: SmtpConfig | null;
  onSave: (config: SmtpConfig | null) => void;
  isDemoMode: boolean;
  onToggleDemoMode: (isDemo: boolean) => void;
}

export default function SmtpConfigPanel({
  config,
  onSave,
  isDemoMode,
  onToggleDemoMode,
}: SmtpConfigPanelProps) {
  const [host, setHost] = useState(config?.host || 'smtp.gmail.com');
  const [port, setPort] = useState(config?.port || 465);
  const [secure, setSecure] = useState(config?.secure ?? true);
  const [user, setUser] = useState(config?.user || '');
  const [pass, setPass] = useState(config?.pass || '');
  const [fromName, setFromName] = useState(config?.fromName || 'WhatsApp Recovery Support');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!isDemoMode) {
      if (!host || !user || !pass) {
        setValidationError('Veuillez remplir le serveur, l’utilisateur et le mot de passe pour le SMTP réel.');
        return;
      }
    }

    const newConfig: SmtpConfig = {
      host,
      port: Number(port),
      secure,
      user,
      pass,
      fromName,
    };

    onSave(newConfig);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClear = () => {
    setHost('smtp.gmail.com');
    setPort(465);
    setSecure(true);
    setUser('');
    setPass('');
    setFromName('WhatsApp Recovery Support');
    onSave(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Shield className="w-5 h-5" id="smtp-shield-icon" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Configuration SMTP Sécurisée</h2>
            <p className="text-xs text-slate-500">Pour l'envoi direct d'e-mails d'appel au support WhatsApp</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <button
          type="button"
          onClick={() => onToggleDemoMode(!isDemoMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isDemoMode
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {isDemoMode ? (
            <>
              <ToggleLeft className="w-4 h-4 text-amber-500" />
              <span>Mode Démo (Simulé)</span>
            </>
          ) : (
            <>
              <ToggleRight className="w-4 h-4 text-emerald-500" />
              <span>SMTP Actif (Réel)</span>
            </>
          )}
        </button>
      </div>

      {isDemoMode ? (
        <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-1">
            <span className="font-semibold block">Le Mode Démo / Simulation est activé</span>
            <p>
              Dans ce mode, vous pouvez configurer vos demandes et tester tout le workflow (génération d'appel par l'IA Gemini, ajout de captures d'écran, prévisualisation, envoi sécurisé) sans configurer de serveur SMTP.
            </p>
            <p className="font-medium mt-1">
              Désactivez ce commutateur pour connecter votre propre messagerie (Gmail, Outlook, Hostinger, Yahoo, etc.) et envoyer de véritables e-mails au support WhatsApp.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/40 rounded-xl p-4 border border-emerald-100/60 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800">
            <span className="font-semibold block text-emerald-900">Connexion SMTP directe sécurisée</span>
            <p className="text-emerald-700 mt-0.5">
              Vos informations d'authentification SMTP restent strictement confidentielles dans votre navigateur. Elles sont envoyées de manière sécurisée (SSL/TLS) uniquement pour communiquer avec vos serveurs de messagerie lors de l'envoi.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nom de l'expéditeur */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Nom d'expéditeur affiché</label>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Ex: WhatsApp Account Recovery Assistant"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              disabled={isDemoMode}
            />
          </div>

          {/* Serveur SMTP */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Serveur SMTP Host</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Ex: smtp.gmail.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Port SMTP */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Port SMTP</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              placeholder="465 ou 587"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>

          {/* Sécurisé SSL/TLS */}
          <div className="flex items-center md:pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={secure}
                onChange={(e) => setSecure(e.target.checked)}
                className="w-4.5 h-4.5 text-emerald-600 bg-slate-100 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                disabled={isDemoMode}
              />
              <span className="text-xs font-medium text-slate-700">Utiliser SSL/TLS (Recommandé)</span>
            </label>
          </div>

          {/* Hint */}
          <div className="flex items-center md:pt-6">
            <p className="text-[10px] text-slate-400">
              * Gmail utilise généralement le port 465 (SSL/TLS) ou 587 (STARTTLS).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identifiant de connexion */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Nom d'utilisateur SMTP / E-mail</label>
            <input
              type="email"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ex: monadresse@gmail.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              required={!isDemoMode}
              disabled={isDemoMode}
            />
          </div>

          {/* Mot de passe de connexion */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">Mot de passe de l'e-mail</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Mot de passe d'application ou classique"
                className="w-full pl-3.5 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
                required={!isDemoMode}
                disabled={isDemoMode}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isDemoMode}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isDemoMode && host.includes('gmail') && (
              <p className="text-[10px] text-amber-600 mt-1">
                Note : Pour Gmail, vous devez générer un <strong>Mot de passe d'application</strong> dans votre compte Google.
              </p>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validationError && (
          <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-2">
          {!isDemoMode && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
            >
              Réinitialiser
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl transition-all shadow-sm shadow-emerald-600/10 cursor-pointer"
          >
            {showSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Paramètres Enregistrés !</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer la Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
