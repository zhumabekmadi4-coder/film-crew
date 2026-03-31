"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { Plus, Trash2, Building2, Loader2 } from "lucide-react";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export default function CompanyManagementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({ name: "", description: "", price: "", category: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    // Fetch user's companies (owned or managed)
    const res = await fetch("/api/companies?mine=true");
    if (res.ok) {
      const data = await res.json();
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        loadCompany(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadCompany = async (id: string) => {
    const res = await fetch(`/api/companies/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedCompany(data);
      setServices(data.services || []);
    }
  };

  const addService = async () => {
    if (!newService.name.trim() || !selectedCompany) return;
    setSaving(true);
    const res = await fetch(`/api/companies/${selectedCompany.id}/services`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newService),
    });
    if (res.ok) {
      const service = await res.json();
      setServices([...services, service]);
      setNewService({ name: "", description: "", price: "", category: "" });
    }
    setSaving(false);
  };

  const deleteService = async (serviceId: number) => {
    if (!selectedCompany) return;
    const res = await fetch(
      `/api/companies/${selectedCompany.id}/services?serviceId=${serviceId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setServices(services.filter((s) => s.id !== serviceId));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <EmptyState
        title="У вас нет компании"
        description="Зарегистрируйте компанию и разместите свои услуги"
        action={
          <Button onClick={() => router.push("/company/new")}>
            <Building2 className="w-4 h-4 mr-2" />
            Зарегистрировать компанию
          </Button>
        }
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Company info */}
      {selectedCompany && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selectedCompany.name}</CardTitle>
                <Badge
                  variant={
                    selectedCompany.status === "approved"
                      ? "default"
                      : selectedCompany.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {selectedCompany.status === "approved"
                    ? "Одобрена"
                    : selectedCompany.status === "pending"
                    ? "На рассмотрении"
                    : "Отклонена"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {selectedCompany.description || "Описание не указано"}
              </p>
            </CardContent>
          </Card>

          {/* Services */}
          <div>
            <h2 className="font-semibold mb-3">Услуги ({services.length})</h2>
            <div className="space-y-2 mb-4">
              {services.map((s: any) => (
                <Card key={s.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      {s.description && (
                        <p className="text-xs text-muted-foreground">{s.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {s.price && (
                        <span className="text-sm font-medium text-primary">{s.price}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteService(s.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add service form */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Добавить услугу</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Название услуги"
                  value={newService.name}
                  onChange={(e) =>
                    setNewService({ ...newService, name: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Описание"
                  value={newService.description}
                  onChange={(e) =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  className="min-h-[60px]"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Цена"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({ ...newService, price: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Select
                    value={newService.category || "none"}
                    onValueChange={(v) =>
                      setNewService({ ...newService, category: v === "none" ? "" : v })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без категории</SelectItem>
                      {SERVICE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={addService}
                  disabled={!newService.name.trim() || saving}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {saving ? "Добавляю..." : "Добавить"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
