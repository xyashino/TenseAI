import { Card, CardContent } from "@/components/ui/card";
import { NavigationRoutes } from "@/lib/enums/navigation";
import type { TenseName } from "@/types";
import { ArrowRight, Award, History, Sparkles, Target } from "lucide-react";
import type React from "react";

interface TenseCardProps {
  name: TenseName;
  slug: string;
  description: string;
}

function getTenseIconComponent(tense: TenseName) {
  const iconMap: Record<TenseName, React.ComponentType<{ className?: string }>> = {
    "Present Simple": Target,
    "Past Simple": History,
    "Present Perfect": Award,
    "Future Simple": Sparkles,
  };

  const IconComponent = iconMap[tense];
  return <IconComponent className="size-8 sm:size-10 text-primary" />;
}

export function TenseCard({ name, slug, description }: TenseCardProps) {
  const tenseIcon = getTenseIconComponent(name);

  return (
    <Card className="group relative hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/10 hover:border-primary/30 dark:hover:border-primary/50 transition-all duration-300 cursor-pointer">
      <CardContent className="flex flex-col h-full">
        <div className="mb-4">
          <span className="flex-shrink-0" aria-hidden="true">
            {tenseIcon}
          </span>
        </div>
        <h2 className="text-2xl font-semibold text-card-foreground mb-2">{name}</h2>
        <p className="text-muted-foreground flex-grow mb-6">{description}</p>
        <div className="mt-auto flex items-center text-primary font-medium">
          <span>Start Learning</span>
          <ArrowRight className="ml-2 size-4 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </CardContent>
      <a href={`${NavigationRoutes.THEORY}/${slug}`} aria-label={`Learn about ${name}`} className="absolute inset-0" />
    </Card>
  );
}
