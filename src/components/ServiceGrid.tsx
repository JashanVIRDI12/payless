import Image from "next/image";
import { PRIMARY, SERVICES } from "@/lib/site";
import Icon from "./Icon";

/**
 * The six services, shared by the home summary and the services page.
 *
 * Square image frames keep a consistent crop while the content below grows
 * naturally. Service details and the dispatch link are always available.
 */
export default function ServiceGrid() {
  return (
    <ul className="service-grid">
      {SERVICES.map((service) => (
        <li key={service.id}>
          <article
            id={`service-${service.id}`}
            className="service-card"
            aria-labelledby={`service-title-${service.id}`}
          >
            <div className="service-media">
              <Image
                src={service.image}
                alt={service.alt}
                fill
                // The landscape originals need up to 1.8x the frame width
                // to keep the square cover crop sharp, especially on phones.
                sizes="(max-width: 600px) calc(180vw - 72px), (max-width: 900px) calc(90vw - 54px), (max-width: 1023px) calc(90vw - 108px), (max-width: 1416px) calc(60vw - 96px), 754px"
                quality={80}
                style={{ objectPosition: service.imagePosition }}
              />
              <span className="service-index" aria-hidden="true">
                {service.index}
              </span>
            </div>
            <div className="service-content">
              <h3 id={`service-title-${service.id}`}>{service.name}</h3>
              <p className="service-description">{service.description}</p>
              <ul
                className="service-details"
                aria-label={`${service.name} details`}
              >
                {service.details.map((detail) => (
                  <li key={detail}>
                    <Icon name="check" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <a
                className="service-contact"
                href={`tel:${PRIMARY.tel}`}
                aria-label={`Talk to dispatch about ${service.name}`}
              >
                <span>Talk to dispatch</span>
                <span className="service-contact-icon">
                  <Icon name="arrow" />
                </span>
              </a>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}
