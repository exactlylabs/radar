export interface RadarItem {
  id: string;
  type: 'wifi' | 'cell_tower';
  name: string;
  strength?: number;
  distance?: number;
  timestamp: number;
}

export interface RadarStats {
  wifiCount: number;
  cellTowerCount: number;
  items: RadarItem[];
}

// Mock data for development
const mockRadarStats: RadarStats = {
  wifiCount: 0,
  cellTowerCount: 1,
  items: []
};

export const radarService = {
  // @TODO: Implement actual radar scanning logic
  startScanning: async (): Promise<void> => {
    return Promise.resolve();
  },

  // @TODO: Implement actual radar stopping logic
  stopScanning: async (): Promise<void> => {
    return Promise.resolve();
  },

  // @TODO: Implement actual stats fetching
  getStats: async (): Promise<RadarStats> => {
    return Promise.resolve(mockRadarStats);
  }
};
