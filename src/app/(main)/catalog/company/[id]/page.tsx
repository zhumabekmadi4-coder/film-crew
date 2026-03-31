"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
} from "lucide-react";
import type { Company, CompanyService } from "@/types";

export default function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<
    Company & { services: CompanyService[]; owner: any }
  | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCompany(data);
        setLoading(false);
      });
  }, [id]);

  const handleChat = async () => {
    if (!company?.ownerId) return;
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: company.ownerId }),
    });
    if (res.ok) {
      const conv = await res.json();
      router.push(`/messages/${conv.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!company) {
    return <div className="p-4 text-center text-muted-foreground">Компания не найдена</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {company.logoUrl && (
            <AvatarImage src={company.logoUrl} alt={company.name} />
          )}
          <AvatarFallback>
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold">{company.name}</h1>
          {company.city && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{company.city}</span>
            </div>
          )}
        </div>
      </div>

      {company.description && (
        <p className="text-sm text-muted-foreground">{company.description}</p>
      )}

      {/* Contact buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={handleChat}>
          <MessageCircle className="w-4 h-4 mr-1" />
          Написать
        </Button>
        {company.website && (
          <Button size="sm" variant="outline" asChild>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <Globe className="w-4 h-4 mr-1" />
              Сайт
            </a>
          </Button>
        )}
        {company.phone && (
          <Button size="sm" variant="outline" asChild>
            <a href={`tel:${company.phone}`}>
              <Phone className="w-4 h-4 mr-1" />
              Позвонить
            </a>
          </Button>
        )}
        {company.email && (
          <Button size="sm" variant="outline" asChild>
            <a href={`mailto:${company.email}`}>
              <Mail className="w-4 h-4 mr-1" />
              Email
            </a>
          </Button>
        )}
      </div>

      {/* Services */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Услуги</h2>
        {company.services?.length === 0 ? (
          <p className="text-sm text-muted-foreground">Услуги пока не добавлены</p>
        ) : (
          <div className="space-y-2">
            {company.services?.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      {service.category && (
                        <Badge variant="secondary" className="text-[10px] mt-1">
                          {service.category}
                        </Badge>
                      )}
                      {service.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      )}
                    </div>
                    {service.price && (
                      <span className="text-sm font-semibold text-primary whitespace-nowrap ml-4">
                        {service.price}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
