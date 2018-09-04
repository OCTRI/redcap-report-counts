<template>
  <div class="container">
    <h3>{{ reportName}}</h3>
    <p>{{ count }}</p>
  </div>
</template>

<script>

/**
 * Renders count for report
 */
export default {
  name: 'ReportCount',
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
    this.configPromise = this.fetchReportCount();
  },

  methods: {
    /**
     * Get report configuration
     */
    fetchReportCount() {
      const { dataService, reportId } = this;
      return dataService.getReportCount(reportId)
        .then(this.captureReportCount);
    },

    /**
     * Capture count for report.
     * @param {Promise->Object[]} responseObject - `dataService.getReportCount` response
     * @see fetchReportCount
     * @see data-service.js
     */
    captureReportCount(responseObject) {
      const { count } = responseObject;
      this.count = count;
    }
  }
}
</script>
