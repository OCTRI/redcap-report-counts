<template>
  <div class="container">
    <h3>{{ reportName }}</h3>
    <p>{{ count }}</p>
  </div>
</template>

<script>

/**
 * Renders count for report
 */
export default {
  name: 'ReportSummary',
  inject: ['dataService'],

  props: {
    reportName: String,
    reportId: Number
  },

  data() {
    return {
      count: null
    }
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchReportSummary();
  },

  methods: {
    /**
     * Get report configuration
     */
    fetchReportSummary() {
      const { dataService, reportId } = this;
      return dataService.getReportSummary(reportId)
        .then(this.captureReportSummary);
    },

    /**
     * Capture count for report.
     * @param {Promise->Object[]} responseObject - `dataService.getReportSummary` response
     * @see fetchReportSummary
     * @see data-service.js
     */
    captureReportSummary(responseObject) {
      const { count } = responseObject;
      this.count = count;
    }
  }
}
</script>
