import { Badge } from "@/components/ui/badge";
import type { ChargingConnector } from "@/types/charging";

export function ConnectorBadge({ connector }: { connector: ChargingConnector }) {
  return (
    <Badge variant="outline" className="text-xs">
      {connector.type}
      {connector.powerKw && ` ${connector.powerKw}kW`}
      {connector.quantity > 1 && ` x${connector.quantity}`}
    </Badge>
  );
}
