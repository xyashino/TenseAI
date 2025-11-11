import { Card, CardContent } from "@/components/ui/card";
import { NavigationRoutes } from "@/lib/enums/navigation";
import type { TenseName } from "@/types";

interface TenseCardProps {
  name: TenseName;
  slug: string;
  description: string;
  icon?: string;
}

export function TenseCard({ name, slug, description, icon }: TenseCardProps) {
  return (
    <Card className="group relative hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/10 hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer">
      <CardContent className="flex flex-col h-full">
        <div className="mb-4">
          {icon && (
            <span className="text-4xl text-primary" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-semibold text-card-foreground mb-2">{name}</h2>
        <p className="text-muted-foreground flex-grow mb-6">{description}</p>
        <div className="mt-auto flex items-center text-primary font-medium">
          <span>Start Learning</span>
          <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">→</span>
        </div>
      </CardContent>
      <a href={`${NavigationRoutes.THEORY}/${slug}`} aria-label={`Learn about ${name}`} className="absolute inset-0" />
    </Card>
  );
}
