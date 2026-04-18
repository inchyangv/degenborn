import ReplayClient from "./ReplayClient";

interface ReplayPageProps {
  searchParams?: {
    autoplay?: string | string[];
  };
}

export default function ReplayPage({ searchParams }: ReplayPageProps) {
  const autoplay = searchParams?.autoplay === "1";
  return <ReplayClient autoplay={autoplay} />;
}
