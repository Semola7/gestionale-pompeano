import { headers } from "next/headers";
import QRCode from "qrcode";
import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  await requireRole("admin");

  const headersList = await headers();
  const host = headersList.get("host");
  const isLocal = host?.startsWith("localhost") || host?.startsWith("127.0.0.1");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${isLocal ? "http" : "https"}://${host}` : "");
  const timbraUrl = `${siteUrl}/timbra`;

  const qrDataUrl = await QRCode.toDataURL(timbraUrl, { width: 400, margin: 1 });

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Amministrazione</h1>

        <div className="max-w-sm rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-semibold uppercase text-zinc-500 dark:text-zinc-400">QR Timbratura</h2>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL generato al volo, non un asset ottimizzabile */}
          <img src={qrDataUrl} alt="QR code timbratura" className="mx-auto mb-4 h-56 w-56" />
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Stampa questo codice ed esponilo all&apos;ingresso. Ogni dipendente lo inquadra con il proprio telefono
            per registrare entrata o uscita.
          </p>
          <a
            href={timbraUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all text-sm text-zinc-900 underline dark:text-zinc-50"
          >
            {timbraUrl}
          </a>
        </div>
      </main>
    </div>
  );
}
