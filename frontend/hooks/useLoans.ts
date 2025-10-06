import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { LOAN_MANAGER_ADDRESS } from '@/config/contracts';
import { loanManagerABI } from '@/config/abis';

export function useLoans() {
  const { address } = useAccount();
  const [loans, setLoans] = useState<any[]>([]);

  const { data, isError, isLoading } = useContractRead({
    address: LOAN_MANAGER_ADDRESS as `0x${string}`,
    abi: loanManagerABI,
    functionName: 'getUserLoans',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  useEffect(() => {
    if (data && !isError) {
      setLoans(data as any[]);
    }
  }, [data, isError]);

  return {
    loans,
    loading: isLoading,
  };
}


