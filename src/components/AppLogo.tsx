import { NavigationRoutes } from "@/lib/enums/navigation";

interface AppLogoProps {
  showText?: boolean;
}
export function AppLogo({ showText = true }: AppLogoProps) {
  return (
    <a href={NavigationRoutes.HOME} className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <span className="text-lg font-bold">T</span>
      </div>
      {showText && <span className="text-lg font-semibold">TenseAI</span>}
    </a>
  );
}
