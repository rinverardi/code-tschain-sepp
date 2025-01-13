use anchor_lang::prelude::*;

declare_id!("vKPUHaPCrDoYLdHiiGGstckp4bfyi2Nny8nSf5uGhWU");

pub mod config {
    pub const CARDS_PER_DECK: usize = 36;
    pub const CARDS_PER_HAND: usize = 5;

    pub const NUMBER_OF_RANKS: usize = 9;
    pub const NUMBER_OF_SUITS: usize = 4;

    pub const PLAYER_LIMIT: usize = 4;
}

pub mod deck {
    use super::*;

    pub fn assign_cards(game: &mut Game, key: &Pubkey) -> Result<()> {
        for card_suit in 0..config::NUMBER_OF_SUITS {
            for card_rank in 0..config::NUMBER_OF_RANKS {
                let card_index = card_suit * config::NUMBER_OF_RANKS + card_rank;

                game.deck[card_index] = (0xff00 | (card_suit << 4) | card_rank) as u16;
            }
        }

        shuffle(game, key)?;

        Ok(())
    }

    pub fn assign_players(game: &mut Game) -> () {
        let mut card_index = 0;

        for player_index in 0..config::PLAYER_LIMIT {
            let player = &game.players[player_index];

            if player.is_some() {
                for _ in 0..config::CARDS_PER_HAND {
                    game.deck[card_index] &= 0x00ff;
                    game.deck[card_index] |= (player_index << 8) as u16;

                    card_index += 1;
                }
            }
        }
    }

    fn shuffle(game: &mut Game, key: &Pubkey) -> Result<()> {
        let mut seed = (Clock::get()?.unix_timestamp as u64)
            .wrapping_mul(key.to_bytes()[0] as u64)
            .wrapping_add(key.to_bytes()[1] as u64);

        for card_index in (1..game.deck.len()).rev() {
            seed = (seed ^ (seed << 13)).wrapping_add(card_index as u64);

            game.deck
                .swap(card_index, (seed as usize) % (card_index + 1));
        }

        Ok(())
    }
}

pub mod error {
    use super::*;

    #[error_code]
    pub enum Code {
        #[msg("Already exists")]
        AlreadyExists,

        #[msg("Illegal status")]
        IllegalStatus,

        #[msg("Insufficient funds")]
        InsufficientFunds,

        #[msg("Not authorized")]
        NotAuthorized,

        #[msg("Not found")]
        NotFound,
    }
}

pub mod game {
    use super::*;

    pub fn add_player(game: &mut Game, key: &Pubkey) -> Result<()> {
        let player = game
            .players
            .iter_mut()
            .find(|player| player.is_none())
            .ok_or(error::Code::NotFound)?;

        *player = Some(*key);

        Ok(())
    }

    pub fn has_player(game: &Game, key: &Pubkey) -> bool {
        game.players
            .iter()
            .any(|player| player.as_ref() == Some(key))
    }
}

pub mod stake {
    use super::*;

    pub fn give(account_from: &AccountInfo, account_to: &AccountInfo, amount: u64) -> Result<()> {
        msg!("Giving {} lamports to {}.", amount, account_to.key);

        if **account_from.try_borrow_lamports()? < amount {
            return Err(error::Code::InsufficientFunds.into());
        }

        **account_from.try_borrow_mut_lamports()? -= amount;
        **account_to.try_borrow_mut_lamports()? += amount;

        Ok(())
    }

    pub fn take<'info>(
        system_program: &Program<'info, System>,
        account_from: &AccountInfo<'info>,
        account_to: &AccountInfo<'info>,
        amount: u64,
    ) -> Result<()> {
        msg!("Taking {} lamports from {}.", amount, account_from.key);

        if **account_from.try_borrow_lamports()? < amount {
            return Err(error::Code::InsufficientFunds.into());
        }

        let context = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: account_from.clone(),
                to: account_to.clone(),
            },
        );

        anchor_lang::system_program::transfer(context, amount)?;

        Ok(())
    }
}

#[program]
pub mod tschain_sepp {
    use super::*;

    const DISCRIMINATOR: usize = 8;

    pub fn abort_game(context: Context<AbortGame>, id: String) -> Result<()> {
        msg!("Aborting game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the game master.

        if &game.players[0].unwrap() != context.accounts.signer.key {
            return Err(error::Code::NotAuthorized.into());
        }

        // Check the game status.

        if !matches!(game.status, Status::Created | Status::Started) {
            return Err(error::Code::IllegalStatus.into());
        }

        // Abort the game.

        game.status = Status::Aborted;

        // Return the stake to the game master.

        stake::give(
            &game.to_account_info(),
            &context.accounts.signer,
            game.stake,
        )?;

        // Return the stakes to the game participants.

        let players = game
            .players
            .iter()
            .skip(1)
            .filter_map(|payer| payer.as_ref());

        for player in players {
            let account = context
                .remaining_accounts
                .iter()
                .find(|account| account.key == player)
                .ok_or(error::Code::NotFound)?;

            stake::give(&game.to_account_info(), account, game.stake)?;
        }

        Ok(())
    }

    pub fn create_game(context: Context<CreateGame>, id: String, stake: u64) -> Result<()> {
        msg!("Creating game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Create the game.

        game.id = id;
        game.players[0] = Some(*context.accounts.signer.key);
        game.stake = stake;
        game.status = Status::Created;

        // Take the stake from the game master.

        stake::take(
            &context.accounts.system_program,
            &context.accounts.signer,
            &game.to_account_info(),
            stake,
        )?;

        Ok(())
    }

    pub fn join_game(context: Context<JoinGame>, id: String) -> Result<()> {
        msg!("Joining game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Prevent the game master from joining.

        if &game.players[0].unwrap() == context.accounts.signer.key {
            return Err(error::Code::NotAuthorized.into());
        }

        // Prevent the game participant from joining more than once.

        if game::has_player(game, context.accounts.signer.key) {
            return Err(error::Code::AlreadyExists.into());
        }

        // Check the game status.

        if game.status != Status::Created {
            return Err(error::Code::IllegalStatus.into());
        }

        // Join the game.

        game::add_player(game, context.accounts.signer.key)?;

        // Take the stake from the game participant.

        stake::take(
            &context.accounts.system_program,
            &context.accounts.signer,
            &game.to_account_info(),
            game.stake,
        )?;

        Ok(())
    }

    pub fn start_game(context: Context<StartGame>, id: String) -> Result<()> {
        msg!("Starting game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the game master.

        if &game.players[0].unwrap() != context.accounts.signer.key {
            return Err(error::Code::NotAuthorized.into());
        }

        // Check the game status.

        if game.status != Status::Created {
            return Err(error::Code::IllegalStatus.into());
        }

        // Start the game.

        deck::assign_cards(game, context.accounts.signer.key)?;
        deck::assign_players(game);

        game.status = Status::Started;

        Ok(())
    }

    #[derive(AnchorSerialize, AnchorDeserialize, Clone, Eq, InitSpace, PartialEq)]
    pub enum Status {
        Aborted,
        Created,
        Ended,
        Started,
    }

    #[derive(Accounts)]
    #[instruction(id: String)]
    pub struct AbortGame<'info> {
        #[account(
            mut,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
        )]
        pub game: Account<'info, Game>,

        #[account(mut)]
        pub signer: Signer<'info>,
    }

    #[derive(Accounts)]
    #[instruction(id: String)]
    pub struct CreateGame<'info> {
        #[account(
            init,
            payer = signer,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
            space = DISCRIMINATOR + Game::INIT_SPACE,
        )]
        pub game: Account<'info, Game>,

        #[account(mut)]
        pub signer: Signer<'info>,

        pub system_program: Program<'info, System>,
    }

    #[account]
    #[derive(InitSpace)]
    pub struct Game {
        pub current_card: u8,
        pub current_player: u8,
        pub deck: [u16; config::CARDS_PER_DECK],

        #[max_len(8)]
        pub id: String,

        pub players: [Option<Pubkey>; config::PLAYER_LIMIT],
        pub stake: u64,
        pub status: Status,
        pub winner: Option<Pubkey>,
    }

    #[derive(Accounts)]
    #[instruction(id: String)]
    pub struct JoinGame<'info> {
        #[account(
            mut,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
        )]
        pub game: Account<'info, Game>,

        #[account(mut)]
        pub signer: Signer<'info>,

        pub system_program: Program<'info, System>,
    }

    #[derive(Accounts)]
    #[instruction(id: String)]
    pub struct StartGame<'info> {
        #[account(
            mut,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
        )]
        pub game: Account<'info, Game>,

        pub signer: Signer<'info>,
    }
}
