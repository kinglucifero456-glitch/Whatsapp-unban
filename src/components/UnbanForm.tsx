import React, { useState, useRef } from 'react';
import { UnbanRequest } from '../types';
import { TEMPLATE_STYLES, TemplateStyle } from '../utils/templates';
import { Upload, X, ShieldAlert, Calendar, Smartphone, FileText, Image, User, PlusCircle, Sparkles, Cpu } from 'lucide-react';

interface UnbanFormProps {
  onSubmit: (data: Omit<UnbanRequest, 'id' | 'status' | 'createdAt' | 'attachments'> & { 
    attachments: { name: string; size: number; mimeType: string; data: string }[];
    engine: 'local' | 'gemini';
    style: TemplateStyle;
  }) => void;
  initialValues?: UnbanRequest | null;
  isOptimizing: boolean;
}

const COMMON_REASONS = [
  { value: "Signalement abusif de groupe / Faux positifs d'algorithme", label: "Signalement abusif de groupe / Faux positifs d'algorithme" },
  { value: "Envoi suspecté de messages en masse (Spam présumé par robot)", label: "Envoi suspecté de messages en masse (Spam présumé par robot)" },
  { value: "Utilisation d'une version non officielle de WhatsApp (WhatsApp Plus/GB par méprise)", label: "Version tierce non officielle (GB/Plus) utilisée par méprise" },
  { value: "Changement fréquent de réseaux IP ou voyage à l'étranger", label: "Changement fréquent de réseau IP (Voyage / VPN)" },
  { value: "Ajout massif d'utilisateurs inconnus dans des groupes d'intérêts", label: "Ajout dans des groupes d'intérêts professionnels" },
  { value: "Autre motif spécifique (saisir ci-dessous)", label: "Autre motif spécifique..." }
];

const PRESET_SUPPORT_EMAILS = [
  { email: 'support@support.whatsapp.com', label: 'Support Principal Général (Recommandé)' },
  { email: 'android_web@support.whatsapp.com', label: 'Support Dédié Android' },
  { email: 'iphone_web@support.whatsapp.com', label: 'Support Dédié iOS / iPhone' },
  { email: 'support@whatsapp.com', label: 'Support WhatsApp Général Bis' }
];

export default function UnbanForm({ onSubmit, initialValues, isOptimizing }: UnbanFormProps) {
  const [clientName, setClientName] = useState(initialValues?.clientName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialValues?.phoneNumber || '');
  const [reason, setReason] = useState(initialValues?.reason || COMMON_REASONS[0].value);
  const [customReason, setCustomReason] = useState('');
  const [suspensionDate, setSuspensionDate] = useState(initialValues?.suspensionDate || new Date().toISOString().split('T')[0]);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'other'>(initialValues?.deviceType || 'android');
  const [additionalDetails, setAdditionalDetails] = useState(initialValues?.additionalDetails || '');
  const [targetEmail, setTargetEmail] = useState(initialValues?.targetEmail || PRESET_SUPPORT_EMAILS[0].email);
  
  // Strategy States
  const [engine, setEngine] = useState<'local' | 'gemini'>('local');
  const [style, setStyle] = useState<TemplateStyle>('formal');

  // Attachments State
  const [attachments, setAttachments] = useState<{ name: string; size: number; mimeType: string; data: string }[]>(
    initialValues?.attachments || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto select target email based on device type
  const handleDeviceChange = (type: 'android' | 'ios' | 'other') => {
    setDeviceType(type);
    if (type === 'android') {
      setTargetEmail('android_web@support.whatsapp.com');
    } else if (type === 'ios') {
      setTargetEmail('iphone_web@support.whatsapp.com');
    } else {
      setTargetEmail('support@support.whatsapp.com');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Seules les captures d’écran au format image sont acceptées.');
        return;
      }

      if (file.size > 4 * 1024 * 1024) {
        alert('La taille de l’image ne doit pas dépasser 4 Mo.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            mimeType: file.type,
            data: base64Data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      alert('Veuillez saisir le numéro de téléphone suspendu.');
      return;
    }

    const selectedReason = reason === "Autre motif spécifique (saisir ci-dessous)" && customReason
      ? customReason
      : reason;

    onSubmit({
      clientName,
      phoneNumber,
      reason: selectedReason,
      suspensionDate,
      deviceType,
      additionalDetails,
      targetEmail,
      attachments,
      engine,
      style,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-2">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
          <ShieldAlert className="w-5 h-5" id="form-alert-icon" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">1. Informations de la Mission</h2>
          <p className="text-xs text-slate-500">Détails sur le compte WhatsApp à récupérer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom du client */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Nom complet du client
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ex: Jean Dupont ou SLIME MODS"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          />
        </div>

        {/* Numéro de téléphone WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <span className="text-emerald-500 font-bold">*</span> Numéro WhatsApp (avec code pays)
          </label>
          <input
            type="text"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Ex: +33 6 12 34 56 78"
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          />
          <p className="text-[10px] text-slate-400 mt-1">Saisir l'indicatif international complet (ex: +33 pour la France, +229 pour le Bénin).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date de suspension */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Date de la suspension
          </label>
          <input
            type="date"
            required
            value={suspensionDate}
            onChange={(e) => setSuspensionDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          />
        </div>

        {/* Type d'appareil */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-slate-400" />
            Type d'appareil
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['android', 'ios', 'other'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleDeviceChange(type)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  deviceType === type
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'android' ? 'Android' : type === 'ios' ? 'iPhone (iOS)' : 'Autre'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email du support de destination */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          E-mail WhatsApp Support destinataire
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            className="px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          >
            {PRESET_SUPPORT_EMAILS.map((preset) => (
              <option key={preset.email} value={preset.email}>
                {preset.label} ({preset.email})
              </option>
            ))}
            <option value="custom">Saisir une adresse personnalisée...</option>
          </select>

          <input
            type="email"
            value={targetEmail === 'custom' ? '' : targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
            disabled={targetEmail !== 'custom'}
            placeholder="Entrez l'adresse de support personnalisée"
            className="px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 disabled:opacity-50 font-mono"
          />
        </div>
      </div>

      {/* Motif de la suspension */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          Motif supposé ou présumé de la suspension
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
        >
          {COMMON_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        {reason === "Autre motif spécifique (saisir ci-dessous)" && (
          <input
            type="text"
            required
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Saisissez le motif précis de suspension..."
            className="w-full mt-2.5 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
          />
        )}
      </div>

      {/* Choix du Moteur et du Style d'écriture */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Moteur de génération de l'appel
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setEngine('local')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                engine === 'local'
                  ? 'bg-white text-emerald-700 border-emerald-400 shadow-xs ring-2 ring-emerald-500/10'
                  : 'bg-slate-100/50 border-slate-200 text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <span className="font-extrabold text-[11px]">Modèles Locaux Premium</span>
              <span className="text-[9px] text-slate-400 font-normal">Garanti à vie (Sans API, 100% Gratuit)</span>
            </button>
            <button
              type="button"
              onClick={() => setEngine('gemini')}
              className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                engine === 'gemini'
                  ? 'bg-white text-emerald-700 border-emerald-400 shadow-xs ring-2 ring-emerald-500/10'
                  : 'bg-slate-100/50 border-slate-200 text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <span className="font-extrabold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                IA Gemini 3.5
              </span>
              <span className="text-[9px] text-slate-400 font-normal">Créatif (Nécessite Clé API)</span>
            </button>
          </div>
        </div>

        {engine === 'local' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Style d'écriture & Argumentaire ciblé
            </label>
            <div className="space-y-2">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as TemplateStyle)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 font-semibold"
              >
                {TEMPLATE_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 italic px-1">
                📌 {TEMPLATE_STYLES.find((s) => s.id === style)?.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Détails additionnels */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Précisions complémentaires / Contexte (optionnel)
        </label>
        <textarea
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          rows={3}
          placeholder="Ex: J'étais en train de créer un groupe de discussion pour mon projet de classe, je n'utilisais aucun robot. Mon compte a plus de 3 ans d'ancienneté."
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
        />
      </div>

      {/* Interface utilisateur intuitive pour la gestion des pièces jointes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2.5 flex items-center justify-between">
          <span>Captures d'écran de preuve (Optionnel - Max 4Mo/image)</span>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
            {attachments.length} jointe(s)
          </span>
        </label>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" id="drag-drop-upload-icon" />
          <p className="text-xs font-bold text-slate-700">Déposez vos captures d'écran ici, ou parcourez</p>
          <p className="text-[10px] text-slate-400 mt-1">Formats acceptés : PNG, JPG, JPEG (Preuves de suspension ou d'écran d'erreur)</p>
        </div>

        {/* Attachment Thumbnail List */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col p-2 bg-slate-50 border border-slate-150 rounded-xl transition-all hover:shadow-sm"
              >
                <div className="relative aspect-video w-full rounded-lg bg-slate-200 overflow-hidden mb-1.5 border border-slate-100">
                  <img
                    src={file.data}
                    alt={file.name}
                    className="object-cover w-full h-full"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="absolute top-1 right-1 p-1 bg-rose-500/90 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="px-1 text-left">
                  <p className="text-[10px] font-bold text-slate-700 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[9px] text-slate-400">{formatSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optimization Submit Trigger */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isOptimizing}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-99 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Génération du message...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>
                {engine === 'local'
                  ? "Générer l'appel avec les Modèles Locaux (Gratuit & Garanti)"
                  : "Générer et Optimiser la demande avec Gemini IA"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
