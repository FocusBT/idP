import * as path from 'path';
import { groth16 } from 'snarkjs';

const hexToDec = (hex: string) =>
  BigInt(hex.startsWith('0x') ? hex : '0x' + hex).toString();

const circuitsBuild = path.resolve(process.cwd(), 'circuits', 'build');

export async function generateProof(
  secretHex: string,
  commitmentDec: string | bigint,
) {
  const input = {
    secret: hexToDec(secretHex),
    commitment: commitmentDec.toString(),
  };

const wasm = path.join(
    circuitsBuild,
    'secret-proof_js',
    'secret-proof.wasm',
  );
  const zkey = path.join(circuitsBuild, 'secret_final.zkey');

  const { proof, publicSignals } = await groth16.fullProve(input, wasm, zkey);

  const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
  const solidityArgs = calldata
    .replace(/["[\]\s]/g, '')
    .split(',')
    .map((x) => (x.startsWith('0x') ? x : `0x${BigInt(x).toString(16)}`));

  return { proof, publicSignals, solidityArgs };
}
