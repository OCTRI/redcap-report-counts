export const uuidPattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/i;

/**
 * Mock response from the data service's `getReportFields` method.
 */
export const mockReportFields = [
  { field_name: 'field_1', field_label: 'Field 1' },
  { field_name: 'field_2', field_label: 'Field 2' },
  { field_name: 'field_3', field_label: 'Field 3' }
];

/**
 * Constructs an object that mocks dependencies injected into components. For use with
 * the `mount` and `shallowMount` test renderers.
 *
 * @return {Object} mock services to inject
 * @see https://vuejs.org/v2/api/#provide-inject
 * @see https://vue-test-utils.vuejs.org/api/options.html#provide
 */
export function createProvideObject() {
  return {
    assetUrls: {},
    dataService: {
      getReports() {
        return Promise.resolve([
          { reportId: 1, 'title': 'Report 1' },
          { reportId: 2, 'title': 'Report 2' },
          { reportId: 3, 'title': 'Report 3' }
        ]);
      },

      saveReportSummary(reportSummary) {
        return Promise.resolve([reportSummary]);
      },

      getReportFields() {
        return Promise.resolve(mockReportFields);
      }
    }
  };
}
