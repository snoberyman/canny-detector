declare global { 
  interface Window { 
    electronAPI: {
      message: () => Promise<string>;
      fetchData: () => Promise<{ data: string }>;     };
  }
}

export {}; 