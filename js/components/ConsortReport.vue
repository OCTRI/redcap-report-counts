<template>
  <div class="container">
    Hello World From Vue
  </div>
</template>

<script>
/**
 * ConsortReport root component.
 */
export default {
  name: 'ConsortReport',

  props: {
    pid: Number
  },

  components: {
  },

  data() {
    return {
      config: {},
      loading: true
    };
  },

  mounted() {
    // capture the promise to synchronize tests
    this.configPromise = this.fetchConfig();
  },

  methods: {
  },

  computed: {
  }
}
</script>
