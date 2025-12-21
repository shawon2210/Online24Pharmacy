import { useQuery } from '@tanstack/react-query';
import { GiftIcon, StarIcon } from '@heroicons/react/24/outline';
import { fetchLoyaltyPoints } from '../../utils/api';
import { useAuthStore } from '../../stores/authStore';

export default function LoyaltyPoints() {
  const { isAuthenticated } = useAuthStore();

  const { data: loyalty } = useQuery({
    queryKey: ['loyalty-points'],
    queryFn: fetchLoyaltyPoints,
    enabled: isAuthenticated
  });

  if (!isAuthenticated || !loyalty) return null;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <StarIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">Loyalty Points</h3>
            <p className="text-sm opacity-90">{loyalty.points} points available</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{loyalty.points}</p>
          <p className="text-xs opacity-90">≈ ৳{Math.floor(loyalty.points / 10)}</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <GiftIcon className="w-4 h-4" />
          <span className="text-sm">Next reward at {loyalty.nextReward} points</span>
        </div>
        <button className="bg-white bg-opacity-20 px-3 py-1 rounded text-sm hover:bg-opacity-30">
          Redeem
        </button>
      </div>
    </div>
  );
}