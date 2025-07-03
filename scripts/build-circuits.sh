#!/usr/bin/env bash
set -euo pipefail

CIRCUIT=secret-proof
SRC_DIR=circuits
BUILD_DIR=${SRC_DIR}/build

# filenames
PTAU_P1=${BUILD_DIR}/powersOfTau12.ptau        # after contribution
PTAU_P2=${BUILD_DIR}/powersOfTau12_final.ptau  # after prepare-phase2
ZKEY_0=${BUILD_DIR}/${CIRCUIT}_0000.zkey
ZKEY_1=${BUILD_DIR}/${CIRCUIT}_0001.zkey
ZKEY_FINAL=${BUILD_DIR}/secret_final.zkey

mkdir -p "${BUILD_DIR}"

echo "▶︎ 1) Compile → wasm / r1cs / sym"
circom "${SRC_DIR}/${CIRCUIT}.circom" \
  --wasm --r1cs --sym -l node_modules -o "${BUILD_DIR}"

echo "▶︎ 2) Powers of Tau (phase-1) + prepare phase-2"
snarkjs powersoftau new bn128 12 "${BUILD_DIR}/ptau_0000.ptau" -v
snarkjs powersoftau contribute "${BUILD_DIR}/ptau_0000.ptau" \
                               "${PTAU_P1}" \
                               --name="1st contribution" -v
#  **here is the missing line**
snarkjs powersoftau prepare phase2 "${PTAU_P1}" "${PTAU_P2}" -v

echo "▶︎ 3) Groth16 setup"
snarkjs groth16 setup \
  "${BUILD_DIR}/${CIRCUIT}.r1cs" \
  "${PTAU_P2}" \
  "${ZKEY_0}"

snarkjs zkey contribute "${ZKEY_0}" "${ZKEY_1}" --name="Key 1" -v
snarkjs zkey beacon     "${ZKEY_1}" "${ZKEY_FINAL}" \
  0102030405060708090a0b0c0d0e0f10 10 -n="SecretProof Final Beacon"
snarkjs zkey verify \
  "${BUILD_DIR}/${CIRCUIT}.r1cs" "${PTAU_P2}" "${ZKEY_FINAL}"

echo "▶︎ 4) Export verifier + vkey"
snarkjs zkey export verificationkey \
  "${ZKEY_FINAL}" "${BUILD_DIR}/verification_key.json"
snarkjs zkey export solidityverifier \
  "${ZKEY_FINAL}" "contracts/SecretProofVerifier.sol"

echo "✅  All artefacts are in ${BUILD_DIR}/"
