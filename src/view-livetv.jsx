// LIVE TV — quadbox/focus/duo view, YouTube TV style

const { useState: tvUseState } = React;

function LiveTVView({ volume, muted, onChangeVolume, onToggleMute,
                     channels, onSetChannels, primary, onSetPrimary,
                     layout, onSetLayout }) {
  // Standalone fallback
  const [_chs, _setChs] = tvUseState([CHANNELS[0].id, CHANNELS[2].id, CHANNELS[3].id, CHANNELS[7].id]);
  const [_pri, _setPri] = tvUseState(0);
  const [_layout, _setLayout] = tvUseState('quad');
  const selected = channels || _chs;
  const setSelected = onSetChannels || _setChs;
  const primIdx = primary !== undefined ? primary : _pri;
  const setPrim = onSetPrimary || _setPri;
  const L = layout || _layout;
  const setL = onSetLayout || _setLayout;

  const setQuad = (idx, channelId) => {
    setSelected(prev => prev.map((c, i) => i === idx ? channelId : c));
  };

  // Click in guide: if already on-screen, take audio there; else replace primary.
  const handleGuideClick = (channelId) => {
    const existing = selected.indexOf(channelId);
    if (existing >= 0) { setPrim(existing); return; }
    setQuad(primIdx, channelId);
  };

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* MAIN PLAYER AREA */}
      <div style={{
        flex: 1, background: '#000',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Header bar */}
        <div style={{
          padding: '14px 28px',
          background: 'var(--fs-navy-900)',
          color: 'var(--fs-paper)',
          borderBottom: '2px solid var(--fs-gold)',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <div className="live-dot" />
          <div style={{
            fontFamily: 'var(--fs-font-mono)', fontSize: 11,
            letterSpacing: '0.18em', color: 'var(--fs-gold)',
            fontWeight: 600,
          }}>AUDIO · {L === 'focus' ? 'FOCUS' : L === 'duo' ? 'DUO' : 'QUAD'} {primIdx + 1}</div>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--fs-font-display)',
              fontSize: 22, fontWeight: 700, lineHeight: 1.1,
              letterSpacing: '-0.01em',
            }}>{getChannel(selected[primIdx]).show}</div>
            <div style={{
              fontFamily: 'var(--fs-font-sans)', fontSize: 12,
              color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em',
              marginTop: 2,
            }}>{getChannel(selected[primIdx]).network} · {getChannel(selected[primIdx]).viewers} watching</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onToggleMute} style={{
              padding: '8px 12px', background: muted ? 'var(--fs-danger)' : 'transparent',
              border: '1px solid ' + (muted ? 'var(--fs-danger)' : 'rgba(255,255,255,0.25)'),
              color: 'var(--fs-paper)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              <Icon name={muted ? 'volume-x' : 'volume-2'} size={14} />
              {muted ? 'Muted' : 'Sound On'}
            </button>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 10px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              <button onClick={() => onChangeVolume(Math.max(0, volume - 10))}
                style={{ background: 'transparent', border: 'none', color: 'var(--fs-paper)', cursor: 'pointer' }}>
                <Icon name="minus" size={12} />
              </button>
              <span className="tabular" style={{
                fontFamily: 'var(--fs-font-mono)', fontSize: 11,
                minWidth: 30, textAlign: 'center', color: 'var(--fs-paper)',
              }}>{volume}</span>
              <button onClick={() => onChangeVolume(Math.min(100, volume + 10))}
                style={{ background: 'transparent', border: 'none', color: 'var(--fs-paper)', cursor: 'pointer' }}>
                <Icon name="plus" size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Layout body */}
        <div style={{ flex: 1, background: 'var(--fs-navy-900)', position: 'relative' }}>
          {L === 'quad' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 2,
            }}>
              {selected.map((cid, i) => (
                <TVTile key={i}
                  channel={getChannel(cid)}
                  isPrimary={i === primIdx}
                  onSelect={() => setPrim(i)}
                  idx={i}/>
              ))}
            </div>
          )}
          {L === 'focus' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'grid',
              gridTemplateColumns: '3fr 1fr',
              gridTemplateRows: 'repeat(3, 1fr)',
              gap: 2,
            }}>
              <div style={{ gridColumn: '1 / 2', gridRow: '1 / 4' }}>
                <TVTile channel={getChannel(selected[primIdx])} isPrimary idx={primIdx}
                  onSelect={() => setPrim(primIdx)} />
              </div>
              {selected.map((cid, i) => i === primIdx ? null : (
                <TVTile key={i} channel={getChannel(cid)} isPrimary={false} idx={i}
                  onSelect={() => setPrim(i)} small />
              ))}
            </div>
          )}
          {L === 'duo' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr',
              gap: 2,
            }}>
              {[primIdx, (primIdx + 1) % 4].map((slot) => (
                <TVTile key={slot} channel={getChannel(selected[slot])}
                  isPrimary={slot === primIdx} idx={slot}
                  onSelect={() => setPrim(slot)} />
              ))}
            </div>
          )}
        </div>

        {/* Transport bar */}
        <div style={{
          background: 'var(--fs-ink)',
          color: 'var(--fs-paper)',
          padding: '10px 28px',
          display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <span style={{
            fontFamily: 'var(--fs-font-mono)', fontSize: 10,
            letterSpacing: '0.18em', color: 'var(--fs-gold)',
          }}>LAYOUT</span>
          <div style={{ display: 'inline-flex' }}>
            {['quad', 'focus', 'duo'].map(name => (
              <button key={name} onClick={() => setL(name)} style={{
                padding: '6px 14px',
                background: L === name ? 'var(--fs-gold)' : 'transparent',
                color: L === name ? 'var(--fs-ink)' : 'var(--fs-paper)',
                border: '1px solid rgba(255,255,255,0.18)',
                fontFamily: 'var(--fs-font-sans)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: 'pointer', marginLeft: -1,
              }}>{name}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            fontFamily: 'var(--fs-font-mono)', fontSize: 11,
            color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em',
          }}>
            Click a tile to take audio · Click a channel in the guide to swap
          </div>
        </div>
      </div>

      {/* CHANNEL GUIDE SIDEBAR */}
      <div style={{
        width: 320, flexShrink: 0,
        background: 'var(--fs-bone-50)',
        borderLeft: '1px solid var(--fs-border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} className="__paper-flip">
        <div style={{ padding: '18px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="gold-rule" />
            <span className="eyebrow">YouTube TV · Guide</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--fs-font-display)',
            fontSize: 26, fontWeight: 700, margin: '8px 0 0',
            color: 'var(--fs-fg-brand)', letterSpacing: '-0.015em',
          }}>Live Now</h2>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 16px' }}>
          {CHANNELS.map(ch => {
            const slotIdx = selected.indexOf(ch.id);
            return (
              <button key={ch.id} onClick={() => handleGuideClick(ch.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr auto',
                  gap: 12, alignItems: 'center',
                  padding: '10px 8px',
                  border: 'none',
                  borderBottom: '1px solid var(--fs-border)',
                  background: slotIdx >= 0 ? 'rgba(26,58,92,0.08)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  borderLeft: slotIdx >= 0 ? '3px solid var(--fs-gold)' : '3px solid transparent',
                }}>
                <div style={{
                  width: 32, height: 32, background: 'var(--fs-navy)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--fs-paper)',
                  fontFamily: 'var(--fs-font-display)', fontWeight: 700, fontSize: 10,
                  letterSpacing: '0.04em',
                }}>{ch.name.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
                <div>
                  <div style={{
                    fontFamily: 'var(--fs-font-display)',
                    fontSize: 15, fontWeight: 700, color: 'var(--fs-fg-brand)',
                    lineHeight: 1.1,
                  }}>{ch.name}</div>
                  <div style={{
                    fontFamily: 'var(--fs-font-sans)', fontSize: 11,
                    color: 'var(--fs-fg-muted)', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{ch.show}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  {ch.live ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontFamily: 'var(--fs-font-mono)', fontSize: 9,
                      letterSpacing: '0.16em', color: 'var(--fs-danger)',
                      fontWeight: 700,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--fs-danger)' }} />
                      LIVE
                    </span>
                  ) : (
                    <span style={{
                      fontFamily: 'var(--fs-font-mono)', fontSize: 9,
                      color: 'var(--fs-fg-subtle)', letterSpacing: '0.16em',
                    }}>OFF AIR</span>
                  )}
                  {slotIdx >= 0 && (
                    <span style={{
                      fontFamily: 'var(--fs-font-mono)', fontSize: 9,
                      color: 'var(--fs-fg-accent)', letterSpacing: '0.12em',
                      fontWeight: 600,
                    }}>Q{slotIdx + 1}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getChannel(id) {
  return CHANNELS.find(c => c.id === id) || CHANNELS[0];
}

function TVTile({ channel, isPrimary, onSelect, idx, small }) {
  const palettes = [
    { bg: '#0E2238', accent: '#EFC53F', text: '#fff' },
    { bg: '#14304B', accent: '#F4D77A', text: '#fff' },
    { bg: '#1A3A5C', accent: '#FBECBF', text: '#fff' },
    { bg: '#0F0F0F', accent: '#EFC53F', text: '#fff' },
  ];
  const p = palettes[idx % 4];

  return (
    <div onClick={onSelect}
      style={{
        position: 'relative',
        background: p.bg,
        overflow: 'hidden', cursor: 'pointer',
        outline: isPrimary ? '3px solid var(--fs-gold)' : '0',
        outlineOffset: -3,
        width: '100%', height: '100%',
      }}>
      <MockNewsFrame channel={channel} palette={p} />

      <div style={{
        position: 'absolute', top: 12, left: 12,
        padding: '4px 8px',
        background: 'rgba(0,0,0,0.5)',
        color: p.accent,
        fontFamily: 'var(--fs-font-display)', fontWeight: 700, fontSize: small ? 11 : 14,
        letterSpacing: '0.04em',
        backdropFilter: 'blur(4px)',
      }}>{channel.name}</div>

      {channel.live && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 8px',
          background: 'rgba(168,52,30,0.9)',
          color: '#fff',
          fontFamily: 'var(--fs-font-mono)', fontSize: small ? 8 : 10,
          fontWeight: 700, letterSpacing: '0.16em',
        }}>
          <span className="live-dot" style={{ background: '#fff', width: 6, height: 6 }} />
          LIVE
        </div>
      )}

      <div style={{
        position: 'absolute', top: 12, right: channel.live ? (small ? 60 : 80) : 12,
        fontFamily: 'var(--fs-font-mono)', fontSize: small ? 8 : 10,
        color: 'rgba(255,255,255,0.7)', letterSpacing: '0.16em',
      }}>Q{idx+1}</div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))',
        padding: small ? '24px 12px 10px' : '40px 16px 14px',
        color: '#fff',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '3px 8px',
          background: p.accent,
          color: '#0F0F0F',
          fontFamily: 'var(--fs-font-sans)', fontWeight: 700, fontSize: small ? 8 : 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          marginBottom: 6,
        }}>{channel.network}</div>
        <div style={{
          fontFamily: 'var(--fs-font-display)', fontWeight: 700, fontSize: small ? 13 : 18,
          lineHeight: 1.15, textWrap: 'pretty', maxWidth: '90%',
        }}>{channel.show}</div>
      </div>

      {isPrimary && (
        <div style={{
          position: 'absolute', bottom: 14, right: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px',
          background: 'var(--fs-gold)',
          color: 'var(--fs-ink)',
          fontFamily: 'var(--fs-font-sans)', fontSize: small ? 8 : 10, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          <Icon name="volume-2" size={small ? 10 : 12} />
          Audio
        </div>
      )}
    </div>
  );
}

function MockNewsFrame({ channel, palette }) {
  const scenes = {
    cspan:  { type: 'chamber', label: 'HOUSE FLOOR' },
    cspan2: { type: 'chamber', label: 'SENATE HEARING' },
    msnbc:  { type: 'anchor',  label: 'STUDIO B' },
    cnn:    { type: 'anchor',  label: 'NEWSROOM' },
    foxnews:{ type: 'anchor',  label: 'AMERICA REPORTS' },
    bloom:  { type: 'chart',   label: 'MARKETS' },
    cnbc:   { type: 'chart',   label: 'POWER LUNCH' },
    wral:   { type: 'anchor',  label: 'RALEIGH STUDIO' },
    wbtv:   { type: 'anchor',  label: 'CHARLOTTE STUDIO' },
    pbsnh:  { type: 'static',  label: 'OFF AIR' },
    nccap:  { type: 'chamber', label: 'NC HOUSE COMMITTEE' },
    wapo:   { type: 'anchor',  label: 'WHITE HOUSE BRIEFING' },
  };
  const s = scenes[channel.id] || scenes.cnn;

  if (s.type === 'static') {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        background: '#0F0F0F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'var(--fs-font-mono)', fontSize: 12, letterSpacing: '0.3em',
      }}>{s.label}</div>
    );
  }

  if (s.type === 'chamber') {
    return (
      <svg width="100%" height="100%" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={'p-'+channel.id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill={palette.bg}/>
            <rect width="20" height="0.5" fill="rgba(255,255,255,0.04)"/>
          </pattern>
        </defs>
        <rect width="400" height="225" fill={palette.bg}/>
        <rect x="0" y="0" width="400" height="225" fill={`url(#p-${channel.id})`}/>
        <rect x="0" y="170" width="400" height="60" fill="rgba(0,0,0,0.4)"/>
        {[40, 100, 160, 220, 280, 340].map((x, i) => (
          <rect key={i} x={x} y={60} width={20} height={110} fill="rgba(255,255,255,0.06)" />
        ))}
        <rect x={180} y={140} width={40} height={30} fill="rgba(255,255,255,0.12)" />
        <circle cx={200} cy={130} r={8} fill="rgba(255,255,255,0.25)" />
        <circle cx={200} cy={50} r={18} fill="none" stroke={palette.accent} strokeWidth="1" opacity="0.5" />
        <text x={200} y={54} textAnchor="middle" fill={palette.accent} fontSize="8"
          fontFamily="var(--fs-font-display)" opacity="0.7">SEAL</text>
      </svg>
    );
  }

  if (s.type === 'chart') {
    const points = Array.from({length: 24}).map((_, i) => {
      const x = (i / 23) * 380 + 10;
      const y = 110 + Math.sin(i * 0.6 + channel.id.length) * 30 + (i * 0.5);
      return `${x},${y}`;
    }).join(' ');
    return (
      <svg width="100%" height="100%" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <rect width="400" height="225" fill={palette.bg}/>
        {[40, 80, 120, 160].map(y => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}
        {[80, 160, 240, 320].map(x => (
          <line key={x} x1={x} y1="0" x2={x} y2="225" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        ))}
        <rect x="0" y="190" width="400" height="35" fill="rgba(0,0,0,0.5)" />
        {['DJI +0.42%', 'SPX +0.18%', 'IXIC -0.05%', 'GOLD +1.2%'].map((t, i) => (
          <text key={i} x={20 + i*100} y={212} fill={palette.accent} fontSize="11"
            fontFamily="ui-monospace, monospace" letterSpacing="1">{t}</text>
        ))}
        <polyline fill="none" stroke={palette.accent} strokeWidth="1.5" points={points} />
        <polyline fill={palette.accent} fillOpacity="0.15" points={`10,180 ${points} 390,180`} />
      </svg>
    );
  }

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0 }}>
      <rect width="400" height="225" fill={palette.bg}/>
      <rect x="0" y="0" width="400" height="160" fill="rgba(0,0,0,0.25)"/>
      {Array.from({length: 12}).map((_, i) => (
        <rect key={i}
          x={20 + (i*30) % 360}
          y={30 + ((i*17) % 80)}
          width={14 + (i % 3) * 4}
          height={6}
          fill={palette.accent}
          opacity={0.18 + (i % 4) * 0.05}
        />
      ))}
      <rect x="0" y="160" width="400" height="65" fill="rgba(0,0,0,0.5)"/>
      <rect x="0" y="160" width="400" height="2" fill={palette.accent} opacity="0.4"/>
      <ellipse cx="200" cy="125" rx="22" ry="26" fill="rgba(255,255,255,0.18)"/>
      <path d="M 152 225 Q 152 175 200 170 Q 248 175 248 225 Z" fill="rgba(255,255,255,0.15)"/>
      <rect x="195" y="155" width="3" height="12" fill="rgba(255,255,255,0.3)"/>
      <circle cx="197" cy="152" r="3" fill="rgba(255,255,255,0.35)"/>
    </svg>
  );
}

Object.assign(window, { LiveTVView });
