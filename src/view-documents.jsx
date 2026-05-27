// DOCUMENTS — Drive browser + preview

const { useState: docsUseState } = React;

function DocumentsView({ folder, onSetFolder, docs, selected, onSetSelected, search, onSetSearch, searchRef }) {
  const [_sel, _setSel] = docsUseState('d1');
  const [_folder, _setFolder] = docsUseState(null);
  const [_search, _setSearch] = docsUseState('');
  const selectedDoc = selected !== undefined ? selected : _sel;
  const setSelectedDoc = onSetSelected || _setSel;
  const activeFolder = folder !== undefined ? folder : _folder;
  const setActiveFolder = onSetFolder || _setFolder;
  const searchValue = search !== undefined ? search : _search;
  const setSearch = onSetSearch || _setSearch;

  const sourceDocs = docs || DOCS;
  const doc = sourceDocs.find(d => d.id === selectedDoc) || DOCS.find(d => d.id === selectedDoc) || sourceDocs[0] || DOCS[0];
  const owner = STAFF.find(s => s.id === doc.owner) || STAFF[0];

  const filtered = sourceDocs.filter(d =>
    !searchValue || d.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const kindIcon = (k) => ({
    doc: 'file-text', sheet: 'sheet', slides: 'presentation', pdf: 'file',
  }[k] || 'file');

  const kindColor = (k) => ({
    doc: 'var(--fs-navy)', sheet: 'var(--fs-success)', slides: 'var(--fs-warning)', pdf: 'var(--fs-danger)',
  }[k] || 'var(--fs-fg-muted)');

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* LEFT — folder list */}
      <div style={{
        width: 260, flexShrink: 0,
        background: 'var(--fs-bone-50)',
        borderRight: '1px solid var(--fs-border)',
        padding: '24px 18px',
        overflowY: 'auto',
      }} className="__paper-flip">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="gold-rule" />
          <span className="eyebrow">Google Drive</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--fs-font-display)',
          fontSize: 28, fontWeight: 700, lineHeight: 1.1,
          color: 'var(--fs-fg-brand)', margin: '0 0 20px',
          letterSpacing: '-0.015em',
        }}>Shared Drive</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FolderRow icon="star" name="Starred" count={DOCS.filter(d=>d.starred).length}
            active={activeFolder === 'star'} onClick={() => setActiveFolder('star')} />
          <FolderRow icon="clock" name="Recent" count={9}
            active={activeFolder === 'recent'} onClick={() => setActiveFolder('recent')} />
          <FolderRow icon="users" name="Shared with me" count={42}
            active={activeFolder === 'shared'} onClick={() => setActiveFolder('shared')} />
        </div>

        <div style={{ height: 1, background: 'var(--fs-border)', margin: '14px 0' }} />

        <div className="eyebrow" style={{ marginBottom: 10, color: 'var(--fs-fg-subtle)', fontSize: 10 }}>Folders</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DOC_FOLDERS.map(f => (
            <FolderRow key={f.id} name={f.name} count={f.count} color={f.color}
              active={activeFolder === f.id} onClick={() => setActiveFolder(f.id)} />
          ))}
        </div>
      </div>

      {/* CENTER — document list */}
      <div style={{
        width: 460, flexShrink: 0,
        borderRight: '1px solid var(--fs-border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--fs-paper)',
      }} className="__paper-flip">
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--fs-border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', border: '1px solid var(--fs-border-strong)',
          }}>
            <Icon name="search" size={16} />
            <input
              ref={searchRef}
              value={searchValue}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Drive…"
              style={{
                border: 'none', outline: 'none',
                background: 'transparent', flex: 1,
                fontFamily: 'var(--fs-font-sans)', fontSize: 14,
                color: 'var(--fs-fg)',
              }}/>
            <span style={{
              fontFamily: 'var(--fs-font-mono)', fontSize: 10,
              letterSpacing: '0.14em', color: 'var(--fs-fg-subtle)',
              border: '1px solid var(--fs-border)', padding: '1px 5px',
            }}>⌘K</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.map(d => {
            const dOwner = STAFF.find(s => s.id === d.owner) || STAFF[0];
            const active = d.id === selectedDoc;
            return (
              <button key={d.id} onClick={() => setSelectedDoc(d.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr auto',
                  gap: 14, alignItems: 'center',
                  padding: '14px 24px',
                  border: 'none',
                  borderBottom: '1px solid var(--fs-border)',
                  borderLeft: active ? '3px solid var(--fs-gold)' : '3px solid transparent',
                  background: active ? 'var(--fs-bone-50)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                }}>
                <div style={{
                  width: 36, height: 36,
                  background: kindColor(d.kind),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                }}>
                  <Icon name={kindIcon(d.kind)} size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--fs-font-display)',
                    fontSize: 16, fontWeight: 700, color: 'var(--fs-fg-brand)',
                    lineHeight: 1.2,
                  }}>
                    {d.starred && <Icon name="star" size={12} style={{ color: 'var(--fs-gold-700)' }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
                  </div>
                  <div style={{
                    fontFamily: 'var(--fs-font-sans)', fontSize: 11,
                    color: 'var(--fs-fg-muted)', marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <StaffAvatar staff={dOwner} size={14} />
                    <span>{dOwner.name}</span>
                    <span>·</span>
                    <span>{d.updated}</span>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 10,
                  color: 'var(--fs-fg-subtle)', letterSpacing: '0.1em',
                }}>{d.size}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT — preview */}
      <div style={{
        flex: 1,
        background: 'var(--fs-bone-100)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }} className="__paper-flip">
        <div style={{
          padding: '20px 32px',
          borderBottom: '1px solid var(--fs-border)',
          background: 'var(--fs-paper)',
          display: 'flex', alignItems: 'center', gap: 16,
        }} className="__paper-flip">
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>{doc.kind.toUpperCase()} · {doc.size}</div>
            <h3 style={{
              fontFamily: 'var(--fs-font-display)',
              fontSize: 26, fontWeight: 700, margin: 0,
              color: 'var(--fs-fg-brand)', lineHeight: 1.15,
              letterSpacing: '-0.015em',
            }}>{doc.title}</h3>
          </div>
          <button onClick={() => window.open('https://drive.google.com/drive/search?q=' + encodeURIComponent(doc.title), '_blank')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            background: 'var(--fs-navy)', color: 'var(--fs-paper)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            <Icon name="external-link" size={14} />
            Open in Drive
          </button>
          <button onClick={() => alert('Casting "' + doc.title + '" to conference TV…')} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            background: 'var(--fs-gold)', color: 'var(--fs-ink)',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--fs-font-sans)', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            <Icon name="cast" size={14} />
            Cast to TV
          </button>
        </div>

        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '36px 48px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        }}>
          <MockDocumentPage doc={doc} owner={owner} />
          <MockDocumentPage doc={doc} owner={owner} pageNum={2} />
        </div>
      </div>
    </div>
  );
}

function FolderRow({ icon, name, count, color, active, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: '24px 1fr auto',
        gap: 12, alignItems: 'center',
        padding: '8px 10px',
        border: 'none',
        background: active ? 'var(--fs-paper)' : 'transparent',
        borderLeft: '2px solid ' + (active ? (color || 'var(--fs-navy)') : 'transparent'),
        cursor: 'pointer', textAlign: 'left', width: '100%',
      }}>
      {icon ? <Icon name={icon} size={14} style={{ color: color || 'var(--fs-fg-muted)' }} /> :
        <span style={{ width: 12, height: 12, background: color || 'var(--fs-navy)' }} />}
      <span style={{
        fontFamily: 'var(--fs-font-sans)', fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: 'var(--fs-fg)',
      }}>{name}</span>
      <span style={{
        fontFamily: 'var(--fs-font-mono)', fontSize: 10,
        color: 'var(--fs-fg-subtle)', letterSpacing: '0.1em',
      }}>{count}</span>
    </button>
  );
}

// Mock document page — looks like an editorial brief
function MockDocumentPage({ doc, owner, pageNum = 1 }) {
  return (
    <div style={{
      width: '100%', maxWidth: 720,
      background: 'var(--fs-paper)',
      boxShadow: '0 8px 24px rgba(14,34,56,0.10)',
      padding: '60px 64px 80px',
      position: 'relative',
      minHeight: 760,
    }} className="__paper-flip">
      <div style={{
        position: 'absolute', top: 24, right: 32,
        fontFamily: 'var(--fs-font-mono)', fontSize: 10,
        color: 'var(--fs-fg-subtle)', letterSpacing: '0.16em',
      }}>p. {pageNum}</div>

      {pageNum === 1 && (
        <>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Memorandum · Fog Signal Strategies
          </div>
          <h1 style={{
            fontFamily: 'var(--fs-font-display)',
            fontSize: 36, fontWeight: 700,
            color: 'var(--fs-fg-brand)', letterSpacing: '-0.015em',
            margin: '0 0 28px', lineHeight: 1.1,
          }}>{doc.title}</h1>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid var(--fs-border)',
            borderBottom: '1px solid var(--fs-border)',
            padding: '14px 0', marginBottom: 32, gap: 16,
          }}>
            {[
              {l: 'Author', v: owner.name},
              {l: 'Updated', v: doc.updated},
              {l: 'Status', v: doc.starred ? 'Active' : 'Draft'},
            ].map(s => (
              <div key={s.l}>
                <div style={{
                  fontFamily: 'var(--fs-font-mono)', fontSize: 9,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--fs-fg-subtle)', marginBottom: 3,
                }}>{s.l}</div>
                <div style={{
                  fontFamily: 'var(--fs-font-display)', fontSize: 14,
                  color: 'var(--fs-fg)', fontWeight: 600,
                }}>{s.v}</div>
              </div>
            ))}
          </div>

          <p style={{
            fontFamily: 'var(--fs-font-serif)',
            fontSize: 17, lineHeight: 1.65,
            color: 'var(--fs-fg)',
            margin: '0 0 16px',
          }}>
            <span style={{
              fontFamily: 'var(--fs-font-display)', fontStyle: 'italic',
              fontSize: 32, float: 'left',
              lineHeight: 0.9, marginRight: 8, marginTop: 4,
              color: 'var(--fs-fg-brand)',
            }}>T</span>
            he short legislative session reconvenes Thursday with three matters of immediate concern to client interests: HB 412 (energy reform), SB 88 (coastal permitting), and the Governor's expected veto of HB 274. We recommend a coordinated posture across coalition channels.
          </p>

          <h3 style={{
            fontFamily: 'var(--fs-font-display)',
            fontSize: 22, fontWeight: 700,
            color: 'var(--fs-fg-brand)', margin: '24px 0 12px',
            letterSpacing: '-0.01em',
          }}>Strategic Posture</h3>

          <p style={{
            fontFamily: 'var(--fs-font-serif)', fontSize: 16, lineHeight: 1.65,
            color: 'var(--fs-fg)', margin: '0 0 14px',
          }}>
            Senior counsel should be visible in the chamber during markup. Press posture remains restrained — issue a single statement post-vote, signed by the firm rather than any individual partner. Coalition members have been asked to hold for our cue.
          </p>

          <ul style={{
            fontFamily: 'var(--fs-font-serif)', fontSize: 16, lineHeight: 1.6,
            color: 'var(--fs-fg)', paddingLeft: 20,
          }}>
            <li>Confirm Coastal Coalition roster for Friday reception</li>
            <li>Coordinate with NCDOT briefing team before Wednesday</li>
            <li>Maintain quiet posture on HB 274 until signing</li>
          </ul>
        </>
      )}

      {pageNum === 2 && (
        <>
          <h3 style={{
            fontFamily: 'var(--fs-font-display)',
            fontSize: 22, fontWeight: 700,
            color: 'var(--fs-fg-brand)', margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}>Risk Considerations</h3>
          {Array.from({length: 5}).map((_, i) => (
            <p key={i} style={{
              fontFamily: 'var(--fs-font-serif)', fontSize: 16, lineHeight: 1.65,
              color: i === 0 ? 'var(--fs-fg)' : 'var(--fs-fg-muted)',
              margin: '0 0 14px',
            }}>
              {i === 0
                ? 'The principal risk in current posture is over-exposure on HB 412. Members of the energy subcommittee have signaled willingness to move quickly; client interests are best served by allowing the markup to proceed without firm fingerprints.'
                : '— content continues —'
              }
            </p>
          ))}

          <div style={{
            marginTop: 32, padding: 18,
            borderLeft: '3px solid var(--fs-gold)',
            background: 'var(--fs-bone-50)',
          }} className="__paper-flip">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Partner Note</div>
            <p style={{
              fontFamily: 'var(--fs-font-display)', fontStyle: 'italic',
              fontSize: 18, lineHeight: 1.45, margin: 0,
              color: 'var(--fs-fg-brand)',
            }}>
              "We move policy, not paper. The record will reflect the work — make sure the work is worth the record."
            </p>
            <div style={{
              fontFamily: 'var(--fs-font-sans)', fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--fs-fg-muted)', marginTop: 8,
            }}>— R. Jamison, Managing Partner</div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { DocumentsView });
