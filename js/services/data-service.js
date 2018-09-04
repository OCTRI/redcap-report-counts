import assert from 'assert';
import axios from 'axios';
import qs from 'qs';

export const ENDPOINTS = {
  REPORT_DATA: 'lib/data.php',
  REPORT_CONFIG: 'lib/settings.php'
};

/**
 * Constructs a service that fetches data for the current project from REDCap.
 *
 * @param {Object} assetUrls - key/value pairs where the key is a relative file path
 *   like `lib/data.php`, and the value is the corresponding external module URL
 *   like `http://localhost/redcap/api/?type=module&prefix=consort-report&page=lib%2Fdata&pid=42`
 * @return {Object} an object encapsulating REDCap HTTP requests
 */
export default function createDataService(assetUrls) {
  assert(assetUrls, 'Asset URL object is required');
  Object.keys(ENDPOINTS).forEach(key => {
    const endpoint = ENDPOINTS[key];
    assert(assetUrls[endpoint], `A URL for ${endpoint} is required`)
  });

  return {
    reportConfigUrl: assetUrls[ENDPOINTS.REPORT_CONFIG],
    reportDataUrl: assetUrls[ENDPOINTS.REPORT_DATA],

    /**
     * Extracts data returned by the request.
     * @param {Promise->Object} response - an axios response object.
     * @return {Promise->Object} the response's data
     * @private
     */
    _extractData(response) {
      return response.data;
    },

    /**
     * Get the current report configuration.
     *
     * @return {Promise ->{report-config: Object[]}} - Returns a promise that resolves to an array of report configurations.
     */
    getReportConfig() {
      return axios(this.reportConfigUrl)
        .then(this._extractData)
        .then(data => {
          const reportConfigArray = data;
          const emptyConfig = Boolean(reportConfigArray && reportConfigArray.length < 1);
          return { reportConfig: emptyConfig ? [] : reportConfigArray };
        });
    },

    /**
     * Get a report summary that includes the total number of records for a report.
     *
     * @param {Number} reportId - the report id.
     * @return {Promise} A promise that resolves to an object with the following keys:
     *   - count: The total number of records for a report.
     */
    getReportSummary(reportId) {
      return axios.post(this.reportDataUrl, qs.stringify({ reportId: reportId }))
        .then(this._extractData);
    },
  };
}
