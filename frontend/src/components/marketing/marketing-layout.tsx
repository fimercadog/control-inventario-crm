import { MarketingFooter } from "./footer";
import { MarketingHeader } from "./header";
import { WhatsAppButton } from "./whatsapp-button";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-theme flex min-h-svh flex-col bg-background text-foreground">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
      <WhatsAppButton />
    </div>
  );
}
