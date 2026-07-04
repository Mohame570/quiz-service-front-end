import LoadingPanel from "@/components/shared/LoadingPanel";

export default function AuthPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <LoadingPanel message="Loading…" />
      </div>
    </div>
  );
}
