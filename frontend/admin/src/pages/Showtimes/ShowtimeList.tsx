import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function ShowtimeList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Showtimes Management"
        description="Manage movie showtimes and schedules"
      />

      <Card className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="rounded-full bg-green-100 p-6">
            <Calendar className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold">Showtimes Management</h3>
          <p className="text-muted-foreground max-w-md">
            This is the showtimes management page. Here you can view, create,
            edit, and delete movie showtimes.
          </p>
        </div>
      </Card>
    </div>
  );
}
