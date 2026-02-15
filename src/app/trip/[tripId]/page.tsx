import { TripDetail } from "@/components/trip/trip-detail";

interface TripPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params;
  return (
    <div className="container py-10">
      <TripDetail tripId={tripId} />
    </div>
  );
}
