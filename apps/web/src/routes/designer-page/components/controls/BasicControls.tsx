import React, { useState, useEffect } from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { SURFACE, TEXT_PRIMARY } from "../../types/designerTypes";
import styles from "../../DesignerPage.module.css";

export function NumField({ value, onChange, min = 0, max = 9999, step = 1, unit }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  const [localVal, setLocalVal] = useState<string>(String(value ?? 0));

  useEffect(() => {
    setLocalVal(String(value ?? 0));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalVal(raw);
    if (raw === "" || raw === "-") return;
    const num = Number(raw);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    }
  };

  const handleBlur = () => {
    if (localVal === "" || localVal === "-" || isNaN(Number(localVal))) {
      setLocalVal(String(value ?? min));
    } else {
      const num = Math.min(max, Math.max(min, Number(localVal)));
      setLocalVal(String(num));
      onChange(num);
    }
  };

  return (
    <div className={styles.numField}>
      <button
        type="button"
        onClick={() => {
          const current = Number(localVal) || value || 0;
          const next = Math.max(min, +(current - step).toFixed(2));
          setLocalVal(String(next));
          onChange(next);
        }}
        className={styles.numBtn}
      >
        −
      </button>
      <input
        type="number"
        value={localVal}
        onChange={handleChange}
        onBlur={handleBlur}
        className={styles.numInput}
        min={min}
        max={max}
        step={step}
      />
      {unit && <span className={styles.unitSpan}>{unit}</span>}
      <button
        type="button"
        onClick={() => {
          const current = Number(localVal) || value || 0;
          const next = Math.min(max, +(current + step).toFixed(2));
          setLocalVal(String(next));
          onChange(next);
        }}
        className={styles.numBtn}
      >
        +
      </button>
    </div>
  );
}

export function TxtInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className={styles.txtInput}>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function TxtArea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div className={styles.txtArea}>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} />
    </div>
  );
}

export function SelField({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { label: string; value: string }[];
}) {
  return (
    <div className={styles.selField}>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: SURFACE, color: TEXT_PRIMARY }}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function AlignField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.alignGroup}>
      {(["left", "center", "right"] as const).map(a => {
        const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : AlignRight;
        const isActive = value === a;
        return (
          <button key={a} onClick={() => onChange(a)}
            className={`${styles.alignBtn} ${isActive ? styles.alignBtnActive : ""}`}>
            <Icon size={11} />
          </button>
        );
      })}
    </div>
  );
}
