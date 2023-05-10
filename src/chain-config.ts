import { ChainConfig, TipNetwork, TipType } from "./types";

type Constants = Omit<ChainConfig, "providerEndpoint" | "tipUrl">;
const kusamaConstants: Constants = {
  decimals: 12,
  currencySymbol: "KSM",
  tipType: "opengov",

  /**
   * Source of the calculation:
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/kusama/src/governance/origins.rs#L172
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/kusama/constants/src/lib.rs#L29
   */
  smallTipperMaximum: 8.33,

  /**
   * Source of the calculation:
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/kusama/src/governance/origins.rs#L173
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/kusama/constants/src/lib.rs#L31
   */
  bigTipperMaximum: 33.33,

  /**
   * These are arbitrary values, can be changed at any time.
   */
  namedTips: { small: 2, medium: 5, large: 8 },
};

const polkadotConstants: Constants = {
  decimals: 10,
  currencySymbol: "DOT",
  tipType: "treasury",

  /**
   * Source of the calculation:
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/polkadot/src/governance/origins.rs#L143
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/polkadot/constants/src/lib.rs#L31
   */
  smallTipperMaximum: 250,

  /**
   * Source of the calculation:
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/polkadot/src/governance/origins.rs#L144
   * https://github.com/paritytech/polkadot/blob/e164da65873f11bf8c583e81f6d82c21b005cfe4/runtime/polkadot/constants/src/lib.rs#L32
   */
  bigTipperMaximum: 1000,

  /**
   * These are arbitrary values, can be changed at any time.
   */
  namedTips: { small: 20, medium: 80, large: 150 },
};

export function getChainConfig(network: TipNetwork): ChainConfig {
  const getTipUrl = (providerEndpoint: string, type: TipType): string => {
    const tipUrlPath = type === "opengov" ? "referenda" : "treasury/tips";
    return `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(providerEndpoint)}#/${tipUrlPath}`;
  };

  switch (network) {
    case "localkusama": {
      const providerEndpoint = "ws://127.0.0.1:9901";
      const constants = kusamaConstants;
      return { providerEndpoint, tipUrl: getTipUrl(providerEndpoint, constants.tipType), ...constants };
    }
    case "localpolkadot": {
      const providerEndpoint = "ws://127.0.0.1:9900";
      const constants = polkadotConstants;
      return { providerEndpoint, tipUrl: getTipUrl(providerEndpoint, constants.tipType), ...constants };
    }
    case "polkadot": {
      const providerEndpoint = "wss://rpc.polkadot.io";
      const constants = polkadotConstants;
      return { providerEndpoint, tipUrl: getTipUrl(providerEndpoint, constants.tipType), ...constants };
    }
    case "kusama": {
      const providerEndpoint = `wss://${network}-rpc.polkadot.io`;
      const constants = kusamaConstants;
      return { providerEndpoint, tipUrl: getTipUrl(providerEndpoint, constants.tipType), ...constants };
    }
    default: {
      const exhaustivenessCheck: never = network;
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `Network is not handled properly in tipUser: ${exhaustivenessCheck}`,
      );
    }
  }
}
