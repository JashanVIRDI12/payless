import Link from "next/link";
import { PRIMARY } from "@/lib/site";
import Icon from "./Icon";
export default function MobileCallBar() {
  return <div className="mobile-call-bar"><Link href="/contact"><Icon name="pin" />Local dispatch</Link><a href={`tel:${PRIMARY.tel}`}><Icon name="phone" />Call 24/7</a></div>;
}
