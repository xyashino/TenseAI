import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { TenseName } from "@/types";

interface TenseCardProps {
  name: TenseName;
  slug: string;
  description: string;
  icon?: string;
}

export function TenseCard({ name, slug, description, icon }: TenseCardProps) {
  return (
    <a
      href={`/app/theory/${slug}`}
      className="block transition-transform hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
      aria-label={`Learn about ${name}`}
    >
      <Card className="h-full hover:border-primary transition-colors cursor-pointer">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon && (
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
            )}
            <span>{name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
          <span className="text-sm text-primary font-medium">Learn more →</span>
        </CardFooter>
      </Card>
    </a>
  );
}
