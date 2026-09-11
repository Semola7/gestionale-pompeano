import { AppHeader } from "@/components/app-header";
import { requireRole } from "@/lib/auth";
import { creaPersonale } from "../actions";

export default async function NuovoPersonalePage() {
  await requireRole("admin");

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nuovo nominativo</h1>

        <form
          action={creaPersonale}
          className="max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nome e cognome</label>
            <input
              name="nome_completo"
              required
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefono</label>
              <input name="telefono" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input type="email" name="email" className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Note</label>
            <textarea name="note" rows={3} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
          </div>

          <button
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Salva nominativo
          </button>
        </form>
      </main>
    </div>
  );
}
