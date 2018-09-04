<template>
  <div id="consort-report-container" class="container" v-if="!loading">
      <div class="error" v-if="hasError">
        {{ errorMessage }}
        <ul v-if="hasErrorDetails">
          <li v-for="message in errorDetails" :key="message">{{ message }}</li>
        </ul>
      </div>

      <ReportCount v-for="report in reportConfig"
                   :report-name="report.name"
                   :report-id="report.reportId" />
  </div>
</template>

<script>
import ReportCount from './ReportCount';

const messages = {
  warnings: {
    configError: 'Report configuration could not be loaded due to an error: '
  }
};

/**
 * ConsortReport root component.
 */
export default {
  name: 'ConsortReport',
  inject: ['dataService'],

  props: {
    pid: Number
  },

  components: {
    ReportCount
  },

  data() {
    return {
      reportConfig: {},
      loading: true
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchReportConfig();
  },

  methods: {
    /**
     * Get report configuration
     */
    fetchReportConfig() {
      const { dataService } = this;
      return dataService.getReportConfig()
        .then(this.captureReportConfig)
        .catch(this.handleConfigError)
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Sets report configuration from `fetchReportConfig` response.
     * @param {Promise->Object[]} responseArray - `dataService.getReportConfig` response
     * @see fetchReportConfig
     * @see data-service.js
     */
    captureReportConfig(responseArray) {
      const { reportConfig } = responseArray;
      this.reportConfig = reportConfig;
    },

    /**
     * Handles rejection of the `fetchReportConfig` request.
     * @param {Error} reason - the error that triggered rejection.
     */
    handleConfigError(reason) {
      this.errorMessage = messages.warnings.reportConfigError;
      this.errorDetails = [ reason.message ];
    },
  },

  computed: {
    hasError() {
      const { errorMessage } = this;
      return Boolean(errorMessage);
    },

    hasErrorDetails() {
      const { errorDetails } = this;
      return Array.isArray(errorDetails) && errorDetails.length > 0;
    }
  }
}
</script>
