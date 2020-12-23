/** @format */
/* eslint @typescript-eslint/no-var-requires:0 */

// vscode-environment.js
const NodeEnvironment = require('jest-environment-node');
const vscode = require('vscode-test');

class VsCodeEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    this.global.vscode = vscode;
  }

  async teardown() {
    this.global.vscode = {};
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = VsCodeEnvironment;
