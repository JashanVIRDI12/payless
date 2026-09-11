import Image from "next/image";
import logo from "@/assets/brand/payless-logo.webp";
import logoOnDark from "@/assets/brand/payless-logo-on-dark.webp";

/**
 * Payless Towing lockup from the supplied brand PDF: navy-and-orange P-hook
 * with wordmark and "Service & Recovery" tagline. The colour version sits on
 * the white header; the reversed version (white + orange) sits on navy.
 *
 * Both dimensions are set in CSS (`h-* w-auto` or a fixed width) so Next
 * does not warn about a single overridden axis.
 */
export default function Logo({
  className = "h-7 w-auto",
  priority = false,
  onDark = false,
}: {
  className?: string;
  priority?: boolean;
  onDark?: boolean;
}) {
  return (
    <Image
      src={onDark ? logoOnDark : logo}
      alt="Payless Towing"
      priority={priority}
      quality={92}
      sizes="240px"
      className={className}
    />
  );
}
