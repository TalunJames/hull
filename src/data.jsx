// Mock data for the office TV app.
// Today is anchored to a fixed date for predictable preview screenshots,
// but the running clock updates in real time.

const TODAY = new Date(); // live
const ANCHOR = new Date(); // visible "today" for the calendar; matches now

// ---- Staff ----
const STAFF = [
  { id: 'office',  name: 'Office Calendar',  initials: 'FS', color: '#1A3A5C', role: 'Shared' },
  { id: 'rj',      name: 'Robert Jamison',   initials: 'RJ', color: '#2A6FDB', role: 'Managing Partner' },
  { id: 'ah',      name: 'Anika Hale',       initials: 'AH', color: '#A8341E', role: 'Senior Counsel' },
  { id: 'mp',      name: 'Marcus Peña',      initials: 'MP', color: '#2F6B4F', role: 'Public Affairs Director' },
  { id: 'cv',      name: 'Carmen Vega',      initials: 'CV', color: '#B8932A', role: 'Coalition Strategist' },
  { id: 'dw',      name: 'Devon Wexler',     initials: 'DW', color: '#5B5B58', role: 'Research Lead' },
  { id: 'tk',      name: 'Tobias Kerr',      initials: 'TK', color: '#7A5AE0', role: 'Operations' },
];

// ---- Today's agenda (relative to right now) ----
// Each event: { time (Date), end (Date), title, location, owner (staff id), type, color, recurring }
function mkEvent(hourStart, mins, durMin, title, location, owner, type, url) {
  const start = new Date();
  start.setHours(hourStart, mins, 0, 0);
  const end = new Date(start.getTime() + durMin * 60 * 1000);
  return { start, end, title, location, owner, type, url };
}

// Detect the video-call platform from any string (URL or label).
// Returns { id, name, color } or null. Used to make "Go to Call" real:
// the calendar event's link is the cue for which platform/URL to launch.
function detectCallPlatform(str) {
  if (!str) return null;
  const s = String(str);
  if (/zoom\.us|zoommtg:/i.test(s))                     return { id: 'zoom',  name: 'Zoom',            color: '#2D8CFF' };
  if (/meet\.google\.com/i.test(s))                     return { id: 'meet',  name: 'Google Meet',     color: '#00897B' };
  if (/teams\.(microsoft|live)\.com|msteams:/i.test(s)) return { id: 'teams', name: 'Microsoft Teams', color: '#5059C9' };
  if (/webex\.com|webexstart:/i.test(s))                return { id: 'webex', name: 'Webex',           color: '#0D8E70' };
  return null;
}

// The openable meeting link for an event, if any.
function eventCallUrl(e) {
  if (!e) return null;
  if (e.url && /^https?:\/\/|:\/\//.test(e.url)) return e.url;
  return null;
}

const TODAY_EVENTS = [
  mkEvent(8,  30,  30, 'Morning Standup',                  'Conference Room A',   'office', 'internal'),
  mkEvent(9,  15,  45, 'NCDOT Briefing Prep',              'Partner Office',      'rj',     'prep'),
  mkEvent(10, 0,   60, 'Coastal Coalition Call',           'Zoom',                'mp',     'call',  'https://zoom.us/j/3344556677'),
  mkEvent(11, 30,  60, 'Hearing — HB 412 Energy Reform',   'State Legislature',   'ah',     'external'),
  mkEvent(13, 0,   30, 'Working Lunch · Triangle Chamber', 'On-site',             'office', 'external'),
  mkEvent(14, 0,   60, 'Coalition Strategy Working Session','Conference Room B',  'cv',     'internal'),
  mkEvent(15, 30,  45, 'Memo Review — Q2 Outlook',         'Partner Office',      'dw',     'internal'),
  mkEvent(16, 30,  30, 'Client Sync · Hadley Industries',  'Google Meet',         'rj',     'call',  'https://meet.google.com/hadley-sync-demo'),
  mkEvent(17, 30,  60, 'Press Statement Drafting',         'Open Floor',          'ah',     'internal'),
];

// ---- This week ----
const WEEK_EVENT_COUNT = [3, 5, 7, 4, 2]; // Mon-Fri counts shown as ticks

// ---- Announcements ----
const ANNOUNCEMENTS = [
  { kind: 'memo',   text: 'Q2 client outlook memo posted to Drive · Partners' },
  { kind: 'press',  text: 'HB 412 markup moved to Thursday afternoon — see updated brief' },
  { kind: 'office', text: 'Office closes Friday at 3pm for the Coastal Coalition reception' },
  { kind: 'people', text: 'Carmen Vega traveling Wed–Thu · Raleigh deposition' },
  { kind: 'memo',   text: 'New retainer signed: Carolina Maritime Trades Association' },
];

// ---- News / wire ticker ----
const WIRE = [
  'NCGA reconvenes short session Thursday 10:00 AM',
  'EPA finalizes Subpart W reporting — 90-day comment window',
  'Coastal Resources Commission advances new permit guidance',
  'Senate Finance markup of SB 88 expected next Tuesday',
  'Governor signs HB 274 — effective July 1',
];

// ---- YouTube TV channels for the quadbox ----
const CHANNELS = [
  { id: 'cspan',   name: 'C-SPAN',           network: 'C-SPAN',           live: true,  show: 'House Floor Proceedings',     viewers: '3.2K' },
  { id: 'cspan2',  name: 'C-SPAN 2',         network: 'C-SPAN',           live: true,  show: 'Senate Energy Hearing',       viewers: '1.8K' },
  { id: 'msnbc',   name: 'MSNBC',            network: 'MSNBC',            live: true,  show: 'Andrea Mitchell Reports',     viewers: '142K' },
  { id: 'cnn',     name: 'CNN',              network: 'CNN',              live: true,  show: 'The Lead with Jake Tapper',   viewers: '224K' },
  { id: 'foxnews', name: 'Fox News',         network: 'Fox News',         live: true,  show: 'America Reports',             viewers: '418K' },
  { id: 'bloom',   name: 'Bloomberg',        network: 'Bloomberg',        live: true,  show: 'Balance of Power',            viewers: '38K'  },
  { id: 'cnbc',    name: 'CNBC',             network: 'CNBC',             live: true,  show: 'Power Lunch',                 viewers: '62K'  },
  { id: 'wral',    name: 'WRAL Raleigh',     network: 'CBS Local',        live: true,  show: 'WRAL News at Noon',           viewers: '4.4K' },
  { id: 'wbtv',    name: 'WBTV Charlotte',   network: 'CBS Local',        live: true,  show: 'WBTV News',                   viewers: '2.1K' },
  { id: 'pbsnh',   name: 'PBS NewsHour',     network: 'PBS',              live: false, show: 'Last aired 7:00 PM',          viewers: '—'    },
  { id: 'nccap',   name: 'NC Capitol',       network: 'NC General Assembly', live: true, show: 'House Energy Cmte.',         viewers: '212'  },
  { id: 'wapo',    name: 'Washington Post',  network: 'WaPo Live',        live: true,  show: 'Live: White House Brief',     viewers: '11K'  },
];

// ---- Documents from Drive ----
const DOCS = [
  { id: 'd1', title: 'Q2 Client Outlook — Working Draft', owner: 'rj', kind: 'doc',   updated: '2h ago',  starred: true,  size: '14 pages' },
  { id: 'd2', title: 'HB 412 Position Brief',              owner: 'ah', kind: 'doc',   updated: '4h ago',  starred: true,  size: '6 pages'  },
  { id: 'd3', title: 'Coastal Coalition Member Roster',    owner: 'cv', kind: 'sheet', updated: 'Yesterday', starred: false, size: '38 rows' },
  { id: 'd4', title: 'NCDOT Briefing Deck',                owner: 'mp', kind: 'slides',updated: 'Yesterday', starred: true,  size: '22 slides' },
  { id: 'd5', title: 'Press Statement — HB 274 Signing',   owner: 'ah', kind: 'doc',   updated: '2d ago',  starred: false, size: '2 pages'  },
  { id: 'd6', title: 'Hadley Industries — Engagement Plan','owner': 'rj', kind: 'doc', updated: '3d ago',  starred: false, size: '9 pages'  },
  { id: 'd7', title: 'Coalition Strategy — One-Pager',     owner: 'cv', kind: 'pdf',   updated: '3d ago',  starred: false, size: '1 page'   },
  { id: 'd8', title: 'Memo Library Index 2026',            owner: 'dw', kind: 'sheet', updated: 'Last week', starred: false, size: '142 rows' },
  { id: 'd9', title: 'Retainer — Carolina Maritime Trades','owner': 'tk', kind: 'pdf', updated: 'Last week', starred: false, size: '11 pages' },
];

const DOC_FOLDERS = [
  { id: 'f1', name: 'Active Clients',        count: 14, color: 'var(--fs-navy)' },
  { id: 'f2', name: 'Legislative Tracking',  count: 38, color: 'var(--fs-gold-700)' },
  { id: 'f3', name: 'Press & Statements',    count: 22, color: 'var(--fs-ink-500)' },
  { id: 'f4', name: 'Coalition Materials',   count:  9, color: 'var(--fs-success)' },
  { id: 'f5', name: 'Memo Library',          count: 142,color: 'var(--fs-navy-600)' },
  { id: 'f6', name: 'Operations',            count: 17, color: 'var(--fs-ink-700)' },
];

// ---- Active call detection (mocked) ----
const NEXT_CALL = {
  app: 'meet',
  url: 'https://meet.google.com/hadley-sync-demo',
  title: 'Client Sync · Hadley Industries',
  host: 'Robert Jamison',
  in_minutes: 6,
  participants: ['RJ', 'AH', 'MP', '+ 3'],
};

// ---- Weather ----
// Office location — edit to point the live weather + sunset/dark-mode anywhere.
const WEATHER_LOCATION = { lat: 35.7796, lng: -78.6382, city: 'Raleigh, NC' };

// Seed values shown on first paint; replaced by the live Open-Meteo fetch.
const WEATHER = {
  city: 'Raleigh, NC',
  tempF: 64,
  feelsF: 61,
  condition: 'Mostly Cloudy',
  high: 71, low: 52,
  sunset: '6:14 PM',
  sunrise: '6:48 AM',
  wind: 'NW 8 mph',
  humidity: 58,
};

// WMO weather code → condition string matching WeatherGlyph's map.
function wmoCondition(code) {
  if (code === 0) return 'Sunny';
  if (code === 1) return 'Sunny';
  if (code === 2) return 'Mostly Cloudy';
  if (code === 3) return 'Cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code === 85 || code === 86) return 'Snow';
  if (code >= 95) return 'Storm';
  return 'Cloudy';
}

function compassDir(deg) {
  if (deg == null || isNaN(deg)) return '';
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function fmtClock(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Live weather from Open-Meteo (no API key, CORS-enabled). Resolves to a
// WEATHER-shaped object plus parsed sunrise/sunset Dates for dark-mode.
async function fetchWeather(loc) {
  const { lat, lng, city } = loc || WEATHER_LOCATION;
  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + lat + '&longitude=' + lng
    + '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m'
    + '&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset'
    + '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather ' + res.status);
  const j = await res.json();
  const c = j.current, d = j.daily;
  return {
    city,
    tempF: Math.round(c.temperature_2m),
    feelsF: Math.round(c.apparent_temperature),
    condition: wmoCondition(c.weather_code),
    high: Math.round(d.temperature_2m_max[0]),
    low: Math.round(d.temperature_2m_min[0]),
    sunset: fmtClock(d.sunset[0]),
    sunrise: fmtClock(d.sunrise[0]),
    sunsetDate: new Date(d.sunset[0]),
    sunriseDate: new Date(d.sunrise[0]),
    wind: (compassDir(c.wind_direction_10m) + ' ' + Math.round(c.wind_speed_10m) + ' mph').trim(),
    humidity: Math.round(c.relative_humidity_2m),
  };
}

Object.assign(window, {
  STAFF, TODAY_EVENTS, WEEK_EVENT_COUNT, ANNOUNCEMENTS, WIRE,
  CHANNELS, DOCS, DOC_FOLDERS, NEXT_CALL, WEATHER, WEATHER_LOCATION,
  detectCallPlatform, eventCallUrl, fetchWeather,
});
