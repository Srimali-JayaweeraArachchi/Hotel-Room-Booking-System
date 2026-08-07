import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { resolveMediaUrl } from '../utils/mediaUrl.js';

function ImageCarousel({ images = [], legacyImageUrl = '', name, compact = false }) {
  const slides = useMemo(() => {
    if (images.length) return images;
    return legacyImageUrl ? [{ id: 'legacy', imageUrl: legacyImageUrl, altText: `${name} room` }] : [];
  }, [images, legacyImageUrl, name]);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => { if (index >= slides.length) setIndex(0); }, [index, slides.length]);
  useEffect(() => {
    if (slides.length < 2 || isPaused || isFullscreen) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4000);
    return () => window.clearInterval(timer);
  }, [isFullscreen, isPaused, slides.length]);
  useEffect(() => {
    if (!isFullscreen) return undefined;
    function close(event) { if (event.key === 'Escape') setIsFullscreen(false); }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', close);
    };
  }, [isFullscreen]);

  function previous(event) { event?.stopPropagation(); setIndex((current) => (current - 1 + slides.length) % slides.length); }
  function next(event) { event?.stopPropagation(); setIndex((current) => (current + 1) % slides.length); }

  if (!slides.length) return <div className={`image-carousel carousel-placeholder ${compact ? 'compact' : ''}`} aria-label={`${name} image placeholder`} />;

  const slide = slides[index];
  const lightbox = isFullscreen ? createPortal(
    <div
      className="image-lightbox"
      onClick={(event) => {
        if (event.target === event.currentTarget) setIsFullscreen(false);
      }}
      role="presentation"
    >
      <button aria-label="Close image viewer" className="lightbox-close" onClick={() => setIsFullscreen(false)} type="button">×</button>
      {slides.length > 1 && <button aria-label="Previous image" className="lightbox-arrow lightbox-previous" onClick={previous} type="button">‹</button>}
      <img alt={slide.altText || `${name} room`} src={resolveMediaUrl(slide.imageUrl)} />
      {slides.length > 1 && <button aria-label="Next image" className="lightbox-arrow lightbox-next" onClick={next} type="button">›</button>}
      <span className="lightbox-counter">{index + 1} / {slides.length}</span>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <div className={`image-carousel ${compact ? 'compact' : ''}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <button className="carousel-image-button" onClick={() => setIsFullscreen(true)} title="View full image" type="button"><img alt={slide.altText || `${name} room image ${index + 1}`} src={resolveMediaUrl(slide.imageUrl)} /></button>
        {slides.length > 1 && <><button aria-label="Previous image" className="carousel-arrow carousel-previous" onClick={previous} type="button">‹</button><button aria-label="Next image" className="carousel-arrow carousel-next" onClick={next} type="button">›</button><div className="carousel-dots">{slides.map((item, slideIndex) => <button aria-label={`Show image ${slideIndex + 1}`} className={slideIndex === index ? 'active' : ''} key={item.id ?? item.imageUrl} onClick={(event) => { event.stopPropagation(); setIndex(slideIndex); }} type="button" />)}</div></>}
        <button className="fullscreen-hint" onClick={() => setIsFullscreen(true)} type="button">⛶ Full image</button>
      </div>
      {lightbox}
    </>
  );
}

export default ImageCarousel;
