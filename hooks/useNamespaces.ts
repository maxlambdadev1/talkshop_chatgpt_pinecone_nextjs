import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface useNamespacesProps {
  // userEmail : string,
}

export default function useNamespaces() {
// userEmail : string,
  const [namespaces, setNamespaces] = useState<any[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<any>({});
  const [isLoadingNamespaces, setIsLoadingNamespaces] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchNamespaces = async () => {
      try {
        const response = await fetch(`/api/getNamespaces`);
        const data = await response.json();

        if (response.ok) {
          setNamespaces(data);
          setIsLoadingNamespaces(false);
          if (data.length > 0) {
            if (!router.query.namespace) {
              const url = new URL(location.href);
              const pathname = url.pathname; 
              const id = pathname.split('/namespace/').pop(); 
              console.log('id', id);
              if (!id) setSelectedNamespace(data[0]);
            }
          }
        } else {
          console.error(data.error);
        }
      } catch (error: any) {
        console.error(error.message);
      }
    };
    fetchNamespaces();
  }, []);

  useEffect(() => {
    const namespaceFromUrl = router.query.namespace;
    if (typeof namespaceFromUrl === 'string') {
      setSelectedNamespace({ realName: namespaceFromUrl, name: ' ' });
      console.log('namespaceFromUrl', namespaceFromUrl);
    }
  }, [router.query.namespace]);

  useEffect(() => {
    if (namespaces.length > 0 && !!selectedNamespace.realName) {
      console.log(
        'ddddddddd',
        selectedNamespace,
        namespaces.find(
          (item: any) => item.realName === selectedNamespace.realName,
        ),
      );
      setSelectedNamespace((selectedNamespace: any) =>
        namespaces.find(
          (item: any) => item.realName === selectedNamespace.realName,
        ),
      );
    }
  }, [namespaces, selectedNamespace]);

  return {
    namespaces,
    selectedNamespace,
    setSelectedNamespace,
    isLoadingNamespaces,
  };
}
