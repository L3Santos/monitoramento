import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "warning" | "destructive" | "blue";
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  color = "primary",
  className 
}: MetricCardProps) {
  
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    destructive: "text-red-500 bg-red-500/10 border-red-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md group",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className={cn("p-3 rounded-lg border", colorMap[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold font-mono mt-1 text-foreground">
            {value}
          </h3>
          {subValue && (
            <p className="text-xs text-muted-foreground mt-1">
              {subValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
