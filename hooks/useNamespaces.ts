import { useState, useEffect } from 'react';

export default function useNamespaces() {
// userEmail : string,
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [isLoadingNamespaces, setIsLoadingNamespaces] = useState(true);


  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const response = await fetch(`/api/getNamespaces`);
        const data = await response.json();

        if (response.ok) {
          setNamespaces(data);
          setIsLoadingNamespaces(false);
        } else {
          console.error(data.error);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };
    fetchNamespaces();
  }, []);


  return {
    namespaces,
    isLoadingNamespaces,
  };
}
