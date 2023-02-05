import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { findRewardDistributorId } from "../src/programs/rewardDistributor/pda";

(async () => {
  const id = findRewardDistributorId(
    new PublicKey("4TXbeAkuFjkTK9RFbzqUU3DWm1f1z8mat9CX4Yd9agWo"),
    new BN(0)
  );
  console.log(id.toString());
})();
