pub mod errors;
pub mod instructions;
pub mod state;

use {anchor_lang::prelude::*, instructions::*};

declare_id!("CbNG8keFXcG8jLzTk3cL35cj6PtZL8EiqRkT6MqU5CxE");

#[program]
pub mod cardinal_group_reward_distributor {
    use super::*;

    pub fn init_group_reward_distributor<'key, 'accounts, 'remaining, 'info>(
        ctx: Context<'key, 'accounts, 'remaining, 'info, InitGroupRewardDistributorCtx<'info>>,
        ix: InitGroupRewardDistributorIx,
    ) -> Result<()> {
        init_group_reward_distributor::handler(ctx, ix)
    }

    pub fn init_group_reward_entry(ctx: Context<InitGroupRewardEntryCtx>) -> Result<()> {
        init_group_reward_entry::handler(ctx)
    }

    pub fn claim_group_rewards<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, ClaimGroupRewardsCtx<'info>>) -> Result<()> {
        claim_group_rewards::handler(ctx)
    }

    pub fn update_group_reward_entry(ctx: Context<UpdateGroupRewardEntryCtx>, ix: UpdateGroupRewardEntryIx) -> Result<()> {
        update_group_reward_entry::handler(ctx, ix)
    }

    pub fn close_group_reward_distributor<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, CloseGroupRewardDistributerCtx<'info>>) -> Result<()> {
        close_group_reward_distributor::handler(ctx)
    }

    pub fn close_group_reward_entry(ctx: Context<CloseGroupRewardEntryCtx>) -> Result<()> {
        close_group_reward_entry::handler(ctx)
    }

    pub fn update_group_reward_distributor(ctx: Context<UpdateGroupRewardDistributorCtx>, ix: UpdateGroupRewardDistributorIx) -> Result<()> {
        update_group_reward_distributor::handler(ctx, ix)
    }

    pub fn reclaim_group_funds(ctx: Context<ReclaimGroupFundsCtx>, amount: u64) -> Result<()> {
        reclaim_group_funds::handler(ctx, amount)
    }

    pub fn init_group_reward_counter(ctx: Context<InitGroupRewardCounterCtx>) -> Result<()> {
        init_group_reward_counter::handler(ctx)
    }

    pub fn close_group_reward_counter(ctx: Context<CloseGroupRewardCounterCtx>) -> Result<()> {
        close_group_reward_counter::handler(ctx)
    }
}
