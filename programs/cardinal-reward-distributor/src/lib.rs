pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("J8KGQczjGYRvqDwMuQ6jBhZdFfLHzHmLTWZRuCCu6mrY");

#[program]
pub mod cardinal_reward_distributor {
    use super::*;

    pub fn init_reward_authority<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, InitRewardAuthorityCtx<'info>>, ix: InitRewardAuthorityIx) -> Result<()> {
        init_reward_authority::handler(ctx, ix)
    }

    pub fn init_reward_distributor<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, InitRewardDistributorCtx<'info>>, ix: InitRewardDistributorIx) -> Result<()> {
        init_reward_distributor::handler(ctx, ix)
    }

    pub fn init_reward_entry(ctx: Context<InitRewardEntryCtx>) -> Result<()> {
        init_reward_entry::handler(ctx)
    }

    pub fn claim_rewards<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, ClaimRewardsCtx<'info>>) -> Result<()> {
        claim_rewards::handler(ctx)
    }

    pub fn update_reward_entry(ctx: Context<UpdateRewardEntryCtx>, ix: UpdateRewardEntryIx) -> Result<()> {
        update_reward_entry::handler(ctx, ix)
    }

    pub fn close_reward_distributor<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, CloseCtx<'info>>) -> Result<()> {
        close_reward_distributor::handler(ctx)
    }

    pub fn close_reward_entry(ctx: Context<CloseRewardEntryCtx>) -> Result<()> {
        close_reward_entry::handler(ctx)
    }

    pub fn update_reward_distributor(ctx: Context<UpdateRewardDistributorCtx>, ix: UpdateRewardDistributorIx) -> Result<()> {
        update_reward_distributor::handler(ctx, ix)
    }

    pub fn reclaim_funds(ctx: Context<ReclaimFundsCtx>, amount: u64) -> Result<()> {
        reclaim_funds::handler(ctx, amount)
    }
}
