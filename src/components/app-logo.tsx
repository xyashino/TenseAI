import { NavigationRoutes } from "@/lib/enums/navigation";
import { cn } from "@/lib/utils";
interface AppLogoProps {
  showText?: boolean;
  invert?: boolean;
}
export function AppLogo({ showText = true, invert = false }: AppLogoProps) {
  return (
    <a href={NavigationRoutes.HOME} className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground",
          invert && "bg-white text-black"
        )}
      >
        <span className="text-lg font-bold">T</span>
      </div>
      {showText && <span className={cn("text-lg font-semibold", invert && "text-white")}>TenseAI</span>}
    </a>
  );
}
