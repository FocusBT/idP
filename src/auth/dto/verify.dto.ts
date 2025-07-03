export class VerifyRequestDto {
    commitment: string;         // decimal string
    proof: any;                 // a‑b‑c object from snarkjs
    publicSignals: string[];    // ["commitment"]
  }