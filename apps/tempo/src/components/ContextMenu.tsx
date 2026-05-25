import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  options: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, options }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed z-[100]" style={{ top: y, left: x }} ref={menuRef}>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass min-w-[200px] overflow-hidden rounded border border-zinc-200 bg-white p-1 shadow-2xl"
      >
        {options.map((option, i) => (
          <button
            key={`${option.label}-${i}`}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-sm px-3 py-2 text-[13px] font-medium transition-all",
              option.destructive
                ? "text-red-500 hover:bg-red-50"
                : "text-zinc-600 hover:bg-zinc-950 hover:text-white",
            )}
          >
            <span className="shrink-0">{option.icon}</span>
            <span className="flex-1 text-left">{option.label}</span>
          </button>
        ))}
      </motion.div>
    </div>
  );
};
