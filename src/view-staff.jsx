// STAFF PORTAL — placeholder view, functionality coming later but design is on-brand

function StaffPortalView() {
  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* LEFT — staff directory */}
      <div style={{
        width: 360, flexShrink: 0,
        background: 'var(--fs-bone-50)',
        borderRight: '1px solid var(--fs-border)',
        padding: '28px 24px',
        overflowY: 'auto',
      }} className="__paper-flip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div className="gold-rule" />
          <span className="eyebrow">Staff Portal</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--fs-font-display)',
          fontSize: 32, fontWeight: 700, lineHeight: 1.1,
          color: 'var(--fs-fg-brand)', margin: '0 0 6px',
          letterSpacing: '-0.015em',
        }}>The Firm</h2>
        <p style={{
          fontFamily: 'var(--fs-font-serif)', fontSize: 15, lineHeight: 1.5,
          color: 'var(--fs-fg-muted)', margin: '0 0 24px',
        }}>Directory, time-off, expense, and document sign-off live here. Full functionality lands in the next milestone.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STAFF.filter(s => s.id !== 'office').map(s => (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr auto',
              gap: 14, alignItems: 'center',
              padding: '12px 12px',
              background: 'var(--fs-paper)',
              borderLeft: '3px solid ' + s.color,
            }} className="__paper-flip">
              <StaffAvatar staff={s} size={36} />
              <div>
                <div style={{
                  fontFamily: 'var(--fs-font-display)', fontSize: 16, fontWeight: 700,
                  color: 'var(--fs-fg-brand)', lineHeight: 1.1,
                }}>{s.name}</div>
                <div style={{
                  fontFamily: 'var(--fs-font-sans)', fontSize: 11,
                  color: 'var(--fs-fg-muted)', marginTop: 2,
                }}>{s.role}</div>
              </div>
              <span style={{
                width: 8, height: 8, borderRadius: 999,
                background: s.id === 'cv' ? 'var(--fs-gold-700)' : 'var(--fs-success)',
              }} title={s.id === 'cv' ? 'Out of office' : 'In office'} />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{
        flex: 1, padding: '36px 56px',
        overflowY: 'auto',
        background: 'var(--fs-paper)',
      }} className="__paper-flip">
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          {/* Headline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="gold-rule" />
            <span className="eyebrow">Coming Soon · Q3 2026</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--fs-font-display)',
            fontSize: 56, fontWeight: 700, lineHeight: 1.05,
            color: 'var(--fs-fg-brand)', margin: '0 0 18px',
            letterSpacing: '-0.02em', maxWidth: 820,
          }}>One portal. The whole firm.</h1>
          <p style={{
            fontFamily: 'var(--fs-font-serif)', fontSize: 19, lineHeight: 1.6,
            color: 'var(--fs-fg-muted)', margin: '0 0 36px', maxWidth: 720,
          }}>
            Time-off, expense reports, retainer documents, partner sign-off, and the firm-wide policy library — consolidated into a single, on-brand interface. Designed alongside the people who use it.
          </p>

          {/* Module grid — placeholders */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
            marginBottom: 32,
          }}>
            <ModuleCard num="01" title="Time-Off" subtitle="Request, approve, calendar sync" detail="3 pending" icon="plane"
              onClick={() => alert('Time-Off module · 3 pending requests.\nLaunching Q3 2026.')} />
            <ModuleCard num="02" title="Expenses" subtitle="Receipts, approvals, reimbursements" detail="$1,420 this month" icon="receipt"
              onClick={() => alert('Expenses · $1,420 month-to-date.\nLaunching Q3 2026.')} />
            <ModuleCard num="03" title="Retainers" subtitle="Active contracts and renewals" detail="14 active" icon="file-signature"
              onClick={() => alert('Retainers · 14 active contracts.\nLaunching Q3 2026.')} />
            <ModuleCard num="04" title="Sign-off Queue" subtitle="Documents pending partner review" detail="7 in queue" icon="check-square"
              onClick={() => alert('Sign-off Queue · 7 documents pending.\nLaunching Q3 2026.')} />
            <ModuleCard num="05" title="Policy Library" subtitle="Firm policies, ethics, handbook" detail="32 documents" icon="book-open"
              onClick={() => alert('Policy Library · 32 documents.\nLaunching Q3 2026.')} />
            <ModuleCard num="06" title="Reporting" subtitle="Billable hours, client time, output" detail="—" icon="bar-chart-3"
              onClick={() => alert('Reporting module coming Q3 2026.')} />
          </div>

          {/* Status panel */}
          <div style={{
            background: 'var(--fs-navy)',
            color: 'var(--fs-paper)',
            padding: '32px 36px',
            position: 'relative', overflow: 'hidden',
          }} className="__paper-flip">
            <BeamMotif size={460} opacity={0.10} color="var(--fs-gold)"
              style={{ right: -160, top: -120 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div className="gold-rule" />
              <span style={{
                fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fs-gold)',
              }}>Build Status</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 36, alignItems: 'center' }}>
              <div>
                <div style={{
                  fontFamily: 'var(--fs-font-display)', fontStyle: 'italic',
                  fontSize: 28, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px',
                }}>The visual system is ready.</div>
                <div style={{
                  fontFamily: 'var(--fs-font-display)', fontSize: 32, fontWeight: 700,
                  lineHeight: 1.1, letterSpacing: '-0.015em',
                }}>Functionality lands next milestone.</div>
              </div>
              <div>
                {[
                  { label: 'Design system',     done: true,  pct: 100 },
                  { label: 'Frontend scaffold', done: true,  pct: 100 },
                  { label: 'Auth + roles',      done: false, pct: 35 },
                  { label: 'Data integrations', done: false, pct: 12 },
                ].map(p => (
                  <div key={p.label} style={{ marginBottom: 12 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontFamily: 'var(--fs-font-mono)', fontSize: 11,
                      letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)',
                      marginBottom: 4,
                    }}>
                      <span>{p.label.toUpperCase()}</span>
                      <span style={{ color: p.done ? 'var(--fs-gold)' : 'rgba(255,255,255,0.5)' }}>{p.pct}%</span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)' }}>
                      <div style={{
                        height: '100%', width: p.pct + '%',
                        background: p.done ? 'var(--fs-gold)' : 'var(--fs-paper)',
                      }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({ num, title, subtitle, detail, icon, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: '20px 22px',
      background: 'var(--fs-bone-50)',
      borderTop: '2px solid var(--fs-gold)',
      position: 'relative',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 120ms',
    }} className="__paper-flip">
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--fs-font-display)', fontWeight: 700, fontSize: 14,
          color: 'var(--fs-fg-accent)', letterSpacing: '0.04em',
        }}>{num}</span>
        <Icon name={icon} size={18} style={{ color: 'var(--fs-fg-muted)' }} />
      </div>
      <h3 style={{
        fontFamily: 'var(--fs-font-display)',
        fontSize: 22, fontWeight: 700, color: 'var(--fs-fg-brand)',
        margin: '0 0 4px', letterSpacing: '-0.01em',
      }}>{title}</h3>
      <p style={{
        fontFamily: 'var(--fs-font-sans)', fontSize: 12, lineHeight: 1.4,
        color: 'var(--fs-fg-muted)', margin: '0 0 14px',
      }}>{subtitle}</p>
      <div style={{
        paddingTop: 10, borderTop: '1px solid var(--fs-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <span style={{
          fontFamily: 'var(--fs-font-display)', fontSize: 18, fontWeight: 700,
          color: 'var(--fs-fg-brand)',
        }}>{detail}</span>
        <span style={{
          fontFamily: 'var(--fs-font-mono)', fontSize: 9,
          letterSpacing: '0.16em', color: 'var(--fs-fg-subtle)',
        }}>SOON</span>
      </div>
    </div>
  );
}

Object.assign(window, { StaffPortalView });
