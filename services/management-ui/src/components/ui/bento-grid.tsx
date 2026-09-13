import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function BentoGrid({
                            className,
                            children,
                          }: {
  className?: string;
  children?: ReactNode;
}) {
  return (
      <div
          className={cn(
              "grid auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-3",
              className
          )}
      >
        {children}
      </div>
  );
}

export function BentoGridItem({
                                className,
                                title,
                                description,
                              }: {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
}) {
  return (
      <div
          className={cn(
              "group/bento row-span-1 flex flex-col justify-between",
              "rounded-3xl border border-neutral-800 bg-neutral-950 p-6",
              "shadow-sm transition duration-200 hover:shadow-xl",
              className
          )}
      >
        <div className="transition duration-200 group-hover/bento:translate-x-1">
          {title && (
              <div className="font-semibold text-neutral-100">
                {title}
              </div>
          )}

          {description && (
              <div className="mt-2 text-sm text-neutral-400">
                {description}
              </div>
          )}
        </div>
      </div>
  );
}