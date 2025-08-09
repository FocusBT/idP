import * as fs from 'fs';
import * as path from 'path';
import { groth16 } from 'snarkjs';

const hexToDec = (hex: string) =>
  BigInt(hex.startsWith('0x') ? hex : '0x' + hex).toString();

const circuitsBuild = path.resolve(process.cwd(), 'circuits', 'build');
const wasmPath    = path.join(circuitsBuild, 'secret-proof_js', 'secret-proof.wasm');
const wcPath      = path.join(circuitsBuild, 'secret-proof_js', 'witness_calculator.js');
const zkeyPath    = path.join(circuitsBuild, 'secret_final.zkey');

const wasmBuffer = fs.readFileSync(wasmPath);
const zkeyBuffer = fs.readFileSync(zkeyPath);

const wcFactory  = require(wcPath);
const wcPromise  = wcFactory(wasmBuffer);

export async function generateProof(
  secretHex: string,
  commitmentDec: string | bigint,
) {

  const input = {
    secret: hexToDec(secretHex),
    commitment: commitmentDec.toString(),
  };

  const wc = await wcPromise;
  const witnessBuffer: Buffer = await wc.calculateWTNSBin(input);

  const { proof, publicSignals } = await groth16.prove(zkeyBuffer, witnessBuffer);

  const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
  const solidityArgs = calldata
    .replace(/["[\]\s]/g, '')
    .split(',')
    .map((x) => (x.startsWith('0x') ? x : `0x${BigInt(x).toString(16)}`));
  return { proof, publicSignals, solidityArgs };
}
