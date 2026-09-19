"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/axios";

type ExportFormat = "csv" | "pdf";

interface ExportButtonsProps {
  endpoint: string;
  params?: Record<string, string | number | undefined>;
  fileBaseName?: string;
}

async function downloadExport(
  endpoint: string,
  format: ExportFormat,
  params: Record<string, string | number | undefined> | undefined,
  fileBaseName: string,
) {
  const response = await api.get<Blob>(endpoint, {
    params: { ...params, format },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileBaseName}.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function ExportButtons({ endpoint, params, fileBaseName = "export" }: ExportButtonsProps) {
  const [loadingFormat, setLoadingFormat] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat) {
    setLoadingFormat(format);
    try {
      await downloadExport(endpoint, format, params, fileBaseName);
    } catch {
      toast.error("No fue posible generar el archivo de exportación");
    } finally {
      setLoadingFormat(null);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={loadingFormat !== null}>
        {loadingFormat === "csv" ? <Loader2 className="animate-spin" /> : <Download />}
        CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={loadingFormat !== null}>
        {loadingFormat === "pdf" ? <Loader2 className="animate-spin" /> : <FileText />}
        PDF
      </Button>
    </div>
  );
}
