"use client";

import { useState, useCallback, useRef } from "react";

interface UseAIStreamOptions {
  onComplete?: (content: string) => void;
  onError?: (error: Error) => void;
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [content, setContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async (url: string, body: Record<string, unknown>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setContent("");
      setIsStreaming(true);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setContent(accumulated);
        }

        options.onComplete?.(accumulated);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const err =
          error instanceof Error ? error : new Error("Stream failed");
        options.onError?.(err);
      } finally {
        setIsStreaming(false);
      }
    },
    [options]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { content, isStreaming, stream, abort };
}
