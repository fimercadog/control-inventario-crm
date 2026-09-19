import type { ReactNode } from "react";
import { Breadcrumbs, type BreadcrumbItemData } from "@/components/shared/breadcrumbs";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemData[];
  actions?: ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
