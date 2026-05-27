// Lucide icon wrapper for React. Uses currentColor and accepts size prop.
// Inserts an SVG via dangerouslySetInnerHTML from lucide's createElement,
// but to keep things simple we just render <i data-lucide=...> and call
// lucide.createIcons() after mount.

const { useEffect, useRef } = React;

function Icon({ name, size = 20, strokeWidth = 1.75, style = {}, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      // Clear and recreate so name changes work
      ref.current.innerHTML = `<i data-lucide="${name}" style="display:inline-flex"></i>`;
      window.lucide.createIcons({
        attrs: { width: size, height: size, 'stroke-width': strokeWidth },
        nameAttr: 'data-lucide',
      });
    }
  }, [name, size, strokeWidth]);
  return (
    <span ref={ref}
      style={{ display: 'inline-flex', width: size, height: size, color: 'currentColor', ...style }}
      {...rest}
    />
  );
}

// A reusable small "lighthouse beam" motif for hero/decorative use.
function BeamMotif({ size = 540, opacity = 0.18, color = 'var(--fs-gold)', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 540 540"
      style={{ position: 'absolute', opacity, pointerEvents: 'none', ...style }}>
      <g fill="none" stroke={color} strokeWidth="1.25">
        <path d="M 270 270 L 540 120" />
        <path d="M 270 270 L 540 270" />
        <path d="M 270 270 L 540 420" />
        <circle cx="270" cy="270" r="80" />
        <circle cx="270" cy="270" r="140" />
        <circle cx="270" cy="270" r="220" />
        <circle cx="270" cy="270" r="300" />
      </g>
    </svg>
  );
}

// A tiny inline weather glyph using lucide names mapped from condition string.
function WeatherGlyph({ condition, size = 24 }) {
  const map = {
    'Mostly Cloudy': 'cloud-sun',
    'Cloudy':        'cloud',
    'Sunny':         'sun',
    'Rain':          'cloud-rain',
    'Storm':         'cloud-lightning',
    'Snow':          'snowflake',
    'Fog':           'cloud-fog',
    'Clear':         'moon',
  };
  return <Icon name={map[condition] || 'cloud'} size={size} />;
}

Object.assign(window, { Icon, BeamMotif, WeatherGlyph });
