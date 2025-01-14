use anchor_lang::prelude::*;

declare_id!("vKPUHaPCrDoYLdHiiGGstckp4bfyi2Nny8nSf5uGhWU");

pub mod card {
    pub const PILE_DISCARD: usize = 0xfe;
    pub const PILE_DRAW: usize = 0xff;

    pub const RANK_SEVEN: usize = 0x01;
    pub const RANK_EIGHT: usize = 0x02;

    pub fn can_draw(card: u16) -> bool {
        (card & 0xff00) >> 8 == PILE_DRAW as u16
    }

    pub fn get_holder(card: u16) -> usize {
        ((card & 0xff00) >> 8) as usize
    }

    pub fn get_rank(card: u16) -> usize {
        (card & 0x000f) as usize
    }

    pub fn get_suit(card: u16) -> usize {
        ((card & 0x00f0) >> 4) as usize
    }

    pub fn set_holder(card: &mut u16, holder: usize) -> () {
        *card &= 0x00ff;
        *card |= (holder << 8) as u16;
    }

    pub fn set_rank(card: &mut u16, rank: usize) -> () {
        *card &= 0xfff0;
        *card |= rank as u16;
    }

    pub fn set_suit(card: &mut u16, suit: usize) -> () {
        *card &= 0xff0f;
        *card |= (suit << 4) as u16;
    }
}

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
        for suit in 0..config::NUMBER_OF_SUITS {
            for rank in 0..config::NUMBER_OF_RANKS {
                let card_index = suit * config::NUMBER_OF_RANKS + rank;

                card::set_holder(&mut game.deck[card_index], card::PILE_DRAW);
                card::set_rank(&mut game.deck[card_index], rank);
                card::set_suit(&mut game.deck[card_index], suit);
            }
        }

        shuffle(game, key)
    }

    pub fn assign_holders(game: &mut Game) -> () {
        card::set_holder(&mut game.deck[0], card::PILE_DISCARD);

        let mut card_index = 1;

        for player_index in 0..config::PLAYER_LIMIT {
            let player = &game.players[player_index];

            if player.is_some() {
                for _ in 0..config::CARDS_PER_HAND {
                    card::set_holder(&mut game.deck[card_index], player_index);

                    card_index += 1;
                }
            }
        }
    }

    pub fn find_card(card: u16, game: &Game) -> Result<usize> {
        game.deck
            .iter()
            .position(|&candidate| candidate == card)
            .ok_or(error::Code::UnknownCard.into())
    }

    pub fn find_player(card: u16) -> Result<usize> {
        let player_index = card::get_holder(card);

        if player_index < config::PLAYER_LIMIT {
            Ok(player_index)
        } else {
            Err(error::Code::UnknownPlayer.into())
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

        #[msg("Illegal card")]
        IllegalCard,

        #[msg("Illegal status")]
        IllegalStatus,

        #[msg("Insufficient funds")]
        InsufficientFunds,

        #[msg("Limit exceeded")]
        LimitExceeded,

        #[msg("Not authorized")]
        NotAuthorized,

        #[msg("Not found")]
        NotFound,

        #[msg("Unknown card")]
        UnknownCard,

        #[msg("Unknown player")]
        UnknownPlayer,
    }
}

pub mod game {
    use super::*;

    pub fn add_player(game: &mut Game, key: &Pubkey) -> Result<()> {
        let player = game
            .players
            .iter_mut()
            .find(|candidate| candidate.is_none())
            .ok_or(error::Code::LimitExceeded)?;

        *player = Some(*key);

        Ok(())
    }

    pub fn count_players(game: &mut Game) -> usize {
        game.players.iter().filter(|candidate| candidate.is_some()).count()
    }

    pub fn discard_card(card: u16, game: &mut Game) -> Result<()> {
        let current_card = game.deck[game.current_card as usize];

        let same_rank = card::get_rank(card) == card::get_rank(current_card);
        let same_suit = card::get_suit(card) == card::get_suit(current_card);

        if !same_rank && !same_suit {
            Err(error::Code::IllegalCard.into())
        } else {
            let card_index = deck::find_card(card, game)?;

            game.current_card = card_index as u8;

            card::set_holder(&mut game.deck[card_index], card::PILE_DISCARD);

            if !game::handle_game_over(game) {
                game::next_player(game);

                if card::get_rank(card) == card::RANK_SEVEN {
                    game::draw_card(game).ok();
                    game::draw_card(game).ok();
                } else if card::get_rank(card) == card::RANK_EIGHT {
                    game::next_player(game);
                }
            }

            Ok(())
        }
    }

    pub fn draw_card(game: &mut Game) -> Result<()> {
        let current_card = game.deck[game.current_card as usize];

        let card_index = game
            .deck
            .iter()
            .position(|&candidate| candidate != current_card && card::can_draw(candidate))
            .ok_or(error::Code::NotFound)?;

        card::set_holder(&mut game.deck[card_index], game.current_player as usize);

        Ok(())
    }

    pub fn find_player(game: &Game, key: &Pubkey) -> Result<usize> {
        game.players
            .iter()
            .position(|candidate| candidate.as_ref() == Some(key))
            .ok_or(error::Code::UnknownPlayer.into())
    }

    pub fn has_player(game: &Game, key: &Pubkey) -> bool {
        game.players
            .iter()
            .any(|player| player.as_ref() == Some(key))
    }

    pub fn handle_game_over(game: &mut Game) -> bool {
        let is_game_over = game
            .deck
            .iter()
            .find(|&candidate| card::get_holder(*candidate) == game.current_player as usize)
            .is_none();

        if is_game_over {
            msg!("The game {} is over");

            game.status = Status::Ended;
            game.winner = game.players[game.current_player as usize];
        }

        return is_game_over;
    }

    pub fn next_player(game: &mut Game) -> () {
        let mut player_index = game.current_player as usize;

        for _ in 0..config::PLAYER_LIMIT {
            player_index = (player_index + 1) % config::PLAYER_LIMIT;

            if game.players[player_index].is_some() {
                game.current_player = player_index as u8;
                break;
            }
        }
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

        anchor_lang::system_program::transfer(context, amount)
    }
}

#[program]
pub mod tschain_sepp {
    use super::*;

    const DISCRIMINATOR: usize = 8;

    pub fn abort_game(context: Context<AbortGame>, id: String) -> Result<()> {
        msg!("Aborting game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the signer.

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
            .filter_map(|candidate| candidate.as_ref());

        for player in players {
            let account = context
                .remaining_accounts
                .iter()
                .find(|candidate| candidate.key == player)
                .ok_or(error::Code::UnknownPlayer)?;

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
        )
    }

    pub fn discard_card(context: Context<DiscardCard>, id: String, card: u16) -> Result<()> {
        msg!("Discarding card {} in game {}.", card, id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the signer.

        let player_index = game::find_player(game, context.accounts.signer.key)?;

        if player_index != game.current_player as usize {
            return Err(error::Code::NotAuthorized.into());
        }

        if player_index != deck::find_player(card)? {
            return Err(error::Code::NotAuthorized.into());
        }

        // Check the game status.

        if !matches!(game.status, Status::Started) {
            return Err(error::Code::IllegalStatus.into());
        }

        // Discard the card.

        game::discard_card(card, game)?;

        // Return the winnings to the winner.

        if game.status == Status::Ended {
            stake::give(
                &game.to_account_info(),
                &context.accounts.signer,
                game::count_players(game) as u64 * game.stake,
            )?;
        }

        Ok(())
    }

    pub fn draw_card(context: Context<DrawCard>, id: String) -> Result<()> {
        msg!("Drawing card in game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the signer.

        let player_index = game::find_player(game, context.accounts.signer.key)?;

        if player_index != game.current_player as usize {
            return Err(error::Code::NotAuthorized.into());
        }

        // Check the game status.

        if !matches!(game.status, Status::Started) {
            return Err(error::Code::IllegalStatus.into());
        }

        // Draw the card.

        game::draw_card(game)
    }

    pub fn join_game(context: Context<JoinGame>, id: String) -> Result<()> {
        msg!("Joining game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the signer

        if &game.players[0].unwrap() == context.accounts.signer.key {
            return Err(error::Code::NotAuthorized.into());
        }

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
        )
    }

    pub fn skip_turn(context: Context<SkipTurn>, id: String) -> Result<()> {
        msg!("Skipping turn in game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the signer.

        let player_index = game::find_player(game, context.accounts.signer.key)?;

        if player_index != game.current_player as usize {
            return Err(error::Code::NotAuthorized.into());
        }

        // Check the game status.

        if !matches!(game.status, Status::Started) {
            return Err(error::Code::IllegalStatus.into());
        }

        // Skip the turn.

        game::next_player(game);

        Ok(())
    }

    pub fn start_game(context: Context<StartGame>, id: String) -> Result<()> {
        msg!("Starting game {}.", id);

        let game: &mut Account<'_, Game> = &mut context.accounts.game;

        // Authorize the signer.

        if &game.players[0].unwrap() != context.accounts.signer.key {
            return Err(error::Code::NotAuthorized.into());
        }

        // Check the game status.

        if game.status != Status::Created {
            return Err(error::Code::IllegalStatus.into());
        }

        // Start the game.

        deck::assign_cards(game, context.accounts.signer.key)?;
        deck::assign_holders(game);

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

    #[derive(Accounts)]
    #[instruction(id: String)]
    pub struct DiscardCard<'info> {
        #[account(
            mut,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
        )]
        pub game: Account<'info, Game>,

        pub signer: Signer<'info>,
    }

    #[derive(Accounts)]
    #[instruction(id: String)]
    pub struct DrawCard<'info> {
        #[account(
            mut,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
        )]
        pub game: Account<'info, Game>,

        pub signer: Signer<'info>,
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
    pub struct SkipTurn<'info> {
        #[account(
            mut,
            seeds = ["game".as_ref(), id.as_ref()],
            bump,
        )]
        pub game: Account<'info, Game>,

        pub signer: Signer<'info>,
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
