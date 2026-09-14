import Link from "next/link";

export function DipendenteNav({ attivo }: { attivo: "timbra" | "cartellino" | "ferie" }) {
  const voci = [
    { href: "/timbra", label: "Timbra", chiave: "timbra" as const },
    { href: "/timbra/cartellino", label: "Il mio cartellino", chiave: "cartellino" as const },
    { href: "/timbra/ferie", label: "Ferie", chiave: "ferie" as const },
  ];

  return (
    <nav className="mb-6 flex gap-2">
      {voci.map((v) => (
        <Link
          key={v.chiave}
          href={v.href}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            attivo === v.chiave
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          }`}
        >
          {v.label}
        </Link>
      ))}
    </nav>
  );
}
