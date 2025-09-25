/**
 * Line Crypto Tokenomics Engine
 * Integrates Yellow Network state channels with gaming rewards
 */

import { createAppSessionFromChannel } from '../../hooks/useClearNodeConnection';
import { useTransfer } from '../../hooks/useTransfer';

// Tokenomics Constants
export const TOKEN_CONFIG = {
  LINE_TOKEN: {
    symbol: 'LCT',
    decimals: 18,
    totalSupply: '1000000000', // 1 billion tokens
    distribution: {
      gaming_rewards: 0.30,     // 30% for gaming rewards
      treasury: 0.25,           // 25% for treasury
      team: 0.15,              // 15% for team (vested)
      community: 0.20,         // 20% for community rewards
      liquidity: 0.10          // 10% for liquidity provision
    }
  },
  GAME_POINTS: {
    symbol: 'GP',
    exchangeRate: 100, // 100 GP = 1 LCT
    maxDailyEarn: 1000
  },
  REWARD_MULTIPLIERS: {
    daily_login: 1.0,
    game_completion: 1.5,
    pvp_win: 2.0,
    tournament_participation: 3.0,
    social_sharing: 0.5
  }
};

// Gaming Treasury Address (managed by app sessions)
export const GAME_TREASURY_ADDRESS = process.env.REACT_APP_GAME_TREASURY_ADDRESS || '0x1234...';

/**
 * Tokenomics Engine Class
 */
export class TokenomicsEngine {
  constructor(clearNodeConnection, transferHook) {
    this.clearNode = clearNodeConnection;
    this.transfer = transferHook;
    this.activeSessions = new Map();
  }

  /**
   * Create a game reward session using Yellow Network app sessions
   */
  async createGameRewardSession(gameType, participants, stakeAmount = '0') {
    try {
      const sessionData = {
        type: 'game_reward_session',
        game_type: gameType,
        participants,
        stake_amount: stakeAmount,
        created_at: Date.now(),
        reward_distribution: this.getRewardDistribution(gameType)
      };

      const session = await this.clearNode.createAppSessionFromChannel({
        channelId: process.env.REACT_APP_NITROLITE_CHANNEL_ID,
        counterparty: GAME_TREASURY_ADDRESS,
        asset: 'usdc',
        amount: stakeAmount,
        session_data: JSON.stringify(sessionData)
      });

      this.activeSessions.set(session.app_session_id, sessionData);
      return session;
    } catch (error) {
      console.error('Failed to create game reward session:', error);
      throw error;
    }
  }

  /**
   * Distribute rewards based on game performance
   */
  async distributeGameRewards(sessionId, gameResults) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const rewards = this.calculateRewards(gameResults, session);
    
    // Execute reward transfers via Yellow Network
    for (const reward of rewards) {
      if (reward.amount > 0) {
        await this.transfer.handleTransfer(
          reward.participant,
          reward.amount.toString(),
          'usdc'
        );
      }
    }

    return rewards;
  }

  /**
   * Calculate rewards based on game type and performance
   */
  calculateRewards(gameResults, session) {
    const distribution = session.reward_distribution;
    const totalStake = parseFloat(session.stake_amount);
    
    switch (session.game_type) {
      case 'endless_car_race':
        return this.calculateRaceRewards(gameResults, totalStake, distribution);
      case 'space_game':
        return this.calculateSpaceGameRewards(gameResults, totalStake, distribution);
      case 'pvp_tournament':
        return this.calculateTournamentRewards(gameResults, totalStake, distribution);
      default:
        return this.calculateDefaultRewards(gameResults, totalStake, distribution);
    }
  }

  /**
   * Race game specific reward calculation
   */
  calculateRaceRewards(results, totalStake, distribution) {
    const { score, participant, gameTime } = results;
    
    // Performance-based reward calculation
    const baseReward = Math.min(score / 1000, 1.0); // Max 1 USDC for 1000+ score
    const timeBonus = gameTime > 60 ? 0.5 : 0; // Bonus for playing > 1 minute
    const finalReward = (baseReward + timeBonus) * TOKEN_CONFIG.REWARD_MULTIPLIERS.game_completion;

    return [{
      participant,
      amount: finalReward,
      reason: 'race_completion_reward'
    }];
  }

  /**
   * Space game specific reward calculation
   */
  calculateSpaceGameRewards(results, totalStake, distribution) {
    const { score, participant, level, enemies_defeated } = results;
    
    const levelBonus = level * 0.1;
    const enemyBonus = enemies_defeated * 0.05;
    const scoreBonus = Math.min(score / 10000, 2.0);
    
    const finalReward = (levelBonus + enemyBonus + scoreBonus) * TOKEN_CONFIG.REWARD_MULTIPLIERS.game_completion;

    return [{
      participant,
      amount: finalReward,
      reason: 'space_game_completion_reward'
    }];
  }

  /**
   * PvP tournament reward calculation
   */
  calculateTournamentRewards(results, totalStake, distribution) {
    const rewards = [];
    const sortedPlayers = results.players.sort((a, b) => b.score - a.score);
    
    // Winner takes 70%, runner-up 20%, participation 10%
    if (sortedPlayers.length >= 1) {
      rewards.push({
        participant: sortedPlayers[0].address,
        amount: totalStake * 0.7,
        reason: 'tournament_winner'
      });
    }
    
    if (sortedPlayers.length >= 2) {
      rewards.push({
        participant: sortedPlayers[1].address,
        amount: totalStake * 0.2,
        reason: 'tournament_runner_up'
      });
    }
    
    // Participation rewards for others
    for (let i = 2; i < sortedPlayers.length; i++) {
      rewards.push({
        participant: sortedPlayers[i].address,
        amount: totalStake * 0.1 / (sortedPlayers.length - 2),
        reason: 'tournament_participation'
      });
    }
    
    return rewards;
  }

  /**
   * Default reward calculation
   */
  calculateDefaultRewards(results, totalStake, distribution) {
    return [{
      participant: results.participant,
      amount: Math.min(results.score / 100, 1.0),
      reason: 'game_completion_reward'
    }];
  }

  /**
   * Get reward distribution rules for different game types
   */
  getRewardDistribution(gameType) {
    const distributions = {
      endless_car_race: {
        type: 'performance_based',
        max_reward: 5.0, // Max 5 USDC per game
        multipliers: TOKEN_CONFIG.REWARD_MULTIPLIERS
      },
      space_game: {
        type: 'achievement_based',
        max_reward: 10.0,
        multipliers: TOKEN_CONFIG.REWARD_MULTIPLIERS
      },
      pvp_tournament: {
        type: 'competitive',
        winner_percentage: 0.7,
        runner_up_percentage: 0.2,
        participation_percentage: 0.1
      }
    };

    return distributions[gameType] || distributions.default;
  }

  /**
   * Create daily reward session
   */
  async createDailyRewardSession(userId, streakBonus = 1) {
    const baseReward = 1.0; // 1 USDC base daily reward
    const streakMultiplier = Math.min(1 + (streakBonus * 0.1), 3.0); // Max 3x multiplier
    const dailyAmount = (baseReward * streakMultiplier).toString();

    return await this.createGameRewardSession('daily_login', [userId], dailyAmount);
  }

  /**
   * Create social media sharing reward session
   */
  async createSocialSharingReward(userId, platform) {
    const socialRewards = {
      twitter: 0.5,
      telegram: 0.3,
      discord: 0.3,
      instagram: 0.4
    };

    const reward = socialRewards[platform] || 0.1;
    return await this.createGameRewardSession('social_sharing', [userId], reward.toString());
  }

  /**
   * Staking mechanism for LINE tokens
   */
  async createStakingSession(userId, amount, duration) {
    const stakingAPY = {
      30: 0.05,  // 5% APY for 30 days
      90: 0.08,  // 8% APY for 90 days
      180: 0.12, // 12% APY for 180 days
      365: 0.20  // 20% APY for 1 year
    };

    const apy = stakingAPY[duration] || 0.05;
    const rewards = (parseFloat(amount) * apy * duration / 365).toString();

    const sessionData = {
      type: 'staking_session',
      stake_amount: amount,
      duration_days: duration,
      apy: apy,
      expected_rewards: rewards,
      staker: userId,
      unlock_date: Date.now() + (duration * 24 * 60 * 60 * 1000)
    };

    return await this.clearNode.createAppSessionFromChannel({
      channelId: process.env.REACT_APP_NITROLITE_CHANNEL_ID,
      counterparty: GAME_TREASURY_ADDRESS,
      asset: 'usdc',
      amount: amount,
      session_data: JSON.stringify(sessionData)
    });
  }

  /**
   * Governance voting session
   */
  async createGovernanceSession(proposalId, voters, votingPower) {
    const sessionData = {
      type: 'governance_vote',
      proposal_id: proposalId,
      voters,
      voting_power: votingPower,
      voting_period: 7 * 24 * 60 * 60 * 1000, // 7 days
      created_at: Date.now()
    };

    return await this.clearNode.createAppSessionFromChannel({
      channelId: process.env.REACT_APP_NITROLITE_CHANNEL_ID,
      counterparty: GAME_TREASURY_ADDRESS,
      asset: 'usdc',
      amount: '0',
      session_data: JSON.stringify(sessionData)
    });
  }

  /**
   * Liquidity mining session
   */
  async createLiquidityMiningSession(userId, lpTokenAmount) {
    const miningRate = 0.001; // 0.1% per day
    const dailyRewards = (parseFloat(lpTokenAmount) * miningRate).toString();

    const sessionData = {
      type: 'liquidity_mining',
      lp_token_amount: lpTokenAmount,
      daily_reward_rate: miningRate,
      miner: userId,
      start_time: Date.now()
    };

    return await this.clearNode.createAppSessionFromChannel({
      channelId: process.env.REACT_APP_NITROLITE_CHANNEL_ID,
      counterparty: GAME_TREASURY_ADDRESS,
      asset: 'usdc',
      amount: dailyRewards,
      session_data: JSON.stringify(sessionData)
    });
  }
}

export default TokenomicsEngine;
