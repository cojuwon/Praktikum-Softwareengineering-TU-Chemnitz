import Link from "next/link";

export default function Page() {
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-[#F3EEEE] px-4">
        <div className="mx-auto w-full max-w-[400px] space-y-3 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-1 text-center text-[28px] font-semibold text-[#42446F]">
          Willkommen bei Bellis e.V.
        </h1>
        <p className="text-center text-sm text-gray-500">
          Hier geht&apos;s zur Anmeldung
        </p>
      

      <div className="mx-5 px-5 py-5 flex flex-col items-center gap-4">
        <Link
          href="/login"
         className="rounded-lg bg-[#294D9D] px-6 py-3 text-sm font-medium text-white hover:bg-blue-400"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-[#294D9D] px-6 py-3 text-sm font-medium text-white hover:bg-blue-400"
        >
          Registrierung
        </Link>
      </div>
       </div>
        </div>
       
      
    </>
  );
}
