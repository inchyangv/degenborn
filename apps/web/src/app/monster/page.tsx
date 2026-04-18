import MonsterClient from "./MonsterClient";

interface MonsterPageProps {
  searchParams?: {
    wallet?: string | string[];
  };
}

export default function MonsterPage({ searchParams }: MonsterPageProps) {
  const wallet = typeof searchParams?.wallet === "string" ? searchParams.wallet : "";
  return <MonsterClient wallet={wallet} />;
}
