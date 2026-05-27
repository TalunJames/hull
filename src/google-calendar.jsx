// Optional, real Google Calendar integration — client-side only, no backend.
// Uses Google Identity Services (GIS) token flow. Stays completely inert
// (and the UI unchanged) unless window.GOOGLE_CLIENT_ID is set.
//
// SETUP (one time):
//   1. console.cloud.google.com → create a project → enable "Google Calendar API".
//   2. APIs & Services → Credentials → Create OAuth client ID → type "Web application".
//      Add your app's origin to "Authorized JavaScript origins" (e.g. http://localhost:8765).
//   3. Paste the client ID into the GOOGLE_CLIENT_ID block in app.html.
// Then a small "Connect Calendar" pill appears; click it once to authorize.
// Reads are scoped to calendar.readonly. Token lives in memory only.
//
// Production note: this client-side flow needs a click and the token expires
// hourly — fine for a prototype. For an unattended kiosk, move to the
// service-account + domain-wide-delegation approach from the roadmap.

const { useState: gcUseState, useEffect: gcUseEffect, useCallback: gcUseCallback, useRef: gcUseRef } = React;

function gcalVideoLink(ev) {
  if (ev.hangoutLink) return ev.hangoutLink;
  if (ev.conferenceData && ev.conferenceData.entryPoints) {
    const ep = ev.conferenceData.entryPoints.find(e => e.entryPointType === 'video');
    if (ep && ep.uri) return ep.uri;
  }
  const blob = (ev.location || '') + ' ' + (ev.description || '');
  const m = blob.match(/https?:\/\/[^\s<>"]+/i);
  if (m && detectCallPlatform(m[0])) return m[0];
  return null;
}

function gcalMapEvent(ev) {
  if (!ev.start) return null;
  const startIso = ev.start.dateTime || ev.start.date;
  const endIso = (ev.end && (ev.end.dateTime || ev.end.date)) || startIso;
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (isNaN(start)) return null;
  const link = gcalVideoLink(ev);
  const platform = link && detectCallPlatform(link);
  return {
    start, end,
    title: ev.summary || '(no title)',
    location: ev.location || (platform ? platform.name : (link ? 'Video call' : '')),
    owner: 'office',
    type: link ? 'call' : 'internal',
    url: link || undefined,
  };
}

function useGoogleCalendar() {
  const clientId = window.GOOGLE_CLIENT_ID;
  const enabled = !!clientId;
  const [status, setStatus] = gcUseState('idle'); // idle | ready | loading | connected | error
  const [events, setEvents] = gcUseState(null);
  const [error, setError] = gcUseState(null);
  const tokenClientRef = gcUseRef(null);

  const fetchEvents = gcUseCallback(async (token) => {
    setStatus('loading');
    try {
      const now = new Date();
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
        + '?timeMin=' + encodeURIComponent(start.toISOString())
        + '&timeMax=' + encodeURIComponent(end.toISOString())
        + '&singleEvents=true&orderBy=startTime&maxResults=50';
      const r = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
      if (!r.ok) throw new Error('Calendar API ' + r.status);
      const j = await r.json();
      const mapped = (j.items || []).map(gcalMapEvent).filter(Boolean);
      setEvents(mapped);
      setStatus('connected');
    } catch (e) {
      setError(String(e && e.message || e));
      setStatus('error');
    }
  }, []);

  gcUseEffect(() => {
    if (!enabled) return;
    const init = () => {
      if (!(window.google && window.google.accounts && window.google.accounts.oauth2)) return;
      try {
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
          callback: (resp) => {
            if (resp && resp.error) { setError(resp.error); setStatus('error'); return; }
            fetchEvents(resp.access_token);
          },
        });
        setStatus('ready');
      } catch (e) {
        setError(String(e && e.message || e));
        setStatus('error');
      }
    };
    if (window.google && window.google.accounts) { init(); return; }
    let s = document.getElementById('gis-script');
    if (!s) {
      s = document.createElement('script');
      s.id = 'gis-script';
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
    s.addEventListener('load', init);
    return () => s && s.removeEventListener('load', init);
  }, [enabled, fetchEvents]);

  const connect = gcUseCallback(() => {
    if (tokenClientRef.current) tokenClientRef.current.requestAccessToken();
  }, []);

  return { enabled, status, events, error, connect };
}

Object.assign(window, { useGoogleCalendar });
