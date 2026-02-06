import Image from "next/image";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between min-h-screen bg-[#F3EEEE]">

     {   /*
   <div className="mx-auto w-full max-w-[700px] px-6 pt-6">
        <Image
          src="/bellis-favicon.png"
          alt="Bellis Logo"
          width={60}
          height={60}
          className="mx-auto my-16 h-auto w-[60px]"
        />

        {children}
      </div>
*/}
      
{children}
      <Image
        src="/drei-welle-zusammenblau.png"
        alt=""
        width={1400}
        height={100}
        className="w-full object-cover"
      />
    </div>
  );
}


/*
   <div className="mx-auto w-full max-w-[700px] px-6 pt-6">
        <Image
          src="/bellis-favicon.png"
          alt="Bellis Logo"
          width={60}
          height={60}
          className="mx-auto my-16 h-auto w-[60px]"
        />

        {children}
      </div>
*/