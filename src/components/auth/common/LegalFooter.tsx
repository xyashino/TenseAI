export function LegalFooter() {
  return (
    <p className="px-6 text-center text-sm text-muted-foreground">
      By clicking continue, you agree to our&nbsp;
      <a href="/terms" className="underline-offset-4 hover:underline">
        Terms of Service
      </a>
      &nbsp;and&nbsp;
      <a href="/privacy" className="underline-offset-4 hover:underline">
        Privacy Policy
      </a>
      .
    </p>
  );
}
