import { BASE_URL } from '@/config/constants';

export interface Region {
  id: number;
  name: string;
  // Add other properties as needed based on API response
}

export const fetchRegions = async (): Promise<Region[]> => {
  try {
    const response = await fetch(`${BASE_URL}/api/regions`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different possible response structures
    if (Array.isArray(data)) {
      return data;
    } else if (data.data && Array.isArray(data.data)) {
      return data.data;
    } else if (data.regions && Array.isArray(data.regions)) {
      // Convert array of strings to Region objects
      return data.regions.map((regionName: string, index: number) => ({
        id: index + 1,
        name: regionName
      }));
    } else {
      console.warn('Unexpected regions API response structure:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching regions:', error);
    // Return a fallback list of regions if API fails
    return [
      { id: 1, name: 'Addis Ababa' },
      { id: 2, name: 'Afar' },
      { id: 3, name: 'Amhara' },
      { id: 4, name: 'Benishangul-Gumuz' },
      { id: 5, name: 'Dire Dawa' },
      { id: 6, name: 'Gambela' },
      { id: 7, name: 'Harari' },
      { id: 8, name: 'Oromia' },
      { id: 9, name: 'Sidama' },
      { id: 10, name: 'SNNPR' },
      { id: 11, name: 'Somali' },
      { id: 12, name: 'Tigray' }
    ];
  }
};
