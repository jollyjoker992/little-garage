import { useEffect } from 'react';
import { go } from '../app/router';
import { GAMES, ZONES, type ZoneId } from '../content/catalog';
import { L, t } from '../engine/i18n';
import { say } from '../engine/speech';
import { sfx } from '../engine/sound';
import { useStore } from '../engine/store';
import { isPlayable } from '../games/registry';
import { ThingView } from '../ui/ThingView';
import { TopBar } from '../ui/TopBar';

export function ZoneScreen({ id }: { id: ZoneId }) {
  const lang = useStore((s) => s.lang);
  const hidden = useStore((s) => s.hidden);
  const zone = ZONES.find((z) => z.id === id);
  const games = GAMES.filter((g) => g.zones.includes(id) && g.status === 'ready' && isPlayable(g.id) && !hidden.includes(g.id));
  useEffect(() => { void say(L(`zone.${id}.intro`)); }, [id]);
  if (!zone) return null;
  return (
    <div className={`screen zone zone-${id}`}>
      <TopBar onReplay={() => void say(L(`zone.${id}.intro`))}>
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
    </div>
  );
}
