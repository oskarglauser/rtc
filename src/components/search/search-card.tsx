"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, CalendarDays, Loader2, Sparkles } from "lucide-react";

interface SearchCardProps {
  onGenerate: (origin: string, destination: string, startDate?: string, endDate?: string) => void;
  onOpenSettings: () => void;
  isGenerating: boolean;
}

export function SearchCard({ onGenerate, onOpenSettings, isGenerating }: SearchCardProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const canGenerate = origin.trim().length > 0 && destination.trim().length > 0 && !isGenerating;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGenerate) return;
    onGenerate(origin, destination, startDate || undefined, endDate || undefined);
  }

  return (
    <Card className="w-[360px] shadow-xl border-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="Where are you starting?"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              disabled={isGenerating}
            />
            <Input
              placeholder="Where to?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          {showDates ? (
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isGenerating}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDates(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Add dates
            </button>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={!canGenerate}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Planning...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Plan my trip!
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              disabled={isGenerating}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
