import React from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { urlFor } from './sanity';

function imageSrc(value: any): string | null {
  if (!value) return null;
  if (typeof value.src === 'string') return value.src;
  if (value.asset) {
    try {
      return urlFor(value).width(1400).auto('format').url();
    } catch {
      return null;
    }
  }
  return null;
}

function ytEmbedUrl(raw: string): string {
  const url = raw.trim();
  if (url.includes('/embed/')) return url;
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/)([\w-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
  return url;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      const src = imageSrc(value);
      if (!src) return null;
      return (
        <figure className="cs-figure">
          <img src={src} alt={value.alt ?? ''} loading="lazy" />
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
    gallery: ({ value }: { value: any }) => {
      const items = (value?.images ?? []) as any[];
      if (items.length === 0) return null;
      const requested = value?.columns;
      const cols = requested === 1 || requested === 2 ? requested : 3;
      return (
        <div className={`cs-gallery cs-gallery--cols-${cols}`}>
          {items.map((img, i) => {
            const src = imageSrc(img);
            if (!src) return null;
            return (
              <figure key={i} className="cs-gallery-item">
                <img src={src} alt={img.alt ?? ''} loading="lazy" />
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            );
          })}
        </div>
      );
    },
    videoEmbed: ({ value }: { value: any }) => {
      const url = value?.url ? ytEmbedUrl(value.url) : null;
      if (!url) return null;
      return (
        <figure className="cs-video">
          <div className="cs-video-frame">
            <iframe
              src={url}
              title={value.title ?? 'Embedded video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {value.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
    callout: ({ value }: { value: any }) => {
      const tone = value?.tone ?? 'info';
      return (
        <aside className={`cs-callout cs-callout--${tone}`}>
          <p>{value.text}</p>
          {value.attribution && <cite>– {value.attribution}</cite>}
        </aside>
      );
    },
  },
  marks: {
    link: ({ value, children }: { value?: { href?: string }; children: React.ReactNode }) => {
      const href = value?.href ?? '#';
      const isExternal = href.startsWith('http');
      return (
        <a
          href={href}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {children}
        </a>
      );
    },
  },
  block: {
    normal:     ({ children }) => <p>{children}</p>,
    h2:         ({ children }) => <h2>{children}</h2>,
    h3:         ({ children }) => <h3>{children}</h3>,
    h4:         ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
};

export interface PTProps {
  value: any;
}

export default function PT({ value }: PTProps) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
