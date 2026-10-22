export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-ocean">
        DestinoSmart
      </p>
      <h1 className="text-4xl font-extrabold tracking-tight text-brand-deep sm:text-5xl">
        Base de autenticación
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary">
        Scaffold de la nueva aplicación. La autenticación, el perfil y las rutas
        privadas se implementan en las siguientes tareas aprobadas.
      </p>
      <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-text-primary">
        {['Vite', 'React', 'TypeScript', 'Tailwind', 'TanStack Router', 'Supabase'].map(
          (item) => (
            <span
              key={item}
              className="rounded-full border border-border-default bg-surface-base px-3 py-1.5"
            >
              {item}
            </span>
          ),
        )}
      </div>
    </main>
  );
}
