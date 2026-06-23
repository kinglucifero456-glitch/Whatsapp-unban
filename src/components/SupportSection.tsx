import React from 'react';
import { Send, Shield, Sparkles, MessageSquare, ExternalLink } from 'lucide-react';

export default function SupportSection() {
  const supports = [
    {
      title: 'SLIME TECH EMPIRE',
      description: 'Canal d’actualités technologiques, astuces de déban et outils exclusifs.',
      url: 'https://t.me/SLIME_TECH_EMPIRE',
      role: 'Support Principal',
      color: 'from-emerald-550 to-teal-600',
    },
    {
      title: 'APK MOD BY STE',
      description: 'Assistance personnalisée, mods vérifiés et guides de récupération.',
      url: 'https://t.me/APK_MOD_BY_STE',
      role: 'Assistance Technique',
      color: 'from-blue-600 to-indigo-600',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-700/50 shadow-lg">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-700/60">
        <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
          <MessageSquare className="w-5 h-5" id="support-chat-icon" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Canaux de Support Partenaires</h2>
          <p className="text-xs text-slate-400">Rejoignez-nous sur Telegram pour une assistance continue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supports.map((s, idx) => (
          <a
            key={idx}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col p-5 bg-slate-850/80 hover:bg-slate-800 rounded-xl border border-slate-700/50 hover:border-emerald-500/40 transition-all duration-300 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2.5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-500/15 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {s.role}
              </span>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              {s.title}
            </h3>
            
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed flex-1">
              {s.description}
            </p>

            {/* Hover bottom bar */}
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
              <span>Rejoindre le canal Telegram</span>
              <Send className="w-3.5 h-3.5" />
            </div>
          </a>
        ))}
      </div>

      {/* Trust notice */}
      <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center gap-3 justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sécurité renforcée : Vos données SMTP et captures ne quittent jamais votre contrôle.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Propulsé par THE SLIME TECH EMPIRE</span>
        </div>
      </div>
    </div>
  );
}
