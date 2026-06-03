"use client";

import { useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "What's my food mode right now?",
  "How much did I spend on delivery this month?",
  "Am I cooking more or ordering more lately?",
  "What cuisines do I order most on weeknights?",
  "Compare my grocery spend to delivery spend",
];

function MarkdownText({ text }: { text: string }) {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cream font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="rounded bg-ink-2 px-1.5 py-0.5 text-xs text-saffron-soft">$1</code>')
    .replace(/₹([\d,.]+)/g, '<span class="nums font-semibold text-saffron">₹$1</span>');

  return (
    <span
      className="inline"
      dangerouslySetInnerHTML={{ __html: formatted }}
    />
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron/60" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron/60 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron/60 [animation-delay:300ms]" />
    </span>
  );
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    setLastFailedInput(null);
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...last,
            content: last.content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      setLastFailedInput(trimmed);
      // Remove the failed user message if no assistant response started
      setMessages((prev) => {
        if (prev.length > 0 && prev[prev.length - 1].role === "user") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleRetry() {
    if (lastFailedInput) {
      send(lastFailedInput);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Message stream */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-1 py-2"
      >
        {isEmpty && (
          <div className="flex flex-col gap-5 pt-6">
            <div>
              <p className="font-display text-2xl italic leading-snug text-cream-dim">
                Ask anything about your food life.
              </p>
              <p className="mt-2 text-sm text-muted">
                Delivery, groceries, dine-outs — grounded in your real Swiggy data.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-surface/60 px-4 py-2 text-sm text-cream-dim transition hover:border-saffron/40 hover:bg-surface-2/70 hover:text-cream"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`rise ${m.role === "user" ? "flex justify-end" : "flex justify-start"}`}
            style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-[0.9375rem] leading-relaxed ${
                m.role === "user"
                  ? "rounded-[1.25rem] rounded-br-md bg-saffron font-medium text-ink"
                  : "rounded-[1.25rem] rounded-bl-md border border-line bg-surface text-cream"
              }`}
            >
              {m.content ? (
                m.role === "assistant" ? (
                  <MarkdownText text={m.content} />
                ) : (
                  m.content
                )
              ) : (
                <TypingDots />
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-berry/30 bg-berry/10 px-4 py-3">
            <p className="flex-1 text-sm text-cream-dim">{error}</p>
            {lastFailedInput && (
              <button
                onClick={handleRetry}
                className="shrink-0 rounded-full border border-berry/40 px-3 py-1 text-xs text-cream-dim transition hover:border-berry hover:text-cream"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2 border-t border-line pt-4"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your food life…"
          disabled={streaming}
          className="flex-1 rounded-full border border-line bg-surface px-5 py-3 text-sm text-cream placeholder:text-muted focus:border-saffron/60 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-ink transition hover:bg-saffron-soft disabled:opacity-40"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
