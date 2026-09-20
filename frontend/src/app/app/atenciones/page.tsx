"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Stethoscope, Clock, CheckCircle, FileEdit, Lock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { api, PaginatedResponse } from "@/lib/api";
import { CareEncounter, EncounterStatus } from "@/lib/carenote-types";

export default function AtencionesListPage() {
  const [encounters, setEncounters] = useState<CareEncounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);

  const fetchEncounters = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get<PaginatedResponse<CareEncounter>>("/care-encounters", { params });
      setEncounters(res.data.data);
      setTotal(res.data.meta.total);
    } catch (err) {
      console.error("Error al cargar atenciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEncounters();
  };

  const statusBadge = (status: EncounterStatus) => {
    switch (status) {
      case "en_proceso":
        return <StatusBadge status="in_progress" label="En proceso" />;
      case "borrador_pendiente":
        return <StatusBadge status="pending" label="Borrador pendiente" />;
      case "revisada":
        return <StatusBadge variant="purple" label="Revisada" />;
      case "cerrada":
        return <StatusBadge status="closed" label="Cerrada" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-7 h-7 text-blue-600" />
            Atenciones y Evoluciones Domiciliarias
          </h1>
          <p className="text-sm text-slate-500">
            Registro asistencial, procesamiento de notas de voz y trazabilidad
          </p>
        </div>

        <Link href="/app/atenciones/nueva">
          <Button size="default" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 font-semibold shadow">
            <Plus className="w-5 h-5" />
            Nueva Atención
          </Button>
        </Link>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <Card className="p-4 border shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, paciente u observaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="en_proceso">En proceso</option>
              <option value="borrador_pendiente">Borrador pendiente</option>
              <option value="revisada">Revisada</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>

          <Button type="submit" variant="outline" className="px-4">
            Buscar
          </Button>
        </form>
      </Card>

      {/* Lista de Atenciones */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Cargando atenciones asistenciales...</div>
      ) : encounters.length === 0 ? (
        <Card className="p-12 text-center space-y-3 border">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">No se encontraron atenciones</h3>
          <p className="text-sm text-slate-500">Inicie una nueva atención domiciliaria o ajuste los filtros de búsqueda.</p>
          <Link href="/app/atenciones/nueva">
            <Button variant="outline" className="mt-2">Iniciar Atención</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {encounters.map((enc) => (
            <Card key={enc.id} className="p-5 border hover:border-blue-300 transition-colors shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {enc.encounter_code}
                    </span>
                    {statusBadge(enc.status)}
                    <span className="text-xs text-slate-500 capitalize flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(enc.started_at).toLocaleString("es-CO")}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Paciente: {enc.patient?.first_name ? `${enc.patient.first_name} ${enc.patient.last_name}` : enc.patient?.name || "Sin nombre"}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span>Doc: <strong>{enc.patient?.document_number || "N/A"}</strong></span>
                    <span>EPS: <strong>{enc.patient?.health_coverage_provider || "N/A"}</strong></span>
                    <span>Profesional: <strong>{enc.professional?.name || "Asignado"}</strong></span>
                    <span>Tipo: <strong className="capitalize">{enc.encounter_type.replace("_", " ")}</strong></span>
                  </div>

                  {enc.notes_summary && (
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1 italic">
                      "{enc.notes_summary}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/app/atenciones/${enc.id}`}>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                      Ver Atención & Editor
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
