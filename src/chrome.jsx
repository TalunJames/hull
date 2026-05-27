// Chrome: top status bar, left rail nav, bottom streamdeck strip.

const { useState: chromeUseState, useEffect: chromeUseEffect, useMemo: chromeUseMemo } = React;

// ───── Top status bar ─────
function TopBar({ now, weather, mic, cam, recording, volume, dark, onToggleDark, onToggleMic, onToggleCam, onChangeVolume }) {
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const dateLine = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const hours = now.getHours();
  const greet = hours < 12 ? 'Good morning' : hours < 17 ? 'Good afternoon' : 'Good evening';
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return (
    <div style={{
      height: 88, display: 'grid',
      gridTemplateColumns: '420px 1fr auto',
      alignItems: 'center',
      borderBottom: '1px solid var(--fs-border)',
      background: 'var(--fs-paper)',
      paddingLeft: 24, paddingRight: 32,
      position: 'relative', zIndex: 10,
    }}>
      {/* Logo block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <img src={dark ? 'assets/logo-horizontal-white.png' : 'assets/logo-horizontal-blue.png'}
          alt="Fog Signal Strategies" style={{ height: 38 }} />
      </div>

      {/* Center: greet + day */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          fontFamily: 'var(--fs-font-display)',
          fontWeight: 400, fontStyle: 'italic',
          fontSize: 22, color: 'var(--fs-fg-muted)',
          letterSpacing: '-0.005em',
        }}>
          {greet}, team
        </div>
        <div style={{
          fontFamily: 'var(--fs-font-display)',
          fontWeight: 700, fontSize: 28,
          color: 'var(--fs-fg-brand)',
          lineHeight: 1.1, letterSpacing: '-0.015em',
        }}>
          {dayName} · {dateLine}
        </div>
      </div>

      {/* Right: clock + status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {/* Status pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {recording && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px',
              background: 'rgba(168,52,30,0.08)',
              border: '1px solid #A8341E',
              color: '#A8341E',
              fontFamily: 'var(--fs-font-sans)', fontSize: 11,
              fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              <span className="live-dot" style={{ background: '#A8341E' }} />
              Krisp · Recording
            </div>
          )}
          <button onClick={onToggleMic} title="Mute mic" style={pillBtn(mic ? 'on' : 'off')}>
            <Icon name={mic ? 'mic' : 'mic-off'} size={16} />
            <span>{mic ? 'Mic On' : 'Muted'}</span>
          </button>
          <button onClick={onToggleCam} title="Toggle cam" style={pillBtn(cam ? 'on' : 'off')}>
            <Icon name={cam ? 'video' : 'video-off'} size={16} />
            <span>{cam ? 'Cam On' : 'Cam Off'}</span>
          </button>
          <VolumePill volume={volume} onChange={onChangeVolume} />
          <button onClick={onToggleDark} title="Toggle dark" style={pillBtn('neutral')}>
            <Icon name={dark ? 'sun' : 'moon'} size={16} />
          </button>
        </div>

        <div style={{ width: 1, height: 48, background: 'var(--fs-border)' }} />

        {/* Big clock */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }} className="tabular">
          <div style={{
            fontFamily: 'var(--fs-font-display)',
            fontWeight: 700, fontSize: 56,
            lineHeight: 0.95, color: 'var(--fs-fg-brand)',
            letterSpacing: '-0.02em',
          }}>{time.replace(/\s?(AM|PM)/, '')}</div>
          <div style={{
            fontFamily: 'var(--fs-font-sans)', fontSize: 14,
            fontWeight: 600, letterSpacing: '0.14em',
            color: 'var(--fs-fg-muted)', textTransform: 'uppercase',
            marginLeft: 4,
          }}>
            <div>{time.match(/(AM|PM)/) ? time.match(/(AM|PM)/)[0] : ''}</div>
            <div style={{ fontFamily: 'var(--fs-font-mono)', fontSize: 11, opacity: 0.6, marginTop: 2 }}>:{seconds}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function pillBtn(state) {
  const styles = {
    on:      { borderColor: 'var(--fs-success)', color: 'var(--fs-success)', background: 'rgba(47,107,79,0.06)' },
    off:     { borderColor: 'var(--fs-danger)',  color: 'var(--fs-danger)',  background: 'rgba(168,52,30,0.06)' },
    neutral: { borderColor: 'var(--fs-border-strong)', color: 'var(--fs-fg-muted)', background: 'transparent' },
  };
  return {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px',
    border: '1px solid',
    background: 'transparent',
    fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    cursor: 'pointer',
    ...styles[state],
  };
}

function VolumePill({ volume, onChange }) {
  const bars = 8;
  const filled = Math.round((volume / 100) * bars);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 12px',
      border: '1px solid var(--fs-border-strong)',
      color: 'var(--fs-fg-muted)',
    }}>
      <Icon name={volume === 0 ? 'volume-x' : volume < 35 ? 'volume-1' : 'volume-2'} size={16} />
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({length: bars}).map((_, i) => (
          <button key={i} onClick={() => onChange(Math.round(((i+1)/bars)*100))}
            style={{
              width: 4, height: i < filled ? 14 : 8,
              background: i < filled ? 'var(--fs-fg-brand)' : 'var(--fs-border-strong)',
              border: 'none', padding: 0, cursor: 'pointer', alignSelf: 'center',
              transition: 'height 120ms',
            }}/>
        ))}
      </div>
      <span className="tabular" style={{ fontFamily: 'var(--fs-font-mono)', fontSize: 11, minWidth: 28, textAlign: 'right' }}>{volume}</span>
    </div>
  );
}

// ───── Left rail nav ─────
const NAV_ITEMS = [
  { id: 'home',     label: 'Home',     icon: 'home',       key: '1' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar',   key: '2' },
  { id: 'livetv',   label: 'Live TV',  icon: 'tv',         key: '3' },
  { id: 'docs',     label: 'Drive',    icon: 'folder',     key: '4' },
  { id: 'call',     label: 'Go to Call', icon: 'phone-call', key: '5' },
  { id: 'staff',    label: 'Staff',    icon: 'users',      key: '6' },
];

function LeftRail({ active, onNavigate }) {
  return (
    <div style={{
      width: 112,
      background: 'var(--fs-navy)',
      color: 'var(--fs-paper)',
      display: 'flex', flexDirection: 'column',
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <BeamMotif size={420} opacity={0.06} color="var(--fs-gold)" style={{ left: -120, top: -60 }} />
      <div style={{
        padding: '20px 0 12px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--fs-font-mono)',
        fontSize: 10, letterSpacing: '0.2em',
        color: 'var(--fs-gold)',
        opacity: 0.7,
      }}>
        FOG · TV
      </div>
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 8 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id}
            className={'nav-btn ' + (active === item.id ? 'active' : '')}
            onClick={() => onNavigate(item.id)}>
            <span className="nav-key">{item.key}</span>
            <Icon name={item.icon} size={26} strokeWidth={1.5} />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{
        padding: '12px 8px 14px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'var(--fs-font-mono)',
        fontSize: 9, letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span>LIVE</span>
        </div>
        v1.0
      </div>
    </div>
  );
}

// ───── Bottom Streamdeck strip ─────
function DeckStrip({ buttons, onPress }) {
  return (
    <div style={{
      height: 88,
      background: 'var(--fs-navy-900)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px',
      gap: 14,
      color: 'var(--fs-paper)',
    }}>
      <div style={{
        fontFamily: 'var(--fs-font-sans)',
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--fs-gold)',
        writingMode: 'vertical-rl', transform: 'rotate(180deg)',
        paddingRight: 8, borderRight: '1px solid rgba(255,255,255,0.1)',
        marginRight: 4,
      }}>
        Streamdeck
      </div>
      {buttons.map((b, i) => (
        <button key={i}
          className={'deck-btn ' + (b.tone || '')}
          onClick={() => onPress && onPress(b)}>
          <span className="deck-num">{(i+1).toString().padStart(2, '0')}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {b.icon && <Icon name={b.icon} size={14} />}
            <span className="deck-label">{b.label}</span>
          </span>
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{
        fontFamily: 'var(--fs-font-mono)', fontSize: 11,
        color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em',
      }}>
        Press any key · or click ↑
      </div>
    </div>
  );
}

Object.assign(window, { TopBar, LeftRail, DeckStrip, NAV_ITEMS });
