export type IconName = "phone" | "arrow" | "chevron" | "pin" | "clock" | "shield" | "truck" | "key" | "check" | "operator" | "award";
const paths: Record<IconName, string> = {
  phone: "M6.5 3h3L11 7.5l-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  chevron: "m6 9 6 6 6-6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2",
  shield: "M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6l-9-4ZM8 12l3 3 5-6",
  truck: "M1 4h13v13H1V4Zm13 5h5l4 5v3h-9M5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  key: "M14 3a7 7 0 0 0-6 10L2 19v3h4v-3h3l3-3a7 7 0 1 0 2-13Zm3 4h.01",
  check: "M5 12l4 4L19 6",
  operator: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0M8 5.5h8",
  award: "M12 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-3.2-1.1L7.5 21l4.5-2.5 4.5 2.5-1.3-8.1",
};
export default function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
