// GO TO CALL — one-touch join flow with prep + connection sequence

const { useState: callUseState, useEffect: callUseEffect } = React;

const CALL_APPS = [
  { id: 'zoom',  name: 'Zoom',           color: '#2D8CFF', icon: 'video' },
  { id: 'meet',  name: 'Google Meet',    color: '#00897B', icon: 'video' },
  { id: 'teams', name: 'Microsoft Teams',color: '#5059C9', icon: 'video' },
  { id: 'webex', name: 'Webex',          color: '#0D8E70', icon: 'video' },
];

function GoToCallView({ now, mic, cam, call, onSetMic, onSetCam, onNavigate }) {
  const NEXT = call || NEXT_CALL;
  const callUrl = NEXT.url || null;
  const detected = detectCallPlatform(callUrl);
  const [phase, setPhase] = callUseState('idle'); // idle | joining | live | skipped
  const [selectedApp, setSelectedApp] = callUseState((detected && detected.id) || 'zoom');
  const [step, setStep] = callUseState(0);
  const [snoozed, setSnoozed] = callUseState(false);

  callUseEffect(() => {
    if (phase === 'joining') {
      const stepInterval = setInterval(() => {
        setStep(s => {
          if (s >= 2) {
            clearInterval(stepInterval);
            setPhase('live');
            return s;
          }
          return s + 1;
        });
      }, 600);
      return () => clearInterval(stepInterval);
    }
  }, [phase]);

  const initiateCall = () => {
    // The real action: open the meeting link. Platform comes from the calendar.
    if (callUrl) window.open(callUrl, '_blank', 'noopener');
    setStep(0);
    setPhase('joining');
    onSetMic && onSetMic(true);
    onSetCam && onSetCam(true);
  };

  const reset = () => { setPhase('idle'); setStep(0); };

  const app = CALL_APPS.find(a => a.id === selectedApp) || CALL_APPS[0];

  if (phase === 'live') {
    return <LiveCallView call={NEXT} app={app} onEnd={reset} mic={mic} cam={cam} onSetMic={onSetMic} onSetCam={onSetCam} />;
  }

  if (phase === 'joining') {
    return <JoiningSequence step={step} app={app} call={NEXT} />;
  }

  // IDLE
  return (
    <div style={{
      height: '100%', display: 'grid',
      gridTemplateColumns: '1fr 420px',
      overflow: 'hidden',
    }}>
      {/* MAIN */}
      <div style={{
        background: 'var(--fs-navy)',
        color: 'var(--fs-paper)',
        padding: '60px 64px',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', position: 'relative',
        overflow: 'hidden',
      }} className="__paper-flip">
        <BeamMotif size={760} opacity={0.12} color="var(--fs-gold)"
          style={{ right: -260, top: -160, animation: 'beamPulse 4s ease-in-out infinite' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="gold-rule" />
          <span style={{
            fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fs-gold)',
          }}>Go to Call · 1-Touch Join</span>
        </div>

        <div style={{
          fontFamily: 'var(--fs-font-display)', fontStyle: 'italic',
          fontSize: 30, color: 'rgba(255,255,255,0.6)',
          margin: '0 0 6px', letterSpacing: '-0.005em',
        }}>Up next, in {NEXT.in_minutes} minutes</div>

        <h1 style={{
          fontFamily: 'var(--fs-font-display)',
          fontWeight: 700, fontSize: 72, lineHeight: 1,
          color: 'var(--fs-paper)', margin: '0 0 24px',
          letterSpacing: '-0.025em', maxWidth: 880, textWrap: 'pretty',
        }}>{NEXT.title}</h1>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 36, marginBottom: 40 }}>
          <div>
            <div style={{
              fontFamily: 'var(--fs-font-mono)', fontSize: 11,
              letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', marginBottom: 6,
            }}>Host</div>
            <div style={{ fontFamily: 'var(--fs-font-display)', fontSize: 22, fontWeight: 400 }}>
              {NEXT.host}
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--fs-font-mono)', fontSize: 11,
              letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', marginBottom: 6,
            }}>Participants</div>
            <div style={{ display: 'flex', gap: -8 }}>
              {NEXT.participants.map((p, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, marginLeft: i === 0 ? 0 : -10,
                  background: 'var(--fs-navy-600)',
                  border: '2px solid var(--fs-navy)',
                  color: 'var(--fs-paper)',
                  fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 700,
                }}>{p}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--fs-font-mono)', fontSize: 11,
              letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', marginBottom: 6,
            }}>Platform</div>
            <div style={{ fontFamily: 'var(--fs-font-display)', fontSize: 22, fontWeight: 400 }}>
              {app.name}
            </div>
          </div>
        </div>

        {/* The big button */}
        <button onClick={initiateCall} style={{
          display: 'inline-flex', alignItems: 'center', gap: 18,
          padding: '24px 40px',
          background: 'var(--fs-gold)',
          color: 'var(--fs-ink)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--fs-font-display)',
          fontSize: 28, fontWeight: 700, letterSpacing: '-0.01em',
          alignSelf: 'flex-start', position: 'relative',
          boxShadow: '0 12px 32px rgba(239,197,63,0.4)',
        }}>
          <Icon name="phone-call" size={28} />
          Join Call Now
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            paddingLeft: 18, marginLeft: 6,
            borderLeft: '1px solid rgba(15,15,15,0.25)',
            fontFamily: 'var(--fs-font-mono)', fontSize: 13,
            letterSpacing: '0.14em',
            opacity: 0.7,
          }}>⌘+⏎</div>
        </button>

        {/* Sub buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center' }}>
          <SubAction icon="clock" label={snoozed ? 'Snoozed · 5 min' : 'Snooze 5 min'}
            onClick={() => setSnoozed(true)} />
          <SubAction icon="x" label="Skip this one"
            onClick={() => onNavigate && onNavigate('home')} />
          {snoozed && (
            <span style={{
              fontFamily: 'var(--fs-font-mono)', fontSize: 11,
              letterSpacing: '0.14em', color: 'var(--fs-gold)',
              textTransform: 'uppercase',
            }}>Reminder set</span>
          )}
        </div>
      </div>

      {/* RIGHT — pre-flight check */}
      <div style={{
        background: 'var(--fs-bone-50)',
        padding: '32px 32px',
        borderLeft: '1px solid var(--fs-border)',
        overflowY: 'auto',
      }} className="__paper-flip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div className="gold-rule" />
          <span className="eyebrow">Pre-flight Check</span>
        </div>

        <h3 style={{
          fontFamily: 'var(--fs-font-display)',
          fontSize: 24, fontWeight: 700,
          color: 'var(--fs-fg-brand)', margin: '0 0 20px',
          letterSpacing: '-0.015em',
        }}>Ready to join</h3>

        {/* Self preview */}
        <div style={{
          width: '100%', aspectRatio: '16/9',
          background: 'var(--fs-navy-900)',
          marginBottom: 18, position: 'relative',
          overflow: 'hidden',
        }}>
          <MockSelfFrame cam={cam} />
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.6)',
            color: 'var(--fs-paper)',
            fontFamily: 'var(--fs-font-mono)', fontSize: 10,
            letterSpacing: '0.16em',
          }}>YOU · {cam ? 'CAM ON' : 'CAM OFF'}</div>
        </div>

        {/* Status list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CheckItem label="Camera" status={cam ? 'on' : 'off'} detail="Logitech Brio" />
          <CheckItem label="Microphone" status={mic ? 'on' : 'off'} detail="Shure MV7 · -18 dB" />
          <CheckItem label="Output" status="on" detail="Conference TV speakers" />
          <CheckItem label="Meeting link" status={callUrl ? 'on' : 'off'} detail={callUrl ? app.name : 'No link found'} />
        </div>

        {/* App selector */}
        <div style={{
          marginTop: 24, paddingTop: 18,
          borderTop: '1px solid var(--fs-border)',
        }}>
          <div className="eyebrow" style={{ marginBottom: 10, fontSize: 10 }}>Override platform</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {CALL_APPS.map(a => (
              <button key={a.id} onClick={() => setSelectedApp(a.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px',
                  border: '1px solid ' + (selectedApp === a.id ? a.color : 'var(--fs-border)'),
                  background: selectedApp === a.id ? 'var(--fs-paper)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <span style={{ width: 10, height: 10, background: a.color }} />
                <span style={{
                  fontFamily: 'var(--fs-font-sans)', fontSize: 12,
                  color: 'var(--fs-fg)', fontWeight: selectedApp === a.id ? 600 : 400,
                }}>{a.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '12px 18px',
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.25)',
      color: 'var(--fs-paper)', cursor: 'pointer',
      fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase',
    }}>
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
}

function CheckItem({ label, status, detail }) {
  const colors = {
    on:    { c: 'var(--fs-success)', icon: 'check-circle-2' },
    off:   { c: 'var(--fs-danger)',  icon: 'x-circle' },
    ready: { c: 'var(--fs-gold-700)', icon: 'circle' },
  }[status] || { c: 'var(--fs-fg-muted)', icon: 'circle' };
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '18px 1fr auto',
      gap: 12, alignItems: 'center',
      padding: '10px 12px',
      background: 'var(--fs-paper)',
      borderLeft: '2px solid ' + colors.c,
    }}>
      <Icon name={colors.icon} size={14} style={{ color: colors.c }} />
      <div>
        <div style={{
          fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
          color: 'var(--fs-fg)',
        }}>{label}</div>
        <div style={{
          fontFamily: 'var(--fs-font-mono)', fontSize: 10,
          color: 'var(--fs-fg-muted)', letterSpacing: '0.06em',
        }}>{detail}</div>
      </div>
      <div style={{
        fontFamily: 'var(--fs-font-mono)', fontSize: 9,
        letterSpacing: '0.16em',
        color: colors.c, fontWeight: 700,
      }}>{status.toUpperCase()}</div>
    </div>
  );
}

function MockSelfFrame({ cam }) {
  if (!cam) {
    return (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'var(--fs-font-mono)', fontSize: 12, letterSpacing: '0.3em',
      }}>CAM OFF</div>
    );
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="self-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A3A5C"/>
          <stop offset="100%" stopColor="#0E2238"/>
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="url(#self-bg)"/>
      {/* Window backlight */}
      <rect x="280" y="20" width="100" height="160" fill="rgba(239,197,63,0.12)"/>
      <rect x="280" y="20" width="100" height="80" fill="rgba(239,197,63,0.06)"/>
      {/* Person silhouette */}
      <ellipse cx="160" cy="105" rx="34" ry="40" fill="rgba(255,255,255,0.22)"/>
      <path d="M 90 225 Q 90 160 160 155 Q 230 160 230 225 Z" fill="rgba(255,255,255,0.18)"/>
      {/* Desk */}
      <rect x="0" y="200" width="400" height="25" fill="rgba(0,0,0,0.4)"/>
    </svg>
  );
}

// ─────── JOINING SEQUENCE ───────
function JoiningSequence({ step, app, call }) {
  const stages = [
    { label: 'Opening ' + app.name,    icon: 'square-mouse-pointer' },
    { label: 'Connecting camera & mic', icon: 'video' },
    { label: 'Joining ' + call.title,  icon: 'phone-call' },
  ];
  return (
    <div style={{
      height: '100%',
      background: 'var(--fs-navy-900)',
      color: 'var(--fs-paper)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }} className="__paper-flip">
      <BeamMotif size={900} opacity={0.18} color="var(--fs-gold)"
        style={{ animation: 'beamPulse 1.5s ease-in-out infinite' }} />

      <div style={{ position: 'relative', zIndex: 1, width: 720, padding: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div className="gold-rule" />
          <span style={{
            fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
            letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fs-gold)',
          }}>Joining</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--fs-font-display)',
          fontSize: 48, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-0.02em', margin: '0 0 32px',
        }}>{call.title}</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {stages.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '32px 1fr 80px',
                alignItems: 'center', gap: 14,
                padding: '12px 14px',
                background: active ? 'rgba(239,197,63,0.1)' : 'transparent',
                borderLeft: '2px solid ' + (done ? 'var(--fs-success)' : active ? 'var(--fs-gold)' : 'rgba(255,255,255,0.1)'),
                opacity: i > step ? 0.4 : 1,
                transition: 'all 200ms',
              }}>
                <div style={{
                  width: 28, height: 28,
                  background: done ? 'var(--fs-success)' : active ? 'var(--fs-gold)' : 'rgba(255,255,255,0.06)',
                  color: done ? '#fff' : active ? 'var(--fs-ink)' : 'rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done ? <Icon name="check" size={14} strokeWidth={3} /> :
                    <Icon name={s.icon} size={14} />}
                </div>
                <div style={{
                  fontFamily: 'var(--fs-font-display)',
                  fontSize: 18, fontWeight: done ? 400 : 600,
                  textDecoration: done ? 'line-through' : 'none',
                  textDecorationColor: 'rgba(255,255,255,0.4)',
                  color: done ? 'rgba(255,255,255,0.7)' : 'var(--fs-paper)',
                }}>{s.label}</div>
                <div className="tabular" style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 10,
                  letterSpacing: '0.14em', textAlign: 'right',
                  color: done ? 'var(--fs-success)' : active ? 'var(--fs-gold)' : 'rgba(255,255,255,0.3)',
                  fontWeight: 700,
                }}>
                  {done ? 'OK' : active ? '… RUN' : 'PENDING'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────── LIVE CALL VIEW ───────
function LiveCallView({ call, app, mic, cam, onSetMic, onSetCam, onEnd }) {
  const [elapsed, setElapsed] = callUseState(0);
  callUseEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--fs-ink)',
    }}>
      {/* Top bar */}
      <div style={{
        padding: '14px 28px',
        background: 'var(--fs-navy-900)',
        color: 'var(--fs-paper)',
        borderBottom: '2px solid var(--fs-gold)',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <span style={{ width: 12, height: 12, background: app.color, borderRadius: 2 }} />
        <div>
          <div style={{
            fontFamily: 'var(--fs-font-display)', fontSize: 18, fontWeight: 700,
            lineHeight: 1.1, letterSpacing: '-0.01em',
          }}>{call.title}</div>
          <div style={{
            fontFamily: 'var(--fs-font-mono)', fontSize: 11,
            color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em',
            marginTop: 2,
          }}>{app.name.toUpperCase()} · {fmt(elapsed)}</div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px',
          background: 'rgba(168,52,30,0.15)',
          border: '1px solid var(--fs-danger)',
        }}>
          <span className="live-dot" style={{ background: 'var(--fs-danger)' }} />
          <span style={{
            fontFamily: 'var(--fs-font-mono)', fontSize: 10,
            letterSpacing: '0.16em', color: 'var(--fs-danger)',
            fontWeight: 700,
          }}>LIVE · {app.name.toUpperCase()}</span>
        </div>
      </div>

      {/* Gallery */}
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 6, padding: 6,
        background: 'var(--fs-ink)',
      }}>
        {['RJ', 'AH', 'MP', 'CV', 'DW', 'YOU'].map((name, i) => (
          <div key={i} style={{
            background: 'var(--fs-navy-900)',
            position: 'relative', overflow: 'hidden',
            outline: i === 0 ? '2px solid var(--fs-gold)' : 0,
            outlineOffset: -2,
          }}>
            <MockSelfFrame cam={true} />
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              padding: '4px 10px',
              background: 'rgba(0,0,0,0.6)',
              color: 'var(--fs-paper)',
              fontFamily: 'var(--fs-font-mono)', fontSize: 10,
              letterSpacing: '0.14em',
            }}>{name}{i === 0 ? ' · SPEAKING' : ''}</div>
            {i === 5 && !cam && (
              <div style={{
                position: 'absolute', inset: 0,
                background: '#0E2238',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--fs-gold)',
                fontFamily: 'var(--fs-font-display)', fontSize: 24, fontWeight: 700,
              }}>YOU</div>
            )}
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div style={{
        background: 'var(--fs-navy-900)',
        padding: '18px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <CallControl icon={mic ? 'mic' : 'mic-off'} label={mic ? 'Mute' : 'Unmute'} onClick={() => onSetMic(!mic)} danger={!mic} />
        <CallControl icon={cam ? 'video' : 'video-off'} label={cam ? 'Stop Cam' : 'Start Cam'} onClick={() => onSetCam(!cam)} danger={!cam} />
        <CallControl icon="external-link" label="Reopen"
          onClick={() => call.url && window.open(call.url, '_blank', 'noopener')} />
        <CallControl icon="users" label="People · 6" onClick={() => alert('In call:\n  • Robert Jamison (host)\n  • Anika Hale\n  • Marcus Peña\n  • Carmen Vega\n  • Devon Wexler\n  • You')} />
        <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
        <button onClick={onEnd} style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 22px',
          background: 'var(--fs-danger)',
          color: 'var(--fs-paper)', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 700,
          letterSpacing: '0.16em', textTransform: 'uppercase',
        }}>
          <Icon name="phone-off" size={16} />
          Leave Call
        </button>
      </div>
    </div>
  );
}

function CallControl({ icon, label, onClick, danger }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      padding: '8px 14px', minWidth: 70,
      background: danger ? 'rgba(168,52,30,0.15)' : 'transparent',
      border: '1px solid ' + (danger ? 'var(--fs-danger)' : 'rgba(255,255,255,0.18)'),
      color: danger ? 'var(--fs-danger)' : 'var(--fs-paper)',
      cursor: 'pointer',
    }}>
      <Icon name={icon} size={18} />
      <span style={{
        fontFamily: 'var(--fs-font-sans)', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.14em', textTransform: 'uppercase',
      }}>{label}</span>
    </button>
  );
}

Object.assign(window, { GoToCallView });
