<template>
  <div class="panel panel-default">
    <div class="panel-body">
      <div class="container">
        <h3>{{ totalRecords }} - {{ title }}</h3>
      </div>
    </div>
  </div>
</template>

<script>

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  props: {
    title: String,
    totalRecords: Number
  }
}
</script>
