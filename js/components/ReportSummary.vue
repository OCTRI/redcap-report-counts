<template>
  <div class="panel panel-default">
    <div class="panel-body">
      <div class="container">
        <h3>{{ totalRecords }} - {{ title }}</h3>

        <ul v-if="strategy === 'itemized'" class="list-unstyled">
          <li v-for="(count, label) in summaryData">{{ count }} - {{ label }}</li>
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
    data: Array
  },

  data() {
    return {
      summaryData: []
    };
  },

  mounted() {
    this.summaryData = countBy(this.data);
  }
}
</script>
