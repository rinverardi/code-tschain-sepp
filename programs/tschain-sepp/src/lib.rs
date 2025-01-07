use anchor_lang::prelude::*;

declare_id!("67azxiUdpSwcaHFDZNXQJPc6yi1VrfeazxPnZiNiywhD");

#[program]
pub mod tschain_sepp {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
