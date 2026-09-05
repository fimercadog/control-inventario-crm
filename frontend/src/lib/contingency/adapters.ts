export type Payload = Record<string, unknown>;

// Un adaptador por modulo elegible. `sync` reproduce la transaccion contra el
// endpoint real del API (misma validacion y logica que un alta online), mas el
// client_uuid que la hace idempotente. Nunca una ruta de escritura paralela.
export type ContingencyAdapter = {
  key: string;
  summarize: (payload: Payload) => string;
  sync: (payload: Payload, clientUuid: string) => Promise<void>;
};

// Vacio: el pivote a CRM + Inventario no definio todavia un flujo de
// escritura offline propio para esos dominios (ver ContingencyModuleRegistry
// en el backend). Se agrega un adapter aqui cuando se diseñe uno.
const adapters: Record<string, ContingencyAdapter> = {};

export function getAdapter(moduleKey: string): ContingencyAdapter | undefined {
  return adapters[moduleKey];
}
