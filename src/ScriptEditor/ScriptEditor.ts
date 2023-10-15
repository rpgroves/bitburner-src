import type { ContentFilePath } from "../Paths/ContentFile";
import type { OpenScript } from "./ui/OpenScript";

import { EventEmitter } from "../utils/EventEmitter";
import * as monaco from "monaco-editor";
import libSource from "!!raw-loader!./NetscriptDefinitions.d.ts";

import { loadWASM } from "onigasm";
import * as bytes from "onigasm/lib/onigasm.wasm";
import { Registry } from "monaco-textmate";
import { wireTmGrammars } from "monaco-editor-textmate";
import { grammar } from "./grammar";
import { defaultMonacoTheme } from "./ui/themes";

/** Event emitter used for tracking when changes have been made to a content file. */
export const fileEditEvents = new EventEmitter<[hostname: string, filename: ContentFilePath]>();
export class ScriptEditor {
  /** Array of scripts that are open. */
  openScripts: OpenScript[] = [];
  /** Index of the currently open script */
  currentScriptIndex?: number = undefined;
  isInitialized = false;
  async initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Add ts definitions for API
    const source = (libSource + "").replace(/export /g, "");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(source, "netscript.d.ts");
    monaco.languages.typescript.typescriptDefaults.addExtraLib(source, "netscript.d.ts");

    await loadWASM(bytes.buffer);
    //wire TextMate grammar for js to monaco
    await wireTmGrammars(
      monaco,
      new Registry({ getGrammarDefinition: () => Promise.resolve(grammar) }),
      new Map([["javascript", "source.js"]]),
    );

    // Load themes
    monaco.editor.defineTheme("defaultTheme", defaultMonacoTheme);
    monaco.editor.setTheme("defaultTheme");
  }
}

export const scriptEditor = new ScriptEditor();
//scriptEditor.initialize();
