import { useEffect, type ReactNode } from 'react';
import { go } from '../app/router';
import { GAMES, ZONES, type ZoneId } from '../content/catalog';
import { L, t } from '../engine/i18n';
import { say, type Step } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';
import { isPlayable } from '../games/registry';
import { ThingView } from '../ui/ThingView';
import { TopBar } from '../ui/TopBar';

/** `intro` replaces the spoken zone intro (English Street adds Zip and a friend); `footer` goes under the games. */
export function ZoneScreen({ id, intro, footer }: { id: ZoneId; intro?: () => Step[]; footer?: ReactNode }) {
  const lang = useStore((s) => s.lang);
  const hidden = useStore((s) => s.hidden);
  const zone = ZONES.find((z) => z.id === id);
  const games = GAMES.filter((g) => g.zones.includes(id) && g.status === 'ready' && isPlayable(g.id) && !hidden.includes(g.id));
  const sayIntro = () => void say(intro ? intro() : L(`zone.${id}.intro`));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(sayIntro, [id]);
  if (!zone) return null;
  return (
    <div className={`screen zone zone-${id}`}>
      <TopBar onReplay={sayIntro}>
        <h2 className="zone-title">{t(lang, L(`zone.${id}`))}</h2>
      </TopBar>
      <div className={`game-grid n${games.length}`}>
        {games.map((g, i) => (
          <button key={g.id} className="game-card pop-in" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => { sfx('pop'); go(`#/game/${g.id}`); }}>
            <div className="game-icon"><ThingView thing={g.icon} fit="center" /></div>
            <span className="game-name">{t(lang, L(`game.${g.id}`))}</span>
          </button>
        ))}
      </div>
      {footer}
    </div>
  );
}
