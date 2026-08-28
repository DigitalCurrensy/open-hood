import { ToolTickets } from "@/components/agent/tool-tickets";
import type { AgentUiMessage } from "@/lib/agent/thread";

export function UserScrap({ message }: { message: AgentUiMessage }) {
  return (
    <article className="ml-auto max-w-[min(36rem,92%)]">
      <div className="ticket-paper rounded-sm px-3 py-2.5 text-ticket-ink">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] opacity-70">
          You {message.imageKind ? `· ${message.imageKind} photo` : ""}
        </p>
        {message.previewUrl ? (
          // User-provided blob — not a content asset for next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.previewUrl}
            alt="Attached bay photo"
            className="mt-2 max-h-36 w-full rounded-sm object-contain"
          />
        ) : null}
        {message.content ? <p className="mt-1 text-sm leading-6">{message.content}</p> : null}
      </div>
    </article>
  );
}

export function AdvocateBrief({
  message,
  streaming,
}: {
  message: AgentUiMessage;
  streaming?: boolean;
}) {
  const reply = message.reply;
  const paragraphs = message.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <article className="max-w-[min(42rem,100%)]">
      <div className="rounded-sm border border-white/10 bg-bay-2/85 pl-3 shadow-[inset_4px_0_0_0_var(--cone)]">
        <div className="px-3 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cone">Advocate</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-aluminum">
              {streaming
                ? "Writing…"
                : `${reply?.engine === "gpt-4o" ? "Advocate" : "Price book"} · ${reply?.readingLevel === "expert" ? "Expert" : "Beginner"}`}
            </p>
          </div>
          <div className="mt-2 space-y-3 text-sm leading-6 text-fluorescent">
            {paragraphs.map((block, index) => (
              <p key={`${index}-${block.slice(0, 24)}`}>{block}</p>
            ))}
          </div>
          {reply?.scripts.length && !streaming ? <ScriptTicket scripts={reply.scripts} /> : null}
          {reply && !streaming ? <ToolTickets tools={reply.tools ?? []} invocations={reply.invocations ?? []} /> : null}
          {reply && !streaming ? (
            <p className="mt-3 font-mono text-[10px] uppercase leading-5 tracking-[0.14em] text-aluminum">{reply.verify}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ScriptTicket({ scripts }: { scripts: string[] }) {
  return (
    <div className="ticket-paper mt-4 rounded-sm p-3 text-ticket-ink">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em]">Say this at the counter</p>
      <ol className="mt-2 list-decimal space-y-2 pl-4 text-sm leading-6">
        {scripts.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </div>
  );
}
