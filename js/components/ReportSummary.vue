<template>
  <div class="panel panel-default">
    <div class="panel-body">
      <div class="container">
        <h3>{{ totalRecords }} - {{ title }}</h3>

        <ul v-if="isItemized" class="list-unstyled">
          <li v-for="(count, label) in summaryCounts" :key="label">{{ count }} - {{ label }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import countBy from 'lodash/countBy';

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  props: {
    title: String,
    totalRecords: Number,
    strategy: String,
    summaryData: Array
  },

  computed: {
    isItemized() {
      return this.strategy === 'itemized';
    },

    summaryCounts() {
      return countBy(this.summaryData);
    }
  }
}
</script>
