import { KeyringPair } from "@polkadot/keyring/types";
import { BN } from "@polkadot/util";
import { Probot } from "probot";
import { Polkassembly } from "./polkassembly/polkassembly";

export type TipNetwork = "localkusama" | "localpolkadot" | "kusama" | "polkadot";

export type TipType = "treasury" | "opengov";
export type TipSize = "small" | "medium" | "large";
export type OpenGovTrack = { trackNo: number; trackName: string };
export const SmallTipperTrack: OpenGovTrack = { trackNo: 30, trackName: "SmallTipper" };
export const BigTipperTrack: OpenGovTrack = { trackNo: 31, trackName: "BigTipper" };

export type ChainConfig = {
  providerEndpoint: string;
  /**
   * This is dependent on which pallets the chain has.
   * The preferred type is OpenGov,
   * but some chains (Polkadot) do not support it (yet).
   */
  tipType: TipType;
  decimals: number;
  currencySymbol: string;
  smallTipperMaximum: number;
  bigTipperMaximum: number;
  namedTips: Record<TipSize, number>;
};

export type ContributorAccount = {
  address: string;
  network: TipNetwork;
};

export type Contributor = {
  githubUsername: string;
  account: ContributorAccount;
};

export type State = {
  allowedGitHubOrg: string;
  allowedGitHubTeam: string;
  botTipAccount: KeyringPair;
  bot: Probot;
  polkassembly?: Polkassembly | undefined
};

export type TipRequest = {
  contributor: Contributor;
  pullRequestNumber: number;
  pullRequestRepo: string;
  tip: {
    size: TipSize | BN;
  };
};

export type TipResult = { success: true; tipUrl: string } | { success: false; errorMessage?: string };
