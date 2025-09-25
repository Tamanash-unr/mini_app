/**
 * React Hook for Tokenomics Integration
 * Manages token operations and rewards using Yellow Network
 */

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TokenomicsEngine, TOKEN_CONFIG } from '../lib/tokenomics/tokenomicsEngine';
import { updateCoins, updateTickets, updateEarnedFromGame } from '../lib/redux/appSlice';
import { updateUserBalance } from '../lib/firebase/firebase_api';
import useClearNodeConnection from './useClearNodeConnection';
import useTransfer from './useTransfer';

/**
 * Custom hook for tokenomics operations
 */
export const useTokenomics = () => {
  const dispatch = useDispatch();
  const clearNodeConnection = useClearNodeConnection();
  const { handleTransfer } = useTransfer(
    clearNodeConnection.sessionKey, 
    clearNodeConnection.isAuthenticated
  );

  const [tokenomicsEngine, setTokenomicsEngine] = useState(null);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [stakingPositions, setStakingPositions] = useState([]);
  const [liquidityPositions, setLiquidityPositions] = useState([]);

  // Redux state
  const userId = useSelector(state => state.user.data.id);
  const coinValue = useSelector(state => state.app.coinValue);
  const tickets = useSelector(state => state.app.tickets);
  const earnedFromGame = useSelector(state => state.app.earnedFromGame);

  // Initialize tokenomics engine
  useEffect(() => {
    if (clearNodeConnection.isAuthenticated && clearNodeConnection.sessionKey) {
      const engine = new TokenomicsEngine(clearNodeConnection, { handleTransfer });
      setTokenomicsEngine(engine);
    }
  }, [clearNodeConnection.isAuthenticated, clearNodeConnection.sessionKey, handleTransfer]);

  /**
   * Process game completion rewards
   */
  const processGameReward = useCallback(async (gameType, gameResults) => {
    if (!tokenomicsEngine || !userId) {
      console.warn('Tokenomics engine not initialized or user not found');
      return { success: false, error: 'Not initialized' };
    }

    try {
      // Create game reward session
      const session = await tokenomicsEngine.createGameRewardSession(
        gameType,
        [clearNodeConnection.walletClient?.account?.address],
        '0' // No upfront stake for single player games
      );

      // Calculate and distribute rewards
      const rewards = await tokenomicsEngine.distributeGameRewards(
        session.app_session_id,
        {
          ...gameResults,
          participant: clearNodeConnection.walletClient?.account?.address
        }
      );

      // Update local state
      if (rewards.length > 0) {
        const totalReward = rewards.reduce((sum, reward) => sum + reward.amount, 0);
        dispatch(updateCoins(totalReward));
        
        // Add to reward history
        setRewardHistory(prev => [...prev, {
          id: session.app_session_id,
          type: gameType,
          amount: totalReward,
          timestamp: Date.now(),
          transaction_hash: session.transaction_hash
        }]);

        // Update Firebase
        await updateUserBalance(userId, coinValue + totalReward, tickets);
      }

      return { success: true, rewards, session };
    } catch (error) {
      console.error('Failed to process game reward:', error);
      return { success: false, error: error.message };
    }
  }, [tokenomicsEngine, userId, clearNodeConnection, coinValue, tickets, dispatch, handleTransfer]);

  /**
   * Process daily login rewards
   */
  const processDailyReward = useCallback(async (streakBonus = 1) => {
    if (!tokenomicsEngine || !userId) {
      return { success: false, error: 'Not initialized' };
    }

    try {
      const session = await tokenomicsEngine.createDailyRewardSession(
        clearNodeConnection.walletClient?.account?.address,
        streakBonus
      );

      const baseReward = 1.0;
      const streakMultiplier = Math.min(1 + (streakBonus * 0.1), 3.0);
      const totalReward = baseReward * streakMultiplier;

      // Award tickets as well
      const dailyTickets = 4 + Math.floor(streakBonus / 7); // Extra ticket per week of streak

      dispatch(updateCoins(totalReward));
      dispatch(updateTickets(dailyTickets));

      setRewardHistory(prev => [...prev, {
        id: session.app_session_id,
        type: 'daily_login',
        amount: totalReward,
        tickets: dailyTickets,
        streak: streakBonus,
        timestamp: Date.now()
      }]);

      await updateUserBalance(userId, coinValue + totalReward, tickets + dailyTickets);

      return { success: true, reward: totalReward, tickets: dailyTickets, session };
    } catch (error) {
      console.error('Failed to process daily reward:', error);
      return { success: false, error: error.message };
    }
  }, [tokenomicsEngine, userId, clearNodeConnection, coinValue, tickets, dispatch]);

  /**
   * Process social sharing rewards
   */
  const processSocialSharingReward = useCallback(async (platform) => {
    if (!tokenomicsEngine || !userId) {
      return { success: false, error: 'Not initialized' };
    }

    try {
      const session = await tokenomicsEngine.createSocialSharingReward(
        clearNodeConnection.walletClient?.account?.address,
        platform
      );

      const socialRewards = {
        twitter: 0.5,
        telegram: 0.3,
        discord: 0.3,
        instagram: 0.4
      };

      const rewardAmount = socialRewards[platform] || 0.1;

      dispatch(updateCoins(rewardAmount));

      setRewardHistory(prev => [...prev, {
        id: session.app_session_id,
        type: 'social_sharing',
        platform,
        amount: rewardAmount,
        timestamp: Date.now()
      }]);

      await updateUserBalance(userId, coinValue + rewardAmount, tickets);

      return { success: true, reward: rewardAmount, session };
    } catch (error) {
      console.error('Failed to process social sharing reward:', error);
      return { success: false, error: error.message };
    }
  }, [tokenomicsEngine, userId, clearNodeConnection, coinValue, tickets, dispatch]);

  /**
   * Stake tokens for rewards
   */
  const stakeTokens = useCallback(async (amount, duration) => {
    if (!tokenomicsEngine || !userId) {
      return { success: false, error: 'Not initialized' };
    }

    if (parseFloat(amount) > coinValue) {
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      const session = await tokenomicsEngine.createStakingSession(
        clearNodeConnection.walletClient?.account?.address,
        amount,
        duration
      );

      // Deduct staked amount from available balance
      dispatch(updateCoins(-parseFloat(amount)));

      const stakingPosition = {
        id: session.app_session_id,
        amount: parseFloat(amount),
        duration,
        start_date: Date.now(),
        unlock_date: Date.now() + (duration * 24 * 60 * 60 * 1000),
        apy: TOKEN_CONFIG.getStakingAPY(duration),
        status: 'active'
      };

      setStakingPositions(prev => [...prev, stakingPosition]);
      await updateUserBalance(userId, coinValue - parseFloat(amount), tickets);

      return { success: true, stakingPosition, session };
    } catch (error) {
      console.error('Failed to stake tokens:', error);
      return { success: false, error: error.message };
    }
  }, [tokenomicsEngine, userId, clearNodeConnection, coinValue, tickets, dispatch]);

  /**
   * Unstake tokens (after lock period)
   */
  const unstakeTokens = useCallback(async (stakingId) => {
    const position = stakingPositions.find(p => p.id === stakingId);
    if (!position) {
      return { success: false, error: 'Staking position not found' };
    }

    if (Date.now() < position.unlock_date) {
      return { success: false, error: 'Tokens are still locked' };
    }

    try {
      // Calculate rewards
      const daysStaked = (Date.now() - position.start_date) / (24 * 60 * 60 * 1000);
      const rewards = position.amount * position.apy * daysStaked / 365;
      const totalReturn = position.amount + rewards;

      // Return staked amount plus rewards
      dispatch(updateCoins(totalReturn));

      // Update staking positions
      setStakingPositions(prev => 
        prev.map(p => p.id === stakingId ? { ...p, status: 'completed' } : p)
      );

      setRewardHistory(prev => [...prev, {
        id: `unstake_${stakingId}`,
        type: 'staking_reward',
        amount: rewards,
        principal: position.amount,
        timestamp: Date.now()
      }]);

      await updateUserBalance(userId, coinValue + totalReturn, tickets);

      return { success: true, totalReturn, rewards };
    } catch (error) {
      console.error('Failed to unstake tokens:', error);
      return { success: false, error: error.message };
    }
  }, [stakingPositions, coinValue, tickets, userId, dispatch]);

  /**
   * Create PvP game session with entry fee
   */
  const createPvPSession = useCallback(async (gameType, entryFee, maxPlayers = 2) => {
    if (!tokenomicsEngine || !userId) {
      return { success: false, error: 'Not initialized' };
    }

    if (parseFloat(entryFee) > coinValue) {
      return { success: false, error: 'Insufficient balance for entry fee' };
    }

    try {
      const session = await tokenomicsEngine.createGameRewardSession(
        `pvp_${gameType}`,
        [clearNodeConnection.walletClient?.account?.address],
        entryFee
      );

      // Deduct entry fee
      dispatch(updateCoins(-parseFloat(entryFee)));
      await updateUserBalance(userId, coinValue - parseFloat(entryFee), tickets);

      return { 
        success: true, 
        session,
        room_id: session.app_session_id,
        entry_fee: entryFee
      };
    } catch (error) {
      console.error('Failed to create PvP session:', error);
      return { success: false, error: error.message };
    }
  }, [tokenomicsEngine, userId, clearNodeConnection, coinValue, tickets, dispatch]);

  /**
   * Get user's tokenomics stats
   */
  const getTokenomicsStats = useCallback(() => {
    const totalEarned = rewardHistory.reduce((sum, reward) => sum + reward.amount, 0);
    const totalStaked = stakingPositions
      .filter(p => p.status === 'active')
      .reduce((sum, position) => sum + position.amount, 0);

    const gameRewards = rewardHistory.filter(r => 
      ['endless_car_race', 'space_game', 'pvp_tournament'].includes(r.type)
    );

    const dailyRewards = rewardHistory.filter(r => r.type === 'daily_login');
    const socialRewards = rewardHistory.filter(r => r.type === 'social_sharing');

    return {
      total_balance: coinValue,
      total_earned: totalEarned,
      total_staked: totalStaked,
      tickets: tickets,
      reward_breakdown: {
        gaming: gameRewards.reduce((sum, r) => sum + r.amount, 0),
        daily: dailyRewards.reduce((sum, r) => sum + r.amount, 0),
        social: socialRewards.reduce((sum, r) => sum + r.amount, 0),
        staking: rewardHistory
          .filter(r => r.type === 'staking_reward')
          .reduce((sum, r) => sum + r.amount, 0)
      },
      active_stakes: stakingPositions.filter(p => p.status === 'active').length,
      reward_history: rewardHistory.slice(-10) // Last 10 rewards
    };
  }, [coinValue, tickets, rewardHistory, stakingPositions]);

  return {
    // State
    tokenomicsEngine,
    rewardHistory,
    stakingPositions,
    liquidityPositions,
    
    // Actions
    processGameReward,
    processDailyReward,
    processSocialSharingReward,
    stakeTokens,
    unstakeTokens,
    createPvPSession,
    
    // Getters
    getTokenomicsStats,
    
    // Config
    TOKEN_CONFIG
  };
};

export default useTokenomics;
