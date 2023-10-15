import type { editor } from "monaco-editor";

import React from "react";

import { Box, Button, Link, Table, TableCell, TableRow, TableBody, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";

import { Modal } from "../../ui/React/Modal";
import { Page } from "../../ui/Router";
import { Router } from "../../ui/GameRoot";
import { useBoolean } from "../../ui/React/hooks";
import { Settings } from "../../Settings/Settings";
import { OptionsModal, OptionsModalProps } from "./OptionsModal";
import { useScriptEditorContext } from "./ScriptEditorContext";

interface ToolbarProps {
  editor: editor.IStandaloneCodeEditor | null;
  onSave: () => void;
}

export function Toolbar({ editor, onSave }: ToolbarProps) {
  const [ramInfoOpen, { on: openRAMInfo, off: closeRAMInfo }] = useBoolean(false);
  const [optionsOpen, { on: openOptions, off: closeOptions }] = useBoolean(false);

  function beautify(): void {
    editor?.getAction("editor.action.formatDocument")?.run();
  }

  const { ram, ramEntries, isUpdatingRAM, options, saveOptions } = useScriptEditorContext();

  const onOptionChange: OptionsModalProps["onOptionChange"] = (option, value) => {
    const newOptions = { ...options, [option]: value };
    saveOptions(newOptions);
    // delaying editor options update to avoid an issue
    // where switching between vim and regular modes causes some settings to be reset
    setTimeout(() => {
      editor?.updateOptions(newOptions);
    }, 100);
  };

  const onThemeChange = () => {
    /** Todo */
  };

  return (
    <>
      <Box display="flex" flexDirection="row" sx={{ m: 1 }} alignItems="center">
        <Button startIcon={<SettingsIcon />} onClick={openOptions} sx={{ mr: 1 }}>
          Options
        </Button>
        <Button onClick={beautify}>Beautify</Button>
        <Button color={isUpdatingRAM ? "secondary" : "primary"} sx={{ mx: 1 }} onClick={openRAMInfo}>
          {ram}
        </Button>
        <Button onClick={onSave}>Save (Ctrl/Cmd + s)</Button>
        <Button sx={{ mx: 1 }} onClick={() => Router.toPage(Page.Terminal)}>
          Terminal (Ctrl/Cmd + b)
        </Button>
        <Typography>
          <Link
            target="_blank"
            href="https://github.com/bitburner-official/bitburner-src/blob/dev/markdown/bitburner.ns.md"
          >
            Documentation
          </Link>
        </Typography>
      </Box>
      <OptionsModal
        open={optionsOpen}
        options={options}
        onClose={closeOptions}
        onOptionChange={onOptionChange}
        onThemeChange={onThemeChange}
      />
      <Modal open={ramInfoOpen} onClose={closeRAMInfo}>
        <Table>
          <TableBody>
            {ramEntries.map(([n, r]) => (
              <TableRow key={n + r}>
                <TableCell sx={{ color: Settings.theme.primary }}>{n}</TableCell>
                <TableCell align="right" sx={{ color: Settings.theme.primary }}>
                  {r}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Modal>
    </>
  );
}
