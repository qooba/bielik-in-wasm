import { parseMarkdown, highlight } from '@/mdcommon';

export default class Notebook {

    public constructor() {
    }

    public parse(nb: any) {

        let tmpCards: any = [];
        let initCode: any = null;
        let title: any = null;

        let card: any = null;
        nb.cells.forEach((el: any, idx: number) => {
            el.code = el.source.join("");
            el.running = false;
            if (idx == 0) {
                title = parseMarkdown(el.code);
            }
            else if (idx == 1) {
                initCode = el.code;
            }
            else {
                if (el.code.startsWith("### ")) {
                    if (card != null) {
                        tmpCards.push(card);
                    }

                    card = [];
                }

                card.push(el);
            }
        });

        tmpCards.push(card);
        return {
            "cards": tmpCards, 
            "initCode": initCode, 
            "title": title
        };
    }

}
