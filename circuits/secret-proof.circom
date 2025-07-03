pragma circom 2.1.7;
include "circomlib/circuits/poseidon.circom";

template SecretProof() {
    signal input  secret;       // private input
    signal input  commitment;   // this one will be public

    component h = Poseidon(1);
    h.inputs[0] <== secret;

    h.out === commitment;       // enforce equality
}

// expose `commitment` as a public input of the main component
component main { public [commitment] } = SecretProof();
