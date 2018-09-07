<template>
  <div id="consort-report-container" class="container">
    <div class="error" v-if="hasError">
      {{ errorMessage }}
      <ul v-if="hasErrorDetails">
        <li v-for="message in errorDetails" :key="message">{{ message }}</li>
      </ul>
    </div>

    <div class="alert alert-info" role="alert" v-if="loading">
      Loading consort report, please wait...
    </div>
    <div v-if="!loading">
      <ReportSummary v-for="summary in reportSummaries"
                    :key="summary.reportId"
                    :title="summary.title"
                    :strategy="summary.strategy"
                    :summaryData="summary.data"
                    :total-records="summary.totalRecords" />
    </div>
  </div>
</template>

<script>
import ReportSummary from './ReportSummary';

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

  components: {
    ReportSummary
  },

  data() {
    return {
      reportSummaries: [],
      loading: true
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchReportSummary();
  },

  methods: {
    /**
     * Get a report summary.
     */
    fetchReportSummary() {
      const { dataService } = this;
      return dataService.fetchReportSummary()
        .then(this.captureReportSummaries)
        .catch(this.handleConfigError)
        .finally(() => {
          this.loading = false;
        });
    },

    /**
     * Sets report summaries from `fetchReportSummary` response.
     * @param {Promise->Object[]} responseArray - `dataService.fetchReportSummary` response
     */
    captureReportSummaries(responseArray) {
      this.reportSummaries = responseArray;
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
