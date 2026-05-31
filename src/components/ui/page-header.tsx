export function PageHeader({
  icon,
  title,
  description,
  api,
}: {
  icon: string;
  title: string;
  description: string;
  api?: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {api && (
            <p className="text-xs uppercase tracking-widest text-indigo-400/80">
              NASA {api} API
            </p>
          )}
        </div>
      </div>
      <p className="max-w-2xl text-slate-400">{description}</p>
    </div>
  );
}
