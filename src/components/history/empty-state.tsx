import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export function EmptyState({ title, description, ctaText, ctaLink }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" role="status" aria-live="polite">
      <h3 className="text-xl sm:text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button asChild>
        <a href={ctaLink} aria-label={ctaText}>
          {ctaText}
        </a>
      </Button>
    </div>
  );
}
