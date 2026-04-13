# 🎵 MusicScript: Advanced Music Player

Desarrollé **MusicScript** como un reproductor de música moderno y de alto rendimiento construido con **React**, **TypeScript** y **Vite**. Este proyecto forma parte de mi **Taller de Listas Doblemente Enlazadas**, donde combino conceptos fundamentales de estructuras de datos con una interfaz de usuario premium y las herramientas de desarrollo más rápidas del ecosistema actual.

> [!TIP]
> Dado que MusicScript utiliza **IndexedDB** para la persistencia, todos los datos de los usuarios se guardarán de forma segura en sus propios navegadores, sin necesidad de configurar bases de datos externas pesadas.

---

## 🚀 Guía de Inicio Rápido

Siga estos pasos para ejecutar el proyecto localmente y verificar todas las funcionalidades:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/itsGabo22/MusicScript.git
   cd MusicScript
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación:**
   Abra el navegador en `http://localhost:5173`.

> [!NOTE]
> La aplicación inicia sin canciones por defecto. Para iniciar la prueba, utilice el botón **"+ Añadir Música"** para cargar sus archivos `.mp3`.

---

## 📑 Cumplimiento del Taller (Checklist Académico)

A continuación, se detalla cómo el proyecto cumple con los requisitos del taller solicitados:

| Requisito | Implementación | Archivo/Clase |
| :--- | :--- | :--- |
| **Lenguaje TypeScript** | Uso estricto de tipos e interfaces en todo el sistema. | Todo el proyecto (`.ts`, `.tsx`) |
| **Concepto "Listas Dobles"** | Estructura de datos principal para la cola de reproducción. | `DoublyLinkedList.ts` |
| **Agregar Canción (Inicio)** | Método `addAtStart` para priorizar temas. | `useMusicPlayer.ts` |
| **Agregar Canción (Final)** | Método `add` por defecto. | `useMusicPlayer.ts` |
| **Agregar Canción (Cualquier pos)** | Método `addAt` con índice dinámico. | `useMusicPlayer.ts` |
| **Eliminar Canción** | Método `remove` con confirmación de seguridad. | `ConfirmModal.tsx` |
| **Forward/Next** | Navegación `next()` a través de punteros. | `DoublyLinkedList.ts` |
| **Backward/Prev** | Navegación `prev()` a través de punteros. | `DoublyLinkedList.ts` |
| **Frontend Interactivo** | Interfaz UI con Glassmorphism y React. | `/src/ui/layouts` |
| **Bundler & Build Tool** | **Vite** para HMR (Hot Module Replacement) instantáneo. | `vite.config.ts` |

---

## 🧠 Inmersión Técnica: La Lista Doblemente Enlazada (DLL)

El corazón de MusicScript es la clase `DoublyLinkedList<T>`. A diferencia de un array convencional, la DLL nos permite:

- **Navegación Eficiente**: Saltar entre canciones (`next` y `prev`) es una operación de complejidad constante **O(1)**.
- **Inserción Dinámica**: Añadir canciones en cualquier posición es más eficiente al solo requerir la actualización de punteros (`prev`, `next`).
- **Control de Estado**: Mantenemos un puntero `current` que siempre sabe qué canción está sonando sin necesidad de buscar índices en cada cambio.

```typescript
// Fragmento de la estructura principal
export class DoublyLinkedList<T> {
  private head: MusicNode<T> | null = null;
  private tail: MusicNode<T> | null = null;
  private current: MusicNode<T> | null = null;
  // ... métodos de navegación y CRUD
}
```

---

## 📦 Arquitectura de Persistencia (LocalStorage & IndexedDB)

Para asegurar que las canciones no se pierdan al recargar la página o reiniciar el servidor, he implementado una capa de persistencia avanzada:

- **Dexie.js (IndexedDB):** Utilizo IndexedDB para almacenar no solo los metadatos (título, artista), sino los archivos de audio reales en formato **Blob**.
- **Acceso Offline:** Una vez cargada una canción, se guarda en el disco local del navegador, permitiendo que la aplicación funcione instantáneamente en futuras sesiones.

---

---

## ✨ Funcionalidades Extra (Fase 1- Finalizada)

Más allá de lo básico, MusicScript ofrece:

1. **Diseño Multi-Vista**: 
   - **Modern**: Una interfaz futurista con efectos de cristal.
   - **Retro (iPod/Cassette)**: Modos temáticos para mayor inmersión.
2. **Sistema Responsivo**: Diseñado específicamente para funcionar perfectamente en móviles, con animaciones de texto (*marquee*) y áreas táctiles optimizadas.
3. **Temas Dinámicos**: Soporte completo para **Modo Claro** y **Modo Oscuro** con contraste inteligente.
4. **Confirmación de Seguridad**: Modos de borrado inteligentes que distinguen entre "Quitar de Playlist" y "Borrar de la Biblioteca".

---

## ⚡ Funcionalidades Avanzadas (Fase 2 - Finalizada)


Con la Fase 2, elevé a MusicScript de ser un reproductor básico a una aplicación de audio de nivel profesional, integrando algoritmos avanzados y refinamientos de UX:

1. **Ordenamiento Manual Persistente (Estructuras de Datos):**
   - Implementación de **Fractional Indexing** ($O(1)$) para permitir el movimiento de canciones a cualquier posición (Inicio, Fin o Índice X) de forma quirúrgica.
   - Persistencia determinista en IndexedDB: el orden se mantiene exactamente igual tras recargar la página.
2. **Motor de Letras Premium:**
   - **Sincronización Proactiva**: Algoritmo de scroll tipo "persecución" que mantiene la línea activa siempre en el centro vertical.
   - **Estética de Vanguardia**: Uso de `mask-image` en CSS para degradados de transparencia suaves.
   - **Multi-API Sync**: Integración con **LRCLIB** y **Lyrics.ovh**.
   - **Traducción Inteligente (Powered by Gemini)**: Traducción automática al español para canciones en cualquier idioma, integrada directamente en el visualizador.

---

En la tercera entrega, consolidé a MusicScript no solo como un reproductor, sino como una estación de música inteligente y autónoma, procesando toda la multimedia _In-Browser_:

1. **Recorte de Audio y Codificación Nativa:**
   - **Editor No Lineal**: Recorta canciones con precisión milimétrica usando cursores visuales duales.
   - **Compresión Nativa (lamejs) y WAV**: Transforma el flujo de bytes `Float32Array` directamente a `WAV` o los codifica en vuelo a `MP3` sin servidores intermedios.
2. **Ecualizador Profesional 5-Bandas (Patrón Decorator):**
   - Una cadena de nodos de filtros bi-quad envuelven dinámicamente el source original de audio.
   - Soporte para *Presets* y persistencia de frecuencias.
3. **Agente LLM Musical Integrado (Gemini 2.5 Flash):**
   - **Cerebro Musical Conversacional**: Conexión ultra-rápida y directa mediante API REST al modelo más potente de Google para recomendaciones y análisis de datos.
   - **Traductor de Letras en Vivo**: Motor de IA que procesa y traduce letras de canciones en tiempo real para el visualizador premium.
   - **Contexto Categórico**: El agente sabe "qué tienes" en este momento y su recomendación se amolda dinámicamente al estado de tus colecciones locales IndexedDB.

---

## 🌐 Sync Center: Bóveda de Sincronización (.mssync) (Fase 4 - Finalizada)

En la cuarta fase, transformé a MusicScript en un ecosistema portable mediante un sistema de **Bóveda Universal**, diseñado específicamente para la transferencia entre computadoras y el respaldo de datos:

1. **Vault Sync Protocol (.mssync):**
   - **Enfoque PC-to-PC**: Optimizado para migrar tu biblioteca entre navegadores (ej. de Chrome a Firefox) o entre diferentes computadoras sin depender de una cuenta en la nube.
   - **Respaldo Local**: Ideal para generar copias de seguridad antes de realizar limpiezas de datos de navegación o formatear el sistema, asegurando que tu música y listas sean persistentes.
   - **Gestión de Conflictos (Deduplicación)**: Durante la importación, el sistema permite elegir entre **Omitir** o **Reemplazar** canciones duplicadas para mantener la integridad de la biblioteca.
2. **Interfaz de Sincronización Premium:**
   - **Operación Simple**: Genera un archivo `.mssync` que contiene metadatos y audio comprimido con `JSZip (DEFLATE)`.
   - **Onboarding Informativo**: Guía paso a paso que explica el propósito de la sincronización local y la importancia de los respaldos físicos.
3. **Independencia Total:**
   - No requiere servidores externos ni conexión a Internet para funcionar una vez generado el archivo, manteniendo la premisa de privacidad total.

---

## 🚀 Futuro de MusicScript (Roadmap)

Aunque MusicScript es actualmente una aplicación basada en almacenamiento local (`IndexedDB`), tengo una visión clara para escalar el proyecto:

*   **Autenticación y Perfiles**: Implementar un sistema de usuarios (Firebase/Supabase) para que la música te siga a cualquier dispositivo sin mover archivos.
*   **Base de Datos Global**: Migrar a una arquitectura en la nube que permita la sincronización en tiempo real y la compartición comunitaria de playlists.
*   **App Nativa / Móvil**: Evolucionar hacia un entorno multiplataforma donde la sincronización sea transparente y automática mediante una API centralizada.

---

## 🛠️ Patrones de Software y Estructuras de Datos

| Concepto | Aplicación en MusicScript |
| :--- | :--- |
| **DLL (Lista Doble)** | Gestión de la cola de reproducción circular y navegación bidireccional inmediata. |
| **Hash Map / Mem Caché** | Algoritmo de mapeo de llaves `O(1)` (`blobUrlCache`) para la estabilización y retención temporal de punteros Blob en el DOM, previniendo micro-cortes. |
| **Fractional Indexing** | Algoritmo utilizado para el reordenamiento de la biblioteca sin necesidad de re-indexar miles de registros. |
| **Decorator Pattern** | Encadenamiento dinámico en tiempo de ejecución de nodos Web Audio API (`BiquadFilterNode`) para inyectar el Ecualizador paramétrico sin alterar el Analyzer principal. |
| **Observer Pattern** | Sincronización proactiva entre el estado del reproductor y los componentes visuales (Holograma/Lyrics). |
| **Factory Pattern** | Carga e instanciación de objetos `Song` leyendo los metadatos binarios (ID33) a través de `PlaylistLoader`. |
| **Singleton Pattern** | Unicidad global en servicios centrales estáticos como `AudioEditorService` y la Base de Datos IndexedDB (`MusicDatabase`). |
| **Repository Pattern** | Capa de abstracción (`LibraryRepository`) que separa la lógica del dominio del motor de almacenamiento físico. |
| **Sync Protocol (Vault)** | Serialización y compresión biyectiva de la base de datos en archivos `.mssync` mediante `JSZip`. |
| **Clean Architecture** | Separación granular entre las capas `Core`, `Infrastructure` y de presentación `UI`. |

---

## 📈 Bitácora de Desarrollo

- **Fase 1:** Motor DLL, estructura de persistencia local, interfaz moderna responsiva y gestión básica de temas. ✅
- **Fase 2:** Ordenamiento persistente avanzado, visualizador holográfico, sistema de letras sincronizadas y guía interactiva. ✅
- **Fase 3:** Sistema autónomo de Procesamiento de Audio Puro (Cortador a MP3/WAV, Ecualizador via Decorator) e Inteligencia Artificial incrustada con Gemini. ✅
- **Fase 4:** Centro de Sincronización por Bóveda (.mssync) para transferencia de bibliotecas universales con gestión de duplicados y UI premium. Proyecto Consolidado. 🚀🔥✅

---
*Desarrollado para el curso de Estructuras de Datos - Gabriel Paz 2026*

