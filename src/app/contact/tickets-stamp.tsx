/** Count is jsonl length on this machine. Zero is a real number. */
export function TicketsOnThisBayStamp({ count }: { count: number }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ticket">
      Tickets on this bay · {count}
      <span className="ml-2 font-normal normal-case tracking-normal text-aluminum">
        Saved on this machine. Not reviews.
      </span>
    </p>
  );
}
