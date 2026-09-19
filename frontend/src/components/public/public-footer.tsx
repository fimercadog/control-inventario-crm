import Link from "next/link";
import Image from "next/image";
import { PublicLogo } from "@/components/public/public-logo";
import { PUBLIC_NAV_LINKS } from "@/constants/public-navigation";
import { SAMPLE_PROPERTY_IMAGE } from "@/constants/images";
import { SITE_CONFIG } from "@/constants/site";

const currentYear = new Date().getFullYear();

export function PublicFooter() {
  return (
    <footer className="bg-(--realty-footer) text-white">
      <div className="mx-auto max-w-330 px-6 py-18 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.8fr_0.8fr_1.4fr]">
          <div className="flex flex-col gap-4">
            <PublicLogo inverted markClassName="size-12" textClassName="text-white" />
            <p className="max-w-xs text-sm leading-7 text-white/65">
              Encuentra el espacio que estás buscando. Compra, arrienda o vende con acompañamiento profesional en
              cada paso.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold tracking-wide text-white uppercase">Navegación</h3>
            <ul className="flex flex-col gap-2">
              {PUBLIC_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/65 transition-colors hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold tracking-wide text-white uppercase">Legal</h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/privacidad" className="text-sm text-white/65 transition-colors hover:text-white">
                  Política de datos
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-sm text-white/65 transition-colors hover:text-white">
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold tracking-wide text-white uppercase">Contacto</h3>
            <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, "")}`} className="text-3xl font-medium tracking-tight transition-colors hover:text-(--realty-accent)">
              {SITE_CONFIG.phone}
            </a>
            <p className="max-w-xs text-sm leading-7 text-white/65">{SITE_CONFIG.address}</p>
            <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm text-white/65 transition-colors hover:text-white">
              {SITE_CONFIG.email}
            </a>
          </div>
        </div>

        <div className="relative mt-14 h-36 overflow-hidden bg-white/5 lg:aspect-6/1 lg:h-auto lg:min-h-36">
          <Image src={SAMPLE_PROPERTY_IMAGE} alt="" fill className="object-cover opacity-45 grayscale" sizes="(min-width: 1024px) 1200px, 100vw" />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="mt-10 text-center text-xs text-white/35">
          © {currentYear} {SITE_CONFIG.name}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
