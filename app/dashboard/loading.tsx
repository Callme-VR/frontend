import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-10">
      <Loader2 className="text-muted-foreground h-15 w-15 animate-spin" />
      <h1 className="text-2xl font-semibold">Loading Dashboard...</h1>
    </div>
  );
}
