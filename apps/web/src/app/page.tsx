import LandingClient from "./LandingClient";

interface LandingPageProps {
  searchParams?: {
    from?: string | string[];
  };
}

export default function LandingPage({ searchParams }: LandingPageProps) {
  const fromWallet = typeof searchParams?.from === "string" ? searchParams.from : null;
  return <LandingClient fromWallet={fromWallet} />;
}
