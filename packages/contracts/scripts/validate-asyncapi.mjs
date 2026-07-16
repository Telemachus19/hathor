import { Parser, fromFile } from '@asyncapi/parser';

const contractPath = process.argv[2];

if (!contractPath) {
  throw new Error('An AsyncAPI contract path is required');
}

const parser = new Parser();
const result = await fromFile(parser, contractPath).parse();
const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 0);

if (!result.document || errors.length > 0) {
  for (const error of errors) {
    const location = error.range?.start;
    const position = location ? `${location.line + 1}:${location.character + 1}` : 'unknown';
    console.error(`${contractPath}:${position} ${error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`AsyncAPI contract is valid: ${contractPath}`);
}
