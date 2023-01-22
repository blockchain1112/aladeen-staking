use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(Accounts)]
pub struct CloseRewardEntryCtx<'info> {
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    #[account(constraint = reward_distributor.reward_authority == reward_authority.key() @ ErrorCode::InvalidRewardAuthority)]
    reward_authority: Box<Account<'info, RewardAuthority>>,
    #[account(mut, close = authority, constraint = reward_entry.reward_distributor == reward_distributor.key() @ ErrorCode::InvalidRewardDistributor)]
    reward_entry: Box<Account<'info, RewardEntry>>,
    #[account(mut, constraint = reward_authority.authority == authority.key() @ ErrorCode::InvalidAuthority)]
    authority: Signer<'info>,
}

pub fn handler(_ctx: Context<CloseRewardEntryCtx>) -> Result<()> {
    Ok(())
}
