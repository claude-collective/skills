import pc from 'picocolors';

export const logger = {
  info: (msg: string) => console.log(pc.cyan(msg)),
  success: (msg: string) => console.log(pc.green(msg)),
  warn: (msg: string) => console.log(pc.yellow(msg)),
  error: (msg: string) => console.log(pc.red(msg)),
  dim: (msg: string) => console.log(pc.dim(msg)),
  log: (msg: string) => console.log(msg),
};

let verboseMode = false;

export function setVerbose(enabled: boolean): void {
  verboseMode = enabled;
}

export function verbose(msg: string): void {
  if (verboseMode) {
    console.log(pc.dim(`  ${msg}`));
  }
}
