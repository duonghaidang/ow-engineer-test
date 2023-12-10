import { bidAsk, curve, spotUniform } from "@/constants/liquidity-config";
import {
  LiquidityDistribution,
  LiquidityDistributionParams,
} from "@/types/pair";
import { ethers } from "ethers";

export const getLiquidityConfig = (
  distribution: LiquidityDistribution
): LiquidityDistributionParams => {
  switch (distribution) {
    case LiquidityDistribution.SPOT:
      return spotUniform;
    case LiquidityDistribution.CURVE:
      return curve;
    case LiquidityDistribution.BID_ASK:
      return bidAsk;
  }
};

const aa = {
  activeIdDesired: "8375355",
  amountX: "100000000000000000000",
  amountXMin: "99500000000000000000",
  amountY: "10000000",
  amountYMin: "9950000",
  binStep: 15,
  deadline: 1702199406,
  deltaIds: ["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5"],
  distributionX: [
    "0",
    "0",
    "0",
    "0",
    "0",
    "90909000000000000",
    "181818000000000000",
    "181818000000000000",
    "181818000000000000",
    "181818000000000000",
    "181818000000000000",
  ],
  distributionY: [
    "181818000000000000",
    "181818000000000000",
    "181818000000000000",
    "181818000000000000",
    "181818000000000000",
    "90909000000000000",
    "0",
    "0",
    "0",
    "0",
    "0",
  ],
  gasLimit: 500000,
  gasPrice: 50000,
  idSlippage: "5",
  refundTo: "0xE94bC997f8Ad62f29683BA6dd1cE7d3B8C5fd315",
  to: "0xE94bC997f8Ad62f29683BA6dd1cE7d3B8C5fd315",
  tokenX: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  tokenY: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};
