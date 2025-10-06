import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { IDENTITY_REGISTRY_ADDRESS } from '@/config/contracts';
import { identityRegistryABI } from '@/config/abis';

export function useIdentity() {
  const { address } = useAccount();
  const [hasIdentity, setHasIdentity] = useState(false);
  const [identity, setIdentity] = useState<any>(null);

  const { data, isError, isLoading } = useContractRead({
    address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
    abi: identityRegistryABI,
    functionName: 'getIdentity',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  useEffect(() => {
    if (data && !isError) {
      const [uniqueId, isVerified, verificationLevel, createdAt, documentCount] = data as any[];
      
      if (uniqueId && uniqueId !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        setHasIdentity(true);
        setIdentity({
          uniqueId,
          isVerified,
          verificationLevel: Number(verificationLevel),
          createdAt: Number(createdAt),
          documentCount: Number(documentCount),
        });
      } else {
        setHasIdentity(false);
        setIdentity(null);
      }
    }
  }, [data, isError]);

  return {
    identity,
    hasIdentity,
    loading: isLoading,
  };
}


