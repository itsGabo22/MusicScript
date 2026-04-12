import axios from 'axios';

export interface AIContext {
  library: string[];
  favorites: string[];
  playlists: { name: string; songs: string[] }[];
  currentSong?: { title: string; artist: string };
}

export const AIService = {
  async getResponse(prompt: string, context: AIContext, botName: string = "MusicScript AI", botPersona: string = "un asistente experto en música"): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API Key de Gemini no configurada en .env');
    }

    const sysPrompt = `Eres ${botName}, ${botPersona}.
REGLAS ESTRICTAS:
1. Conoces la biblioteca del usuario:
   - Canciones guardadas: ${context.library.slice(0, 50).join(', ')}
   - Favoritos: ${context.favorites.join(', ')}
2. SI EL USUARIO PIDE MÚSICA NUEVA PARA DESCARGAR O AGREGAR: Está ESTRICTAMENTE PROHIBIDO recomendar canciones que ya están en sus "Canciones guardadas" o "Favoritos". Busca artistas relacionados pero canciones diferentes.
3. Si el usuario solo pide qué escuchar por estado de ánimo, busca primero en sus canciones guardadas.
4. Escribe en tono natural, conciso y apasionado.
5. Usa formato Markdown para las canciones. NUNCA intentes adivinar una URL directa de YouTube porque fallará. Usa SIEMPRE links de BÚSQUEDA de la siguiente manera: [Nombre Canción](https://www.youtube.com/results?search_query=Nombre+Artista+Nombre+Cancion). Reemplaza los espacios con el signo +.
${context.currentSong ? `Dato: El usuario está escuchando ahora mismo ${context.currentSong.title} de ${context.currentSong.artist}.` : ''}`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: `${sysPrompt}\n\nUsuario: ${prompt}` }] }]
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      console.error('Gemini AI Detailed Error:', error.response?.data || error.message);
      return `Error (${error.response?.status || 'Conexión'}): No pude contactar con mi cerebro. TIP: Revisa que la API Key en el .env sea válida y REINICIA el server.`;
    }
  }
};
