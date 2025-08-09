# Zero-Knowledge Identity Provider (idP)

A research prototype implementing privacy-preserving identity authentication using Zero-Knowledge (ZK) proofs. This system allows users to prove their identity without revealing sensitive personal information, built with NestJS and Circom circuits.

## 🔬 Research Context

This project is part of a final research project investigating zero-knowledge cryptography applications in identity management. It demonstrates how ZK-SNARKs can be used to create privacy-preserving authentication systems where users can prove they possess valid credentials without revealing the underlying data.

## 🏗️ Architecture Overview

### Core Components

1. **ZK Circuit** (`circuits/secret-proof.circom`)
   - Implements a Poseidon hash-based commitment scheme
   - Proves knowledge of a secret that produces a given commitment
   - Uses Groth16 proving system for efficient verification

2. **NestJS API** (`src/`)
   - RESTful API with three main endpoints
   - Handles user registration, proof generation, and verification
   - Integrates with ZK circuit artifacts for cryptographic operations

3. **Cryptographic Layer** (`src/crpyto/`)
   - Secret generation from user attributes
   - ZK proof generation and verification
   - Poseidon hash implementation for commitment schemes

4. **Database Layer** (`prisma/`)
   - PostgreSQL integration via Prisma ORM
   - Stores user commitments (but not secrets)
   - Maintains privacy by design

## 🔐 Cryptographic Flow

### 1. Registration Phase
```
User Attributes → Hash (Keccak256) → Poseidon → UserHash
UserHash + Nonce → Poseidon → Secret
Secret → Poseidon → Commitment
```

### 2. Authentication Phase
```
Secret + Commitment → ZK Circuit → Proof
Proof + PublicSignals → Groth16 Verifier → Valid/Invalid
```

## 🚀 Setup and Installation

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** package manager
- **PostgreSQL** database
- **Circom** compiler (for circuit compilation)
- **snarkjs** (installed as dependency)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd idP
pnpm install
```

### 2. Database Setup

```bash
# Set up your PostgreSQL database
# Create a .env file with DATABASE_URL
echo "DATABASE_URL=postgresql://username:password@localhost:5432/idp" > .env

# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push
```

### 3. Build ZK Circuits

```bash
# This will compile circuits and generate proving/verification keys
pnpm run build:circuits
```

This script will:
- Compile the Circom circuit to WASM and R1CS
- Generate Powers of Tau ceremony files
- Create Groth16 proving and verification keys
- Export Solidity verifier contract

### 4. Start the Development Server

```bash
# Development mode with hot reload
pnpm run start:dev

# Production build
pnpm run build
pnpm run start:prod
```

The API will be available at `http://localhost:3000` with Swagger documentation at `http://localhost:3000/api`.

## 📡 API Endpoints

### 1. Register User
```bash
curl --location 'http://localhost:3000/auth' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "alice@ex.com",
    "name": "Alice12312",
    "age": 50,
    "country": "IR",
    "dob": "1994-05-01"
}'
```

**Response:**
```json
{
  "secret": "0x258c489bb45c94cfde65f05964efc75a47e4e4310595935ff10a440cc9acbbed",
  "nonce": "0x9876543210fedcba",
  "commitment": "5360578543298580981610616694364508704365712000716700730584261436538390710233"
}
```

### 2. Generate Proof
```bash
curl --location 'http://localhost:3000/auth/proof' \
--header 'Content-Type: application/json' \
--data '{
    "secretHex": "0x15be259a42e027c35ea64a00c4165e32ae5b9d0d5beff4b824a749451fc15b16",
    "commitment": "16512419083883938285461209963832099958639710929935693304629782614629100909759"
}'
```

**Response:**
```json
{
  "proof": {
    "pi_a": [],
    "pi_b": [],
    "pi_c": [],
    "protocol": "groth16",
    "curve": "bn128"
  },
  "publicSignals": [
    ""
  ],
  "solidityArgs": [  ]
}
```

### 3. Verify Proof
```bash
curl --location 'http://localhost:3000/auth/verify' \
--header 'Content-Type: application/json' \
--data '{
    "commitment": "16512419083883938285461209963832099958639710929935693304629782614629100909759",
    "proof": {
        "pi_a": [
            "16272273635477741363430524923994398455075306173858196865619827318278999437746",
            "5497361023195268984795424006241437730065995132300464766979845628249461773621",
            "1"
        ],
        "pi_b": [
            [
                "5531648730765496189299984141013429335176293916624288473027312900574687503695",
                "837584405495997022985661350781224077647290664588555614127320131078799912871"
            ],
            [
                "13710907757682478108066922650482603829363350759876577174904192278597672805633",
                "6371344832433353595501841968844132162592422692084819880733485594488528966179"
            ],
            [
                "1",
                "0"
            ]
        ],
        "pi_c": [
            "12400918088286675926504005672731381714775100590779336212769026192223073829457",
            "8570106050589180677574221408743302642917811565697447697211740695850645549675",
            "1"
        ],
        "protocol": "groth16",
        "curve": "bn128"
    },
    "publicSignals": [
        "5360578543298580981610616694364508704365712000716700730584261436538390710233"
    ]
}'
```

**Response:**
```json
true
```

## 🔧 Benchmarking with bench.js

The project includes a comprehensive benchmarking tool to measure performance across different concurrency levels.

### Benchmark Setup

1. **Prerequisites for Benchmarking:**
   ```bash
   # Install additional benchmark dependencies (already included in package.json)
   # - autocannon: HTTP load testing
   # - pidusage: Process monitoring
   # - axios: HTTP client
   ```

2. **Ensure Server is Running:**
   ```bash
   # Start the NestJS server in one terminal
   pnpm run start:dev
   
   # Or for production benchmarking
   pnpm run build
   pnpm run start:prod
   ```

3. **Run Benchmarks:**
   ```bash
   # Navigate to benchmark directory
   cd bench-mark
   
   # Run the benchmark script
   node bench.js
   ```

### Benchmark Configuration

The benchmark script (`bench-mark/bench.js`) tests three key endpoints:

- **Registration**: `POST /auth` - Tests user registration performance
- **Proof Generation**: `POST /auth/proof` - Measures ZK proof generation latency
- **Proof Verification**: `POST /auth/verify` - Tests proof verification speed

**Configuration Options:**
```javascript
const CONCURRENCY_LEVELS = [1, 10, 15, 20, 25, 30];  // Concurrent connections
const TEST_DURATION = 15;                              // Test duration in seconds
const SAMPLE_INTERVAL_MS = 250;                        // CPU/Memory sampling interval
```

### Benchmark Output

The script provides detailed metrics including:
- **Latency**: Average and P50 response times
- **Throughput**: Requests per second and data transfer rates
- **Resource Usage**: CPU and memory consumption during tests
- **Per-endpoint Analysis**: Individual performance for each API endpoint

Example output:
```
register  (concurrency 10)
  Avg latency  : 45.23 ms
  P50 latency  : 42.10 ms
  Throughput   : 12.34 MB/s
  Requests/sec : 220.15
  CPU (avg)    : 35.67 %
  Memory (avg) : 128.45 MB
```

### Benchmark Environment

- Tests various concurrency levels to identify performance characteristics
- Monitors server resource usage during testing
- Pre-computes valid proof data to ensure realistic testing conditions
- Uses Autocannon for accurate HTTP load testing

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# End-to-end tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📁 Project Structure

```
idP/
├── circuits/                    # ZK circuits and compiled artifacts
│   ├── secret-proof.circom     # Main ZK circuit
│   ├── secret-proof.r1cs       # Compiled constraint system
│   ├── secret-proof.sym        # Symbol mapping
│   └── secret-proof_js/        # WASM and witness calculator
├── contracts/                   # Solidity contracts
│   └── SecretProofVerifier.sol # Generated Groth16 verifier
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts  # API endpoints
│   │   ├── auth.service.ts     # Business logic
│   │   └── dto/               # Data transfer objects
│   ├── crpyto/                # Cryptographic utilities
│   │   ├── generate-proof.ts  # ZK proof generation
│   │   └── secret-generator.ts # Secret and commitment generation
│   └── main.ts               # Application entry point
├── bench-mark/                # Performance benchmarking
│   └── bench.js              # Comprehensive benchmark suite
├── prisma/                   # Database schema and migrations
└── scripts/                  # Build and utility scripts
    └── build-circuits.sh     # Circuit compilation script
```

## 🔒 Security Considerations

- **Secret Management**: Secrets are generated client-side and never stored on the server
- **Commitment Privacy**: Only hash commitments are stored, preserving user privacy
- **ZK Soundness**: Uses battle-tested Groth16 proving system
- **Input Validation**: Comprehensive validation on all API inputs
- **Database Security**: Sensitive data is cryptographically protected

## 🛠️ Development Scripts

```bash
# Build ZK circuits and generate keys
pnpm run build:circuits

# Start development server
pnpm run start:dev

# Build for production
pnpm run build

# Run linting and formatting
pnpm run lint
pnpm run format

# Database operations
npx prisma generate    # Generate Prisma client
npx prisma db push     # Apply schema changes
npx prisma studio      # Database GUI
```

## 📊 Performance Characteristics

Based on benchmark results, the system demonstrates:

- **Registration**: Fast user onboarding with cryptographic key generation
- **Proof Generation**: Computationally intensive ZK proof creation (hundreds of ms)
- **Verification**: Efficient proof verification (sub-second response times)
- **Scalability**: Handles concurrent requests with predictable resource usage

## 🔬 Research Applications

This prototype demonstrates several key research areas:

1. **Privacy-Preserving Authentication**: Users prove identity without revealing personal data
2. **Zero-Knowledge Proofs**: Practical implementation of ZK-SNARKs in web applications
3. **Commitment Schemes**: Using Poseidon hashes for efficient cryptographic commitments
4. **Performance Analysis**: Benchmarking ZK operations under various load conditions

## 📝 API Documentation

When the server is running, comprehensive API documentation is available via Swagger UI at:
```
http://localhost:3000/api
```

## 🤝 Contributing

This is a research prototype. For academic use or contributions:

1. Ensure all ZK circuits are properly tested
2. Follow the established TypeScript/NestJS conventions
3. Update benchmarks when adding new endpoints
4. Document cryptographic assumptions and security properties

## 📜 License

This project is for research and educational purposes. See license terms for specific usage restrictions.

---

*This project demonstrates the practical implementation of zero-knowledge cryptography for privacy-preserving identity systems. It serves as both a functional prototype and a research artifact for studying ZK-SNARK performance characteristics in real-world applications.*
