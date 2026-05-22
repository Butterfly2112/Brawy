import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function FutureGuide() {
  return (
    <div className="app">
      <Header />
      <main style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ color: '#274D69' }}>Instruction</h1>

        <section style={{ marginTop: 20 }}>
          <h2>Quick Start</h2>
          <ol>
            <li>Sign in or register an account.</li>
            <li>Click "New Project" or choose a template.</li>
            <li>Add text, images and shapes from the left tools panel.</li>
            <li>Save your project using the <strong>Save</strong> button in the top bar.</li>
            <li>To share, open <strong>Share</strong> and enable public access.</li>
          </ol>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2>Detailed guide</h2>
          <p>The left panel contains tools and templates. The center is the canvas. The right panel shows properties for the selected element (color, font, size).</p>
          <p>Uploading images: use "Image &gt; Upload" or drag-and-drop files directly onto the canvas.</p>
          <p>Text: add a text block and change the font in the right panel. Custom fonts can be uploaded — they will be used in SVG/PDF export if CORS is configured correctly.</p>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2>Example task</h2>
          <p>Create a mobile poster 1080×1920:</p>
          <ul>
            <li>New project: set size to <code>1080x1920</code>.</li>
            <li>Background: gradient or #f4f4f4.</li>
            <li>Heading: Inter, 72px, centered.</li>
            <li>Image: upload and apply the Brighten filter.</li>
            <li>Export: PNG to check the final quality.</li>
          </ul>
        </section>

        <section style={{ marginTop: 24 }}>
          <h2>Screenshots</h2>

          {/** Screenshots with hover captions */}
          <ScreenshotRow />
        </section>

      </main>
      <Footer />
    </div>
  );
}

function ScreenshotRow() {
  const [hover, setHover] = useState<number | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = [
    { src: '/docs/screenshots/create-project.png', alt: 'Create project', label: '1. New project' },
    { src: '/docs/screenshots/add-text.png', alt: 'Add text', label: '2. Create your design' },
    { src: '/docs/screenshots/export.png', alt: 'Export', label: '3. Export' },
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {items.map((it, i) => (
          <div
            key={it.src}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setOpenIndex(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpenIndex(i); }}
            style={{ position: 'relative', width: 320, borderRadius: 8, overflow: 'hidden', border: '1px solid #e6e8f0', cursor: 'pointer' }}
          >
            <img src={it.src} alt={it.alt} style={{ width: '100%', display: 'block' }} />
            <div
              aria-hidden={hover !== i}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: hover === i ? 'rgba(39,77,105,0.6)' : 'transparent',
                color: 'white',
                fontWeight: 600,
                fontSize: 18,
                transition: 'background 120ms ease, opacity 120ms ease',
                opacity: hover === i ? 1 : 0,
              }}
            >
              {it.label}
            </div>
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIndex(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img src={items[openIndex].src} alt={items[openIndex].alt} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
            <button
              aria-label="Close"
              onClick={() => setOpenIndex(null)}
              style={{ position: 'absolute', top: -12, right: -12, background: '#fff', borderRadius: 20, padding: '6px 10px', border: 'none', cursor: 'pointer', fontSize: 18 }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
