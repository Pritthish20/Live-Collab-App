import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("tabs", className)} {...props} />;
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("tabs-list", className)} {...props} />;
}

export function TabsTrigger({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("tabs-trigger", className)} {...props} />;
}
