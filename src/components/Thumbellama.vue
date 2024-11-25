<script lang="ts">
import { defineComponent, ref, onMounted, onUpdated } from 'vue';
import Assistant from '@/llmcommon';
import { getCookie, parseBool, setCookie } from '@/common';
import { parseMarkdown, highlight } from '@/mdcommon';


export default defineComponent({
  name: 'Editor',
  setup() {

    const editor: any = ref(null);
    const code: any = ref(null);
    const editorCreated: any = ref(false);

    const running: any = ref(false);
    const loading = ref(true);

    const results: any = ref("");
    const error: any = ref("");
    const done: any = ref(false);

    const assistantDialog = ref(false);
    const assistantEnabled = ref(false);
    const assistant = new Assistant()
    const assistantConversation: any = ref([]);
    //const assistantModel: any = ref("Bielik-11B-v2.3-Instruct-q3f32_1");

    const assistantModel: any = ref("Bielik-7B-Instruct-v0.1-q4f32_1");

    const assistantChange = async () => {
      await assistant.reload(assistantModel.value);
      assistantEnabled.value = true;
      assistantDialog.value = false;
    }

    const showAssistantDialog = () => {
      assistantDialog.value = true;
    }

    onMounted(async () => {
    });

    onUpdated(() => {
    });

    const explainCode = async () => {
      console.log(code.value);
      let len = assistantConversation.value.length;
      const conversationItem = {
        id: `assistant-conversation-${len}`,
        prompt: highlight(code.value),
        response: "",
        type: "explain"
      };
      assistantConversation.value.push(conversationItem);
      let response = await assistant.explain(code.value, conversationItem.id);
      console.log(response);
      assistantConversation.value[len].response = response;
    }

    return {
      loading,
      parseMarkdown,
      highlight,
      assistantEnabled,
      assistantChange,
      assistantConversation,
      explainCode,
      assistant,
      assistantModel,
      assistantDialog,
      showAssistantDialog,
      running,
      done,
      results,
      error,
      editor,
      code
    };
  }
});
</script>

<template>
  <v-card>
    <v-container>
      <v-row justify="center">
        <v-col cols="7" sm="7">
          <v-select label="Assistant Model" v-model="assistantModel" :items="assistant.modelList()" variant="outlined">
          </v-select>
        </v-col>

        <v-col cols="2" sm="2">
          <v-btn :color="assistantEnabled ? 'green' : 'black'" @click="assistantChange" size="x-large" variant="text"
            :prepend-icon="assistantEnabled ? 'mdi-lightbulb-on-outline' : 'mdi-lightbulb-outline'" class="main-title">
            Load
          </v-btn>
        </v-col>
        <v-col cols="10" sm="10">
          <label id="init-label" class="swanky-text"> </label>
        </v-col>
      </v-row>
      <br />
      <v-divider></v-divider>
      <br />
      <v-row justify="center" v-if="assistantEnabled" v-for="conversationItem in assistantConversation">
        <v-col cols="1" sm="1" align="end">
          <v-btn variant="text" v-show="assistantEnabled" :icon="'mdi-account'" size="small"></v-btn>
        </v-col>
        <v-col cols="10" sm="10">
          <label v-if="conversationItem.type == 'explain'"></label>
          <pre class="pre-container" v-html="conversationItem.prompt" v-if="conversationItem.type == 'explain'"></pre>
        </v-col>
        <v-col cols="1" sm="1" align="end"></v-col>
        <v-col cols="1" sm="1" align="end">
          <v-btn variant="text" v-show="assistantEnabled" :icon="'mdi-lightbulb-on-outline'" size="small"></v-btn>
        </v-col>
        <v-col cols="10" sm="10">
          <label :id="conversationItem.id" v-html="parseMarkdown(conversationItem.response)"></label>
        </v-col>
        <v-col cols="1" sm="1" align="end"></v-col>
      </v-row>
      <v-row align="center" no-gutters>
        <br />

        <v-col cols="1" sm="1" align="end" />
        <v-col cols="10" sm="10">
          <br />
          <v-text-field ref="editor" v-model="code" color="green" v-show="assistantEnabled" density="compact" variant="solo"
            append-inner-icon="mdi-send" single-line hide-details @click:append-inner="explainCode()"
            v-on:keydown.enter.capture.prevent.stop="explainCode()"></v-text-field>
        </v-col>


        <br />
      </v-row>


    </v-container>
  </v-card>
</template>

<style scoped>
.code-container {
  font-family: monospace, monospace;
}

.pre-container {
  padding: 15px 16px;
  border-color: -internal-light-dark(rgb(118, 118, 118), rgb(133, 133, 133));
  background-color: #F6F6F6;
  font-family: monospace, monospace;
  margin-bottom: 22px;
}


.results-container {
  font-family: monospace, monospace;
}

.markdown-container {}

.toolbar-switch {
  margin-top: 20px;
  width: 45px;
  font-size: 5px;
}

#editor {
  /* width: 40dvw; */
  height: 200px;
}

.results-container {
  margin-left: 10%;
}

.swanky-text {
  font-family: 'Fontdiner Swanky' !important;
  font-size: 20px;
  line-height: 1.5;
}

.position-absolute {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
