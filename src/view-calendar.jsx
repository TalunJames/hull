// CALENDAR VIEW — day/week/month grid with staff member switcher

const { useState: calUseState, useMemo: calUseMemo } = React;

function CalendarView({ now, events, view, onSetView, weekOffset, onSetWeekOffset, selectedStaff, onSetStaff }) {
  const todayEvents = events && events.length ? events : TODAY_EVENTS;
  // Allow standalone use (no parent state) for safety.
  const [_view, _setView] = calUseState(view || 'week');
  const [_off, _setOff] = calUseState(weekOffset || 0);
  const [_staff, _setStaff] = calUseState(selectedStaff || ['office']);
  const vw = view !== undefined ? view : _view;
  const setVw = onSetView || _setView;
  const off = weekOffset !== undefined ? weekOffset : _off;
  const setOff = onSetWeekOffset || _setOff;
  const staff = selectedStaff || _staff;
  const setStaffWrap = onSetStaff || _setStaff;

  const toggleStaff = (id) => {
    const prev = staff;
    let next;
    if (id === 'office') next = ['office'];
    else {
      const without = prev.filter(s => s !== 'office');
      if (without.includes(id)) {
        next = without.filter(s => s !== id);
        if (next.length === 0) next = ['office'];
      } else {
        next = [...without, id];
      }
    }
    setStaffWrap(next);
  };

  // Week dates (offset by `off` weeks)
  const dow = (now.getDay() + 6) % 7; // 0=Mon
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dow + off * 7);
  weekStart.setHours(0, 0, 0, 0);
  const days = Array.from({length: 5}).map((_, i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d;
  });
  const isCurrentWeek = off === 0;
  const todayIdxInWeek = isCurrentWeek ? dow : -1;

  // Hours visible
  const startHour = 8, endHour = 19;
  const hours = Array.from({length: endHour - startHour + 1}).map((_, i) => startHour + i);

  // Build events
  const eventsByDay = calUseMemo(() => {
    const out = days.map(() => []);
    if (isCurrentWeek) {
      out[dow] = todayEvents;
    }
    const samples = [
      [{ h: 9, m: 0, dur: 60, title: 'Partners Meeting', loc: 'Conference A', owner: 'office' },
       { h: 10, m: 30, dur: 45, title: 'Hadley Industries Sync', loc: 'Zoom', owner: 'rj' },
       { h: 13, m: 0, dur: 30, title: 'Memo Review', loc: 'Partner Office', owner: 'dw' },
       { h: 15, m: 0, dur: 60, title: 'NCDOT Strategy', loc: 'Conference B', owner: 'mp' }],
      [{ h: 8, m: 30, dur: 30, title: 'Standup', loc: 'Conf A', owner: 'office' },
       { h: 9, m: 30, dur: 90, title: 'Senate Energy Hearing', loc: 'Legislature', owner: 'ah' },
       { h: 11, m: 30, dur: 60, title: 'Coastal Coalition', loc: 'Zoom', owner: 'mp' },
       { h: 14, m: 0, dur: 45, title: 'Press Statement Review', loc: 'Open Floor', owner: 'ah' },
       { h: 15, m: 30, dur: 60, title: 'Working Lunch · Triangle Chamber', loc: 'On-site', owner: 'office' }],
      [{ h: 8, m: 30, dur: 30, title: 'Standup', loc: 'Conf A', owner: 'office' },
       { h: 9, m: 0, dur: 120, title: 'Raleigh Deposition', loc: 'Off-site', owner: 'cv' },
       { h: 13, m: 0, dur: 60, title: 'Client Sync · Maritime', loc: 'Teams', owner: 'tk' },
       { h: 14, m: 30, dur: 30, title: 'Memo · Q2 Outlook', loc: 'Drive', owner: 'dw' },
       { h: 16, m: 0, dur: 60, title: 'NCDOT Briefing', loc: 'State HQ', owner: 'mp' },
       { h: 17, m: 30, dur: 60, title: 'Drafting Session', loc: 'Open Floor', owner: 'ah' }],
      [{ h: 9, m: 0, dur: 90, title: 'HB 412 Markup', loc: 'Legislature', owner: 'ah' },
       { h: 11, m: 0, dur: 30, title: 'Press Check-in', loc: 'Phone', owner: 'rj' },
       { h: 14, m: 0, dur: 60, title: 'Coalition Strategy', loc: 'Conf B', owner: 'cv' },
       { h: 16, m: 30, dur: 30, title: 'Research Review', loc: 'Partner Office', owner: 'dw' }],
      [{ h: 10, m: 0, dur: 60, title: 'Weekly Wrap', loc: 'Conf A', owner: 'office' },
       { h: 15, m: 0, dur: 120, title: 'Coastal Coalition Reception', loc: 'Off-site', owner: 'office' }],
    ];
    samples.forEach((dayEvents, i) => {
      const target = isCurrentWeek ? (i < dow ? i : i + 1) : i;
      if (target < 5 && (target !== dow || !isCurrentWeek)) {
        out[target] = dayEvents.map(s => {
          const start = new Date(days[target]); start.setHours(s.h, s.m, 0, 0);
          const end = new Date(start.getTime() + s.dur * 60000);
          return { start, end, title: s.title, location: s.loc, owner: s.owner };
        });
      }
    });
    return out;
  }, [dow, off, todayEvents]);

  const visibleByDay = eventsByDay.map(dayE => {
    if (staff.includes('office')) return dayE;
    return dayE.filter(e => staff.includes(e.owner) || e.owner === 'office');
  });

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* LEFT: Staff selector */}
      <div style={{
        width: 280, flexShrink: 0,
        background: 'var(--fs-bone-50)',
        borderRight: '1px solid var(--fs-border)',
        padding: '24px 20px',
        overflowY: 'auto',
      }} className="__paper-flip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="gold-rule" />
          <span className="eyebrow">Calendars</span>
        </div>

        <h2 style={{
          fontFamily: 'var(--fs-font-display)',
          fontWeight: 700, fontSize: 32, lineHeight: 1.1,
          color: 'var(--fs-fg-brand)', margin: '0 0 20px',
          letterSpacing: '-0.015em',
        }}>{vw === 'day' ? 'This Day' : vw === 'month' ? 'This Month' : 'This Week'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {STAFF.map(s => {
            const active = staff.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggleStaff(s.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '32px 1fr auto',
                  alignItems: 'center', gap: 12,
                  padding: '10px 8px',
                  border: 'none',
                  borderLeft: '3px solid ' + (active ? s.color : 'transparent'),
                  background: active ? 'var(--fs-paper)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 200ms',
                }}>
                <StaffAvatar staff={s} size={28} />
                <div>
                  <div style={{
                    fontFamily: 'var(--fs-font-display)',
                    fontWeight: active ? 700 : 400, fontSize: 16,
                    color: 'var(--fs-fg-brand)',
                  }}>{s.name}</div>
                  <div style={{
                    fontFamily: 'var(--fs-font-sans)', fontSize: 11,
                    color: 'var(--fs-fg-muted)',
                  }}>{s.role}</div>
                </div>
                <div style={{
                  width: 14, height: 14,
                  border: '1.5px solid ' + (active ? s.color : 'var(--fs-border-strong)'),
                  background: active ? s.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}>
                  {active && <Icon name="check" size={10} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ height: 1, background: 'var(--fs-border)', margin: '20px 0' }} />

        {/* Quick actions — now wired */}
        <div style={{
          fontFamily: 'var(--fs-font-mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--fs-fg-subtle)', marginBottom: 10,
        }}>Quick Actions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Show all staff',       icon: 'users',           onClick: () => setStaffWrap(STAFF.map(s => s.id)) },
            { label: 'Just office calendar', icon: 'building-2',      onClick: () => setStaffWrap(['office']) },
            { label: 'Out of office today',  icon: 'plane-takeoff',   onClick: () => setStaffWrap(['cv']) },
            { label: 'Conflicts this week',  icon: 'alert-triangle',  onClick: () => alert('No scheduling conflicts detected this week.') },
          ].map(a => (
            <button key={a.label} onClick={a.onClick} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', border: '1px solid var(--fs-border)',
              background: 'transparent', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--fs-font-sans)', fontSize: 13,
              color: 'var(--fs-fg)',
            }}>
              <Icon name={a.icon} size={14} />
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header strip */}
        <div style={{
          padding: '20px 32px 16px',
          borderBottom: '1px solid var(--fs-border)',
          background: 'var(--fs-paper)',
          display: 'flex', alignItems: 'center', gap: 24,
        }} className="__paper-flip">
          <div>
            <div className="eyebrow">{weekStart.toLocaleDateString('en-US',{month:'long'})} · Week {Math.ceil(weekStart.getDate()/7)}</div>
            <div style={{
              fontFamily: 'var(--fs-font-display)',
              fontSize: 28, fontWeight: 700, marginTop: 4,
              color: 'var(--fs-fg-brand)', letterSpacing: '-0.015em',
            }}>
              {weekStart.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}
              <span style={{ opacity: 0.4, margin: '0 8px' }}>—</span>
              {(() => { const e = new Date(weekStart); e.setDate(weekStart.getDate()+4); return e.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}); })()}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          {/* View switcher */}
          <div style={{
            display: 'inline-flex', border: '1px solid var(--fs-border-strong)',
            padding: 2,
          }}>
            {['day', 'week', 'month'].map(v => (
              <button key={v} onClick={() => setVw(v)}
                style={{
                  padding: '8px 16px', border: 'none',
                  background: vw === v ? 'var(--fs-navy)' : 'transparent',
                  color: vw === v ? 'var(--fs-paper)' : 'var(--fs-fg)',
                  fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}>{v}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={iconBtn()} onClick={() => setOff(off - 1)} title="Previous week">
              <Icon name="chevron-left" size={18} />
            </button>
            <button style={iconBtn(true)} onClick={() => setOff(0)} title="Jump to current week">Today</button>
            <button style={iconBtn()} onClick={() => setOff(off + 1)} title="Next week">
              <Icon name="chevron-right" size={18} />
            </button>
          </div>
        </div>

        {/* BODY — switches by view */}
        {vw === 'week' && (
          <WeekGrid days={days} hours={hours} startHour={startHour} endHour={endHour}
            visibleByDay={visibleByDay} now={now} todayIdxInWeek={todayIdxInWeek} />
        )}
        {vw === 'day' && (
          <DayGrid day={days[Math.max(0, todayIdxInWeek)] || days[0]}
            events={visibleByDay[Math.max(0, todayIdxInWeek)] || visibleByDay[0]}
            hours={hours} startHour={startHour} endHour={endHour} now={now}
            isToday={todayIdxInWeek >= 0} />
        )}
        {vw === 'month' && (
          <MonthGrid now={now} weekOffset={off} visibleByDay={visibleByDay} days={days} />
        )}
      </div>
    </div>
  );
}

function WeekGrid({ days, hours, startHour, endHour, visibleByDay, now, todayIdxInWeek }) {
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '64px repeat(5, 1fr)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'subgrid', borderBottom: '1px solid var(--fs-border)' }}>
        <div></div>
        {days.map((d, i) => {
          const isToday = i === todayIdxInWeek;
          return (
            <div key={i} style={{
              padding: '10px 14px',
              borderLeft: '1px solid var(--fs-border)',
              background: isToday ? 'var(--fs-bone-50)' : 'var(--fs-paper)',
            }}>
              <div style={{
                fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: isToday ? 'var(--fs-fg-accent)' : 'var(--fs-fg-muted)',
              }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="tabular" style={{
                fontFamily: 'var(--fs-font-display)',
                fontWeight: 700, fontSize: 28,
                color: 'var(--fs-fg-brand)', letterSpacing: '-0.015em',
              }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div style={{ overflowY: 'auto', gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'subgrid', position: 'relative' }}>
        <div>
          {hours.map(h => (
            <div key={h} style={{
              height: 72, paddingTop: 6, paddingRight: 8,
              textAlign: 'right',
              fontFamily: 'var(--fs-font-mono)', fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--fs-fg-subtle)',
              borderTop: '1px solid var(--fs-border)',
            }}>
              {h === 12 ? '12 PM' : h > 12 ? (h-12) + ' PM' : h + ' AM'}
            </div>
          ))}
        </div>
        {days.map((d, dayIdx) => {
          const dayEvents = visibleByDay[dayIdx];
          const isToday = dayIdx === todayIdxInWeek;
          return (
            <div key={dayIdx} style={{
              borderLeft: '1px solid var(--fs-border)',
              position: 'relative',
              background: isToday ? 'rgba(239,197,63,0.03)' : 'transparent',
            }}>
              {hours.map(h => (
                <div key={h} style={{
                  height: 72,
                  borderTop: '1px solid var(--fs-border)',
                }} />
              ))}
              {isToday && now.getHours() >= startHour && now.getHours() <= endHour && (
                <div style={{
                  position: 'absolute',
                  top: ((now.getHours() - startHour) * 72) + ((now.getMinutes()/60) * 72),
                  left: -4, right: 0, height: 2, background: 'var(--fs-gold)',
                  zIndex: 5,
                }}>
                  <div style={{
                    position: 'absolute', left: -6, top: -4,
                    width: 10, height: 10, background: 'var(--fs-gold)', borderRadius: 999,
                  }} />
                </div>
              )}
              {dayEvents.map((e, ei) => {
                const startH = e.start.getHours() + e.start.getMinutes()/60;
                const endH = e.end.getHours() + e.end.getMinutes()/60;
                if (endH < startHour || startH > endHour) return null;
                const top = Math.max(0, (startH - startHour) * 72);
                const height = Math.max(28, (endH - startH) * 72 - 2);
                const s = STAFF.find(x => x.id === e.owner) || STAFF[0];
                return (
                  <div key={ei} onClick={() => alert(e.title + '\n' + e.location + '\n' + e.start.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'}) + ' – ' + e.end.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'}))} style={{
                    position: 'absolute',
                    top, left: 4, right: 4, height,
                    background: 'var(--fs-paper)',
                    borderLeft: '3px solid ' + s.color,
                    boxShadow: '0 2px 6px rgba(14,34,56,0.08)',
                    padding: '6px 8px',
                    overflow: 'hidden', cursor: 'pointer',
                  }} className="__paper-flip">
                    <div style={{
                      fontFamily: 'var(--fs-font-mono)', fontSize: 9,
                      letterSpacing: '0.12em', color: s.color,
                      fontWeight: 600,
                    }}>
                      {e.start.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}
                    </div>
                    <div style={{
                      fontFamily: 'var(--fs-font-display)',
                      fontWeight: 700, fontSize: height < 50 ? 12 : 14,
                      color: 'var(--fs-fg-brand)',
                      lineHeight: 1.15, marginTop: 2,
                      textWrap: 'pretty',
                    }}>{e.title}</div>
                    {height > 60 && (
                      <div style={{
                        fontFamily: 'var(--fs-font-sans)', fontSize: 11,
                        color: 'var(--fs-fg-muted)', marginTop: 4,
                      }}>{e.location}</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayGrid({ day, events, hours, startHour, endHour, now, isToday }) {
  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '80px 1fr', overflow: 'hidden' }}>
      <div style={{ overflowY: 'auto', display: 'contents' }}>
        <div style={{ borderRight: '1px solid var(--fs-border)' }}>
          <div style={{ padding: '14px 12px', borderBottom: '1px solid var(--fs-border)' }}>
            <div className="eyebrow" style={{ color: isToday ? 'var(--fs-fg-accent)' : 'var(--fs-fg-muted)' }}>
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="tabular" style={{ fontFamily: 'var(--fs-font-display)', fontWeight: 700, fontSize: 28, color: 'var(--fs-fg-brand)' }}>
              {day.getDate()}
            </div>
          </div>
          {hours.map(h => (
            <div key={h} style={{
              height: 84, paddingTop: 6, paddingRight: 10, textAlign: 'right',
              fontFamily: 'var(--fs-font-mono)', fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--fs-fg-subtle)',
              borderTop: '1px solid var(--fs-border)',
            }}>
              {h === 12 ? '12 PM' : h > 12 ? (h-12) + ' PM' : h + ' AM'}
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', overflowY: 'auto', background: isToday ? 'rgba(239,197,63,0.03)' : 'transparent' }}>
          <div style={{ height: 64, borderBottom: '1px solid var(--fs-border)', padding: '14px 24px' }}>
            <div style={{ fontFamily: 'var(--fs-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--fs-fg-brand)' }}>
              {day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
          {hours.map(h => (
            <div key={h} style={{ height: 84, borderTop: '1px solid var(--fs-border)' }} />
          ))}
          {isToday && now.getHours() >= startHour && now.getHours() <= endHour && (
            <div style={{
              position: 'absolute',
              top: 64 + ((now.getHours() - startHour) * 84) + ((now.getMinutes()/60) * 84),
              left: 0, right: 0, height: 2, background: 'var(--fs-gold)', zIndex: 5,
            }}>
              <div style={{ position: 'absolute', left: -6, top: -4, width: 10, height: 10, background: 'var(--fs-gold)', borderRadius: 999 }} />
            </div>
          )}
          {events.map((e, ei) => {
            const startH = e.start.getHours() + e.start.getMinutes()/60;
            const endH = e.end.getHours() + e.end.getMinutes()/60;
            const top = 64 + Math.max(0, (startH - startHour) * 84);
            const height = Math.max(36, (endH - startH) * 84 - 4);
            const s = STAFF.find(x => x.id === e.owner) || STAFF[0];
            return (
              <div key={ei} onClick={() => alert(e.title + '\n' + e.location)} style={{
                position: 'absolute', top, left: 24, right: 24, height,
                background: 'var(--fs-paper)',
                borderLeft: '3px solid ' + s.color,
                boxShadow: '0 2px 6px rgba(14,34,56,0.08)',
                padding: '10px 14px', cursor: 'pointer', overflow: 'hidden',
              }} className="__paper-flip">
                <div style={{ fontFamily: 'var(--fs-font-mono)', fontSize: 10, color: s.color, fontWeight: 600, letterSpacing: '0.12em' }}>
                  {e.start.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})} — {e.end.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}
                </div>
                <div style={{ fontFamily: 'var(--fs-font-display)', fontSize: 18, fontWeight: 700, color: 'var(--fs-fg-brand)', marginTop: 4, lineHeight: 1.2 }}>
                  {e.title}
                </div>
                <div style={{ fontFamily: 'var(--fs-font-sans)', fontSize: 12, color: 'var(--fs-fg-muted)', marginTop: 4 }}>
                  {e.location}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MonthGrid({ now, weekOffset, visibleByDay, days }) {
  // Build a 5-week month view anchored to the displayed week.
  const anchor = days[0];
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const firstDow = (monthStart.getDay() + 6) % 7;
  const monthLabel = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const cells = [];
  const start = new Date(monthStart);
  start.setDate(monthStart.getDate() - firstDow);
  for (let i = 0; i < 35; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    cells.push(d);
  }
  const inMonth = (d) => d.getMonth() === anchor.getMonth();
  const isToday = (d) => d.toDateString() === now.toDateString();

  // Build a simple lookup of event counts per day from visibleByDay
  const eventCountByDate = {};
  visibleByDay.forEach((dayEvents) => {
    dayEvents.forEach(e => {
      const k = e.start.toDateString();
      eventCountByDate[k] = (eventCountByDate[k] || 0) + 1;
    });
  });

  return (
    <div style={{ flex: 1, padding: '20px 32px', overflowY: 'auto' }}>
      <div style={{
        fontFamily: 'var(--fs-font-display)', fontSize: 24, fontWeight: 700,
        color: 'var(--fs-fg-brand)', marginBottom: 16, letterSpacing: '-0.015em',
      }}>{monthLabel}</div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0,
        border: '1px solid var(--fs-border)',
      }}>
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} style={{
            padding: '10px 12px', background: 'var(--fs-bone-50)',
            borderBottom: '1px solid var(--fs-border)',
            fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--fs-fg-muted)',
          }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          const inM = inMonth(d);
          const today = isToday(d);
          const count = eventCountByDate[d.toDateString()] || 0;
          return (
            <div key={i} style={{
              minHeight: 110,
              padding: 10,
              borderRight: ((i + 1) % 7) ? '1px solid var(--fs-border)' : 'none',
              borderTop: '1px solid var(--fs-border)',
              background: today ? 'rgba(239,197,63,0.08)' : 'var(--fs-paper)',
              opacity: inM ? 1 : 0.4,
              position: 'relative',
            }}>
              <div className="tabular" style={{
                fontFamily: 'var(--fs-font-display)',
                fontWeight: 700, fontSize: 18, color: 'var(--fs-fg-brand)',
              }}>{d.getDate()}</div>
              {count > 0 && inM && (
                <div style={{ marginTop: 6, display: 'flex', gap: 3 }}>
                  {Array.from({length: Math.min(count, 6)}).map((_, j) => (
                    <span key={j} style={{ width: 12, height: 4, background: 'var(--fs-navy)', opacity: 0.7 }} />
                  ))}
                </div>
              )}
              {today && (
                <div style={{
                  position: 'absolute', top: 6, right: 8,
                  width: 6, height: 6, background: 'var(--fs-gold)', borderRadius: 999,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function iconBtn(isLabel) {
  return {
    width: isLabel ? 'auto' : 40, height: 40,
    padding: isLabel ? '0 14px' : 0,
    border: '1px solid var(--fs-border-strong)',
    background: 'var(--fs-paper)',
    color: 'var(--fs-fg)',
    cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--fs-font-sans)', fontSize: 12, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
  };
}

Object.assign(window, { CalendarView });
