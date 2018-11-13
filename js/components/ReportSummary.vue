<template>
  <div class="card mb-3 report-summary" :data-index="index">
    <div class="card-body">
      <div class="container">
        <h3 class="card-title mb-0">{{ totalRecords }} - {{ title }}</h3>
        <div class="summary-controls mb-3">
          <a class="delete" v-if="canDelete" @click="deleteSummary">Delete <i class="far fa-trash-alt"></i></a>
        </div>
        <ul v-if="isItemized" class="list-unstyled">
          <li v-for="(count, label) in summaryCounts" :key="label">{{ count }} - {{ label }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import countBy from 'lodash/countBy';
import { STRATEGY } from '../report-strategy';

/**
 * Renders report summary.
 */
export default {
  name: 'ReportSummary',

  props: {
    index: Number,
    title: String,
    totalRecords: Number,
    strategy: String,
    summaryData: Array
  },

  methods: {
    deleteSummary() {
      if (confirm('Permanently delete this summary?')) {
        this.$emit('deleteSummary', this.index);
      }
    },

    canDelete() {
      // TODO: implement REDDEV-595
      return true;
    }
  },

  computed: {
    isItemized() {
      return this.strategy === STRATEGY.ITEMIZED;
    },

    summaryCounts() {
      return countBy(this.summaryData);
    }
  }
}
</script>
