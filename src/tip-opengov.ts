import "@polkadot/api-augment";
import "@polkadot/types-augment";
import { ApiPromise } from "@polkadot/api";
import { KeyringPair } from "@polkadot/keyring/types";
import { blake2AsHex } from "@polkadot/util-crypto";
import assert from "assert";

import { State, TipRequest } from "./types";
import { formatReason, tipSizeToOpenGovTrack } from "./util";

export async function tipOpenGov(opts: {
  state: State;
  api: ApiPromise;
  tipRequest: TipRequest;
  botTipAccount: KeyringPair;
}): Promise<void> {
  const {
    state: { bot },
    api,
    tipRequest,
    botTipAccount,
  } = opts;
  const { contributor } = tipRequest;
  assert(tipRequest.tip.type === "opengov");

  const track = tipSizeToOpenGovTrack(tipRequest);

  const proposalTx = api.tx.utility.batch([
    api.tx.system.remark(formatReason(tipRequest)),
    api.tx.treasury.spend(track.value.toString(), contributor.account.address),
  ]);
  const encodedProposal = proposalTx.method.toHex();
  const proposalHash = blake2AsHex(encodedProposal);

  const preimage_unsub = await api.tx.preimage
    .notePreimage(encodedProposal)
    .signAndSend(botTipAccount, { nonce: -1 }, (result) => {
      if (result.status.isInBlock) {
        bot.log(`Preimage Upload included at blockHash ${result.status.asInBlock.toString()}`);
      } else if (result.status.isFinalized) {
        bot.log(`Preimage Upload finalized at blockHash ${result.status.asFinalized.toString()}`);
        preimage_unsub();
      }
    });

  const referenda_unsub = await api.tx.referenda
    .submit(
      // TODO: There should be a way to set those types properly.
      { Origins: track.track } as any, // eslint-disable-line
      { Lookup: { hash: proposalHash, length: proposalTx.length - 1 } },
      { after: 10 } as any, // eslint-disable-line
    )
    .signAndSend(botTipAccount, { nonce: -1 }, (result) => {
      if (result.status.isInBlock) {
        bot.log(`Tip referendum included at blockHash ${result.status.asInBlock.toString()}`);
      } else if (result.status.isFinalized) {
        bot.log(`Tip referendum finalized at blockHash ${result.status.asFinalized.toString()}`);
        referenda_unsub();
      }
    });
}
