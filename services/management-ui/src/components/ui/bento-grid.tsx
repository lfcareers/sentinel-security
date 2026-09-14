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
                                  children,
                              }: {
    className?: string
    title?: string
    description?: string
    children?: ReactNode
}) {
    return (
        <div
            className={[
                "group/bento rounded-xl border border-neutral-800",
                "bg-neutral-900/60 p-5",
                "transition duration-200",
                "hover:border-neutral-700 hover:bg-neutral-900/80",
                className ?? "",
            ].join(" ")}
        >
            {(title || description) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="font-semibold text-neutral-100">
                            {title}
                        </h3>
                    )}

                    {description && (
                        <p className="mt-2 text-sm leading-6 text-neutral-400">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children && (
                <div className="min-w-0">
                    {children}
                </div>
            )}
        </div>
    )
}