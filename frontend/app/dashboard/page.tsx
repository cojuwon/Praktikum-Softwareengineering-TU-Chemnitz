import Link from 'next/link';

import Image from 'next/image';
import CenteredCard from '@/components/layout/CenteredCard';
import PageHeader from '@/components/layout/PageHeader';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function Page() {
  return (
    <CenteredCard
      header={<PageHeader title={"Willkommen bei Bellis e.V."} imageMargin={"60px auto 20px auto"} />}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
        <PrimaryButton href="/dashboard/anfrage/create">Neue Anfrage</PrimaryButton>

        <PrimaryButton href="/dashboard/fall/create">Neuer Fall</PrimaryButton>
      </div>
    </CenteredCard>
  );
}