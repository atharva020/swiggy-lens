"use client";

import { useEffect, useRef, useState } from "react";

import type { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "What's my food mode right now?",
  "How much did I spend on delivery this month?",
  "Am I cooking more or ordering more lately?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
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

      // Add an empty assistant message we fill as chunks stream in.
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
    } finally {
      setStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
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
          <div className="flex flex-col gap-3 pt-8">
            <p className="text-sm text-zinc-500">
              Ask anything about your food life — delivery, groceries, dine-outs.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
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
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-orange-500 text-black"
                  : "border border-zinc-800 bg-zinc-900/80 text-zinc-200"
              }`}
            >
              {m.content || (
                <span className="inline-flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500 [animation-delay:300ms]" />
                </span>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2 border-t border-zinc-800 pt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your food life…"
          disabled={streaming}
          className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/50 focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-orange-400 disabled:opacity-40"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
