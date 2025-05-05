import AccountDAO from "./AccountDAO";

export class Withdraw {
  private validAssets = ["BTC", "USD"];
  constructor(private readonly accountDAO: AccountDAO) {}

  async execute(input: any) {
    if (input.quantity <= 0) throw new Error("Invalid quantity");
    const haveValidAsset = this.validAssets.includes(input.assetId);
    if (!haveValidAsset) throw new Error("Invalid asset");
    const accountExists = await this.accountDAO.getAccountById(input.accountId);
    if (!accountExists) throw new Error("Account not found");
    const accountAsset = await this.accountDAO.getAccountAssetBalance(
      input.accountId,
      input.assetId
    );

    if (!accountAsset) {
      throw new Error("Account asset not found");
    }

    const quantityUpdated = parseFloat(accountAsset.quantity) - input.quantity;
    if (quantityUpdated < 0) throw new Error("Insufficient funds");

    input.quantity = quantityUpdated;
    console.log({ input });

    await this.accountDAO.saveAccountAsset(input);
  }
}
