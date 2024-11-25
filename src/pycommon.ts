
export function formatCode(code: string) {
    return `from pyodide.code import eval_code\nformat_output(eval_code("""${code}""",globals=globals(),locals=locals()))`;
}

const pyodideWorker = new Worker(new URL("@/pyworker.js", import.meta.url));

const callbacks: any = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  const onSuccess = callbacks[id];
  delete callbacks[id];
  onSuccess(data);
};

export const asyncRun = (() => {
  let id = 0; // identify a Promise
  return (script: string, context: any) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
      });
    });
  };
})();

export const init_code = `
import js

class Dummy:
    def __init__(self, *args, **kwargs) -> None:
        return

    def __getattr__(self, __name: str):
        return Dummy

js.document = Dummy()

def format_output(res):
    import html
    import pandas as pd
    import numpy as np

    res_type = type(res)
    print(res_type, res)

    if res_type == str:
        return res
    elif res_type in [int, float, bool]:
        return res
    elif 'matplotlib' in html.escape(str(res)):
        from matplotlib import pyplot as plt
        import io
        import base64

        bytes_io = io.BytesIO()
        plt.savefig(bytes_io, format='jpg')
        bytes_io.seek(0)
        base64_encoded_spectrogram = base64.b64encode(bytes_io.read())
        src='data:image/png;base64,'+base64_encoded_spectrogram.decode('utf-8')
        img='<img src=\"'+src+'\" />'
        return img

    elif res_type in [list, set, tuple]:
        return str(res)

    elif res_type in [np.ndarray, np.int32, np.float64, np.intc]:
        return str(res)
       
    elif res is None:
        pass
    elif res_type == pd.DataFrame:
        pd.set_option('colheader_justify', 'center')
        return res.to_html(classes='dfstyle')
    elif res_type == pd.Series:
        return str(list(res))
    else:
        return html.escape(str(res_type))
    `
