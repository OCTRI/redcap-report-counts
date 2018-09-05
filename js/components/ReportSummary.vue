<template>
  <div class="container">
    <h3>{{ reportName }}</h3>
    <p>{{ totalRecords }}</p>
  </div>
</template>

<script>

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  props: {
    reportName: String,
    totalRecords: Number
  }
}
</script>
