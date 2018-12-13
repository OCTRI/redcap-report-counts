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
      obj.summaryData,
      obj.totalRecords
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
   * @param {Object[]} summaryData - ???
   * @param {Number} totalRecords - total number of records.
   * @return {ReportSummaryModel}
   */
  constructor(id, title, reportId, strategy, bucketBy, bucketByLabel, summaryData, totalRecords) {
    this.id = id;
    this.title = title;
    this.reportId = reportId;
    this.strategy = strategy;
    this.bucketBy = bucketBy;
    this.bucketByLabel = bucketByLabel;
    this.summaryData = summaryData;
    this.totalRecords = totalRecords;
  }

  /**
   * @property {ReportSummaryConfig} config - configuration for this summary
   */
  get config() {
    const { id, title, reportId, strategy, bucketBy } = this;
    return new ReportSummaryConfig(id, title, reportId, strategy, bucketBy);
  }
}