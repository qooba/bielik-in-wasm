import { loadPyodide } from "pyodide";

declare const self: Worker;

async function loadPyodideAndPackages() {
    let pyodide = await loadPyodide();
    await pyodide.loadPackage(["numpy", "pytz", "matplotlib", "micropip", "pandas"]);
    return pyodide
}

const pyodide = await loadPyodideAndPackages();

const workerContext: Record<string, any> = {};

self.onmessage = async (event) => {
    const { id, python, ...context } = event.data;
    for (const key of Object.keys(context)) {
        workerContext[key] = context[key];
    }

    try {
        await pyodide.loadPackagesFromImports(python);
        let results = await pyodide.runPythonAsync(python);
        self.postMessage({ results, id });
    } catch (error) {
        if (error instanceof Error) {
            self.postMessage({ error: error.message, id });
        } else {
            console.error(error);
        }
    }
};
