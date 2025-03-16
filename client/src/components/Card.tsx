import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
} from "./ui/card"
import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<typeof ShadcnCard> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <ShadcnCard
      className={cn(
        "card-hover glass-effect",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnCard>
  )
}

export const CardContent = ShadcnCardContent;
export const CardHeader = ShadcnCardHeader;
export const CardTitle = ShadcnCardTitle;
export const CardDescription = ShadcnCardDescription;
export const CardFooter = ShadcnCardFooter;