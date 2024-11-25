import { Marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import { markedHighlight } from "marked-highlight";
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
//import 'highlight.js/styles/stackoverflow-dark.css';
//import 'highlight.js/styles/stackoverflow-light.css';
import 'highlight.js/styles/atom-one-light.css';
import { sl } from 'vuetify/locale';
//import 'highlight.js/styles/atom-one-dark.css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
const marked = new Marked(
    markedHighlight({
        langPrefix: 'hljs language-',
        highlight(code, lang) {

            if(!lang) {
                lang = 'python';
            }

            return hljs.highlight(code, { language: lang }).value;
        }
    })
);

export function parseMarkdown(text: string) {
    return marked.parse(text);
}

export function highlight(code: string) {
    return hljs.highlight(code, { language: 'python' }).value;
}

