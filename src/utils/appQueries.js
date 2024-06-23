export default class AppQueries {
  constructor(queryObject, query) {
    this.queryObject = queryObject;
    this.query = query;
  }

  filter() {
    const cQueryObject = { ...this.queryObject };
    const excluded = ["page", "limit", "sort", "fields"];
    excluded.forEach((el) => delete cQueryObject[el]);

    this.query = this.query.find(
      JSON.parse(
        JSON.stringify(cQueryObject).replace(
          /\b(gte|gt|lte|lt|in|ne|eq)\b/g,
          (match) => `$${match}`,
        ),
      ),
    );
    return this;
  }

  sort() {
    if (this.queryObject.sort) {
      const sortValue = this.queryObject.sort.split(",").join(" ");
      this.query = this.query.sort(sortValue);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryObject.fields) {
      const selectedValue = this.queryObject.fields.split(",").join(" ");
      this.query = this.query.select(selectedValue);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  paginate() {
    if (this.queryObject.paginate) {
      const page = +this.queryObject.page || 1;
      const limit = +this.queryObject.limit || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
  }
}
