"use client";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ConditionsData {
  conditionsType: "discuss" | "specified";
  payment?: string;
  schedule?: string;
  timeCommitment?: string;
  otherConditions?: string;
}

interface Props {
  value: ConditionsData;
  onChange: (value: ConditionsData) => void;
}

export function ConditionsForm({ value, onChange }: Props) {
  const isSpecified = value.conditionsType === "specified";

  return (
    <div className="space-y-3">
      <Label>Условия участия</Label>

      <div className="flex rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => onChange({ ...value, conditionsType: "discuss" })}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            !isSpecified ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
          )}
        >
          Обговариваются лично
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...value, conditionsType: "specified" })}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            isSpecified ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
          )}
        >
          Указать подробно
        </button>
      </div>

      {isSpecified && (
        <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
          <div className="space-y-1.5">
            <Label className="text-xs">Оплата</Label>
            <Input
              placeholder="Например: 50 000 руб, % от бюджета, бесплатно..."
              value={value.payment || ""}
              onChange={(e) => onChange({ ...value, payment: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">График работы</Label>
            <Input
              placeholder="Например: выходные, 2 недели, по необходимости..."
              value={value.schedule || ""}
              onChange={(e) => onChange({ ...value, schedule: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Занятость по времени</Label>
            <Input
              placeholder="Например: полный день, 4 часа в день..."
              value={value.timeCommitment || ""}
              onChange={(e) => onChange({ ...value, timeCommitment: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Другие условия</Label>
            <Textarea
              placeholder="Любая дополнительная информация..."
              rows={3}
              value={value.otherConditions || ""}
              onChange={(e) => onChange({ ...value, otherConditions: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
