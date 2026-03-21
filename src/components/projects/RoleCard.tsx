import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, DollarSign } from "lucide-react";

interface Role {
  id: number;
  professionName?: string | null;
  customTitle?: string | null;
  description?: string | null;
  conditionsType: "discuss" | "specified";
  payment?: string | null;
  schedule?: string | null;
  timeCommitment?: string | null;
  otherConditions?: string | null;
  isFilled: boolean;
}

interface Props {
  role: Role;
  actions?: React.ReactNode;
}

export function RoleCard({ role, actions }: Props) {
  const title = role.professionName || role.customTitle || "Без названия";

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{title}</span>
          {role.isFilled && (
            <Badge variant="success" className="text-xs py-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Занято
            </Badge>
          )}
        </div>
        {actions}
      </div>

      {role.description && (
        <p className="text-xs text-muted-foreground">{role.description}</p>
      )}

      <div className="space-y-1">
        {role.conditionsType === "discuss" ? (
          <span className="text-xs text-muted-foreground italic">Условия обговариваются лично</span>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {role.payment && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {role.payment}
              </span>
            )}
            {role.timeCommitment && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {role.timeCommitment}
              </span>
            )}
            {role.schedule && <span>{role.schedule}</span>}
            {role.otherConditions && <span>{role.otherConditions}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
