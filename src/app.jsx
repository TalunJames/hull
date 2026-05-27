// APP — top-level routing, global state, tweaks integration

const { useState: appUseState, useEffect: appUseEffect, useMemo: appUseMemo, useRef: appUseRef } = React;

function App() {
  // Tweaks
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  // ── Global state ──
  const [view, setView] = appUseState('home');
  const [now, setNow] = appUseState(new Date());
  const [mic, setMic] = appUseState(true);
  const [cam, setCam] = appUseState(true);
  const [volume, setVolume] = appUseState(60);
  const [muted, setMuted] = appUseState(false);
  const [recording, setRecording] = appUseState(false);
  const [weather, setWeather] = appUseState(WEATHER); // seeded with mock; replaced by live fetch

  // Lifted Live TV state — so deck buttons can drive it.
  const [tvChannels, setTvChannels] = appUseState([
    CHANNELS[0].id, CHANNELS[2].id, CHANNELS[3].id, CHANNELS[7].id,
  ]);
  const [tvPrimary, setTvPrimary] = appUseState(0);
  const [tvLayout, setTvLayout] = appUseState('quad');

  // Lifted Calendar state.
  const [calView, setCalView] = appUseState('week');
  const [calWeekOffset, setCalWeekOffset] = appUseState(0);
  const [calStaff, setCalStaff] = appUseState(['office']);

  // Lifted Docs state.
  const [docFolder, setDocFolder] = appUseState(null);
  const [docSelected, setDocSelected] = appUseState('d1');
  const [docSearch, setDocSearch] = appUseState('');
  const docSearchRef = appUseRef(null);

  // Optional real Google Calendar — inert (mock data) unless a client ID is set.
  const gcal = useGoogleCalendar();
  const liveEvents = appUseMemo(
    () => (gcal.events && gcal.events.length ? gcal.events : TODAY_EVENTS),
    [gcal.events]
  );
  // Next upcoming call (event with a real meeting link) drives Go-to-Call.
  const nextCall = appUseMemo(() => {
    const upcoming = liveEvents
      .filter(e => eventCallUrl(e) && e.end > now)
      .sort((a, b) => a.start - b.start)[0];
    if (!upcoming) return NEXT_CALL;
    const plat = detectCallPlatform(eventCallUrl(upcoming));
    return {
      app: (plat && plat.id) || 'zoom',
      url: eventCallUrl(upcoming),
      title: upcoming.title,
      host: NEXT_CALL.host,
      in_minutes: Math.max(0, Math.round((upcoming.start - now) / 60000)),
      participants: NEXT_CALL.participants,
    };
  }, [liveEvents, now]);

  // Live clock
  appUseEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Live weather — fetch on mount + every 15 min. Fails gracefully (keeps seed).
  appUseEffect(() => {
    let alive = true;
    const load = () => {
      if (typeof fetch === 'undefined') return;
      fetchWeather(WEATHER_LOCATION)
        .then(w => { if (alive) setWeather(w); })
        .catch(() => {/* offline / blocked — keep last good values */});
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Dark-mode resolution — real sunset/sunrise when available, else 18:00/07:00.
  const dark = appUseMemo(() => {
    if (t.darkMode === 'manual') return t.manualDark;
    let autoDark;
    if (weather.sunsetDate && weather.sunriseDate && !isNaN(weather.sunsetDate)) {
      autoDark = now >= weather.sunsetDate || now < weather.sunriseDate;
    } else {
      const h = now.getHours();
      autoDark = h >= 18 || h < 7;
    }
    if (t.darkMode === 'auto') return autoDark;
    return t.manualDark ? !autoDark : autoDark;
  }, [t.darkMode, t.manualDark, now, weather]);

  appUseEffect(() => {
    const stage = document.getElementById('stage');
    if (!stage) return;
    if (dark) stage.classList.add('dark');
    else stage.classList.remove('dark');
  }, [dark]);

  // Accent intensity
  appUseEffect(() => {
    const root = document.getElementById('stage');
    if (!root) return;
    if (t.accentIntensity === 'restrained') {
      root.style.setProperty('--fs-gold', '#D4AB33');
      root.style.setProperty('--fs-fg-accent', '#8B6F1F');
    } else if (t.accentIntensity === 'bold') {
      root.style.setProperty('--fs-gold', '#F4D77A');
      root.style.setProperty('--fs-fg-accent', '#B8932A');
    } else {
      root.style.removeProperty('--fs-gold');
      root.style.removeProperty('--fs-fg-accent');
    }
  }, [t.accentIntensity]);

  // Density
  appUseEffect(() => {
    const root = document.getElementById('stage');
    if (!root) return;
    if (t.density === 'compact') {
      root.style.fontSize = '15px';
      root.style.setProperty('--fs-text-base', '15px');
    } else {
      root.style.fontSize = '16px';
      root.style.removeProperty('--fs-text-base');
    }
  }, [t.density]);

  // Keyboard shortcuts
  appUseEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const map = { '1': 'home', '2': 'calendar', '3': 'livetv', '4': 'docs', '5': 'call', '6': 'staff' };
      if (map[e.key]) {
        setView(map[e.key]);
      } else if (e.key === 'm' || e.key === 'M') {
        setMic(m => !m);
      } else if (e.key === 'd' || e.key === 'D') {
        setTweak('manualDark', !t.manualDark);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setView('docs');
        setTimeout(() => docSearchRef.current && docSearchRef.current.focus(), 80);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [t.manualDark]);

  // Pick a sensible "next" slot when adding a channel from the guide.
  const tvSwapChannel = (channelId) => {
    setTvChannels(prev => {
      // If the channel is already on-screen, just take audio.
      const existing = prev.indexOf(channelId);
      if (existing >= 0) { setTvPrimary(existing); return prev; }
      const next = [...prev];
      next[tvPrimary] = channelId;
      return next;
    });
  };

  // Filter docs by folder.
  const docsForFolder = appUseMemo(() => {
    if (!docFolder) return DOCS;
    if (docFolder === 'star')   return DOCS.filter(d => d.starred);
    if (docFolder === 'recent') return DOCS.slice(0, 6);
    if (docFolder === 'shared') return DOCS;
    // Mock folder routing by id
    const folderMap = {
      f1: ['rj', 'ah'],
      f2: ['ah', 'mp'],
      f3: ['ah'],
      f4: ['cv', 'mp'],
      f5: ['dw'],
      f6: ['tk'],
    };
    const owners = folderMap[docFolder];
    if (!owners) return DOCS;
    return DOCS.filter(d => owners.includes(d.owner));
  }, [docFolder]);

  // Deck buttons per view — all wired to real handlers.
  const deckButtons = appUseMemo(() => {
    switch (view) {
      case 'home': return [
        { label: 'Calendar',  icon: 'calendar',   onPress: () => setView('calendar') },
        { label: 'Live TV',   icon: 'tv',         onPress: () => setView('livetv') },
        { label: 'Drive',     icon: 'folder',     onPress: () => setView('docs') },
        { label: 'Go to Call',icon: 'phone-call', tone: 'gold', onPress: () => setView('call') },
        { label: 'All Staff', icon: 'users',      onPress: () => setView('staff') },
        { label: 'Wire',      icon: 'newspaper',  onPress: () => {
            // Scroll/flash the wire ticker
            const el = document.querySelector('[data-wire]');
            if (el) { el.style.background = 'var(--fs-gold)'; setTimeout(() => el.style.background = '', 400); }
          } },
      ];
      case 'calendar': return [
        { label: 'Office',  icon: 'building-2', onPress: () => setCalStaff(['office']) },
        { label: 'All',     icon: 'users',      onPress: () => setCalStaff(STAFF.map(s => s.id)) },
        { label: 'Today',   icon: 'crosshair',  tone: 'gold', onPress: () => setCalWeekOffset(0) },
        { label: 'Day',     icon: 'square',     onPress: () => setCalView('day') },
        { label: 'Week',    icon: 'columns',    onPress: () => setCalView('week') },
        { label: 'Month',   icon: 'grid',       onPress: () => setCalView('month') },
      ];
      case 'livetv': {
        const setPrimaryToChannel = (id) => {
          setTvChannels(prev => {
            const existing = prev.indexOf(id);
            if (existing >= 0) { setTvPrimary(existing); return prev; }
            const next = [...prev]; next[tvPrimary] = id; return next;
          });
        };
        return [
          { label: 'C-SPAN',  icon: 'building',  onPress: () => setPrimaryToChannel('cspan') },
          { label: 'MSNBC',   icon: 'tv',        onPress: () => setPrimaryToChannel('msnbc') },
          { label: 'CNN',     icon: 'tv',        onPress: () => setPrimaryToChannel('cnn') },
          { label: 'NC Cap',  icon: 'landmark',  onPress: () => setPrimaryToChannel('nccap') },
          { label: 'Mute TV', icon: muted ? 'volume-x' : 'volume-2', tone: muted ? 'danger' : '',
            onPress: () => setMuted(!muted) },
          { label: tvLayout === 'quad' ? 'Focus' : tvLayout === 'focus' ? 'Duo' : 'Quad',
            icon: 'grid-2x2', tone: 'gold',
            onPress: () => setTvLayout(L => L === 'quad' ? 'focus' : L === 'focus' ? 'duo' : 'quad') },
        ];
      }
      case 'docs': return [
        { label: 'Starred', icon: 'star',       onPress: () => setDocFolder('star') },
        { label: 'Recent',  icon: 'clock',      onPress: () => setDocFolder('recent') },
        { label: 'All',     icon: 'file-text',  onPress: () => setDocFolder(null) },
        { label: 'Memos',   icon: 'book',       onPress: () => setDocFolder('f5') },
        { label: 'Search',  icon: 'search',     onPress: () => {
            docSearchRef.current && docSearchRef.current.focus();
          } },
        { label: 'Cast',    icon: 'cast', tone: 'gold', onPress: () => {
            alert('Casting "' + (DOCS.find(d => d.id === docSelected) || DOCS[0]).title + '" to TV…');
          } },
      ];
      case 'call': return [
        { label: 'Join',    icon: 'phone-call', tone: 'gold',
          onPress: () => nextCall.url && window.open(nextCall.url, '_blank', 'noopener') },
        { label: 'Mic',     icon: mic ? 'mic' : 'mic-off', tone: mic ? '' : 'danger',
          onPress: () => setMic(!mic) },
        { label: 'Cam',     icon: cam ? 'video' : 'video-off', tone: cam ? '' : 'danger',
          onPress: () => setCam(!cam) },
        { label: 'Reopen',  icon: 'external-link',
          onPress: () => nextCall.url && window.open(nextCall.url, '_blank', 'noopener') },
        { label: 'People',  icon: 'users',
          onPress: () => alert('In call:\n  • Robert Jamison (host)\n  • Anika Hale\n  • Marcus Peña\n  • Carmen Vega\n  • Devon Wexler\n  • You') },
        { label: 'Leave',   icon: 'phone-off', tone: 'danger',
          onPress: () => setView('home') },
      ];
      case 'staff': return [
        { label: 'Directory',icon: 'users',     onPress: () => alert('Directory module coming Q3 2026.') },
        { label: 'Time Off', icon: 'plane',     onPress: () => alert('Time-off module coming Q3 2026.') },
        { label: 'Expenses', icon: 'receipt',   onPress: () => alert('Expenses module coming Q3 2026.') },
        { label: 'Sign-off', icon: 'check-square', onPress: () => alert('Sign-off queue coming Q3 2026.') },
        { label: 'Policies', icon: 'book-open', onPress: () => alert('Policy library coming Q3 2026.') },
        { label: 'Reports',  icon: 'bar-chart-3',onPress: () => alert('Reports coming Q3 2026.') },
      ];
      default: return [];
    }
  }, [view, mic, cam, muted, recording, tvLayout, tvPrimary, docSelected, nextCall]);

  return (
    <div style={{
      width: 1920, height: 1080,
      display: 'grid',
      gridTemplateColumns: '112px 1fr',
      gridTemplateRows: '88px 1fr 88px',
      background: 'var(--fs-paper)',
      color: 'var(--fs-fg)',
      overflow: 'hidden',
    }}>
      {/* Top bar — spans both columns */}
      <div style={{ gridColumn: '1 / -1' }}>
        <TopBar
          now={now} weather={weather}
          mic={mic} cam={cam} recording={recording} volume={volume}
          dark={dark}
          onToggleDark={() => setTweak('manualDark', !t.manualDark)}
          onToggleMic={() => setMic(!mic)}
          onToggleCam={() => setCam(!cam)}
          onChangeVolume={setVolume}
        />
      </div>

      {/* Left rail */}
      <LeftRail active={view} onNavigate={setView} />

      {/* Main view */}
      <main style={{
        overflow: 'hidden', position: 'relative',
        background: 'var(--fs-paper)',
      }} key={view}>
        {view === 'home'     && <HomeView now={now} weather={weather} density={t.density}
                                    events={liveEvents} nextCall={nextCall}
                                    onNavigate={setView} />}
        {view === 'calendar' && <CalendarView now={now} events={liveEvents}
                                    view={calView} onSetView={setCalView}
                                    weekOffset={calWeekOffset} onSetWeekOffset={setCalWeekOffset}
                                    selectedStaff={calStaff} onSetStaff={setCalStaff} />}
        {view === 'livetv'   && <LiveTVView
                                    volume={volume} muted={muted}
                                    onChangeVolume={setVolume} onToggleMute={() => setMuted(!muted)}
                                    channels={tvChannels} onSetChannels={setTvChannels}
                                    primary={tvPrimary} onSetPrimary={setTvPrimary}
                                    layout={tvLayout} onSetLayout={setTvLayout} />}
        {view === 'docs'     && <DocumentsView
                                    folder={docFolder} onSetFolder={setDocFolder}
                                    docs={docsForFolder}
                                    selected={docSelected} onSetSelected={setDocSelected}
                                    search={docSearch} onSetSearch={setDocSearch}
                                    searchRef={docSearchRef} />}
        {view === 'call'     && <GoToCallView now={now} mic={mic} cam={cam}
                                    call={nextCall}
                                    onSetMic={setMic} onSetCam={setCam}
                                    onNavigate={setView} />}
        {view === 'staff'    && <StaffPortalView />}

        {/* Connect-Calendar pill — only appears once a client ID is configured */}
        {gcal.enabled && gcal.status !== 'connected' && (
          <button onClick={gcal.connect} title="Authorize Google Calendar (read-only)"
            style={{
              position: 'absolute', top: 16, right: 16, zIndex: 50,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px',
              background: gcal.status === 'error' ? 'var(--fs-danger)' : 'var(--fs-navy)',
              color: 'var(--fs-paper)', border: '1px solid var(--fs-gold)',
              cursor: 'pointer',
              fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
            <Icon name="calendar" size={14} />
            {gcal.status === 'loading' ? 'Loading…' :
             gcal.status === 'error' ? 'Calendar error · retry' : 'Connect Calendar'}
          </button>
        )}
      </main>

      {/* Streamdeck strip */}
      <div style={{ gridColumn: '1 / -1' }}>
        <DeckStrip buttons={deckButtons} onPress={(b) => b.onPress && b.onPress()} />
      </div>

      {/* Tweaks Panel */}
      <TweaksPanel title="Office TV · Tweaks">
        <TweakSection label="Visuals" />
        <TweakRadio label="Accent intensity" value={t.accentIntensity}
          options={['restrained', 'balanced', 'bold']}
          onChange={(v) => setTweak('accentIntensity', v)} />
        <TweakRadio label="Density" value={t.density}
          options={['compact', 'comfortable']}
          onChange={(v) => setTweak('density', v)} />

        <TweakSection label="Dark Mode" />
        <TweakRadio label="Mode" value={t.darkMode}
          options={['auto', 'manual']}
          onChange={(v) => setTweak('darkMode', v)} />
        <TweakToggle label="Manual override · dark" value={t.manualDark}
          onChange={(v) => setTweak('manualDark', v)} />

        <TweakSection label="Navigation" />
        <TweakButton label="Reset to Home" onClick={() => setView('home')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
