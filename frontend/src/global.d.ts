declare global { 
  interface Window { 
    electronAPI: {
      message: () => string;
      fetchData: () => Promise<{ data: string }>;     };
  }
}

export {}; 