import { PublicContainer } from "@/components/public/public-container";

interface LegalPageProps {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <PublicContainer className="flex flex-col gap-10 py-16 sm:py-20">
      <div className="realty-animate-fade-up mx-auto flex w-full max-w-3xl flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-medium tracking-normal text-balance sm:text-5xl">{title}</h1>
        <p className="text-sm text-muted-foreground">Última actualización: {updatedAt}</p>
      </div>

      <div className="realty-animate-fade-up realty-animate-delay-1 mx-auto flex w-full max-w-3xl flex-col gap-6 text-sm leading-7 text-muted-foreground [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-2 [&_strong]:text-foreground">
        {children}
      </div>
    </PublicContainer>
  );
}
