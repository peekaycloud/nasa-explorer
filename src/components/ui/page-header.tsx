import { SpaceIcon, type SpaceIconName } from "@/components/ui/space-icon";

export function PageHeader({
  icon,
  title,
  description,
  api,
}: {
  icon: SpaceIconName;
  title: string;
  description: string;
  api?: string;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-3">
        <SpaceIcon name={icon} size={44} label={title} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {api && (
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              NASA {api} API
            </p>
          )}
        </div>
      </div>
      <p className="max-w-2xl text-neutral-400">{description}</p>
    </div>
  );
}
