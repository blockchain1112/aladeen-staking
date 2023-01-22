use anchor_lang::prelude::*;
use std::str::FromStr;

pub const CLAIM_REWARD_LAMPORTS: u64 = 2_000_000;

pub fn assert_reward_manager(pubkey: &Pubkey) -> bool {
    pubkey.to_string() == Pubkey::from_str("5nx4MybNcPBut1yMBsandykg2n99vQGAqXR3ymEXzQze").unwrap().to_string()
}

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize, Copy)]
#[repr(u8)]
pub enum GroupRewardDistributorKind {
    /// Rewards are distributed by minting new tokens
    Mint = 1,
    /// Rewards are distributed from a treasury
    Treasury = 2,
}
impl From<u8> for GroupRewardDistributorKind {
    fn from(orig: u8) -> Self {
        match orig {
            1 => return GroupRewardDistributorKind::Mint,
            2 => return GroupRewardDistributorKind::Treasury,
            _ => return GroupRewardDistributorKind::Treasury,
        };
    }
}

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize, Copy)]
#[repr(u8)]
pub enum GroupRewardDistributorMetadataKind {
    NoRestriction = 1,
    UniqueNames = 2,
    UniqueSymbols = 3,
}
impl From<u8> for GroupRewardDistributorMetadataKind {
    fn from(orig: u8) -> Self {
        match orig {
            1 => return GroupRewardDistributorMetadataKind::NoRestriction,
            2 => return GroupRewardDistributorMetadataKind::UniqueNames,
            3 => return GroupRewardDistributorMetadataKind::UniqueSymbols,
            _ => return GroupRewardDistributorMetadataKind::NoRestriction,
        };
    }
}

#[derive(Clone, Debug, PartialEq, Eq, AnchorSerialize, AnchorDeserialize, Copy)]
#[repr(u8)]
pub enum GroupRewardDistributorPoolKind {
    NoRestriction = 1,
    AllFromSinglePool = 2,
    EachFromSeparatePool = 3,
}
impl From<u8> for GroupRewardDistributorPoolKind {
    fn from(orig: u8) -> Self {
        match orig {
            1 => return GroupRewardDistributorPoolKind::NoRestriction,
            2 => return GroupRewardDistributorPoolKind::AllFromSinglePool,
            3 => return GroupRewardDistributorPoolKind::EachFromSeparatePool,
            _ => return GroupRewardDistributorPoolKind::NoRestriction,
        };
    }
}

pub const GROUP_REWARD_COUNTER_SEED: &str = "group-reward-counter";
pub const GROUP_REWARD_COUNTER_SIZE: usize = 8 + std::mem::size_of::<GroupRewardCounter>() + 8;

#[account]
pub struct GroupRewardCounter {
    pub bump: u8,
    pub group_reward_distributor: Pubkey,
    pub authority: Pubkey,
    pub count: u64,
}

pub const GROUP_REWARD_ENTRY_SEED: &str = "group-reward-entry";
pub const GROUP_REWARD_ENTRY_SIZE: usize = 8 + std::mem::size_of::<GroupRewardEntry>() + 64;
#[account]
pub struct GroupRewardEntry {
    pub bump: u8,
    pub group_entry: Pubkey,
    pub group_reward_distributor: Pubkey,
    pub reward_seconds_received: u128,
    pub multiplier: u64,
}

pub const GROUP_REWARD_DISTRIBUTOR_SEED: &str = "group-reward-distributor";
pub const GROUP_REWARD_DISTRIBUTOR_SIZE: usize = 8 // Anchor discriminator/sighash
 + 1 // bump
 + 32 // id
 + 4 + 5 * 32// authorized_pools (5 Pubkeys)
 + 1 // reward_kind
 + 1 // metadata_kind
 + 1 // pool_kind
 + 32 // authority
 + 32 // reward_mint
 + 8 // reward_amount
 + 16 // reward_duration_seconds
 + 16 // rewards_issued
 + 8 // base_adder
 + 1 // base_adder_decimals
 + 8 // base_multiplier
 + 1 // base_multiplier_decimals
 + 1 // multiplier_decimals
 + 4 // min_cooldown_seconds
 + 4 // min_stake_seconds
 + 8 // max_supply
 + 8 // group_count_multiplier
 + 1 // group_count_multiplier_decimals
 + 1 // min_group_size
 + 16 // max_reward_seconds_received
 + 256 // padding
;
#[account]
pub struct GroupRewardDistributor {
    pub bump: u8,
    pub id: Pubkey,
    pub authorized_pools: Vec<Pubkey>,
    pub reward_kind: GroupRewardDistributorKind,
    pub metadata_kind: GroupRewardDistributorMetadataKind,
    pub pool_kind: GroupRewardDistributorPoolKind,
    pub authority: Pubkey,
    pub reward_mint: Pubkey,
    pub reward_amount: u64,
    pub reward_duration_seconds: u128,
    pub rewards_issued: u128,
    pub base_adder: u64,
    pub base_adder_decimals: u8,
    pub base_multiplier: u64,
    pub base_multiplier_decimals: u8,
    pub multiplier_decimals: u8,
    pub min_cooldown_seconds: u32,
    pub min_stake_seconds: u32,
    pub max_supply: Option<u64>,
    pub group_count_multiplier: Option<u64>,
    pub group_count_multiplier_decimals: Option<u8>,
    pub min_group_size: Option<u8>,
    pub max_reward_seconds_received: Option<u128>,
}
