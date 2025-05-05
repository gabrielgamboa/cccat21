import pgp from "pg-promise";

export default interface AccountDAO {
  saveAccount(account: any): Promise<void>;
  getAccountById(accountId: string): Promise<any>;
  saveAccountAsset(input: any): Promise<void>;
  getAccountAssets(accountId: string): Promise<any>;
  getAccountAssetBalance(accountId: string, assetId: string): Promise<any>;
}

export class AccountDAODatabase implements AccountDAO {
  async saveAccount(account: any): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ]
    );
    await connection.$pool.end();
  }

  async getAccountById(accountId: string): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountData] = await connection.query(
      "select * from ccca.account where account_id = $1",
      [accountId]
    );
    await connection.$pool.end();
    return accountData;
  }

  async saveAccountAsset(input: any): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ccca.account_asset (account_id, asset_id, quantity) values ($1, $2, $3)",
      [input.accountId, input.assetId, input.quantity]
    );
    await connection.$pool.end();
  }

  async getAccountAssets(accountId: string): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const accountAssetsData = await connection.query(
      "select * from ccca.account_asset where account_id = $1",
      [accountId]
    );
    await connection.$pool.end();
    return accountAssetsData;
  }

  async getAccountAssetBalance(
    accountId: string,
    assetId: string
  ): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [accountAssetData] = await connection.query(
      "select * from ccca.account_asset where account_id = $1 and asset_id = $2",
      [accountId, assetId]
    );
    await connection.$pool.end();
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
