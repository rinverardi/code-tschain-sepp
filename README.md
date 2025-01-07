# Tschain Sepp

## Development

### Prerequisites

Set up your developer tools as follows:

	$ uname -mors
	Linux 6.12.7-arch1-1 x86_64 GNU/Linux
	
	$ anchor --version
	anchor-cli 0.30.1
	
	$ cargo --version
	cargo 1.79.0 (ffa9cf99a 2024-06-03)
	
	$ node --version
	v23.4.0
	
	$ rustc --version
	rustc 1.79.0 (129f3b996 2024-06-10)
	
	$ yarn --version
	1.22.22

Set up your developer wallet as follows:

	$ solana-keygen new
	
	$ solana config set --url devnet
	$ solana airdrop 2

[Use the official faucet for additional airdrops.](https://faucet.solana.com)

### Hacking the Backend

Test the on-chain program:

	$ anchor test

Deploy the on-chain program:

	$ anchor build
	$ anchor deploy

Close the on-chain program:

	$ solana program close {program-address} --bypass-warning

Show the address of the on-chain program:

	$ solana address -k target/deploy/tschain_sepp-keypair.json

### Hacking the Frontend

Install the dependencies:

	$ yarn install

Check the code style:

	$ yarn prettier:check

Fix the code style:

	$ yarn prettier:fix

Run the web app for development purposes:

	$ yarn next dev

Run the web app for production purposes:

	$ yarn next build
	$ yarn next start

[Open the web app in your browser.](http://localhost:3000)
