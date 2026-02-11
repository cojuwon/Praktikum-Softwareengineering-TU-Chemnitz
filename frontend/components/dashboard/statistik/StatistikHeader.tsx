import Image from 'next/image';

export default function StatistikHeader() {
  return (
    <div className="relative w-full">
      <Image
        src="/bellis-favicon.png"
        alt="Bellis Logo"
        width={100}
        height={100}
        className="w-[60px] h-auto object-contain block mx-auto my-5"
      />

      <div className="bg-white px-10 py-10 mx-5 rounded-t-xl">
        <h1 className="text-2xl font-semibold text-[#42446F] mb-1.5 text-center">
          Statistik Dashboard
        </h1>
        <p className="text-sm text-gray-500 text-center m-0">
          Filter setzen und Daten exportieren
        </p>
      </div>
    </div>
  );
}