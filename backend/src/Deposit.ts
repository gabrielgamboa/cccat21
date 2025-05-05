import AccountDAO from "./AccountDAO";

export default class Deposit {
  private validAssets = ["BTC", "USD"];

  constructor(private readonly accountDAO: AccountDAO) {}

  async execute(input: any): Promise<any> {
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
      await this.accountDAO.saveAccountAsset(input);
      return;
    }

    const quantityUpdated = parseFloat(accountAsset.quantity) + input.quantity;
    input.quantity = quantityUpdated;

    await this.accountDAO.saveAccountAsset(input);
  }
}
