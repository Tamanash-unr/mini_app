/**
 * Staking Interface Component
 * Allows users to stake tokens for rewards using Yellow Network state channels
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CustomButton, CustomInput } from '../index';
import { icons } from '../../constants';
import useTokenomics from '../../hooks/useTokenomics';

const StakingInterface = ({ isOpen, onClose }) => {
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const { stakeTokens, unstakeTokens, stakingPositions } = useTokenomics();
  const coinValue = useSelector(state => state.app.coinValue);

  const stakingOptions = [
    { duration: 30, apy: 5, label: '30 Days', color: 'from-green-500 to-green-600' },
    { duration: 90, apy: 8, label: '90 Days', color: 'from-blue-500 to-blue-600' },
    { duration: 180, apy: 12, label: '180 Days', color: 'from-purple-500 to-purple-600' },
    { duration: 365, apy: 20, label: '1 Year', color: 'from-amber-500 to-amber-600' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const calculateRewards = (amount, apy, duration) => {
    return (parseFloat(amount) * apy / 100 * duration / 365);
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (parseFloat(stakeAmount) > coinValue) {
      toast.error('Insufficient balance');
      return;
    }

    setIsStaking(true);
    try {
      const result = await stakeTokens(stakeAmount, selectedDuration);
      if (result.success) {
        toast.success(`Successfully staked ${formatCurrency(stakeAmount)} for ${selectedDuration} days!`);
        setStakeAmount('');
      } else {
        toast.error(result.error || 'Failed to stake tokens');
      }
    } catch (error) {
      toast.error('Staking failed');
      console.error('Staking error:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (positionId) => {
    setIsStaking(true);
    try {
      const result = await unstakeTokens(positionId);
      if (result.success) {
        toast.success(`Unstaked successfully! Received ${formatCurrency(result.totalReturn)}`);
      } else {
        toast.error(result.error || 'Failed to unstake tokens');
      }
    } catch (error) {
      toast.error('Unstaking failed');
      console.error('Unstaking error:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const formatTimeRemaining = (unlockDate) => {
    const now = Date.now();
    const remaining = unlockDate - now;
    
    if (remaining <= 0) return 'Ready to unstake';
    
    const days = Math.ceil(remaining / (24 * 60 * 60 * 1000));
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  const selectedOption = stakingOptions.find(opt => opt.duration === selectedDuration);
  const estimatedRewards = stakeAmount ? calculateRewards(stakeAmount, selectedOption.apy, selectedDuration) : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Stake Tokens</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Balance Display */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm">Available Balance</p>
            <p className="text-white text-2xl font-bold">{formatCurrency(coinValue)}</p>
          </div>

          {/* Staking Duration Options */}
          <div className="mb-6">
            <p className="text-white font-semibold mb-3">Select Staking Period</p>
            <div className="grid grid-cols-2 gap-3">
              {stakingOptions.map((option) => (
                <motion.button
                  key={option.duration}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDuration === option.duration
                      ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedDuration(option.duration)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="text-white font-semibold">{option.label}</p>
                  <p className="text-green-400 text-sm">{option.apy}% APY</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stake Amount Input */}
          <div className="mb-6">
            <p className="text-white font-semibold mb-3">Stake Amount</p>
            <div className="relative">
              <CustomInput
                type="number"
                placeholder="Enter amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                inputStyle="bg-gray-800 border-gray-700 text-white pr-20"
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 text-sm font-medium"
                onClick={() => setStakeAmount(coinValue.toString())}
              >
                MAX
              </button>
            </div>
          </div>

          {/* Reward Estimation */}
          {stakeAmount && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 mb-6">
              <div className="text-white">
                <div className="flex justify-between mb-2">
                  <span>Stake Amount:</span>
                  <span className="font-semibold">{formatCurrency(stakeAmount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Duration:</span>
                  <span className="font-semibold">{selectedOption.label}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>APY:</span>
                  <span className="font-semibold">{selectedOption.apy}%</span>
                </div>
                <div className="border-t border-white border-opacity-20 pt-2">
                  <div className="flex justify-between">
                    <span>Estimated Rewards:</span>
                    <span className="font-bold text-green-300">{formatCurrency(estimatedRewards)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stake Button */}
          <CustomButton
            text={isStaking ? 'Staking...' : 'Stake Tokens'}
            textStyle="text-center font-semibold"
            buttonStyle={`w-full mb-6 bg-gradient-to-r ${selectedOption.color} hover:opacity-90`}
            onClick={handleStake}
            isLoading={isStaking}
            disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking}
          />

          {/* Active Staking Positions */}
          {stakingPositions.filter(p => p.status === 'active').length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-3">Active Stakes</h3>
              <div className="space-y-3">
                {stakingPositions
                  .filter(p => p.status === 'active')
                  .map((position, index) => {
                    const canUnstake = Date.now() >= position.unlock_date;
                    const progress = Math.min(
                      (Date.now() - position.start_date) / (position.unlock_date - position.start_date) * 100,
                      100
                    );

                    return (
                      <motion.div
                        key={position.id}
                        className="bg-gray-800 rounded-lg p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-white font-semibold">{formatCurrency(position.amount)}</p>
                            <p className="text-gray-400 text-sm">
                              {position.apy * 100}% APY • {position.duration} days
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${canUnstake ? 'text-green-400' : 'text-yellow-400'}`}>
                              {formatTimeRemaining(position.unlock_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                        {canUnstake && (
                          <CustomButton
                            text={isStaking ? 'Processing...' : 'Unstake'}
                            textStyle="text-center font-medium text-sm"
                            buttonStyle="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                            onClick={() => handleUnstake(position.id)}
                            isLoading={isStaking}
                            disabled={isStaking}
                          />
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StakingInterface;
