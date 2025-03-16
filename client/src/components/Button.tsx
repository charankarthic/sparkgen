import { Button as ShadcnButton } from "./ui/button"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ComponentProps<typeof ShadcnButton> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <ShadcnButton 
      className={cn(
        "button-hover",
        className
      )} 
      {...props}
    >
      {children}
    </ShadcnButton>
  )
}