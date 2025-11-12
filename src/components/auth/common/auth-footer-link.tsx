interface AuthFooterLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export function AuthFooterLink({ text, linkText, href }: AuthFooterLinkProps) {
  return (
    <p className="text-center text-sm text-muted-foreground mt-4">
      {text}&nbsp;
      <a href={href} className="underline-offset-4 hover:underline">
        {linkText}
      </a>
    </p>
  );
}
