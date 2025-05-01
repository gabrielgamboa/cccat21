import AccountDAO from "./AccountDAO";

export default class Deposit {
  constructor(private readonly accountDAO: AccountDAO) {}

  async execute(input: any): Promise<any> {
    const accountExists = await this.accountDAO.getAccountById(input.accountId);
    if (!accountExists) throw new Error("Account not found");
    await this.accountDAO.saveAccountAsset(input);
  }
}
