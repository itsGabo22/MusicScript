import axios from 'axios';

export const ExternalMetadataService = {
  async searchCover(title: string, artist: string): Promise<string | null> {
    try {
      const query = encodeURIComponent(`${title} ${artist}`);
      const response = await axios.get(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      
      if (response.data.results && response.data.results.length > 0) {
        // Get the 600x600 version by replacing the dimensions in the URL
        const artworkUrl100 = response.data.results[0].artworkUrl100;
        return artworkUrl100.replace('100x100bb', '600x600bb');
      }
      return null;
    } catch (error) {
      console.error('Error fetching cover from iTunes:', error);
      return null;
    }
  }
};
