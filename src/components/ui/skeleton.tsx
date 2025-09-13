import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200",
        "dark:from-blue-700 dark:via-blue-600 dark:to-blue-700",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
