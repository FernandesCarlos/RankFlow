const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : file.endsWith('.tsx') ? [file] : [];
  });
}

test('mock loading boundaries do not compile raw text children outside Text', () => {
  const invalid = [];
  for (const file of filesIn('src/app')) {
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    const ast = ts.createSourceFile(file + '.js', output, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.createElement' && node.arguments[0]?.getText(ast) === 'MockData') {
        if (node.arguments.slice(2).some(child => ts.isStringLiteral(child) && child.text.length)) invalid.push(file);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  assert.deepEqual(invalid, [], 'Raw JSX text becomes a native text node outside <Text>');
});
