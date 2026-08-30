"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { StateOption } from "@/lib/overtime/registry";
import type { StateCode } from "@/lib/overtime/types";

/**
 * Native <select> elements can't reliably render an image inside an
 * <option> across browsers, so a state flag next to each state name
 * needs a custom listbox instead. Built as a plain combobox pattern
 * (button + listbox, keyboard nav, click-outside-to-close) rather than
 * pulling in a UI library for one component.
 */

function FlagIcon({ code, className }: { code: StateCode; className?: string }) {
  return (
    // Plain <img>, not next/image: these are simple local SVGs served
    // from /public, and Next's image optimizer disables SVG handling
    // by default (XSS surface for untrusted SVGs) -- not worth the
    // config for static, known-safe assets.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={24}
      height={16}
      className={className}
    />
  );
}

interface StateSelectProps {
  id: string;
  states: StateOption[];
  value: StateCode;
  onChange: (code: StateCode) => void;
}

export default function StateSelect({ id, states, value, onChange }: StateSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selected = states.find((s) => s.code === value);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useLayoutEffect(() => {
    if (open) {
      // Move focus into the listbox so Escape/arrow keys reach
      // onListKeyDown -- without this, focus stays on the trigger
      // button (which only knows how to *open* the list) and the
      // list becomes unreachable by keyboard once opened via click.
      // useLayoutEffect (not useEffect) so this runs before the
      // browser paints/before a fast follow-up key event can race it.
      listRef.current?.focus();
      const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  function openList() {
    const idx = states.findIndex((s) => s.code === value);
    setActiveIndex(idx >= 0 ? idx : 0);
    setOpen(true);
  }

  function closeAndFocusButton() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  function selectIndex(i: number) {
    const opt = states[i];
    if (!opt || !opt.available) return;
    onChange(opt.code);
    closeAndFocusButton();
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openList();
    } else if (open && e.key === "Escape") {
      e.preventDefault();
      closeAndFocusButton();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeAndFocusButton();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(states.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectIndex(activeIndex);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKeyDown}
        className="mt-1 flex w-full items-center gap-2 rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-left text-sm dark:border-neutral-700"
      >
        {selected && (
          <FlagIcon code={selected.code} className="h-4 w-6 shrink-0 rounded-sm object-cover" />
        )}
        <span className="flex-1">{selected?.name ?? "Select a state"}</span>
        <span aria-hidden className="text-neutral-400">
          ▾
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-label="State"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-neutral-300 bg-white py-1 shadow-lg outline-none dark:border-neutral-700 dark:bg-neutral-900"
        >
          {states.map((s, i) => (
            <li
              key={s.code}
              role="option"
              aria-selected={s.code === value}
              aria-disabled={!s.available}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectIndex(i)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm ${
                s.available ? "cursor-pointer" : "cursor-not-allowed opacity-40"
              } ${i === activeIndex ? "bg-neutral-100 dark:bg-neutral-800" : ""}`}
            >
              <FlagIcon code={s.code} className="h-4 w-6 shrink-0 rounded-sm object-cover" />
              <span className="flex-1">{s.name}</span>
              {!s.available && <span className="text-xs text-neutral-400">coming soon</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
