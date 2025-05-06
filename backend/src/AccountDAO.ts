import { query } from "./db";

export default interface AccountDAO {
  saveAccount(account: any): Promise<void>;
  getAccountById(accountId: string): Promise<any>;
  saveAccountAsset(input: any): Promise<void>;
  getAccountAssets(accountId: string): Promise<any>;
  getAccountAssetBalance(accountId: string, assetId: string): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {
  async saveAccount(account: any): Promise<void> {
    await query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ]
    );
  }

  async getAccountById(accountId: string): Promise<any> {
    const [accountData] = await query(
      "select * from ccca.account where account_id = $1",
      [accountId]
    );
    return accountData;
  }

  async saveAccountAsset(input: any): Promise<void> {
    await query(
      "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
      [input.accountId, input.assetId, input.quantity]
    );
  }

  async getAccountAssets(accountId: string): Promise<any> {
    const accountAssetsData = await query(
      "select * from ccca.account_asset where account_id = $1",
      [accountId]
    );
    return accountAssetsData;
  }

  async getAccountAssetBalance(
    accountId: string,
    assetId: string
  ): Promise<any> {
    const [accountAssetData] = await query(
      "select * from ccca.account_asset where account_id = $1 and asset_id = $2",
      [accountId, assetId]
    );
    return accountAssetData;
  }
}

export class AccountDAOMemory implements AccountDAO {
  accounts: any = [];
  assets: any = [];

  async saveAccount(account: any): Promise<void> {
    this.accounts.push(account);
  }

  async getAccountById(accountId: string): Promise<any> {
    const account = this.accounts.find(
      (account: any) => account.accountId === accountId
    );
    return account;
  }

  async saveAccountAsset(input: any): Promise<void> {
    this.assets.push(input);
  }

  async getAccountAssets(accountId: string): Promise<any> {
    return this.assets.filter((asset: any) => asset.accountId === accountId);
  }

  async getAccountAssetBalance(
    accountId: string,
    assetId: string
  ): Promise<any> {
    return this.assets.find(
      (asset: any) => asset.accountId === accountId && asset.assetId === assetId
    );
  }
}
