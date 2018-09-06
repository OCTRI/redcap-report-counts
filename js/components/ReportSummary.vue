<template>
  <div class="panel panel-default">
    <div class="panel-body">
      <div class="container">
        <h3>{{ totalRecords }} - {{ title }}</h3>
        <div v-if="strategy === 'itemized'">
          {{ itemizedData }}
        </div>
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
    totalRecords: Number,
    strategy: String,
    data: Array
  },

  data() {
    return {
      itemizedData: []
    };
  },

  mounted() {
    this.itemizedData = this.itemizeData();
  },

  methods: {
    itemizeData() {
      return this.data;
    }
  }
}
</script>
