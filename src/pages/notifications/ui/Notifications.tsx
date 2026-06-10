import { Button, Card, Panel } from "@/shared/ui/Primitives";
import { useTopDeals } from "@/entities/game/model/useTopDeals";
import { useUserStore } from "@/entities/user/model/userStore";
import { XP_LEVELING } from "@/shared/lib/xp";
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const { t } = useTranslation();
  const { data: deals, isLoading } = useTopDeals(1);
  const { userLevel, userXP, xpToNextLevel } = useUserStore();

  const topDeal = deals?.[0];

  return (
      <div className="h-full flex flex-col gap-5">
        <div className="text-sm text-white/65 font-semibold">{t('notifications.title')}</div>

        <Panel className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-3">
            
            {/* Dynamic Deal Notification */}
            {isLoading ? (
                <Card className="p-4 bg-slate-950/40 border border-slate-800/60 animate-pulse h-28" />
            ) : topDeal ? (
                <Card className="p-4 bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/85 font-semibold flex items-center gap-2">
                      <span className="text-red-400">🔥</span>
                      {t('notifications.deal.title', { title: topDeal.title })}
                    </div>
                    <div className="text-[11px] text-white/45">{t('notifications.deal.time')}</div>
                  </div>
                  <div className="text-xs text-white/55 mt-2 leading-relaxed">
                    {t('notifications.deal.desc', { savings: Math.round(parseFloat(topDeal.savings)), title: topDeal.title })}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="soft" className="text-xs py-1.5">{t('notifications.deal.to_deals')}</Button>
                    <Button variant="ghost" className="text-xs py-1.5 text-white/40 hover:text-white/80">{t('notifications.deal.hide')}</Button>
                  </div>
                </Card>
            ) : null}

            {/* Level Notification */}
            {userLevel > XP_LEVELING.initialLevel && (
                <Card className="p-4 bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white/85 font-semibold flex items-center gap-2">
                      <span className="text-emerald-400">⭐</span>
                      {t('notifications.level.title', { level: userLevel })}
                    </div>
                    <div className="text-[11px] text-white/45">{t('notifications.level.time')}</div>
                  </div>
                  <div className="text-xs text-white/55 mt-2 leading-relaxed">
                    {t('notifications.level.desc', { xp: xpToNextLevel - userXP })}
                  </div>
                </Card>
            )}

            <Card className="p-4 bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                <div className="text-sm text-white/85 font-semibold flex items-center gap-2">
                    <span className="text-blue-400">👋</span>
                    {t('notifications.welcome.title')}
                </div>
                <div className="text-[11px] text-white/45">{t('notifications.welcome.time')}</div>
                </div>
                <div className="text-xs text-white/55 mt-2 leading-relaxed">
                {t('notifications.welcome.desc')}
                </div>
            </Card>

          </div>

          <Panel className="p-5 bg-slate-950/20 border border-slate-800/60 h-fit">
            <div className="text-sm text-white/75 font-semibold mb-4 flex items-center gap-2">
              <span>📌</span> {t('notifications.pinned.title')}
            </div>
            <div className="space-y-3">
              <Card className="p-4 bg-emerald-950/25 border border-emerald-900/40">
                <div className="text-xs text-emerald-400/60 uppercase font-bold tracking-wider">{t('notifications.pinned.api_status.label')}</div>
                <div className="text-sm text-emerald-400 font-semibold mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
                  {t('notifications.pinned.api_status.online')}
                </div>
              </Card>
              <Card className="p-4 bg-slate-950/40 border border-slate-800/60">
                <div className="text-xs text-white/45 uppercase font-bold tracking-wider">{t('notifications.pinned.next_step.label')}</div>
                <div className="text-sm text-white/70 mt-1 leading-relaxed">
                  {t('notifications.pinned.next_step.desc')}
                </div>
              </Card>
            </div>
          </Panel>
        </Panel>
      </div>
  );
}