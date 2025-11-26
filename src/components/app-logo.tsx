import { NavigationRoutes } from "@/lib/enums/navigation";
import { cn } from "@/shared/utils";
interface AppLogoProps {
  showText?: boolean;
  invert?: boolean;
}
export function AppLogo({ showText = true, invert = false }: AppLogoProps) {
  return (
    <a href={NavigationRoutes.HOME} className="flex items-center gap-2">
      <svg
        className={cn("h-6 w-6 text-primary", invert && "text-white")}
        fill="none"
        viewBox="0 0 48 48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
      </svg>
      {showText && <span className={cn("text-xl font-bold", invert && "text-white")}>TenseAI</span>}
    </a>
  );
}
