import { createContext, useContext, useState, useEffect } from 'react';
import { loyaltyAPI } from '../services/api';
import { useUserAuth } from './UserAuthContext';
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
  const { user: authUser } = useUserAuth();
  
  // Map authUser to the format expected by legacy components if needed,
  // but better to use authUser directly.
  const currentUser = authUser ? {
    userId: authUser._id,
    userName: authUser.name || authUser.userName || 'Student',
  } : null;

  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch loyalty details
  const fetchLoyaltyData = async () => {
    if (!currentUser?.userId) {
      setLoyaltyData(null);
      return;
    }
    
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
    if (!currentUser?.userId) return false;
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
    await fetchLoyaltyData();
  };

  // Load on startup and when user changes
  useEffect(() => {
    if (currentUser?.userId) {
      fetchLoyaltyData();
    } else {
      setLoyaltyData(null);
    }
  }, [currentUser?.userId]);

  const value = {
    currentUser,
    setCurrentUser: () => {}, // No-op since it's driven by UserAuthContext
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
