import { Card, Panel } from "../components/ui";
import { XP_ACTIONS_UI, XP_LEVELING } from "../lib/xp";
import { useTranslation } from "react-i18next";

type XpAction = {
  key: string;
  xp: string;
};

const XP_ACTIONS: readonly XpAction[] = XP_ACTIONS_UI.map((action) => ({
  key: action.key,
  xp: `+${action.xp} XP`,
}));

const ETHICS_PRINCIPLES = [
  "help.ethics.p1",
  "help.ethics.p2",
  "help.ethics.p3",
  "help.ethics.p4",
];

export default function HelpAndEthicsPage() {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto pr-1">
      <div className="text-sm text-white/65 font-semibold">{t('help.title')}</div>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('help.xp.title')}</div>
        <Card className="p-4 bg-white/[0.02] border-white/5">
          <p className="text-sm text-white/70 leading-relaxed">
            {t('help.xp.desc1')}
          </p>

          <p className="mt-3 text-xs text-white/50 leading-relaxed">
            {t('help.xp.desc2', { initial: XP_LEVELING.initialThreshold, multiplier: XP_LEVELING.thresholdMultiplier })}
          </p>

          <div className="mt-4 divide-y divide-white/10 rounded-xl border border-white/10 bg-black/20">
            {XP_ACTIONS.map((action) => (
              <div key={action.key} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-white/80">{t(action.key)}</span>
                <span className="text-sm font-bold text-emerald-300">{action.xp}</span>
              </div>
            ))}
          </div>
        </Card>
      </Panel>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('help.ethics.title')}</div>
        <Card className="p-4 bg-white/[0.02] border-white/5">
          <p className="text-sm text-white/70 leading-relaxed mb-3">
            {t('help.ethics.subtitle')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ETHICS_PRINCIPLES.map((key) => (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/75 leading-relaxed"
              >
                {t(key)}
              </div>
            ))}
          </div>
        </Card>
      </Panel>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('help.privacy.title')}</div>
        <Card className="p-4 bg-white/[0.02] border-white/5">
          <p className="text-sm text-white/70 leading-relaxed">
            {t('help.privacy.desc')}
          </p>
        </Card>
      </Panel>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('help.stores.title')}</div>
        <Card className="p-4 bg-white/[0.02] border-white/5">
          <p className="text-sm text-white/70 leading-relaxed mb-3">
            {t('help.stores.desc')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">Steam</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.steam')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">Epic Games Store</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.epic')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">GOG</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.gog')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">Humble Store</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.humble')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">Green Man Gaming</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.gmg')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">Fanatical</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.fanatical')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">GamersGate</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.gamersgate')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">Gamesplanet</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.gamesplanet')}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
              <div className="text-sm font-bold text-white/90">WinGameStore</div>
              <div className="text-xs text-white/50 mt-1">{t('help.stores.wingamestore')}</div>
            </div>
          </div>
        </Card>
      </Panel>

      <Panel className="p-6 bg-black/20 border-white/10">
        <div className="text-xs text-white/45 uppercase font-bold tracking-wider mb-4">{t('help.sources.title')}</div>
        <Card className="p-4 bg-white/[0.02] border-white/5">
          <p className="text-sm text-white/70 leading-relaxed">
            {t('help.sources.desc_before')}{" "}
            <a href="https://www.cheapshark.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-bold">
              CheapShark
            </a>
            {t('help.sources.desc_after')}
          </p>
        </Card>
      </Panel>
    </div>
  );
}
