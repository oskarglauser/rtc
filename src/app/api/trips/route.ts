import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const { data: trips, error } = await supabase
      .from("trips")
      .select("id, title, description, status, origin_name, destination_name, start_date, end_date, total_distance_km, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(trips);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
