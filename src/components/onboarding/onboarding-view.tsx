import { OnboardingForm } from "./onboarding-form";

export default function OnboardingView() {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-8 pt-16 px-4 pb-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold text-foreground">Welcome! Let&apos;s get started</h1>
        <p className="text-muted-foreground text-base">
          Please enter your name and choose your preferred difficulty level.
        </p>
      </div>

      <OnboardingForm />
    </div>
  );
}
