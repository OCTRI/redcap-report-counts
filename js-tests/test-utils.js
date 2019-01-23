export const uuidPattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/i;

/**
 * Mock response from the data service's `getReports` method.
 */
export const mockReports = [
  { reportId: 1, 'title': 'Report 1' },
  { reportId: 2, 'title': 'Report 2' },
  { reportId: 3, 'title': 'Report 3' }
];

/**
 * Mock response from the data service's `getReportFields` method.
 */
export const mockReportFields = [
  { field_name: 'field_1', field_label: 'Field 1' },
  { field_name: 'field_2', field_label: 'Field 2' },
  { field_name: 'field_3', field_label: 'Field 3' }
];

/**
 * Function to build response from the data service's `fetchSecurityConfig` method.
 * @param {Boolean} hasReportsRights - true to indicate the user has reports rights
 */
export const buildMockSecurityConfig = function(hasReportsRights=false) {
  return {
    hasReportsRights: hasReportsRights
  }
};

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
        return Promise.resolve(mockReports);
      },

      fetchReportSummary() {
        return Promise.resolve([]);
      },

      saveReportSummary(reportSummary) {
        return Promise.resolve([reportSummary]);
      },

      saveReportSummaries(reportSummaries) {
        return Promise.resolve([]);
      },

      getReportFields() {
        return Promise.resolve(mockReportFields);
      },

      fetchSecurityConfig() {
        return Promise.resolve(buildMockSecurityConfig(true));
      }
    }
  };
}

/**
 * Waits for a selector to appear in a wrapper. Allows testing nodes created by async code
 * like simulated Ajax requests.
 *
 * @param {Wrapper} wrapper - Vue test utils node wrapper
 * @param {String} selector - CSS selector string or Vue component class
 * @param {Number} turns - number of run loop turns to wait, defaults to 5
 */
export const waitForSelector = async (wrapper, selector, turns = 5) => {
  for (let i = 0; i < turns; i++) {
    if (wrapper.findAll(selector).length) {
      return Promise.resolve(true);
    }

    // wait for the next turn of the run loop
    const nextTickPromise = new Promise(resolve => {
      wrapper.vm.$nextTick(() => {
        resolve();
      });
    });
    await nextTickPromise;
  }

  return Promise.reject(new Error(`Selector "${selector}" was never found`));
};
