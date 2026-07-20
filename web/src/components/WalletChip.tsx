import { auth } from "@clerk/nextjs/server";
import BucksChip from "./BucksChip";
import { clerkEnabled } from "@/lib/clerk";
import { getWallet, DAILY_CLAIM } from "@/lib/economy";

/* Server half: fetches the wallet, renders v4's BucksChip. */
export default async function WalletChip() {
  if (!clerkEnabled) return null;
  const { userId } = await auth();
  if (!userId) return null;

  const wallet = await getWallet(userId).catch(() => null);
  if (!wallet) return null;
  const w = wallet.data;

  const today = new Date().toISOString().slice(0, 10);
  const claimable = !w.last_claim_at || w.last_claim_at.slice(0, 10) !== today;

  return <BucksChip balance={w.balance} streak={w.streak} claimable={claimable} dailyClaim={DAILY_CLAIM} />;
}
