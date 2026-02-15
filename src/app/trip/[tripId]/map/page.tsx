import { TripMap } from "@/components/map/trip-map";

interface TripMapPageProps {
  params: Promise<{ tripId: string }>;
}

export default async function TripMapPage({ params }: TripMapPageProps) {
  const { tripId } = await params;
  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <TripMap tripId={tripId} />
    </div>
  );
}
