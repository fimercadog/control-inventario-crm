<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .muted { color: #666; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  th { background: #f3f3f3; }
  .header { border-bottom: 2px solid #15803d; padding-bottom: 8px; margin-bottom: 12px; }
  .notes { margin-top: 16px; white-space: pre-wrap; }
  .sign { margin-top: 48px; }
</style>
</head>
<body>
  <div class="header">
    <h1>{{ $p->company->name ?? 'Clínica veterinaria' }}</h1>
    <div class="muted">Receta médica veterinaria</div>
  </div>

  <p>
    <strong>Paciente:</strong> {{ $p->patient->name ?? '—' }}<br>
    <strong>Fecha:</strong> {{ optional($p->created_at)->format('d/m/Y') }}<br>
    <strong>Veterinario/a:</strong> {{ $p->vet->name ?? '—' }}
  </p>

  <table>
    <thead>
      <tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th></tr>
    </thead>
    <tbody>
      @foreach ($p->items as $item)
        <tr>
          <td>{{ $item->medication_name }}</td>
          <td>{{ $item->dosage ?: '—' }}</td>
          <td>{{ $item->frequency ?: '—' }}</td>
          <td>{{ $item->duration ?: '—' }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>

  @if ($p->notes)
    <div class="notes"><strong>Indicaciones:</strong><br>{{ $p->notes }}</div>
  @endif

  <div class="sign">_______________________________<br>Firma y sello</div>
</body>
</html>
