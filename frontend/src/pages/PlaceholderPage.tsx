import { Construction } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-16 text-center">
          <div className="rounded-2xl bg-slate-50 p-4">
            <Construction className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm text-muted-foreground">
            Módulo planificado. La arquitectura (API, modelos y servicios) ya
            está preparada para implementarlo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
