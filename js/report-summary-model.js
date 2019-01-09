import ReportSummaryConfig from './report-summary-config';

export default class ReportSummaryModel {
  /**
   * Constructs a `ReportSummaryModel` with property values copied from another object.
   *
   * @param {Object} obj - an object to extract property values from.
   * @return {ReportSummaryModel}
   */
  static fromObject(obj) {
    return new ReportSummaryModel(
      obj.id,
      obj.title,
      obj.reportId,
      obj.strategy,
      obj.bucketBy,
      obj.bucketByLabel,
      obj.data,
      obj.totalRecords,
      obj.reportExists,
      obj.bucketByFieldExists
    );
  }

  /**
   * Constructs a new `ReportSummaryModel`.
   *
   * NOTE: You probably want to use `ReportSummaryModel.fromObject()` instead.
   *
   * @param {String} id - report summary UUID.
   * @param {String} title - report summary title.
   * @param {Number} reportId - ID of the REDCap report used for data.
   * @param {String} strategy - summarization strategy. Should be one of the constants from
   *   `report-summary.js`.
   * @param {String} bucketBy - field to bucket itemized counts by. Only valid when `strategy`
   *   is `STRATEGY.ITEMIZED`.
   * @param {String} bucketByLabel - string label REDCap displays for the `bucketBy` field.
   * @param {String[]} data - array of `bucketBy` field values to aggregate.
   * @param {Number} totalRecords - total number of records.
   * @param {Boolean} reportExists - `true` if the report exists, otherwise `false` indicating 
   *   the report is inaccessible or deleted.
   * @param {Boolean} bucketByFieldExists = `true` if the field exists, otherwise `false`.
   * @return {ReportSummaryModel}
   */
  constructor(id, title, reportId, strategy, bucketBy, bucketByLabel, data, totalRecords, reportExists, bucketByFieldExists) {
    this.id = id;
    this.title = title;
    this.reportId = reportId;
    this.strategy = strategy;
    this.bucketBy = bucketBy;
    this.bucketByLabel = bucketByLabel;
    this.data = data;
    this.totalRecords = totalRecords;
    this.reportExists = reportExists;
    this.bucketByFieldExists = bucketByFieldExists;
  }

  /**
   * @property {ReportSummaryConfig} config - configuration for this summary
   */
  get config() {
    const { id, title, reportId, strategy, bucketBy } = this;
    return new ReportSummaryConfig(id, title, reportId, strategy, bucketBy);
  }
}