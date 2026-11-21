/* Design-review page — typography, controls, status and data treatments.
   Temporary demonstration of the established design system. Not the
   production dashboard; the real shell is not yet built.
*/

export function DesignTest() {
  return (
    <main className="test-page container">
      <header className="test-page__header">
        <h1 className="test-page__title">Orca Console</h1>
        <p className="test-page__subtitle">
          Design review — editorial minimalism for infrastructure software
        </p>
      </header>

      <hr className="sep" />

      <section className="test-section">
        <h2 className="test-section__heading">Typography</h2>
        <p className="test-intro">
          A refined system sans-serif carries the interface. A restrained
          editorial serif appears only for major headings. Monospace is
          reserved for technical data. No display faces beyond headings, no
          oversized type to manufacture personality.
        </p>

        <div className="type-specimen">
          <div className="type-col">
            <p className="type-display-sm">Display small</p>
            <p className="type-display-md">Display medium</p>
            <p className="type-display-lg">Display large</p>
          </div>
          <div className="type-col">
            <p className="type-body">
              Body text at the base size, set at a comfortable measure for
              sustained reading in an operational context.
            </p>
            <p className="type-body type--secondary">
              Secondary prose carries supporting context without competing for
              attention.
            </p>
            <p className="type-label">Compact data label</p>
            <p className="type-mono">0x1A3F &bull; server-04 &bull; 14:32:07</p>
          </div>
        </div>
      </section>

      <hr className="sep" />

      <section className="test-section">
        <h2 className="test-section__heading">Controls</h2>
        <div className="control-group">
          <button className="btn btn--primary">Primary action</button>
          <button className="btn btn--secondary">Secondary</button>
          <button className="btn btn--ghost">Ghost</button>
          <button className="btn btn--primary" disabled>
            Disabled
          </button>
          <button className="btn btn--primary btn--sm">Small</button>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="hostname">
            Hostname
          </label>
          <input
            className="field-input"
            id="hostname"
            placeholder="server-01.example.com"
          />
          <p className="field-note">
            Fully qualified domain name of the target host.
          </p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="environment">
            Environment
          </label>
          <select className="field-select" id="environment">
            <option>Production</option>
            <option>Staging</option>
            <option>Development</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="notes">
            Notes
          </label>
          <textarea className="field-textarea" id="notes" rows={3} />
        </div>
      </section>

      <hr className="sep" />

      <section className="test-section">
        <h2 className="test-section__heading">Status &amp; data</h2>
        <div className="status-group">
          <span className="status status--ok">Operational</span>
          <span className="status status--warn">Degraded</span>
          <span className="status status--error">Outage</span>
          <span className="status status--info">Maintenance</span>
          <span className="status status--neutral">Pending</span>
        </div>

        <div className="data-card">
          <div className="kv-row">
            <span className="data-label">Cluster</span>
            <span className="data-value">orca-prod-01</span>
          </div>
          <div className="kv-row">
            <span className="data-label">Nodes</span>
            <span className="data-value">12</span>
          </div>
          <div className="kv-row">
            <span className="data-label">Utilization</span>
            <span className="data-value">64%</span>
          </div>
          <div className="kv-row">
            <span className="data-label">Last sync</span>
            <span className="data-mono">2026-11-21 10:19 UTC</span>
          </div>
        </div>

        <table className="table table--compact">
          <thead>
            <tr>
              <th>Host</th>
              <th>Role</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>server-01</td>
              <td>compute</td>
              <td><span className="status status--ok">ok</span></td>
              <td className="data-mono">10:18:02</td>
            </tr>
            <tr>
              <td>server-07</td>
              <td>storage</td>
              <td><span className="status status--warn">warn</span></td>
              <td className="data-mono">10:17:41</td>
            </tr>
            <tr>
              <td>server-12</td>
              <td>gateway</td>
              <td><span className="status status--error">err</span></td>
              <td className="data-mono">10:16:55</td>
            </tr>
          </tbody>
        </table>
      </section>

      <hr className="sep sep--tight" />

      <footer className="test-page__footer">
        <p className="type-muted">
          Design review only — dashboard not yet built.
        </p>
      </footer>
    </main>
  );
}

export default DesignTest;
