import { requireRole } from "@/lib/auth";
import { creaPersonale } from "../actions";
import { PersonaleFormFields } from "../personale-form-fields";

export default async function NuovoPersonalePage() {
  await requireRole("admin");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-50">Nuovo nominativo</h1>

      <form
        action={creaPersonale}
        className="max-w-lg rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <PersonaleFormFields />

        <button
          type="submit"
          className="mt-6 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Salva nominativo
        </button>
      </form>
    </div>
  );
}
