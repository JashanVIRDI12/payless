import { LOCATIONS } from "@/lib/site";
import Icon from "./Icon";

const directions = (street: string, city: string, postal: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${street}, ${city}, BC ${postal}`
  )}`;

/**
 * The corridor as a route map. A dark band carries Highway 99 south to north
 * — the road draws itself as it scrolls in (see PageMotion) — and each
 * dispatch card sits directly beneath its own town on that line.
 *
 * Alignment is structural, not measured: the stops and the cards share the
 * same four equal columns, and the road runs from the first column's centre
 * to the last's (12.5% → 87.5%). That holds at every width with no JS.
 *
 * Server component. Motion lives in PageMotion; hover links a card to its
 * town on the road through CSS :has(), so that needs no JS either.
 */
export default function Locations() {
  return (
    <section
      id="locations"
      aria-labelledby="locations-heading"
      className="corridor-section section-space"
    >
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Deep Cove to Lillooet</p>
            <h2 id="locations-heading">
              One corridor.
              <br />
              Four local dispatches.
            </h2>
          </div>
          <p>
            Call the office closest to you for towing and roadside assistance.
            Check with the team before visiting a dispatch address.
          </p>
        </div>

        <div className="corridor">
          <div className="corridor-band">
            <div className="corridor-legend">
              <span className="route-shield" role="img" aria-label="Highway 99">
                99
              </span>
              <p className="corridor-caption">South to north · schematic route</p>
            </div>

            {/* Decorative: the same four towns are listed, in order, just below. */}
            <div className="corridor-track" aria-hidden="true">
              <svg
                className="corridor-svg"
                viewBox="0 0 1000 8"
                preserveAspectRatio="none"
              >
                <path className="corridor-road-bed" d="M125 4 H875" />
                <path className="corridor-road" d="M125 4 H875" />
              </svg>
              <ol className="corridor-stops">
                {LOCATIONS.map((location, i) => (
                  <li key={location.city} data-stop={i}>
                    <span className="corridor-node" />
                    <span className="corridor-town">{location.city}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ol className="stop-grid" aria-label="Dispatch locations, south to north">
            {LOCATIONS.map((location, i) => (
              <li key={location.city} className="stop-card" data-stop={i}>
                <div className="stop-card-inner">
                  <p className="stop-index">
                    {String(i + 1).padStart(2, "0")}
                    {i === 0 && <span className="stop-tag">Main office</span>}
                  </p>
                  <h3 className="stop-city">{location.city}</h3>

                  <a
                    className="stop-call"
                    href={`tel:${location.tel}`}
                    data-cursor="call"
                    aria-label={`Call ${location.city} dispatch, ${location.phone}`}
                  >
                    <Icon name="phone" />
                    <span>{location.phone}</span>
                  </a>

                  <address className="stop-address">
                    {location.street}
                    <br />
                    {location.city}, BC {location.postal}
                  </address>

                  <a
                    className="stop-directions"
                    href={directions(location.street, location.city, location.postal)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get directions
                    <Icon name="arrow" />
                    <span className="sr-only">
                      to {location.city} (opens in a new tab)
                    </span>
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
