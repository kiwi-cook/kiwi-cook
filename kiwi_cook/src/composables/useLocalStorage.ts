export function useLocalStorage() {
  // Handles circular references and non-stringifiable values
  const getCircularReplacer = () => {
    const seen = new WeakSet<object>();
    return (key: string, value: unknown): unknown => {
      if (value instanceof Error) {
        return {
          errorType: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      if (value instanceof Date) {
        return {
          type: 'Date',
          iso: value.toISOString(),
        };
      }
      if (value instanceof RegExp) {
        return {
          type: 'RegExp',
          source: value.source,
          flags: value.flags,
        };
      }
      if (value instanceof Map) {
        return {
          type: 'Map',
          entries: Array.from(value.entries()),
        };
      }
      if (value instanceof Set) {
        return {
          type: 'Set',
          values: Array.from(value.values()),
        };
      }

      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  };

  // Custom reviver function to restore special types
  type ReviverValue = {
    type?: string;
    iso?: string;
    source?: string;
    flags?: string;
    entries?: [string, unknown][];
    values?: unknown[];
  };

  const customReviver = (key: string, value: ReviverValue): unknown => {
    if (value && typeof value === 'object') {
      if (value.type === 'Date' && value.iso) {
        return new Date(value.iso);
      }
      if (value.type === 'RegExp' && value.source) {
        return new RegExp(value.source, value.flags);
      }
      if (value.type === 'Map' && value.entries) {
        return new Map(value.entries);
      }
      if (value.type === 'Set' && value.values) {
        return new Set(value.values);
      }
    }
    return value;
  };

  // Save data to localStorage
  const saveData = (key: string, data: unknown): boolean => {
    try {
      const serialized = JSON.stringify(data, getCircularReplacer());
      // Generate a checksum to detect data corruption
       
      const checksum = serialized.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
      const serializedWithChecksum = JSON.stringify({ data: serialized, checksum });
      localStorage.setItem(key, serializedWithChecksum);
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      return false;
    }
  };

  // Load data from localStorage
  const loadData = (key: string): unknown | null => {
    try {
      const serializedWithChecksum = localStorage.getItem(key);
      if (!serializedWithChecksum) return null;
      const { data, checksum } = JSON.parse(serializedWithChecksum);
      // Verify checksum to detect data corruption
       
      const calculatedChecksum = data.split('').reduce((a: number, b: string) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
      if (checksum !== calculatedChecksum) {
        console.error(`Data in ${key} is corrupted!`);
        return null;
      }
      return JSON.parse(data, customReviver);
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
      return null;
    }
  };

  return {
    saveData,
    loadData,
  };
}
