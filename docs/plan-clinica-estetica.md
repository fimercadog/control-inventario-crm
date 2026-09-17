# Plan Maestro de Adaptación & Auditoría: Clínica de Medicina Estética Premium

> **Documento de Especificación, Auditoría y Arquitectura Visual**  
> **Rama de Trabajo:** `clinica-estetica` (derivada directamente de la rama estable `erp`)  
> **Fecha:** 16 de Septiembre de 2026  
> **Estado:** Fase 2 - Implementación de la Web Pública Editorial (Bloque 1)

---

## 1. Contexto & Baseline de Entrada

Se inicia la creación de una nueva vertical especializada en **Medicina Estética Premium** partiendo del núcleo del **ERP Pyme V1** (`3d94855` en la rama `erp`).

### Reglas de Integridad y Aislamiento de Código:
1. **Rama de Trabajo:** `clinica-estetica`. Creada directamente desde `erp`.
2. **Sin Afectación Horizontal:** No se modifica la rama `erp` original ni la rama `veterinaria`. Todo el trabajo de esta vertical vive exclusivamente en `clinica-estetica`.
3. **No Commits / Push / Merge Inadvertidos:** El desarrollo se mantiene controlado en la rama local hasta la aprobación del cliente.
4. **Respeto a la Lógica Transversal ERP:** Se conservan las reglas cardinales del ERP (Ledger inmutable de inventario `stock_movements`, facturación interna con CxC/CxP, sesiones de caja con arqueo, multi-tenancy `company_id` y auditoría `audit_logs`).

---

## 2. Ajustes Importantes al Plan & Principios Rectores

### 📌 Ajuste 1: Tono Neutro y Profesional en Tecnología
- **No Afirmaciones Globales Rígidas:** No se utilizarán declaraciones cerradas o globales como "certificada por FDA/CE" en todo el sistema.
- **Expresiones Neutras Aprobadas:**
  - *"Tecnología médica profesional"*
  - *"Equipos para medicina estética"*
  - *"Procedimientos realizados con protocolos clínicos"*
  - *"Tecnología aplicada a tratamientos estéticos"*
- **Regla:** Las certificaciones regulatorias específicas solo se mostrarán cuando un equipo o producto concreto en el catálogo tenga dicha configuración explícita.

### 📌 Ajuste 2: Arquitectura Flexible y Dinámica
- **Sin Lógica Hardcodeada:** La estructura del sistema (modelos, base de datos y componentes) no hardcodeará tratamientos (ej. Botox, ácido hialurónico), procedimientos ni especialidades como requisitos de código obligatorios.
- **Configuración Dinámica:** El ERP y la Web Pública permitirán gestionar y configurar dinámicamente:
  - Tratamientos y Servicios
  - Procedimientos Clínicos
  - Especialistas y Especialidades
  - Zonas corporales / faciales
  - Productos, Insumos y Paquetes de Sesiones
- **Dataset Demo Separado:** Los ítems clínicos específicos existirán únicamente como **datos demo o configurables** (`aesthetic-data.ts`), nunca como esquemas rígidos.

---

## 3. Adaptación Visual del Layout Elegant Themes Spa

Se toma como referencia la composición y jerarquía visual de la plantilla Spa de Elegant Themes (`https://www.elegantthemes.com/layouts/fashion-beauty/spa-home-page`), adaptándola a una **CLÍNICA DE MEDICINA ESTÉTICA PREMIUM**:

- **Carácter del Sitio:** Médica, elegante, limpia, confiable, sofisticada y moderna. (No spa de relajación, no peluquería, no estética informal).
- **Traducción Conceptual del Dominio:**
  - *Spa Services* → **Tratamientos Estéticos Médicos**
  - *Massage / Wellness* → **Procedimientos y Protocolos Estéticos**
  - *Spa Professionals* → **Equipo de Especialistas Médicos**
  - *Book Treatment* → **Reserva de Valoración Estética**
  - *Testimonials* → **Experiencias de Pacientes**
  - *Products* → **Tecnología Médica & Dermocosmética**

---

## 4. Design System: Medicina Estética Premium

```text
┌─────────────────────────────────────────────────────────────────────────┐
│              DESIGN SYSTEM: MEDICINA ESTÉTICA PREMIUM                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Paleta Cromática:                                                       │
│  - Fondo Principal Web:       #FAF6F0 (Marfil / Warm Ivory)              │
│  - Tarjetas / Paneles:        #FFFFFF (Blanco Puro) / #F5EBE6 (Nude Soft)│
│  - Acentos & Detalles:        #C5A880 (Champán / Rose-Gold sutil)        │
│  - Primario / Botones:        #A87C6D (Warm Taupe Profundo)              │
│  - Primario Hover:            #8C6355 (Rich Warm Taupe)                  │
│  - Texto Principal:           #1A1A1A (Slate Carbón Profundo)            │
│  - Texto Secundario:          #55514D (Taupe Muted / Gris Editorial)     │
│  - Borde Suave:               #E8D8CE (Rose Gold Delicate Border)        │
│                                                                         │
│ Tipografía & Formas:                                                    │
│  - Encabezados (Headings):    Cormorant Garamond / Playfair (Serif)     │
│  - Cuerpo (Body text):        Plus Jakarta Sans / Open Sans (Sans)       │
│  - Radio de Bordes:           rounded-3xl (24px) / rounded-full (Píldora)│
│  - Sombras:                   shadow-xs (tarjetas), shadow-xl (modales) │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Bloque 1 de Implementación: Web Pública

Para esta fase inicial se construirá exclusivamente el paquete visual público para validación de la marca:

1. **Header Público (`header.tsx`):** Navegación refinada con logo institucional, enlaces a Tratamientos, Experiencia, Equipo, Tecnología y botón primario *"Agendar Valoración"*.
2. **Hero Principal (`split-hero.tsx` / `home-hero.tsx`):** Titular editorial en Serif, subtítulo refinado, distintivos de protocolo clínico y CTA principal.
3. **Sección de Tratamientos Destacados (`service-card.tsx`):** Grid elegante de tarjetas configurables con imagen, categoría, breve descripción y acciones.
4. **Sección Confianza & Experiencia (`image-text-section.tsx`):** Bloque visual destacando los protocolos clínicos y la tecnología médica aplicada.
5. **Sección Equipo de Especialistas (`team-profile-row.tsx`):** Perfiles dinámicos de profesionales con especialidades configurables.
6. **Sección Tecnología & Equipos:** Presentación de aparatología para tratamientos estéticos.
7. **Testimonios & Casos:** Experiencias de pacientes en tarjetas tipo revista.
8. **CTA de Agendamiento:** Banner directo para solicitar valoración.
9. **Footer Público (`footer.tsx`):** Pie de página elegante con información de contacto, horarios y links de navegación.

---

## 6. Siguientes Pasos (Bloque 2 - Pendiente de Aprobación)
- Adaptación de Ficha de Paciente Estético.
- Módulo de Historia Clínica Estética y Valoraciones.
- Consentimientos informados y control de sesiones.
- Gestión de inventario especializado de viales e insumos.
