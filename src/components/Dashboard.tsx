import React, { useState } from 'react';
import { UnbanRequest } from '../types';
import { Search, Trash2, Mail, ExternalLink, RefreshCw, Layers, CheckCircle, AlertTriangle, Play } from 'lucide-react';

interface DashboardProps {
  requests: UnbanRequest[];
  onSelectRequest: (request: UnbanRequest) => void;
  onDeleteRequest: (id: string) => void;
  onClearAll: () => void;
}

export default function Dashboard({
  requests,
  onSelectRequest,
  onDeleteRequest,
  onClearAll,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Count requests by status
  const totalCount = requests.length;
  const sentCount = requests.filter((r) => r.status === 'sent').length;
  const optimizedCount = requests.filter((r) => r.status === 'optimized').length;
  const failedCount = requests.filter((r) => r.status === 'failed').length;

  const filteredRequests = requests.filter(
    (r) =>
      r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneNumber.includes(searchQuery)
  );

  const getStatusBadge = (status: UnbanRequest['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Brouillon
          </span>
        );
      case 'optimized':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Optimisé
          </span>
        );
      case 'sending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
            Envoi...
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Envoyé
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Échoué
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
      {/* Dashboard Top header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">Tableau de Bord de Suivi</h2>
          <p className="text-xs text-slate-500">Gérez et suivez l'état d'avancement des demandes de débannissement</p>
        </div>

        {requests.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('Voulez-vous vraiment effacer tout l’historique des demandes ?')) {
                onClearAll();
              }
            }}
            className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 transition-colors cursor-pointer"
          >
            Effacer tout l'historique
          </button>
        )}
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Total Missions */}
        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Missions totales</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{totalCount}</span>
            <span className="text-xs font-bold text-slate-400">fiches</span>
          </div>
        </div>

        {/* Optimized */}
        <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Prêtes / Optimisées</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono">{optimizedCount}</span>
            <span className="text-xs font-bold text-amber-500">IA OK</span>
          </div>
        </div>

        {/* Sent / Succeeded */}
        <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">E-mails envoyés</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-mono">{sentCount}</span>
            <span className="text-xs font-bold text-emerald-500">SMTP</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-rose-50/30 p-4 rounded-2xl border border-rose-100/50">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Envois échoués</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">{failedCount}</span>
            <span className="text-xs font-bold text-rose-400">erreurs</span>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par numéro de téléphone ou nom du client..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
        />
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="border border-dashed border-slate-150 rounded-2xl p-10 text-center text-slate-400">
          <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2 animate-pulse" />
          <p className="text-xs font-bold">Aucune demande trouvée</p>
          <p className="text-[10px] text-slate-400 mt-1">Créez votre première demande de débannissement ci-dessus.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-150 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Client / N° WhatsApp</th>
                <th className="py-3 px-4">Date de suspension</th>
                <th className="py-3 px-4">Appareil</th>
                <th className="py-3 px-4">État</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-all">
                  {/* Client name and Phone */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{r.clientName}</div>
                    <div className="text-slate-500 font-mono font-medium text-[11px] mt-0.5">{r.phoneNumber}</div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-slate-600">{r.suspensionDate}</td>

                  {/* Device */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 capitalize">
                      {r.deviceType === 'android' ? 'Android' : r.deviceType === 'ios' ? 'iOS' : 'Autre'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">{getStatusBadge(r.status)}</td>

                  {/* Action buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectRequest(r)}
                        title="Ouvrir dans l'éditeur et prévisualiser"
                        className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(r.id)}
                        title="Supprimer la mission"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
