export enum OrderBy {
  UpdatedFirst = 0,
  NewestFirst = 1,
}

export enum ListingType {
  All = 0,
  ForSale = 1,
  LookingToBuy = 2,
}

export class UrlBuilder {
  private readonly baseUrl: string;
  private params: Record<string, string> = {};

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  addKeyword(keyword: string): this {
    this.params['keywords'] = keyword;
    return this;
  }

  setCostMin(costMin: number): this {
    this.params['cost_min'] = costMin.toString();
    return this;
  }

  setCostMax(costMax: number): this {
    this.params['cost_max'] = costMax.toString();
    return this;
  }

  setType(type: ListingType): this {
    this.params['type'] = type.toString();
    return this;
  }

  setCategoryId(categoryId: number): this {
    this.params['category_id'] = categoryId.toString();
    return this;
  }

  setAdSinceMin(unixTimestamp: number): this {
    this.params['ad_since_min'] = unixTimestamp.toString();
    return this;
  }

  setOrderBy(orderBy: OrderBy): this {
    this.params['orderBy'] = orderBy.toString();
    return this;
  }

  build(): string {
    const queryString = new URLSearchParams(this.params).toString();
    return `${this.baseUrl}?${queryString}`;
  }
}