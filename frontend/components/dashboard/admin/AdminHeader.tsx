import Image from 'next/image';

export default function AdminHeader() {
  return (
    <div className="relative w-full">
      <Image
        src="/bellis-favicon.png"
        alt="Bellis Logo"
        width={100}
        height={100}
        className="w-[60px] h-auto object-contain block mx-auto my-[60px]"
      />

      <div className="bg-white px-10 py-10 mx-5 rounded-t-xl">
        <h1 className="text-2xl font-semibold text-[#42446F] mb-1.5 text-center">
          Willkommen auf dem Dashboard
        </h1>
        <p className="text-sm text-gray-500 text-center m-0">
          Wählen Sie einen Bereich
        </p>
      </div>
    </div>
  );
}
