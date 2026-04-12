export const StringUtils = {
  /**
   * Cleans a track title by removing common meta-information suffixes
   * and artist prefixes if present.
   */
  cleanTrackTitle(title: string, artist?: string): string {
    let cleaned = title;
    
    // 1. Remove artist prefix if it's there (e.g. "Artist - Title")
    if (artist) {
      const artistPrefix = new RegExp(`^${this.escapeRegExp(artist)}\\s*-\\s*`, 'i');
      cleaned = cleaned.replace(artistPrefix, '');
    }

    // 2. Remove standard suffixes and meta info
    return cleaned
      .replace(/\s*\(.*?\)\s*/g, ' ')               // Remove (Official Audio), (Lyrics), etc.
      .replace(/\s*\[.*?\]\s*/g, ' ')               // Remove [4K], [Explicit], etc.
      .replace(/\s*feat\..*$/gi, '')                // Remove "feat. artist"
      .replace(/\s*ft\..*$/gi, '')                  // Remove "ft. artist"
      .replace(/\s* - .*$/g, ' ')                   // Remove " - Remastered", etc. if after a dash
      .replace(/\.[^/.]+$/, "")                     // Remove extension if still there
      .trim();
  },

  escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
};
