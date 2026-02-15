import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, MapPin } from "lucide-react";
import type { ChargingStation } from "@/types/charging";
import { ConnectorBadge } from "./connector-badge";

export function StationCard({ station }: { station: ChargingStation }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium">
            {station.name || "Charging Station"}
          </CardTitle>
          {station.isFastCharge && (
            <Badge variant="default" className="ml-2 shrink-0 bg-green-600">
              <Zap className="mr-1 h-3 w-3" />
              Fast
            </Badge>
          )}
        </div>
        {station.operator && (
          <p className="text-xs text-muted-foreground">{station.operator}</p>
        )}
      </CardHeader>
      <CardContent>
        {station.address && (
          <div className="mb-2 flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
            <span>{station.address}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          {station.connectors.map((connector, i) => (
            <ConnectorBadge key={i} connector={connector} />
          ))}
        </div>
        {station.maxPowerKw && (
          <p className="mt-2 text-xs text-muted-foreground">
            Max {station.maxPowerKw} kW
          </p>
        )}
      </CardContent>
    </Card>
  );
}
