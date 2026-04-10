# 🎵 MusicScript: Advanced Music Player

**MusicScript** es un reproductor de música moderno y de alto rendimiento construido con **React**, **TypeScript** y **Vite**. Este proyecto fue desarrollado como parte del **Taller de Listas Doblemente Enlazadas**, combinando conceptos fundamentales de estructuras de datos con una interfaz de usuario premium y las herramientas de desarrollo más rápidas del ecosistema actual.

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

Para asegurar que las canciones no se pierdan al recargar la página o reiniciar el servidor, hemos implementado una capa de persistencia avanzada:

- **Dexie.js (IndexedDB):** Utilizamos IndexedDB para almacenar no solo los metadatos (título, artista), sino los archivos de audio reales en formato **Blob**.
- **Acceso Offline:** Una vez cargada una canción, se guarda en el disco local del navegador, permitiendo que la aplicación funcione instantáneamente en futuras sesiones.

---

## ✨ Funcionalidades Extra (Fase 1)

Más allá de lo básico, MusicScript ofrece:

1. **Diseño Multi-Vista**: 
   - **Modern**: Una interfaz futurista con efectos de cristal.
   - **Retro (iPod/Cassette)**: Modos temáticos para mayor inmersión.
2. **Sistema Responsivo**: Diseñado específicamente para funcionar perfectamente en móviles, con animaciones de texto (*marquee*) y áreas táctiles optimizadas.
3. **Temas Dinámicos**: Soporte completo para **Modo Claro** y **Modo Oscuro** con contraste inteligente.
4. **Confirmación de Seguridad**: Modos de borrado inteligentes que distinguen entre "Quitar de Playlist" y "Borrar de la Biblioteca".

---

## 📈 Bitácora de Desarrollo

- **Fase 1 (Actual):** Implementación del motor DLL, estructura de persistencia, interfaz moderna responsiva y gestión de canciones.
- **Fase 2 (Próximamente):** Conexión con APIs de metadatos, lógica avanzada para modos retro y editor de audio integrado.

---
*Desarrollado para el curso de Estructuras de Datos - 2026*
