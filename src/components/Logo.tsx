import Image from "next/image";
import logo from "@/assets/brand/payless-logo.webp";

/**
 * The company's actual wordmark, taken from paylesstowing.ca — it is the mark
 * their own schema.org markup declares as the organization logo.
 *
 * Amber letters with a heavy black outline on transparency, so it reads on the
 * dark navigation and over the hero photograph alike. Both dimensions are set
 * in CSS (`h-* w-auto`) so Next does not warn about a single overridden axis.
 */
export default function Logo({
  className = "h-7 w-auto",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="Payless Auto Towing"
      priority={priority}
      quality={92}
      sizes="200px"
      className={className}
    />
  );
}
