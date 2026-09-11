import Image, { type StaticImageData } from "next/image";

/**
 * Compact header for the inner pages — the same photographic language as the
 * home hero, at a third of the height and without the load choreography, so a
 * page someone navigated to deliberately gets out of the way faster.
 */
export default function PageHero({
  kicker,
  title,
  lede,
  image,
  alt,
  position,
}: {
  kicker: string;
  title: string;
  lede: string;
  image: StaticImageData;
  alt: string;
  position?: string;
}) {
  return (
    <section className="page-hero" aria-labelledby="page-heading">
      <div className="page-hero-bg">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          quality={75}
          loading="eager"
          fetchPriority="high"
          placeholder="blur"
          className="page-hero-photo"
          style={position ? { objectPosition: position } : undefined}
        />
        <div className="page-hero-scrim" aria-hidden="true" />
      </div>
      <div className="page-hero-inner site-container">
        <p className="section-kicker">{kicker}</p>
        <h1 id="page-heading">{title}</h1>
        <p className="page-hero-lede">{lede}</p>
      </div>
      <p className="image-note">Illustrative imagery</p>
    </section>
  );
}
