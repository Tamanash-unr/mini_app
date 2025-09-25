/**
 * Tokenomics Dashboard Component
 * Displays user's token statistics, rewards, and staking positions
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CustomButton, CustomInput } from '../index';
import { icons } from '../../constants';
import useTokenomics from '../../hooks/useTokenomics';
import { getStoredAllowances, storeAllowances, clearAllowances } from '../../lib/sessionUtils';
import StakingInterface from './StakingInterface';

const ConfigStatus = () => {
  const isConfigured = process.env.REACT_APP_NITROLITE_APP_ADDRESS &&
                      process.env.REACT_APP_NITROLITE_CHANNEL_ID &&
                      process.env.REACT_APP_CLEARNODE_WS_URL;

  return (
    <div className={`mt-2 p-2 rounded text-xs ${
      isConfigured
        ? 'bg-green-500 bg-opacity-10 text-green-400 border border-green-500 border-opacity-20'
        : 'bg-red-500 bg-opacity-10 text-red-400 border border-red-500 border-opacity-20'
    }`}>
      {isConfigured ? '✅ Tokenomics Configured' : '❌ Tokenomics Not Configured'}
    </div>
  );
};

const TokenomicsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [showStakingModal, setShowStakingModal] = useState(false);
  const { getTokenomicsStats, stakingPositions, rewardHistory } = useTokenomics();
  const [allowances, setAllowances] = useState(getStoredAllowances());
  const [newAsset, setNewAsset] = useState('usdc');
  const [newAmount, setNewAmount] = useState('0');
  const dispatch = useDispatch();

  const coinValue = useSelector(state => state.app.coinValue);
  const tickets = useSelector(state => state.app.tickets);

  // Get ClearNode connection data
  const clearNodeData = useSelector(state => state.clearNode);
  const { connectionStatus, isAuthenticated, error, resetSession, getLedgerBalances } = useClearNodeConnection(
    process.env.REACT_APP_CLEARNODE_WS_URL || 'wss://clearnet.yellow.com/ws',
    useWallet()?.walletClient
  );

  useEffect(() => {
    const updateStats = () => {
      if (getTokenomicsStats) {
        const tokenomicsStats = getTokenomicsStats();
        setStats(tokenomicsStats);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getTokenomicsStats, coinValue, tickets]);

  // Check if tokenomics is properly initialized
  if (!getTokenomicsStats) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tokenomics Dashboard</h1>
          <p className="text-gray-400 mb-4">Connect your wallet to access tokenomics features</p>

          <div className="mt-4 p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg">
            <h3 className="text-yellow-400 font-semibold mb-2">🔗 Wallet Connection Required</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>1. Go to the Wallet tab and connect your MetaMask</p>
              <p>2. Ensure Yellow Network credentials are configured</p>
              <p>3. Come back here to see your tokenomics dashboard</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tokenomics Dashboard</h1>
          <p className="text-gray-400">Loading your tokenomics data...</p>
        </div>

        <div className="flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>

        <div className="mt-4 p-4 bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20 rounded-lg">
          <h3 className="text-blue-400 font-semibold mb-2">💡 How Tokenomics Works</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Play games to earn real USDC rewards via Yellow Network</p>
            <p>• Stake tokens for 5-20% APY returns with lock periods</p>
            <p>• Daily login bonuses and social sharing rewards</p>
            <p>• PvP gaming with entry fees and prize pools</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tokenomics Dashboard</h1>
        <p className="text-gray-400">Track your earnings, stakes, and rewards</p>

        {/* Quick Setup Guide */}
        <div className="mt-4 p-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20 rounded-lg">
          <h3 className="text-yellow-400 font-semibold mb-2">🚀 How to Use Tokenomics</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>1. Connect your wallet in the Wallet tab</p>
            <p>2. Play games to earn USDC rewards via Yellow Network</p>
            <p>3. Stake tokens for 5-20% APY returns</p>
            <p>4. Track all your rewards and stakes here</p>
          </div>
          <ConfigStatus />
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Balance</p>
              <p className="text-white text-2xl font-bold">{formatCurrency(stats.total_balance)}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <img src={icons.Wallet} alt="Wallet" className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Earned</p>
              <p className="text-white text-2xl font-bold">{formatCurrency(stats.total_earned)}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <img src={icons.Coins} alt="Coins" className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Active Stakes</p>
              <p className="text-white text-2xl font-bold">{stats.active_stakes}</p>
              <p className="text-purple-200 text-xs">{formatCurrency(stats.total_staked)} staked</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <img src={icons.Crown} alt="Stakes" className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tickets */}
      <motion.div 
        className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl p-6 mb-6"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm font-medium">Game Tickets</p>
            <p className="text-white text-2xl font-bold">{stats.tickets}</p>
            <p className="text-amber-200 text-xs">Use tickets to play premium games</p>
          </div>
          <div className="bg-amber-500 p-3 rounded-full">
            <img src={icons.Ticket} alt="Tickets" className="w-6 h-6" />
          </div>
        </div>
      </motion.div>

      {/* Channels & Balances */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Channels & Balances</h3>
          <div className="flex gap-2">
            <CustomButton
              text="Fetch Balances"
              buttonStyle="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-xs"
              textStyle="text-center font-semibold"
              onClick={() => {
                if (useWallet()?.account && isAuthenticated) {
                  getLedgerBalances(useWallet().account.address);
                }
              }}
            />
            <CustomButton
              text="Reset Session"
              buttonStyle="bg-gradient-to-r from-red-500 to-red-600 hover:opacity-90 text-xs"
              textStyle="text-center font-semibold"
              onClick={resetSession}
            />
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-4 p-3 rounded-lg bg-gray-800">
          <div className="text-sm">
            <span className="text-gray-400">Connection:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              connectionStatus === 'connected' ? 'bg-green-500 text-green-100' :
              connectionStatus === 'connecting' ? 'bg-yellow-500 text-yellow-100' :
              'bg-red-500 text-red-100'
            }`}>
              {connectionStatus.toUpperCase()}
            </span>
            {isAuthenticated && (
              <span className="ml-2 px-2 py-1 rounded text-xs bg-blue-500 text-blue-100">
                AUTHENTICATED
              </span>
            )}
          </div>
          {error && (
            <div className="text-red-400 text-xs mt-1">Error: {error}</div>
          )}
        </div>

        {/* Channels */}
        {clearNodeData.channels?.channels?.length > 0 ? (
          <div className="mb-4">
            <h4 className="text-white font-semibold mb-2">Active Channels</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {clearNodeData.channels.channels.map((channel, idx) => (
                <div key={idx} className="bg-gray-800 p-3 rounded text-sm">
                  <div className="text-gray-200">
                    <span className="font-medium">Channel {channel.id}</span>
                    <span className="ml-2 text-gray-400">• {channel.asset?.toUpperCase()}</span>
                  </div>
                  <div className="text-gray-300 text-xs mt-1">
                    Amount: {channel.amount} • Status: {channel.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h4 className="text-gray-400 text-sm mb-2">No channels found</h4>
          </div>
        )}

        {/* Ledger Balances */}
        {Object.keys(clearNodeData.ledgerBalances).length > 0 ? (
          <div>
            <h4 className="text-white font-semibold mb-2">Ledger Balances</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(clearNodeData.ledgerBalances).map(([asset, balance]) => (
                <div key={asset} className="bg-gray-800 p-3 rounded text-center">
                  <div className="text-gray-200 font-medium">{asset.toUpperCase()}</div>
                  <div className="text-white">{balance}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            {isAuthenticated ? 'No balance data yet. Click "Fetch Balances" to load.' : 'Authenticate to view balances.'}
          </div>
        )}
      </div>

      {/* Reward Breakdown */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Reward Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">Gaming</p>
            <p className="text-white text-lg font-semibold">{formatCurrency(stats.reward_breakdown.gaming)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Daily Login</p>
            <p className="text-white text-lg font-semibold">{formatCurrency(stats.reward_breakdown.daily)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Social Sharing</p>
            <p className="text-white text-lg font-semibold">{formatCurrency(stats.reward_breakdown.social)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-sm">Staking</p>
            <p className="text-white text-lg font-semibold">{formatCurrency(stats.reward_breakdown.staking)}</p>
          </div>
        </div>
      </div>

      {/* Session Allowances */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Session Allowances</h3>
        <p className="text-gray-400 text-sm mb-3">These caps are sent in the auth_request as allowances (per docs) to constrain spend within a session.</p>

        {allowances?.length ? (
          <div className="space-y-2 mb-4">
            {allowances.map((a, idx) => (
              <div key={`${a.asset}_${idx}`} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                <div className="text-gray-200 text-sm">{a.asset.toUpperCase()} • {a.amount}</div>
                <button className="text-red-300 text-xs" onClick={() => {
                  const next = allowances.filter((_, i) => i !== idx);
                  setAllowances(next); storeAllowances(next);
                }}>Remove</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-4">No allowances set.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
          <CustomInput
            placeholder="Asset (e.g. usdc)"
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            inputStyle="bg-gray-800 border-gray-700 text-white"
          />
          <CustomInput
            placeholder="Amount (string)"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            inputStyle="bg-gray-800 border-gray-700 text-white"
          />
          <CustomButton
            text="Add Allowance"
            buttonStyle="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
            textStyle="text-center font-semibold"
            onClick={() => {
              if (!newAsset || !newAmount) return;
              const next = [...allowances, { asset: newAsset.toLowerCase(), amount: newAmount }];
              setAllowances(next); storeAllowances(next); setNewAmount('0');
            }}
          />
        </div>

        <div className="flex gap-2">
          <CustomButton
            text="Clear Allowances"
            buttonStyle="bg-gradient-to-r from-gray-500 to-gray-600 hover:opacity-90"
            textStyle="text-center font-semibold"
            onClick={() => { setAllowances([]); clearAllowances(); }}
          />
        </div>
      </div>

      {/* Active Staking Positions */}
      {stakingPositions.filter(p => p.status === 'active').length > 0 && (
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">Active Staking Positions</h3>
          <div className="space-y-3">
            {stakingPositions
              .filter(p => p.status === 'active')
              .map((position, index) => {
                const progress = Math.min(
                  (Date.now() - position.start_date) / (position.unlock_date - position.start_date) * 100,
                  100
                );
                const timeRemaining = Math.max(0, position.unlock_date - Date.now());
                const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));

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
                        <p className="text-gray-400 text-sm">{position.apy * 100}% APY • {position.duration} days</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 text-sm font-medium">
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ready to unstake'}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Rewards */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Rewards</h3>
        {stats.reward_history.length > 0 ? (
          <div className="space-y-3">
            {stats.reward_history.map((reward, index) => (
              <motion.div 
                key={reward.id}
                className="flex justify-between items-center bg-gray-800 rounded-lg p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-full">
                    <img src={icons.Gift} alt="Reward" className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">
                      {reward.type.replace('_', ' ')}
                      {reward.platform && ` (${reward.platform})`}
                    </p>
                    <p className="text-gray-400 text-sm">{formatDate(reward.timestamp)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">+{formatCurrency(reward.amount)}</p>
                  {reward.tickets && (
                    <p className="text-amber-400 text-sm">+{reward.tickets} tickets</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No rewards yet. Start playing games to earn!</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CustomButton
          text="Play Games"
          textStyle="text-center font-semibold"
          buttonStyle="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          onClick={() => window.location.href = '/main'}
        />
        <CustomButton
          text="Stake Tokens"
          textStyle="text-center font-semibold"
          buttonStyle="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          onClick={() => setShowStakingModal(true)}
        />
        <CustomButton
          text="View History"
          textStyle="text-center font-semibold"
          buttonStyle="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
          onClick={() => {/* TODO: Open history modal */}}
        />
      </div>

      {/* Staking Modal */}
      <StakingInterface
        isOpen={showStakingModal}
        onClose={() => setShowStakingModal(false)}
      />
    </div>
  );
};

export default TokenomicsDashboard;
