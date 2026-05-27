// HOME / DASHBOARD VIEW
// Editorial dashboard: hero with weather + next event, today's agenda, week-at-a-glance, wire ticker.

const { useMemo: homeUseMemo } = React;

function HomeView({ now, weather, density, onNavigate, events, nextCall }) {
  const go = (v) => onNavigate && onNavigate(v);
  const dense = density === 'compact';
  const allEvents = events && events.length ? events : TODAY_EVENTS;
  // Find current/next event
  const sorted = homeUseMemo(() => [...allEvents].sort((a,b) => a.start - b.start), [allEvents]);
  const current = sorted.find(e => e.start <= now && e.end > now);
  const upcoming = sorted.filter(e => e.start > now);
  const nextEvent = current || upcoming[0];
  const nextThree = upcoming.slice(current ? 0 : 1, current ? 3 : 4);

  // mins until next non-current event
  const minutesUntil = nextEvent && nextEvent.start > now
    ? Math.max(0, Math.round((nextEvent.start - now) / 60000))
    : 0;

  const ownerStaff = (id) => STAFF.find(s => s.id === id) || STAFF[0];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* TOP HERO ROW — split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.3fr 1fr',
        height: 360,
        flexShrink: 0,
      }}>
        {/* Hero: Today's headline / next event */}
        <div style={{
          background: 'var(--fs-navy)',
          color: 'var(--fs-paper)',
          padding: '40px 48px',
          position: 'relative', overflow: 'hidden',
        }} className="__paper-flip">
          <BeamMotif size={620} opacity={0.18} color="var(--fs-gold)"
            style={{ right: -220, top: -160, animation: 'beamPulse 5s ease-in-out infinite' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="gold-rule" />
            <span style={{
              fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'var(--fs-gold)',
            }}>
              {current ? 'Happening Now' : 'Up Next · in ' + minutesUntil + ' min'}
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--fs-font-display)',
            fontWeight: 700, fontSize: 64,
            lineHeight: 1.05, letterSpacing: '-0.02em',
            margin: '20px 0 18px', color: 'var(--fs-paper)',
            maxWidth: 740, textWrap: 'pretty',
          }}>
            {nextEvent ? nextEvent.title : 'Nothing on the calendar.'}
          </h1>

          {nextEvent && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 32, marginBottom: 28 }}>
              <div>
                <div style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 11,
                  color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Time</div>
                <div className="tabular" style={{
                  fontFamily: 'var(--fs-font-display)',
                  fontSize: 30, fontWeight: 700, lineHeight: 1,
                }}>
                  {nextEvent.start.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}
                  <span style={{ opacity: 0.5 }}> – </span>
                  {nextEvent.end.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}
                </div>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 11,
                  color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Location</div>
                <div style={{
                  fontFamily: 'var(--fs-font-display)',
                  fontStyle: 'italic',
                  fontSize: 24, fontWeight: 400, lineHeight: 1,
                }}>{nextEvent.location}</div>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 11,
                  color: 'rgba(255,255,255,0.55)', letterSpacing: '0.16em',
                  textTransform: 'uppercase', marginBottom: 6,
                }}>Owner</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StaffAvatar staff={ownerStaff(nextEvent.owner)} size={32} />
                  <span style={{
                    fontFamily: 'var(--fs-font-display)',
                    fontSize: 22, fontWeight: 400,
                  }}>{ownerStaff(nextEvent.owner).name}</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA row — single click opens the real meeting link, platform from the calendar */}
          {(() => {
            const url = eventCallUrl(nextEvent) || (nextCall && nextCall.url);
            const platform = url && detectCallPlatform(url);
            if (!nextEvent || !url) return null;
            return (
              <button onClick={() => window.open(url, '_blank', 'noopener')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 22px',
                background: 'var(--fs-gold)',
                border: 'none', color: 'var(--fs-ink)',
                fontFamily: 'var(--fs-font-sans)',
                fontSize: 13, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: 'pointer',
              }}>
                <Icon name="phone-call" size={16} />
                Join {platform ? platform.name : 'Call'} · 1-Touch
                <span style={{ marginLeft: 6, opacity: 0.6, fontFamily: 'var(--fs-font-mono)', fontSize: 11 }}>⌘5</span>
              </button>
            );
          })()}
        </div>

        {/* Weather + ambient block */}
        <div style={{
          background: 'var(--fs-bone-50)',
          padding: '40px 36px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderLeft: '1px solid var(--fs-border)',
        }} className="__paper-flip">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="gold-rule" />
              <span className="eyebrow">{weather.city}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 18 }}>
              <span className="display tabular" style={{
                fontWeight: 700, fontSize: 120,
                color: 'var(--fs-fg-brand)', letterSpacing: '-0.04em', lineHeight: 0.9,
              }}>{weather.tempF}</span>
              <span className="display" style={{
                fontWeight: 400, fontSize: 60,
                color: 'var(--fs-fg-muted)', letterSpacing: '-0.04em', lineHeight: 1,
              }}>°F</span>
              <div style={{ marginLeft: 12 }}>
                <WeatherGlyph condition={weather.condition} size={56} />
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--fs-font-display)',
              fontStyle: 'italic', fontSize: 24,
              color: 'var(--fs-fg-muted)', marginTop: 6,
            }}>{weather.condition}</div>
          </div>

          {/* Mini stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
            borderTop: '1px solid var(--fs-border)', paddingTop: 16, gap: 4,
          }}>
            {[
              {l: 'High', v: weather.high + '°'},
              {l: 'Low', v: weather.low + '°'},
              {l: 'Sunset', v: weather.sunset},
              {l: 'Wind', v: weather.wind},
            ].map(s => (
              <div key={s.l}>
                <div style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 10,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'var(--fs-fg-subtle)', marginBottom: 4,
                }}>{s.l}</div>
                <div className="tabular" style={{
                  fontFamily: 'var(--fs-font-display)', fontSize: 22,
                  fontWeight: 700, color: 'var(--fs-fg-brand)',
                }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE ROW — Today's agenda + Week ahead */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        borderTop: '1px solid var(--fs-border)',
        minHeight: 0,
      }}>
        {/* Today's Agenda */}
        <div style={{
          padding: '24px 36px 16px',
          display: 'flex', flexDirection: 'column',
          background: 'var(--fs-paper)',
        }} className="__paper-flip">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div className="gold-rule" />
            <span className="eyebrow">Today's Agenda</span>
            <span style={{ flex: 1 }} />
            <span style={{
              fontFamily: 'var(--fs-font-sans)', fontSize: 12,
              color: 'var(--fs-fg-muted)',
            }}>
              {sorted.length} events · {sorted.filter(e => e.end > now).length} remaining
            </span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: dense ? 4 : 6 }}>
            {sorted.map((e, i) => {
              const isPast = e.end <= now;
              const isCurrent = e.start <= now && e.end > now;
              const staff = ownerStaff(e.owner);
              return (
                <div key={i} onClick={() => go('calendar')} style={{
                  display: 'grid', gridTemplateColumns: '120px 6px 1fr auto',
                  alignItems: 'center', gap: 16,
                  padding: '10px 12px 10px 0',
                  borderBottom: i < sorted.length - 1 ? '1px solid var(--fs-border)' : 'none',
                  opacity: isPast ? 0.42 : 1,
                  background: isCurrent ? 'rgba(239,197,63,0.08)' : 'transparent',
                  cursor: 'pointer',
                }}>
                  <div className="tabular" style={{
                    fontFamily: 'var(--fs-font-display)',
                    fontWeight: 700, fontSize: 22,
                    color: isCurrent ? 'var(--fs-fg-accent)' : 'var(--fs-fg-brand)',
                    letterSpacing: '-0.01em',
                  }}>
                    {e.start.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}
                  </div>
                  <div style={{
                    width: 4, height: 32,
                    background: isCurrent ? 'var(--fs-gold)' : staff.color,
                    opacity: isPast ? 0.4 : 1,
                  }} />
                  <div>
                    <div style={{
                      fontFamily: 'var(--fs-font-display)',
                      fontWeight: 400, fontSize: 22,
                      color: 'var(--fs-fg-brand)',
                      lineHeight: 1.15,
                      textDecoration: isPast ? 'line-through' : 'none',
                      textDecorationThickness: '1px',
                    }}>{e.title}</div>
                    <div style={{
                      fontFamily: 'var(--fs-font-sans)', fontSize: 13,
                      color: 'var(--fs-fg-muted)', marginTop: 2,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Icon name="map-pin" size={12} /> {e.location}
                      <span style={{ color: 'var(--fs-fg-subtle)' }}>·</span>
                      <span>{staff.initials}</span>
                    </div>
                  </div>
                  <div>
                    {isCurrent && <span style={{
                      fontFamily: 'var(--fs-font-mono)', fontSize: 10,
                      letterSpacing: '0.18em', color: 'var(--fs-fg-accent)',
                      padding: '4px 8px', border: '1px solid var(--fs-gold)',
                    }}>NOW</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Week + Announcements stack */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderLeft: '1px solid var(--fs-border)',
        }}>
          {/* Week ahead */}
          <div onClick={() => go('calendar')} style={{ padding: '24px 32px 18px', background: 'var(--fs-bone-50)', flex: 1, cursor: 'pointer' }} className="__paper-flip">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div className="gold-rule" />
              <span className="eyebrow">Week Ahead</span>
            </div>
            <WeekAtAGlance now={now} />
          </div>

          {/* Announcements */}
          <div style={{
            padding: '20px 32px', background: 'var(--fs-bg)',
            borderTop: '1px solid var(--fs-border)',
            flex: 0.7,
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div className="gold-rule" />
              <span className="eyebrow">Announcements</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {ANNOUNCEMENTS.slice(0, 4).map((a, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '70px 1fr',
                  gap: 12, padding: '6px 0',
                  borderBottom: i < 3 ? '1px solid var(--fs-border)' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'var(--fs-font-mono)', fontSize: 9,
                    letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: 'var(--fs-fg-accent)', alignSelf: 'center',
                  }}>{a.kind}</span>
                  <div style={{
                    fontFamily: 'var(--fs-font-serif)',
                    fontSize: 15, lineHeight: 1.4,
                    color: 'var(--fs-fg)', textWrap: 'pretty',
                  }}>{a.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WIRE TICKER */}
      <div data-wire style={{
        background: 'var(--fs-ink)',
        color: 'var(--fs-paper)',
        height: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        transition: 'background 200ms',
      }}>
        <div style={{
          flexShrink: 0,
          background: 'var(--fs-gold)',
          color: 'var(--fs-ink)',
          height: '100%',
          display: 'flex', alignItems: 'center',
          padding: '0 18px',
          fontFamily: 'var(--fs-font-sans)',
          fontWeight: 700, fontSize: 12,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          <span className="live-dot" style={{ background: 'var(--fs-ink)', marginRight: 10 }} />
          Wire
        </div>
        <div style={{
          flex: 1, overflow: 'hidden', position: 'relative',
          whiteSpace: 'nowrap',
        }}>
          <div style={{
            display: 'inline-flex', gap: 60,
            animation: 'tickerScroll 90s linear infinite',
            paddingLeft: 32,
          }}>
            {[...WIRE, ...WIRE].map((w, i) => (
              <span key={i} style={{
                fontFamily: 'var(--fs-font-serif)',
                fontSize: 16, color: 'var(--fs-paper)',
              }}>
                <span style={{ color: 'var(--fs-gold)', marginRight: 12, fontFamily: 'var(--fs-font-mono)', fontSize: 12, letterSpacing: '0.14em' }}>· {String(i % WIRE.length + 1).padStart(2,'0')} ·</span>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ───── Helpers ─────
function StaffAvatar({ staff, size = 28 }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size,
      background: staff.color, color: '#fff',
      fontFamily: 'var(--fs-font-sans)',
      fontWeight: 700, fontSize: size * 0.4,
      letterSpacing: '0.04em',
    }}>{staff.initials}</span>
  );
}

function WeekAtAGlance({ now }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const todayIdx = (now.getDay() + 6) % 7; // Mon=0
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - todayIdx);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {days.map((d, i) => {
        const dt = new Date(startOfWeek);
        dt.setDate(startOfWeek.getDate() + i);
        const isToday = i === todayIdx;
        const count = WEEK_EVENT_COUNT[i];
        return (
          <div key={d} style={{
            display: 'grid', gridTemplateColumns: '60px 40px 1fr auto',
            alignItems: 'center', gap: 16,
            padding: '10px 12px',
            background: isToday ? 'var(--fs-navy)' : 'transparent',
            color: isToday ? 'var(--fs-paper)' : 'var(--fs-fg)',
            borderLeft: isToday ? '3px solid var(--fs-gold)' : '3px solid transparent',
          }}>
            <div className="eyebrow" style={{ color: isToday ? 'var(--fs-gold)' : 'var(--fs-fg-accent)' }}>{d}</div>
            <div className="tabular display" style={{
              fontWeight: 700, fontSize: 28, lineHeight: 1,
              color: isToday ? 'var(--fs-paper)' : 'var(--fs-fg-brand)',
            }}>{dt.getDate()}</div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {Array.from({length: count}).map((_, j) => (
                <span key={j} style={{
                  width: 18, height: 4,
                  background: isToday ? 'var(--fs-gold)' : 'var(--fs-navy)',
                  opacity: 0.7,
                }} />
              ))}
            </div>
            <div className="tabular" style={{
              fontFamily: 'var(--fs-font-mono)', fontSize: 12,
              color: isToday ? 'rgba(255,255,255,0.6)' : 'var(--fs-fg-muted)',
            }}>{count} evt</div>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { HomeView, StaffAvatar });
