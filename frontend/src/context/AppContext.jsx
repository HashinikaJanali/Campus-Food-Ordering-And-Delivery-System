import { createContext, useContext, useState, useEffect } from 'react';
import { loyaltyAPI } from '../services/api';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Mock user (replace with real auth later)
  const [currentUser, setCurrentUser] = useState({
    userId: 'USER001',
    userName: 'John Doe',
  });

  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch loyalty details
  const fetchLoyaltyData = async () => {
    try {
      setLoading(true);

      const res = await loyaltyAPI.get(currentUser.userId);
      setLoyaltyData(res.data.data);

    } catch (error) {
      // If account does not exist → create one
      if (error.response?.status === 404) {
        try {
          const createRes = await loyaltyAPI.create({
            userId: currentUser.userId,
            userName: currentUser.userName,
          });

          setLoyaltyData(createRes.data.data);
          toast.success('Welcome! You received 50 bonus points! 🎉');

        } catch (createError) {
          console.error('Error creating loyalty account:', createError);
        }
      } else {
        console.error('Error fetching loyalty data:', error);
      }

    } finally {
      setLoading(false);
    }
  };

  // Redeem points
  const redeemReward = async (amount, rewardName) => {
    try {
      const res = await loyaltyAPI.redeem({
        userId: currentUser.userId,
        amount,
        rewardName,
      });

      setLoyaltyData(res.data.data);
      toast.success(`${rewardName} redeemed successfully! 🎁`);
      return true;

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to redeem reward');
      return false;
    }
  };

  // Force refresh loyalty data
  const refreshLoyaltyData = async () => {
    return await fetchLoyaltyData();
  };

  // Load on startup
  useEffect(() => {
    if (currentUser.userId) {
      fetchLoyaltyData();
    }
  }, [currentUser.userId]);

  const value = {
    currentUser,
    setCurrentUser,
    loyaltyData,
    loading,
    redeemReward,
    refreshLoyaltyData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
