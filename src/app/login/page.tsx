export default function LoginPage({
  searchParams,
}: {
  searchParams: { role?: string; lang?: string };
}) {
  const role = searchParams.role ?? "farmer";
  const lang = searchParams.lang ?? "en";

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Login</h1>
      <p className="mt-3">Role: <b>{role}</b></p>
      <p>Lang: <b>{lang}</b></p>

      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm text-gray-600">
          Next step: we build the real login UI + authentication flow.
        </p>
      </div>
    </main>
  );
}
