import { COMPANY, PRIMARY } from "@/lib/site";
import Icon from "./Icon";

/**
 * Service area. One dispatch line covers Edmonton and the surrounding areas,
 * so this is a reach statement rather than a map of offices: the band carries
 * the city and the number, and the three points below restate the coverage
 * the services already describe. No addresses are published.
 */
const REACH = [
  { icon: "truck", label: "Towing & recovery across Edmonton" },
  { icon: "pin", label: "Surrounding areas, day or night" },
  { icon: "arrow", label: "Long-distance towing beyond the local area" },
] as const;

export default function Locations() {
  return (
    <section
      id="locations"
      aria-labelledby="locations-heading"
      className="area-section section-space"
    >
      <div className="site-container">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Our service area</p>
            <h2 id="locations-heading">
              Ready to go where
              <br />
              the job takes us.
            </h2>
          </div>
          <p>
            Our towing and recovery capabilities extend across {COMPANY.coverage},
            with long-distance towing available for jobs that go beyond the local
            service area.
          </p>
        </div>

        <div className="area-band">
          <div className="area-band-copy">
            <p className="area-hours">24 hours a day, 7 days a week</p>
            <p className="area-city">
              {COMPANY.city}
              <span> &amp; surrounding areas</span>
            </p>
          </div>
          <a
            className="area-call"
            href={`tel:${PRIMARY.tel}`}
            data-cursor="call"
            aria-label={`Call Payless Towing dispatch, ${PRIMARY.phone}`}
          >
            <Icon name="phone" />
            <span>{PRIMARY.phone}</span>
          </a>
        </div>

        <ul className="area-points">
          {REACH.map((point) => (
            <li key={point.label}>
              <Icon name={point.icon} />
              {point.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
