import { AppHeader } from "@/components/app-header";
import { getCurrentProfile } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="flex-1 bg-zinc-50 px-6 py-8 dark:bg-black">
        <h1 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Benvenuto, {profile.nome_completo}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Dashboard in costruzione: qui vedrai lo stato di personale, mezzi e attrezzature
          e le scadenze in avvicinamento.
        </p>
      </main>
    </div>
  );
}
