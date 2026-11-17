import * as React from "react"

const alertVariants = {
  default: "bg-background text-foreground",
  destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
}

export function Alert({
  variant = "default",
  className,
  children,
  ...props
}: {
  variant?: keyof typeof alertVariants
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${alertVariants[variant]} ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertTitle({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={`mb-1 font-medium leading-none tracking-tight ${className || ""}`} {...props}>
      {children}
    </h5>
  )
}

export function AlertDescription({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className || ""}`} {...props}>
      {children}
    </div>
  )
}
