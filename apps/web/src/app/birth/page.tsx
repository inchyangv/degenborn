import BirthClient from "./BirthClient";

interface BirthPageProps {
  searchParams?: {
    wallet?: string | string[];
  };
}

export default function BirthPage({ searchParams }: BirthPageProps) {
  const wallet = typeof searchParams?.wallet === "string" ? searchParams.wallet : "";
  return <BirthClient wallet={wallet} />;
}
