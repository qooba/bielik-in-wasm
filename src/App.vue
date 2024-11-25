<script lang="ts">
import Thumbellama from './components/Thumbellama.vue'
import { defineComponent, onMounted } from 'vue';
import { parseMarkdown } from '@/mdcommon';

export default defineComponent({
  name: 'App',
  components: {
    Thumbellama
  },
  setup(props, { emit }) {

    onMounted(() => {
    });


    return {
      parseMarkdown,
    };
  }
});
</script>

<template>
  <v-container>
    <br />
    <v-row justify="center">
      <v-col cols="12" sm="12">
        <div class="text-h4 text-center font-weight-bold main-title" v-html="''"></div>
      </v-col>
    </v-row>
    <br />
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <Thumbellama></Thumbellama>
      </v-col>
    </v-row>
  </v-container>
  <br />

</template>

<style scoped>
.main-title {
  font-family: 'Fontdiner Swanky' !important;
  line-height: 1.5;
}

.center-image {
  display: block;
  margin-left: auto;
  margin-right: auto;
}
</style>
