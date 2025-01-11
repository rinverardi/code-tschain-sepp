import {
  AccountClient,
  AnchorError,
  AnchorProvider,
  BN,
  IdlAccounts,
  Program,
  setProvider
} from "@coral-xyz/anchor";

import { assert } from "chai";
import { randomBytes } from "node:crypto";

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey
} from "@solana/web3.js";

import IDL from "@tschain-sepp/idl/tschain_sepp.json";
import { TschainSepp } from "@tschain-sepp/types/tschain_sepp";

type GameAccount = IdlAccounts<TschainSepp>["game"];

const STAKE_LARGE = new BN(LAMPORTS_PER_SOL * 10);
const STAKE_SMALL = new BN(LAMPORTS_PER_SOL / 10);

async function airdrop(
  connection: Connection,
  publicKey: PublicKey
) {
  const signature = await connection.requestAirdrop(
    publicKey,
    LAMPORTS_PER_SOL
  );

  const latestBlockhash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature,
  });
}

async function getBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  const balance = await connection.getBalance(publicKey);

  return balance / LAMPORTS_PER_SOL;
}

async function getGame(
  gameAccount: AccountClient<TschainSepp>,
  gameId: string,
  program: Program<TschainSepp>
): Promise<GameAccount> {
  const [address, _] = PublicKey.findProgramAddressSync(
    [Buffer.from("game"), Buffer.from(gameId)],
    program.programId
  );

  return await gameAccount.fetch(address);
}

function randomId(): string {
  return randomBytes(4).toString("hex");
}

describe("pre-game scenarios", () => {
  setProvider(AnchorProvider.local());

  const program = new Program(IDL as TschainSepp);

  it("abort game with one player", async () => {
    const gameId = randomId();
    const player = Keypair.generate();

    await airdrop(program.provider.connection, player.publicKey);

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // The game master aborts the game.

    await program.methods
      .abort(gameId)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // Check the balance of the game master.

    const balance = await getBalance(
      program.provider.connection,
      player.publicKey
    );

    assert.isAbove(balance, 0.99);
    assert.isBelow(balance, 1.01);

    // Check the status of the game.

    const game = await getGame(program.account.game, gameId, program);

    assert.isDefined(game.status.aborted);
  });

  it("abort game with two players", async () => {
    const gameId = randomId();

    const players = [
      Keypair.generate(),
      Keypair.generate(),
    ];

    for (const player of players) {
      await airdrop(program.provider.connection, player.publicKey);
    }

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: players[0].publicKey })
      .signers([players[0]])
      .rpc();

    // The game participant joins the game.

    await program.methods
      .join(gameId)
      .accounts({ signer: players[1].publicKey })
      .signers([players[1]])
      .rpc();

    // The game master aborts the game.

    await program.methods
      .abort(gameId)
      .accounts({ signer: players[0].publicKey })
      .remainingAccounts([
        {
          pubkey: players[1].publicKey,
          isWritable: true,
          isSigner: false,
        },
      ])
      .signers([players[0]])
      .rpc();

    // Check the balance of the game master.

    const balance0 = await getBalance(
      program.provider.connection,
      players[0].publicKey
    );

    assert.isAbove(balance0, 0.99);
    assert.isBelow(balance0, 1.01);

    // Check the balance of the game participant.

    const balance1 = await getBalance(
      program.provider.connection,
      players[1].publicKey
    );

    assert.isAbove(balance1, 0.99);
    assert.isBelow(balance1, 1.01);

    // Check the status of the game.

    const game = await getGame(program.account.game, gameId, program);

    assert.isDefined(game.status.aborted);
  });

  it("create game", async () => {
    const gameId = randomId();
    const player = Keypair.generate();

    await airdrop(program.provider.connection, player.publicKey);

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // Check the balance of the game master.

    const balance = await getBalance(
      program.provider.connection,
      player.publicKey
    );

    assert.isAbove(balance, 0.89);
    assert.isBelow(balance, 0.91);

    // Check the status of the game.

    const game = await getGame(program.account.game, gameId, program);

    assert.isDefined(game.status.created);
  });

  it("create game with insufficient funds", async () => {
    const gameId = randomId();
    const player = Keypair.generate();

    await airdrop(program.provider.connection, player.publicKey);

    // The game master creates the game.

    let caught = false;

    try {
      await program.methods
        .create(gameId, STAKE_LARGE)
        .accounts({ signer: player.publicKey })
        .signers([player])
        .rpc();
    } catch (error) {
      const programError = AnchorError.parse(error.errorLogs);

      caught = programError.error.errorCode.code == "InsufficientFunds";
    }

    assert.isTrue(caught);
  });

  it("join game", async () => {
    const gameId = randomId();

    const players = [
      Keypair.generate(),
      Keypair.generate(),
    ];

    for (const player of players) {
      await airdrop(program.provider.connection, player.publicKey);
    }

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: players[0].publicKey })
      .signers([players[0]])
      .rpc();

    // The game participant joins the game.

    await program.methods
      .join(gameId)
      .accounts({ signer: players[1].publicKey })
      .signers([players[1]])
      .rpc();

    // Check the balance of the game participant.

    const balance = await getBalance(
      program.provider.connection,
      players[1].publicKey
    );

    assert.isAbove(balance, 0.89);
    assert.isBelow(balance, 0.91);
  });

  it("re-create game", async () => {
    const gameId = randomId();

    const player = Keypair.generate();

    await airdrop(program.provider.connection, player.publicKey);

    // The game master creates the game for the first time.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // The game master creates the game for the second time.

    let caught = false;

    try {
      await program.methods
        .create(gameId, STAKE_SMALL)
        .accounts({ signer: player.publicKey })
        .signers([player])
        .rpc();
    } catch (error) {
      caught = error.logs.some((log: string) => log.includes("already in use"));
    }

    assert.isTrue(caught);
  });

  it("re-join game as game master", async () => {
    const gameId = randomId();

    const player = Keypair.generate();

    await airdrop(program.provider.connection, player.publicKey);

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // The game master joins the game.

    let caught = false;

    try {
      await program.methods
        .join(gameId)
        .accounts({ signer: player.publicKey })
        .signers([player])
        .rpc();
    } catch (error) {
      const programError = AnchorError.parse(error.errorLogs);

      caught = programError.error.errorCode.code == "NotAuthorized";
    }

    assert.isTrue(caught);
  });

  it("re-join game as game participant", async () => {
    const gameId = randomId();

    const players = [
      Keypair.generate(),
      Keypair.generate(),
    ];

    for (const player of players) {
      await airdrop(program.provider.connection, player.publicKey);
    }

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: players[0].publicKey })
      .signers([players[0]])
      .rpc();

    // The game participant joins the game for the first time.

    await program.methods
      .join(gameId)
      .accounts({ signer: players[1].publicKey })
      .signers([players[1]])
      .rpc();

    // The game participant joins the game for the second time.

    let caught = false;

    try {
      await program.methods
        .join(gameId)
        .accounts({ signer: players[1].publicKey })
        .signers([players[1]])
        .rpc();
    } catch (error) {
      const programError = AnchorError.parse(error.errorLogs);

      caught = programError.error.errorCode.code == "AlreadyExists";
    }

    assert.isTrue(caught);
  });

  it("start game", async () => {
    const gameId = randomId();

    const player = Keypair.generate();

    await airdrop(program.provider.connection, player.publicKey);

    // The game master creates the game.

    await program.methods
      .create(gameId, STAKE_SMALL)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // The game master starts the game.

    await program.methods
      .start(gameId)
      .accounts({ signer: player.publicKey })
      .signers([player])
      .rpc();

    // Check the status of the game.

    const game = await getGame(program.account.game, gameId, program);

    assert.isDefined(game.status.started);
  });
});
