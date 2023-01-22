use {crate::state::*, anchor_lang::prelude::*};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitRewardAuthorityIx {}

#[derive(Accounts)]
pub struct InitRewardAuthorityCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = REWARD_AUTHORITY_SIZE,
        seeds = [REWARD_AUTHORITY_SEED.as_bytes(), authority.key().as_ref()],
        bump,
    )]
    reward_authority: Box<Account<'info, RewardAuthority>>,
    #[account(mut)]
    authority: Signer<'info>,
    #[account(mut)]
    payer: Signer<'info>,
    system_program: Program<'info, System>,
}

pub fn handler<'key, 'accounts, 'remaining, 'info>(ctx: Context<'key, 'accounts, 'remaining, 'info, InitRewardAuthorityCtx<'info>>, ix: InitRewardAuthorityIx) -> Result<()> {
    let reward_authority = &mut ctx.accounts.reward_authority;
    reward_authority.authority = ctx.accounts.authority.key();
    reward_authority.bump = *ctx.bumps.get("reward_authority").unwrap();
    Ok(())
}
