import type { TerminalClient, TerminalSession } from '../terminal/TerminalClient';

/** Browser-only terminal transport; never connects visitors to a host shell. */
export class DemoTerminalClient implements TerminalClient {
  connect(): TerminalSession {
    let output: (data: string) => void = () => {};
    let buffer = '';
    let closed = false;
    const prompt = '\r\n\x1b[32mcodechroma\x1b[0m $ ';
    return {
      onData(fn) { output = fn; queueMicrotask(() => { if (!closed) output('CodeChroma browser demo\r\nExample terminal. Type help to see available commands.' + prompt); }); },
      onClose() {}, resize() {}, writeBinary() {},
      write(data) {
        if (closed) return;
        for (const char of data) {
          if (char === '\r') {
            const command = buffer.trim(); buffer = '';
            if (command === 'clear') { output('\x1b[2J\x1b[H'); output(prompt); continue; }
            const responses: Record<string, string> = {
              help: 'Browser demo commands: help, ls, pwd, clear\r\nInstall CodeChroma to run commands against your own repository.',
              ls: 'src/  web/  tests/  docs/  pyproject.toml', pwd: '/demo/code-chroma',
            };
            output('\r\n' + (command ? responses[command] ?? 'This browser demo does not execute system commands. Type help.' : '') + prompt);
          } else if (char === '\x7f') { if (buffer) { buffer = buffer.slice(0, -1); output('\b \b'); } }
          else if (char === '\x03') { buffer = ''; output('^C' + prompt); }
          else if (char >= ' ') { buffer += char; output(char); }
        }
      },
      close() { closed = true; },
    };
  }
}
