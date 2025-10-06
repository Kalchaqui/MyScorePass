import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CREDIT_SCORING_ADDRESS } from '@/config/contracts';
import { creditScoringABI } from '@/config/abis';

export function useCreditScore() {
  const { address } = useAccount();
  const [score, setScore] = useState<any>(null);

  const { data, isError, isLoading } = useContractRead({
    address: CREDIT_SCORING_ADDRESS as `0x${string}`,
    abi: creditScoringABI,
    functionName: 'getScore',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  useEffect(() => {
    if (data && !isError) {
      const [scoreValue, maxLoanAmount, lastUpdated] = data as any[];
      
      if (Number(scoreValue) > 0) {
        setScore({
          score: Number(scoreValue),
          maxLoanAmount: maxLoanAmount.toString(),
          lastUpdated: Number(lastUpdated),
        });
      } else {
        setScore(null);
      }
    }
  }, [data, isError]);

  return {
    score,
    loading: isLoading,
  };
}


