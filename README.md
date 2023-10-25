# substrate-tip-bot

[![GitHub Issue Sync](https://github.com/paritytech/substrate-tip-bot/actions/workflows/github-issue-sync.yml/badge.svg)](https://github.com/paritytech/substrate-tip-bot/actions/workflows/github-issue-sync.yml)

> A GitHub App built with [Probot](https://github.com/probot/probot) that can submit tips on behalf
> of a [Substrate](https://github.com/paritytech/substrate) based network.

# Getting started 🌱

## Usage

This bot relies on GitHub pull request that opt in via a body text comment (or text in profile bio) to specify what Substrate network and address to send tips to.  

Permission to send out tips is limited for a GitHub team, that's configured with `APPROVERS_GH_ORG` + `APPROVERS_GH_TEAM` environment variables. For production, it's [@paritytech/tip-bot-approvers](https://github.com/orgs/paritytech/teams/tip-bot-approvers)  

### Pull request body

```sh
{kusama|polkadot|localtest} address: <SS58 Address>
```

Followed by a _comment_ on said pull request

### Pull request comment

```sh
/tip {small | medium | large | <custom value>}
```

In OpenGov, the tip sizes are translated to specific values as follows:

Size | Value on Kusama | Value on Polkadot
--- | --- | ---
small | 4 KSM | 20 DOT
medium | 16 KSM | 80 DOT
large | 30 KSM | 150 DOT

## Local development 🔧

To use this bot, you'll need to have an `.env` file. Most of the options will
automatically be generated by the GitHub application creation process, but you will also need to add
`ACCOUNT_SEED`, `APPROVERS_GH_ORG` and `APPROVERS_GH_TEAM`.

A reference env file is placed at `.env.example` to copy over

```sh
$ cp .env.example .env
```

### Run polkadot or substrate `localtest` network locally

- Follow readme in https://github.com/paritytech/polkadot#development to run local network. 
  - Among all dependencies, main steps are (from repo): 
    - Compile `cargo b -r`
    - Run `./target/release/polkadot --dev`
  - Alternatively, run a docker container: `docker run -p 9933:9933 -p 9944:9944 parity/polkadot --dev`
- [Create 2 accounts: for "bot" & for "contributor"](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/accounts) 
  - Save the seeds & passwords somewhere
  - Set `ACCOUNT_SEED` as bot's seed in `.env` file  
- Create a team in GitHub for the org that you control, and set `APPROVERS_GH_ORG` and `APPROVERS_GH_TEAM` in `.env` to said org and team
- Transfer some meaningful amount from test accounts (like Alice) to a new bot account (from which bot will send tip to the contributor)

### Create GitHub application for testing

- Note: During app creation save according env variables to `.env` file
- Read [Getting-started](https://gitlab.parity.io/groups/parity/opstooling/-/wikis/Bots/Development/Getting-started) doc to get a sense of how to work with bots
- Follow [creating app](https://gitlab.parity.io/groups/parity/opstooling/-/wikis/Bots/Development/Create-a-new-GitHub-App)
and [installing app](https://gitlab.parity.io/groups/parity/opstooling/-/wikis/Bots/Development/Installing-the-GitHub-App)
guidance
- `WEBHOOK_PROXY_URL` you can generate via https://smee.io/new

### Integration tests

There are semi-automatic integration tests that execute the tip functions against a locally running Polkadot and Kusama nodes.

| Network        | Snippet                                                                                                                                                |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| Local Kusama   | `docker run --rm -p 9901:9901 parity/polkadot:v0.9.42 --chain=kusama-dev --tmp --alice --execution Native --ws-port 9901 --ws-external --force-kusama` |
| Local Polkadot | `docker run --rm -p 9900:9900 parity/polkadot:v0.9.42 --chain=dev --tmp --alice --execution Native --ws-port 9900 --ws-external`                       |

Notes: 
- the node needs to have the OpenGov features - Kusama development chain can be used for that (`--chain=kusama-dev`).
- on macos apple silicon chip, you might see error `docker: no matching manifest for linux/arm64/v8 in the manifest list entries.`, 
  in this case 
  - close docker desktop, 
  - open terminal in Rosetta. 
  - run `open /Applications/Docker.app`
  - add `--platform linux/amd64` flag to docker run command after `--rm`

With that, run the tests:

```bash
yarn test:integration
```

The tests require manual inspection - follow the tip URLs printed in the output.

#### Github app permissions

##### Repository permissions:
- **Issues**: Read-only
  - Allows for interacting with the comments API
- **Pull Requests**: Read & write
  - Allows for posting comments on pull requests
##### Organization permissions
- **Members**: Read-only
  - Related to $ALLOWED_ORGANIZATIONS: this permission enables the bot to request the organization membership of the command's requester even if their membership is private
##### Event subscriptions
- **Issue comment**
  - Allows for receiving events for pull request comments

### Start a bot

After registering and configuring the bot environment, we can run it. We use
[Nodemon](https://nodemon.io/) for hot-reloading, the `probot` package
automatically parses the relevant `.env` values.

```sh
$ yarn start
```

### Create a PR and test it
You'll need 2 gh users: contributor and maintainer (since it's not allowed for contributors to send a tip to themselves)

- From contributor GH account: create a PR and add into PR description `localtest address: <contributor polkadot address>`
- From maintainer GH account: write `/tip small` in comments so the bot sends funds to <contributor polkadot address>

### Docker

To run the bot via Docker, we need to build and then run it like so

```sh
$ docker build -t substrate-tip-bot .
```

```sh
$ docker run \
    -e APP_ID=<app-id> \
    -e PRIVATE_KEY=<pem-value> \
    substrate-tip-bot
```

## End-to-end tests

For the E2E tests, we need a modified Kusama node in a way that speeds up the referenda and treasury.

### Preparing and running Kusama

```bash
git clone https://github.com/paritytech/polkadot.git
cd polkadot
git checkout v0.9.42
git apply ../polkadot.e2e.patch
cargo build --release --locked --features=fast-runtime -p polkadot
./target/release/polkadot --ws-external --rpc-external --no-prometheus --no-telemetry --chain=kusama-dev --tmp --alice --execution Native --ws-port 9901 --force-kusama
```

### Running the E2E tests

```bash
yarn test:e2e
```

Go make a cup of tea, the tests take ~3 minutes (waiting for the various on-chain stages to pass).

## Contributing

If you have suggestions for how substrate-tip-bot could be improved, or want to report a bug, open
an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2021 Parity Technologies <admin@parity.io>
